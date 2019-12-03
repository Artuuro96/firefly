angular.module("firefly").controller("desarrollador", function($rootScope, $scope, socket, $location, $ocLazyLoad){
    localStorage.setItem("menu_actual", "/desarrollador");
    $scope.especificaciones = {}
    $scope.numero_luminaria = "";
    $scope.coordenada_x = "";
    $scope.coordenada_y = "";
    $scope.estado = "";
    $scope.zona = "";
    $scope.node_id = "";
    $scope.voltaje = "";
    $scope.sesiones_menu1 = true;
    $scope.usuarios_menu1 = false;
    $scope.luminarias_menu1 = false;
    $scope.logs_menu1 = false;
    $scope.modificar_especificaciones = {}
    $scope.modificar_numero_luminaria = "";
    $scope.modificar_coordenada_x = "";
    $scope.modificar_coordenada_y = "";
    $scope.modificar_estado = "";
    $scope.modificar_zona = "";
    $scope.modificar_node_id = "";
    $scope.modificar_voltaje = "";
    $scope.permisos = true;
    $scope.usuario = {};
    $rootScope.verificar_usuario();

    socket.emit("menus");
    socket.removeListener("respuesta_menus");
    socket.on("respuesta_menus", function(datos){
        $scope.todos_los_menus = datos.respuesta
    })

    socket.removeListener("respuesta_refresca_sesiones")
    socket.on("respuesta_refresca_sesiones", function(datos){
        $scope.sesiones = datos;
    })

    socket.removeListener("respuesta_luminarias")
    socket.on("respuesta_luminarias", function(datos){
        $scope.luminarias = datos;
    })

    socket.removeListener("respuesta_usuarios")
    socket.on("respuesta_usuarios", function(datos){
        $scope.usuarios = datos.respuesta;
    })

    $scope.sesiones_menu = function(){
        $scope.sesiones_menu1 = true;
        $scope.usuarios_menu1 = false;
        $scope.luminarias_menu1 = false;
        $scope.logs_menu1 = false;
        socket.emit("sesiones")
    }

    $scope.usuarios_menu = function(){
        $scope.sesiones_menu1 = false;
        $scope.usuarios_menu1 = true;
        $scope.luminarias_menu1 = false;
        $scope.logs_menu1 = false;
        socket.emit("usuarios")
    }

    $scope.luminarias_menu = function(){
        $scope.sesiones_menu1 = false;
        $scope.usuarios_menu1 = false;
        $scope.luminarias_menu1 = true;
        $scope.logs_menu1 = false;
        socket.emit("luminarias")
    }

    $scope.logs_menu = function(){
        $scope.sesiones_menu1 = false;
        $scope.usuarios_menu1 = false;
        $scope.luminarias_menu1 = false;
        $scope.logs_menu1 = true;
    }

    $scope.mostrar_permisos = function(abrir){
        if(abrir){
            $scope.permisos = true;
        } else {
            $scope.permisos = false
        }
    }

    $scope.guardar_luminaria = function(){
        if($scope.especificaciones.voltaje == "Encendida" )
            $scope.voltaje = 100
        else
            $scope.voltaje = 0

        socket.emit("guardar_luminaria",{
            numero_luminaria: $scope.numero_luminaria,
            coordenada_x: $scope.coordenada_x,
            coordenada_y: $scope.coordenada_y,
            estado: $scope.estado,
            zona: $scope.zona,
            node_id: $scope.node_id,
            voltaje: $scope.voltaje,
            especificaciones: $scope.especificaciones
        })
    }
    socket.removeListener("respuesta_guardar_luminaria")
    socket.on("respuesta_guardar_luminaria", function(datos){
        if(datos.exito == true){
            $('#agregar_luminaria').modal('hide')
            socket.emit("luminarias")
            swal("Éxito", "Se ha guardado exitosamente la luminaria", "success")
        }
        else{
            swal("Error", "Debes llenar todos los campos o hay un campo duplicado", "error")
        }
    })

    $scope.modificar_luminaria = function(){
        if($scope.especificaciones.voltaje == "Encendida" )
            $scope.especificaciones.voltaje = 100
        else
            $scope.especificaciones.voltaje = 0

        socket.emit("modificar_luminaria",{
            numero_luminaria: $scope.especificaciones.numero_luminaria,
            coordenada_x: $scope.especificaciones.coordenada_x,
            coordenada_y: $scope.especificaciones.coordenada_y,
            estado: $scope.especificaciones.estado,
            zona: $scope.especificaciones.zona,
            node_id: $scope.especificaciones.node_id,
            voltaje: $scope.especificaciones.voltaje,
            especificaciones: $scope.especificaciones.especificaciones,
            luminaria_modificar: $scope.luminaria_modificar
        })
    }

    socket.removeListener("respuesta_modificar_luminaria")
    socket.on("respuesta_modificar_luminaria", function(datos){
        if(datos.exito == true){
            $('#modificar_especificaciones').modal('hide')
            socket.emit("luminarias")
            swal("Éxito", "Se ha modificado exitosamente la luminaria", "success")
        }
        else if(datos.exito == "llenar_campos"){
            swal("Error", "Debes llenar todos los campos", "error")
        }
        else if(datos.exito == "llenar_voltaje"){
            swal("Error", "Debes colocar un valor en el voltaje", "error")
        }
        else{
            swal("Error", "Hubo un error en el cambio", "error")
        }
    })

    $scope.eliminar_luminaria = function(datos){
        $scope.ver_especificaciones(datos)
        swal({
            title: "Estas a punto de eliminar una luminaria ¿Desea continuar?",
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
                        socket.emit("eliminar_luminaria", $scope.luminaria_modificar)
                    }
                });
            }
        });
    }

    socket.removeListener("respuesta_eliminar_luminaria")
    socket.on("respuesta_eliminar_luminaria", function(datos){
        if(datos.exito == true){
            socket.emit("luminarias")
            swal("Luminaria eliminada con exito", {
                icon: "success",
            });   
        }
        else{
            swal("Error", "Algo salio mal, vuelve a intentar", "error")
        }
    })

    $scope.ver_especificaciones = function(datos){
        socket.emit("ver_especificaciones", datos)  
    }
    
    socket.removeListener("respuesta_ver_especificaciones")
    socket.on("respuesta_ver_especificaciones", function(datos){
        $scope.especificaciones = datos.respuesta;
        $scope.luminaria_modificar = datos.respuesta.numero_luminaria;
    });

    $scope.eliminar_usuario = function(usuario) {
        swal({
            title: "Estas a punto de eliminar un usuario ¿Desea continuar?",
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
                        socket.emit("eliminar_usuario", {usuario: usuario})
                    }
                });
            }
        });        
    }

    socket.removeListener("repsuesta_eliminar_usuario")
    socket.on("respuesta_eliminar_usuario", function(datos){
        if(!datos.exito)
            swal("Error", "Algo salio mal, vuelve a intentar: " + datos.respuesta, "error")
        else {
            swal("Usuario eliminado", {
                icon: "success"
            });
            socket.emit("usuarios")
        }
    });

    $scope.abre_modal_usuario = function (){
        $('#nuevo_usuario').modal('show')
    }

    $scope.permisos_por_usuario = function(id){
        $scope.id = id
        socket.emit("permisos_por_usuario", {id});
    }

    socket.on("respuesta_permisos_por_usuario", function(datos){
        if(!datos.exito) {
            swal("Error", "El usuario no tiene ningun permiso asginado", "error")
        } else {
            $scope.menus.todos_los_menus = $scope.todos_los_menus;
        }
    })

    $scope.menus_asignar = [];
    $scope.agregar_menu = function(menu, valor) {
        if(valor) {
            $scope.menus_asignar.push(menu);
        } else {
            if($scope.menus_asignar.length > 0) {
                let index = $scope.menus_asignar.findIndex(menu_asignar => menu_asignar == menu);
                $scope.menus_asignar.splice(index, 1);
            }
        }
    }

    $scope.asignar_nuevos_menus = function() {
        let datos = {}
        datos.id = $scope.id
        datos.menus = $scope.menus_asignar
        socket.emit("asignar_menus", datos);
    }

    socket.on("respuesta_asignar_menus", function(datos){
        if(datos.exito) {
            swal("Menus asignados correctamente", "", "success")
        } else {
            swal("Error", `${datos.mensaje}`, "error")
        }
    })

    $scope.menus_permisos = [];
    $scope.permisos_menu = function(menu, valor) {
        if(valor) {
            $scope.menus_permisos.push(menu);
        } else {
            if($scope.menus_permisos.length > 0) {
                let index = $scope.menus_permisos.findIndex(menu_permiso => menu_permiso == menu);
                $scope.menus_permisos.splice(index, 1);
            }
        }
    }

    $scope.valida_contrasena = function(usuario, confirmar) {
        if(usuario == confirmar)
            $scope.coincidencia = false;
        else
            $scope.coincidencia = true;
    }

    $scope.valida_correo = function (correo){
        var regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(correo) ? $scope.valido = false : $scope.valido = true;
    }

    $scope.guardar_usuario = function (){
        $scope.usuario.menus = $scope.menus_permisos;
        console.log($scope.usuario)
        socket.emit("guardar_usuario", $scope.usuario);
    }

    socket.on("respuesta_guardar_usuario", function(datos){
        if(datos.exito){
            swal("Éxito", "Se ha guardado exitosamente el usuario", "success");
            $('#nuevo_usuario').modal('hide')
        }
        else{
            swal("Error", "Ha ocurrido un error." + datos.respuesta, "error");
        }
    })

    $scope.abrir_modal_editar_usuario = function(usuario){
        $scope.usuario= usuario
        $('#editar_usuario_des').modal('show');
    }

    $scope.modificar_usuario = function(){
        if(!$scope.usuario.usuario || $scope.usuario.usuario==""){
            swal("Campo vacio", "Debes colocar un usuario", "warning");
            return;
        }
        if(!$scope.usuario.nombre || $scope.usuario.nombre==""){
            swal("Campo vacio", "Debes colocar un nombre", "warning");
            return;
        }
        if(!$scope.usuario.correo || $scope.usuario.correo==""){
            swal("Campo vacio", "Debes colocar un correo electronico", "warning");
            return;
        }
        if(!$scope.usuario.contrasena|| $scope.usuario.contrasena==""){
            swal("Campo vacio", "Debes colocar una contrasenia", "warning");
            return;
        }
        socket.emit("modificar_usuario", $scope.usuario)
    }

    
    socket.on("respuesta_modificar_usuario", function(datos){
        if(datos.exito){
            swal("Usuario modificado", "", "success")
        } else {
            swal("Error", `${datos.mensaje}`, "success")
        }
    })

    $scope.desconectar_usuario = function(socket_id){
        $rootScope.cargando = false;
        socket.emit("desconectar_usuario", {socket_id: socket_id})
    };
    
    socket.removeListener("respuesta_desconectar_usuario")
    socket.on("respuesta_desconectar_usuario", function(datos){
        socket.emit("sesiones")
        $rootScope.cargando = false;
        location.reload();
        $rootScope.en_sesion = false;
    });

    $scope.logs = []
    socket.removeListener("genera_log_en_tiempo_real")
    socket.on("genera_log_en_tiempo_real", function(logs){
        console.log(logs)
        $scope.$apply(function(){
            $scope.logs.push({
                msj_estandar: logs.msj_estandar,
                res_web_service: JSON.stringify(logs.mensaje.datos),
                mensaje: logs.mensaje.mensaje,
                error: logs.error
            })
        })
    })
})