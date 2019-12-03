
angular.module("firefly").controller("historial", function ($rootScope, $scope, socket, $location, $ocLazyLoad) {
    localStorage.setItem("menu_actual", "/historial")
    $rootScope.verificar_usuario();

    socket.emit("luminarias")
    socket.removeListener("respuesta_luminarias")
    socket.on("respuesta_luminarias", function (datos) {
        var voltaje_formato = [];
        for (let i = 0; datos.respuesta.length > i; i++) {
            voltaje_formato[i] = (datos.respuesta[i].voltaje * 100) / 1023;
            datos.respuesta[i].voltaje = voltaje_formato[i];
            $scope.luminarias = datos.respuesta;
        }
        socket.emit("luminarias_activas");
        socket.emit("luminarias_inactivas");
    })

    $scope.luminaria = undefined
    $scope.anio = undefined
    $scope.dia = undefined
    $scope.meses = true
    $scope.por_dias = false
    $scope.por_meses = false

    $scope.tabla_meses = false
    $scope.tabla_dias = false

    $scope.mostrar_grafica_tabla = false

    $scope.mostrar_datos = false
    $scope.mostrar_grafica = false
    $scope.boton_tabla_grafica = false

    $scope.mostrar_pdf = false
    $scope.ruta_pdf = ""


    $scope.seleccion_anio = function (numero) {
        $scope.anio = numero
    }
    $scope.seleccion_mes = function (numero) {
        $scope.mes = numero
    }
    $scope.seleccion_dia = function (numero) {
        $scope.dia = numero
    }

    $scope.ocultar_pdf = async function(){
        $scope.mostrar_pdf = false
    }

    $scope.en_dias = function () {
        $scope.por_dias = true
        $scope.por_meses = false
        $scope.mostrar_tabla = false
        $scope.tabla_meses = false
        $scope.tabla_dias = true
        $scope.boton_tabla_grafica = false
        $scope.mostrar_datos = false
        $scope.mostrar_pdf = false
        if ($scope.chart != undefined) {
            $scope.chart.destroy();
        }
    }
    $scope.en_meses = function () {
        $scope.mostrar_pdf = false
        $scope.por_dias = false
        $scope.por_meses = true
        $scope.mostrar_tabla = false
        $scope.tabla_meses = true
        $scope.tabla_dias = false
        $scope.boton_tabla_grafica = false
        $scope.mostrar_datos = false
        $scope.mostrar_pdf = false
        if ($scope.chart != undefined) {
            $scope.chart.destroy();
        }
    }
    $scope.indefinido = function () {
        $scope.mostrar_pdf = false
        $scope.por_dias = false
        $scope.por_meses = false
        $scope.mostrar_tabla = false
        $scope.mostrar_grafica = false
        $scope.tabla_meses = false
        $scope.tabla_dias = false
        $scope.boton_tabla_grafica = false
        $scope.mostrar_datos = false
        $scope.mostrar_pdf = false
        if ($scope.chart != undefined) {
            $scope.chart.destroy();
        }
    }

    $scope.por_tabla_grafica = function () {
        $scope.mostrar_grafica_tabla = !$scope.mostrar_grafica_tabla
    }

    $scope.buscar_luminaria = function (luminaria) {
        $scope.luminaria = luminaria
        console.log(luminaria)
        socket.emit("buscar_luminaria", luminaria)
    }
    socket.removeListener("respuesta_buscar_luminaria")
    socket.on("respuesta_buscar_luminaria", function (datos) {

        if (datos.exito == false) {
            swal("Error", "No hay registros de esa luminaria", "error")
            $scope.grafica = false
            $scope.mostrar_datos = false
        }
        else {
            $scope.anios = datos.anios
        }
    })

    $scope.graficar = function () {
        $scope.mostrar_pdf = false
        console.log($scope.mes, $scope.anio, $scope.luminaria, $scope.dia)
        if ($scope.chart != undefined) {
            $scope.chart.destroy();
        }
        if ($scope.mes != undefined || $scope.anio != undefined || $scope.luminaria != undefined && $scope.dia != undefined) {
            var datos_consulta = {
                luminaria: $scope.luminaria,
                mes: $scope.mes,
                anio: $scope.anio,
                dia: $scope.dia,
                por_dias: $scope.por_dias,
                por_meses: $scope.por_meses
            }
            $rootScope.cargando = true
            socket.emit("graficar", datos_consulta)
            $scope.datos_consulta = datos_consulta
        }
        else {
            swal("Error", "Llena todos los campos", "error")
        }
    }

    socket.removeListener("respuesta_graficar")
    socket.on("respuesta_graficar", function (datos) {
        $rootScope.cargando = false
        console.log("Datos", datos)
        console.log("Registro", datos.registro)
        if ($scope.chart != undefined) {
            $scope.chart.destroy();
        }
        if (datos.exito == true) {
            $scope.grafica = true
            $scope.mostrar_datos = true
            $scope.registro = datos.registro
            $scope.boton_tabla_grafica = true
            console.log("Data", $scope.registro)
            console.log(datos.fechas)
            let valor_maximo = Math.max.apply(Math, datos.valores.map(function (valores) { return valores; }))
            valor_maximo = valor_maximo * 1.15
            console.log(valor_maximo)
            if ($scope.chart != undefined) {
                $scope.chart.destroy();
            }
            ctx = document.getElementById('grafica_historial').getContext('2d');

            $scope.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: datos.fechas,
                    datasets: [{
                        label: "Consumo De la luminaria",
                        borderColor: 'rgb(255, 99, 132)',
                        data: datos.valores,
                    }]
                },
                options: {
                    fill: false,
                    responsive: true,
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Fecha",
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                max: valor_maximo,
                                min: 0
                            },
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Energia",
                            }
                        }]
                    }
                }
            });


        }
        else {
            swal("Error", "No hay registros de esa fecha", "error")
            $scope.grafica = false
            $scope.mostrar_datos = false
        }
    })


    $scope.genera_pdf_historial = function () {

        socket.emit("generar_pdf_grafica_historial", {
            datos_para_imprimir: $scope.registro,
            datos_consulta: $scope.datos_consulta
        })
        $rootScope.cargando = true
        
    }

    socket.removeListener("respuesta_generar_pdf_grafica_historial")
    socket.on("respuesta_generar_pdf_grafica_historial", function (datos) {
        $rootScope.cargando = false
        if(datos.exito == true){
            console.log("Dato",datos.ruta)
            $scope.ruta_pdf =  datos.ruta
            $scope.mostrar_pdf = true
            swal("Éxito", "PDF generado con exito", "success")
        }
        else{
            swal("Error", "Hubo un error al generar el pdf, intente mas tarde", "error")
        }
    })

});
