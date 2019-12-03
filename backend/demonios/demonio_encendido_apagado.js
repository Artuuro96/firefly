var Luminarias = require('../../modelos/luminarias')
var fs = require('fs');
var hora_apagado_anterior_apagar = 0
var hora_encendido_anterior_encender = 0

module.exports.demonio_configuracion_encendido = async function () {
    var configuracion = JSON.parse(fs.readFileSync("./backend/jsons/configuracion.json", 'utf8'));
    if (hora_encendido_anterior_encender !== 0) {
        if (hora_encendido_anterior_encender == configuracion.hora_encendido) {
            //console.log("Ejecutando el encendido automatico: ",new Date().setHours(new Date().getHours() - 5))
            console.log("Ejecutando el encendido automatico: ", configuracion.hora_encendido)
            require('../panel_de_control').modificacion_total(undefined, { opcion: 'Enciende todas', luminarias_modificar: [] })
            intervalo_de_ejecucion_encender = 86400000
        }
        else {

            hora_encendido_anterior_encender = 0
        }
    }
    if (hora_encendido_anterior_encender == 0) {
        hora_encendido_anterior_encender = configuracion.hora_encendido
        try {
            hora_encendido = configuracion.hora_encendido.split(":")

            hora_encendido[0] = parseInt(hora_encendido[0]) - 5
            hora_encendido[1] = parseInt(hora_encendido[1])

            let fecha_hoy = new Date().setHours(new Date().getHours() - 5);

            let fecha_encendido_hoy = new Date().setHours(hora_encendido[0], hora_encendido[1], 0)

            var intervalo_de_ejecucion_encender = fecha_encendido_hoy - fecha_hoy

            es_posible_ejecutar_hoy = Math.sign(intervalo_de_ejecucion_encender)
            if (es_posible_ejecutar_hoy == 1) es_posible_ejecutar_hoy = true
            else es_posible_ejecutar_hoy = false

            if (!es_posible_ejecutar_hoy) {
                proxima_fecha_dia_siguiente = new Date().setHours(hora_encendido[0] + 24, hora_encendido[1], 0)

                intervalo_de_ejecucion_encender = proxima_fecha_dia_siguiente - fecha_hoy
            }

        } catch (err) {
            console.log("Error con el demonio de encendido", err)
        }
    }
    setTimeout(function () {
        try {
            module.exports.demonio_configuracion_encendido();
        } catch (error) {
            console.error(error)
        }
    }, intervalo_de_ejecucion_encender);
}

module.exports.demonio_configuracion_apagado = async function () {
    var configuracion = JSON.parse(fs.readFileSync("./backend/jsons/configuracion.json", 'utf8'));
    if (hora_apagado_anterior_apagar !== 0) {
        if (hora_apagado_anterior_apagar == configuracion.hora_apagado) {
            console.log("Ejecutando el apagado automatico de apagado: ",configuracion.hora_apagado)
            require('../panel_de_control').modificacion_total(undefined, { opcion: 'Apaga todas', luminarias_modificar: [] })
            intervalo_de_ejecucion = 86400000
        }
        else {

            hora_apagado_anterior_apagar = 0
        }
    }
    if (hora_apagado_anterior_apagar == 0) {
        hora_apagado_anterior_apagar = configuracion.hora_apagado
        try {
            hora_apagado = configuracion.hora_apagado.split(":")

            hora_apagado[0] = parseInt(hora_apagado[0]) - 5
            hora_apagado[1] = parseInt(hora_apagado[1])

            fecha_hoy = new Date().setHours(new Date().getHours() - 5);

            fecha_apagado_hoy = new Date().setHours(hora_apagado[0], hora_apagado[1], 0)

            var intervalo_de_ejecucion = fecha_apagado_hoy - fecha_hoy

            es_posible_ejecutar_hoy = Math.sign(intervalo_de_ejecucion)
            if (es_posible_ejecutar_hoy == 1) es_posible_ejecutar_hoy = true
            else es_posible_ejecutar_hoy = false
            if (!es_posible_ejecutar_hoy) {
                proxima_fecha_dia_siguiente = new Date().setHours(hora_apagado[0] + 24, hora_apagado[1], 0)

                intervalo_de_ejecucion = proxima_fecha_dia_siguiente - fecha_hoy
            }

        } catch (err) {
            console.log("Error con el demonio de apagado", err)
        }
    }
    setTimeout(function () {
        try {
            module.exports.demonio_configuracion_apagado();
        } catch (error) {
            console.error(error)
        }
    }, intervalo_de_ejecucion);
}
                 