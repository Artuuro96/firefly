angular.module("firefly").controller("configuracion", function ($rootScope, $scope, socket, $location) {
    localStorage.setItem("menu_actual", "/configuracion")
    $rootScope.valido = false;
    $rootScope.verificar_usuario();
    socket.emit("cargar_configuraciones");
    socket.removeListener("respuesta_cargar_configuraciones");
    socket.on("respuesta_cargar_configuraciones", function (datos) {
        console.log(datos)
        $scope.tiempo_error = datos.tiempo_error;
        $scope.correos_errores = datos.correos_errores;
        $scope.correos_reportes = datos.correos_reportes;
        $scope.intervalo = datos.intervalo;
        $scope.hora_encendido = datos.hora_encendido;
        $scope.hora_apagado = datos.hora_apagado;
        $scope.numero_registros_pdf = datos.numero_registros_pdf;
    })

    socket.emit("usuarios")
    socket.removeListener("respuesta_usuarios")
    socket.on("respuesta_usuarios", function (datos) {
        $scope.usuarios = datos.respuesta;
    })

    $scope.guarda_configuraciones = function () {
        if (!$scope.tiempo_error || $scope.tiempo_error == "") {
            swal("Campo vacio", "Debes configurar un tiempo de error", "warning");
            return;
        }
        if (!$scope.correos_reportes || $scope.correos_reportes == "") {
            swal("Campo vacio", "Debes correos para recepcion de reportes", "warning");
            return;
        }
        if (!$scope.intervalo || $scope.intervalo == "") {
            swal("Campo vacio", "Debes configurar un intervalo de tiempo para grafica general", "warning");
            return;
        }
        if (!$scope.hora_encendido || $scope.hora_apagado == "") {
            swal("Campo vacio", "Debes configurar un horario de encendido", "warning");
            return;
        }
        if ($scope.hora_encendido == $scope.hora_apagado) {
            swal("Campo vacio", "La horas de endendido y apagado no pueden ser iguales", "warning");
            return;
        }
        if (!$scope.valida_encendido_apagado($scope.hora_encendido))
            return

        if (!$scope.valida_encendido_apagado($scope.hora_apagado))
            return
        if ($scope.numero_registros_pdf == 0) {
            swal("Campo vacio", "No puedes colocar una cantidad nula como registros", "warning");
            return;
        }
        if ($scope.numero_registros_pdf < 0) {
            swal("Campo vacio", "No puedes colocar registros negativos", "warning");
            return;
        }

        let configs = {
            tiempo_error: $scope.tiempo_error,
            correos_errores: $scope.correos_errores,
            correos_reportes: $scope.correos_reportes,
            intervalo: $scope.intervalo,
            hora_encendido: $scope.hora_encendido,
            hora_apagado: $scope.hora_apagado,
            numero_registros_pdf: $scope.numero_registros_pdf
        }
        $rootScope.cargando = true;
        socket.emit("guarda_configuraciones", configs)
    }

    $scope.valida_contrasena = function (usuario, confirmar) {
        if (usuario == confirmar)
            $scope.coincidencia = false;
        else
            $scope.coincidencia = true;
    }


    $scope.valida_encendido_apagado = function (hora) {
        try {

            hora = hora.split(":")
            console.log("hora[1]", hora[1].length)
            console.log("if[1]", !hora[1].length == 2)
            if (hora[0].length < 1 || hora[0].length > 2) {
                swal("Hora no configurada", "Las horass deben tener un formato de al menos un digito", "warning");
                return false;
            }
            if (hora[1].length < 2 || hora[1].length > 2) {
                swal("Hora no configurada", "Los minutos deben tener un formato de 2 digitos", "warning");
                return false;
            }
            hora[0] = parseInt(hora[0])
            hora[1] = parseInt(hora[1])
            if (hora.lenght == 5) {
                swal("Hora no configurada", "La hora debe ser como la siguiente '12:00'", "warning");
                return false;
            }
            if ((hora[0] < 0) || (hora[1] < 0)) {
                swal("Hora no configurada", "La hora no debe contener negativos", "warning");
                return false;
            }
            if ((hora[0] > 23) || (hora[1] > 59)) {
                swal("Hora no configurada", "Debes colocar un formato de 24 horas ", "warning");
                return false;
            }
            return true
        } catch (err) {
            swal("Hora no configurada", "Debes colocar un formato de 24 horas separados por ':' ", "warning");
            console.log(err)
            return false;
        }
    }

    $scope.valida_correo = function (correo) {
        var regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(correo) ? $scope.valido = false : $scope.valido = true;
    }
    $scope.abrir_modal_editar_usuario = function (usuario) {
        $scope.usuario = usuario
        $('#editar_usuario').modal('show');
    }

    $scope.modificar_usuario = function () {
        if (!$scope.usuario.usuario || $scope.usuario.usuario == "") {
            swal("Campo vacio", "Debes colocar un usuario", "warning");
            return;
        }
        if (!$scope.usuario.nombre || $scope.usuario.nombre == "") {
            swal("Campo vacio", "Debes colocar un nombre", "warning");
            return;
        }
        if (!$scope.usuario.correo || $scope.usuario.correo == "") {
            swal("Campo vacio", "Debes colocar un correo electronico", "warning");
            return;
        }
        if (!$scope.usuario.contrasena || $scope.usuario.contrasena == "") {
            swal("Campo vacio", "Debes colocar una contrasenia", "warning");
            return;
        }
        socket.emit("modificar_usuario", $scope.usuario)
    }

    socket.on("respuesta_modificar_usuario", function (datos) {
        if (datos.exito) {
            swal("Usuario modificado", "", "success")
        } else {
            swal("Error", `${datos.mensaje}`, "success")
        }
    })

    socket.removeListener("respuesta_guarda_configuraciones");
    socket.on("respuesta_guarda_configuraciones", function (datos) {
        $rootScope.cargando = false;
        if (datos.exito) {
            swal("Éxito", `${datos.mensaje}`, "success");
        } else {
            swal("Error", `${datos.mensaje}`, "error");
        }
    })
});

