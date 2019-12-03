angular.module("firefly").controller("estadisticas", function ($rootScope, $scope, socket, $location, $ocLazyLoad) {
    localStorage.setItem("menu_actual", "/estadisticas_generales")
    $rootScope.verificar_usuario();

    socket.emit("datos_grafica_general_pastel");
    socket.removeListener("respuesta_datos_para_grafica_pastel");
    socket.on("respuesta_datos_para_grafica_pastel", function (datos) {
        if (datos.exito) {
            console.log("Datos para los KH: ", datos.respuesta)
            $scope.consumo_total = 0

            datos.respuesta.forEach(luminaria => {
                luminaria.forEach(energia => {
                    $scope.consumo_total = $scope.consumo_total + energia.energia_total
                })
            })
            $scope.consumo_total =  $scope.consumo_total/1000
            $scope.consumo_total = $scope.consumo_total.toFixed(3)
            genera_grafica_pastel(datos.respuesta)
        } else {
            swal("Error", datos.mensaje, "error")
        }
    });

    $scope.logs = []
    $scope.cantidad_registros = 0

    socket.emit("luminarias_activas");
    socket.emit("traer_logs");
    socket.emit("traer_cantidad_reportes_sin_terminar")

    socket.on("respuesta_traer_luminarias_activas", function (datos) {
        if (datos.exito) {
            if (datos.activas > 0) {
                $scope.$apply(function () {
                    $scope.lum_activas = datos.activas;
                })
            } else {
                $scope.$apply(function () {
                    $scope.lum_activas = 0
                })
            }

        } else {
            swal("Error", datos.mensaje, "error")
        }
    });

    socket.emit("luminarias_inactivas");
    socket.on("respuesta_traer_luminarias_inactivas", function (datos) {
        if (datos.exito) {
            if (datos.inactivas > 0) {
                $scope.$apply(function () {
                    $scope.lum_inactivas = datos.inactivas;
                })
            }
            else {
                $scope.$apply(function () {
                    $scope.lum_inactivas = 0;
                })
            }
        } else {
            swal("Error", datos.mensaje, "error")
        }
    })

    socket.emit("numero_reportes")
    socket.removeListener("respuesta_numero_reportes");
    socket.on("respuesta_numero_reportes", function (datos) {
        if (datos.exito) {
            if (datos.reportes > 0) {
                $scope.$apply(function () {
                    $scope.reportes = datos.reportes;
                })
            }
            else {
                $scope.$apply(function () {
                    $scope.reportes = 0;
                })
            }
        } else {
            swal("Error", datos.mensaje, "error")
        }
    })

    socket.on("envia_correo", function (datos) {
        console.log(datos)
    });

    function genera_grafica_pastel(datos) {
        var datos_grafica = [];
        var etiquetas = [];
        var colores = [];
        datos.forEach(dato => {
            dato.forEach(d => {
                datos_grafica.push(d.energia_total);
                etiquetas.push(`Luminaria ${d._id}`);
                colores.push($scope.genera_colores_al_azar());
            })
        });
        if ($scope.grafica_pastel != undefined)
            $scope.grafica_pastel.destroy();
        $scope.grafica_pastel = new Chart(document.getElementById("pastel"), {
            type: 'doughnut',
            data: {
                labels: etiquetas,
                datasets: [
                    {
                        backgroundColor: colores,
                        data: datos_grafica
                    }
                ]
            },
            options: {
                title: {
                    display: true,
                    text: ''
                }
            }
        });
    }

    $scope.genera_colores_al_azar = function () {
        let R = Math.round(Math.random() * (255 - 100) + parseInt(100));
        let G = Math.round(Math.random() * (255 - 100) + parseInt(100));
        let B = Math.round(Math.random() * (255 - 100) + parseInt(100));
        return `rgb(${R},${G},${B})`
    }

    socket.removeListener("respuesta_traer_logs");
    socket.on("respuesta_traer_logs", function (datos) {
        $scope.logs = datos
    })
    socket.removeListener("respuesta_traer_cantidad_reportes_sin_terminar");
    socket.on("respuesta_traer_cantidad_reportes_sin_terminar", function (datos) {
        $scope.cantidad_registros = datos.cantidad_reportes
    })
})
