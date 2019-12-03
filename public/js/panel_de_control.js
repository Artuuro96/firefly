angular.module("firefly").controller("panel_de_control", function ($rootScope, $scope, socket, $location, $ocLazyLoad) {
    localStorage.setItem("menu_actual", "/panel_de_control")
    $rootScope.verificar_usuario();

    $scope.voltaje_a_modificar = "";
    $scope.modificar_seleccion = "";
    $scope.luminarias_seleccion = [];

    socket.emit("luminarias")
    socket.removeListener("respuesta_luminarias")
    socket.on("respuesta_luminarias", function (datos) {
        console.log("Luminarias: ", datos)
        var voltaje_formato = [];
        $scope.$apply(function () {
            for (let i = 0; datos.respuesta.length > i; i++) {
                voltaje_formato[i] = (datos.respuesta[i].voltaje * 100) / 1023;
                datos.respuesta[i].voltaje = voltaje_formato[i];
                $scope.luminarias = datos;
            }
        })
        socket.emit("luminarias_activas");
        socket.emit("luminarias_inactivas");

    })

    $scope.ver_especificaciones = function (datos) {
        socket.emit("ver_especificaciones", datos)
    }
    socket.removeListener("respuesta_ver_especificaciones")
    socket.on("respuesta_ver_especificaciones", function (datos) {
        console.log("respuesta_ver_especificaciones",datos)
        $scope.especificaciones = datos.respuesta;
        $scope.luminaria_modificar = datos.respuesta.numero_luminaria;
        $scope.voltaje_a_modificar = (100 * datos.respuesta.voltaje) / (1023);
    })

    $scope.modificar_voltaje = function (numero_luminaria) {
        var cambiar_voltaje = ($scope.voltaje_a_modificar * 1023) / 100
        socket.emit("modificar_voltaje", {
            voltaje: cambiar_voltaje,
            numero_luminaria: numero_luminaria
        })
    }

    $scope.apagar = function (luminaria, voltaje, estado) {
        socket.emit("apagar_luminaria", {
            luminaria,
            voltaje,
            estado
        });
    }
    $scope.encender = function (luminaria, voltaje, estado) {
        socket.emit("encender_luminaria", {
            luminaria,
            voltaje,
            estado
        });
    }

    socket.on("respuesta_modificar_luminaria", function (datos) {
        console.log("sup", datos);
    })

    $scope.seleccionar = function (datos, agregar) {
        if (agregar == true) {
            $scope.luminarias_seleccion.push(datos)
        }
        else {
            for (var i = 0; i < $scope.luminarias_seleccion.length; i++) {
                if ($scope.luminarias_seleccion[i] === datos) {
                    $scope.luminarias_seleccion.splice(i, 1);
                }
            }
        }

    }
    $scope.modificacion_total = function () {
        if ($scope.modificar_seleccion === "Apaga todas" || $scope.modificar_seleccion === "Enciende todas") {
            socket.emit("modificacion_total", {
                opcion: $scope.modificar_seleccion,
                luminarias_modificar: $scope.luminarias_seleccion
            })

        }
        if ($scope.modificar_seleccion === "Encender seleccionadas" || $scope.modificar_seleccion === "Apagar Seleccionadas") {
            socket.emit("modificacion_total", {
                opcion: $scope.modificar_seleccion,
                luminarias_modificar: $scope.luminarias_seleccion
            })
        }
        $scope.luminarias_seleccion = [];
    }
})