
angular.module("firefly").controller("login", function($rootScope, $scope, socket, $location, $ocLazyLoad){
    $scope.div_exito = false;
    $scope.div_alerta = false;
    $scope.usuario = "";
    $scope.contrasena = "";
    $scope.correo_a_enviar ="";
    $scope.nuevos_campos = false;
    $rootScope.recuperar_contrasenia = false;
    $scope.nueva_contrasenia = "";
    $scope.conf_nueva_contrasenia = "";
    $location.path("/")
    
    $scope.iniciar_sesion = function(){
        $rootScope.cargando = true;
        if(!$scope.usuario || !$scope.contrasena){
            swal("Error", "Debes llenar todos los campos", "error"); 
        }
        else{
            socket.emit("login", {
                usuario : $scope.usuario,
                contrasena : $scope.contrasena,
            });
            localStorage.setItem("usuario_actual",$scope.usuario)
            localStorage.setItem("contrasenia",$scope.contrasena)
        }
    }

    socket.on("respuesta_login", function(datos) {
        
        if(datos.exito == true){
            $rootScope.usuario_actual = datos.respuesta.usuario;
            $rootScope.en_sesion = true;
            $rootScope.menus = datos.menus
            $location.path("/estadisticas_generales")
            $rootScope.cargando = false;
        }
        else if(datos.exito == "en_sesion"){
            $rootScope.cargando = false;
            swal({
                title: "Hay una sesion activa ¿Desea cerrarla?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    swal({
                        title: "¿Esta seguro?",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                    })
                    .then((willDelete) => {
                        if (willDelete) {
                            socket.emit("cerrar_sesion", datos.respuesta.usuario)
                            swal("Ahora puedes iniciar sesion", {
                                icon: "success",
                        });
                        }
                    });
                }
            });  
            
            $rootScope.ocultar_todo = false;
            $rootScope.loader = false;   
        }
        else {
            $rootScope.cargando = false;
            swal("Error", "Contraseña y/o usuario incorrectos", "error");
        }
    })

    $scope.enviar_correo = function (email){
        $rootScope.cargando = true;
        $scope.correo = {
            destino: email,
            asunto: "Recuperacion de Contrasenia",
            texto: "Codigo: " + $scope.genera_codigo_al_azar(),
            html: false
        };
        socket.emit("guardar_codigo", {
            codigo: $scope.correo.texto.replace("Codigo: ", ""),
            destino: $scope.correo.destino
        });
    }

    socket.on("respuesta_guardar_codigo", function(datos){
        if(datos.exito) {
            socket.emit("envia_correo", $scope.correo)
        } else if(!datos.exito){
            $rootScope.cargando = false;
            swal("Error", `${datos.mensaje}`, "error"); 
        }
    })

    socket.on("respuesta_enviar_correo", function(datos){
        if(datos.exito) {
            swal("Código enviado", `${datos.mensaje}`, "success"); 
            $rootScope.cargando = false;
            $scope.usuario_correo = datos.correo;
        } else if (!datos.exito) {
            swal("Error al enviar el correo", `${datos.mensaje}`, "error");
            $rootScope.cargando = false;
        }

    })

    $scope.confirmar_codigo = function(codigo) {
        socket.emit("confirmar_codigo", {
            codigo: Number(codigo),
            correo: $scope.usuario_correo
        })
    }

    socket.on("respuesta_confirmar_codigo", function(datos){
        let {_id, codigo, mensaje} = datos.respuesta;
        $scope.id = _id;
        $scope.usuario_codigo = codigo;
        console.log("resp", datos);
        $scope.msj = mensaje;
        if(datos.exito){
            $scope.div_exito = true;
            $scope.div_alerta = false;
        } else if(!datos.exito) {
            $scope.div_alerta = true;
            $scope.div_exito = false;
        }
    })

    $scope.cambiar_contrasenia = function(contrasenia) {
        socket.emit("cambiar_contrasenia", {
            id: $scope.id,
            codigo: $scope.usuario_codigo,
            contrasenia
        })
    }
   
    socket.on("respuesta_cambiar_contrasenia", function(datos){
        let {exito, mensaje} = datos;
        if(exito) {
            swal("Contraseña cambiada", `${mensaje}`, "success");
        } else {
            swal("Error", `No se pudo cambiar la constraseña${mensaje}`, "error");
        }
    })

    $scope.genera_codigo_al_azar = function() {
        return Math.round(Math.random()*(999999-100000)+parseInt(100000));
    }
    
    $scope.valida_contrasenia = function(nueva, confirmar) {
        if(nueva == confirmar)
            $scope.coinciden = false;
        else
            $scope.coinciden = true;
    }
})