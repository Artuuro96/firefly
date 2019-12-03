var fs = require('fs');
const fecha = require('./funciones_ayuda/fecha')
const jsonfile = require('jsonfile')
const Luminarias = require('../modelos/luminarias');

module.exports.guardar_configuracion = (socket, datos) => {
    try {
        jsonfile.writeFileSync("./backend/jsons/configuracion.json", datos)
        socket.emit("respuesta_guarda_configuraciones", {
            exito: true,
            mensaje: "Configuraciones guardadas correctamente"
        })
        configurar_hora(datos.hora_apagado)
        configurar_hora(datos.hora_encendido)
    } catch (error) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error);
        socket.emit("respuesta_guarda_configuraciones", {
            exito: false,
            mensaje: "Error al guardar las configuraciones: " + error.message
        })
    }
}

module.exports.cargar_configuracion = (socket) => {
    try {
        let configs = JSON.parse(fs.readFileSync("./backend/jsons/configuracion.json", 'utf8'));
        socket.emit("respuesta_cargar_configuraciones", configs)
    } catch (error) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error);
    }
}

configurar_hora = async function (hora) {
    let hora_configurada = hora
    hora = hora.split(":")
    hora[0] = parseInt(hora[0]) - 5
    hora[1] = parseInt(hora[1])

    fecha_hoy = new Date().setHours(new Date().getHours() - 5);

    fecha_modificacion_hoy = new Date().setHours(hora[0], hora[1], 0)

    var intervalo_de_ejecucion = fecha_modificacion_hoy - fecha_hoy

    es_posible_ejecutar_hoy = Math.sign(intervalo_de_ejecucion)
    if (es_posible_ejecutar_hoy == 1) es_posible_ejecutar_hoy = true
    else es_posible_ejecutar_hoy = false

    if (!es_posible_ejecutar_hoy) {
        proxima_fecha_dia_siguiente = new Date().setHours(hora[0] + 24, hora[1], 0)

        intervalo_de_ejecucion = proxima_fecha_dia_siguiente - fecha_hoy
    }

    setTimeout(function () {
        try {
            console.log(hora_configurada)
            configiuracion_masiva(hora_configurada)
        } catch (error) {
            console.error(error)
        }
    }, intervalo_de_ejecucion);
}

configiuracion_masiva = async function (hora) {
    
    var configuracion = JSON.parse(fs.readFileSync("./backend/jsons/configuracion.json", 'utf8'));

    if (hora == configuracion.hora_apagado) {
        console.log("Ejecutando el apagado automatico")
        require('./panel_de_control').modificacion_total(undefined, { opcion: 'Apaga todas', luminarias_modificar: [] })
    }
    if (hora == configuracion.hora_encendido) {
        console.log("Ejecutando el encendido automatico")
        require('./panel_de_control').modificacion_total(undefined, { opcion: 'Enciende todas', luminarias_modificar: [] })
    }
}
