const pdf = require('./generar_pdf');
const fecha = require('./funciones_ayuda/fecha');
const fecha_base = require('./funciones_ayuda/fecha_base')
const Luminarias = require('../modelos/luminarias');
const Reportes = require('../modelos/reportes');
const Socket = require('./funciones_ayuda/sockets');

module.exports.procesa_falla = async ({
    fecha_dia,
    detalle,
    luminaria,
    tipo
}) => {
    try {
        let info_luminaria = await Luminarias.findOne({
            numero_luminaria: String(luminaria)
        }).lean().exec().catch(err => {
            throw err;
        })
        fecha_dia = fecha_base.obtener()
        fecha_bonita = fecha.obtener()
        let datos_pdf = {
            ...info_luminaria,
            detalle,
            tipo,
            fecha_dia: fecha_bonita
        }

        let respuesta = await pdf.genera_pdf({
            titulo: `L${luminaria}_${fecha_bonitaFallas}`,
            carpeta: 'reportes',
            plantilla: 'reporte'
        }, datos_pdf)

        if (respuesta.exito) {
            nuevo_registro = new Reportes({
                numero_luminaria: luminaria,
                fecha: fecha_dia,
                zona: datos_pdf.zona,
                usuario_reporte: datos_pdf.tipo,
                ubicacion: [datos_pdf.coordenada_x, datos_pdf.coordenada_y],
                ruta: respuesta.ruta
            })

            await nuevo_registro.save().catch(err => { throw err; })



            let reportes = await Reportes.find({}).lean().exec().catch(error => {
                Socket.enviar_a_sockets_conectados("respuesta_trae_reportes", {
                    exito: false,
                    mensaje: error.message
                })
                throw err;
            })

            Socket.enviar_a_sockets_conectados("respuesta_trae_reportes", {
                exito: true,
                respuesta: reportes,
            })
            cantidad = await Reportes.find({ terminado: false }).count()
            Socket.enviar_a_sockets_conectados("respuesta_traer_cantidad_reportes_sin_terminar", {
                cantidad_reportes: cantidad,
                exito: true
            })

        }

    } catch (error) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error)
    }
}

module.exports.trae_reportes = async (socket, datos) => {
    try {
        let reportes = await Reportes.find({}).lean().exec().catch(error => {
            throw err;
        });

        Socket.enviar_a_sockets_conectados("respuesta_trae_reportes", {
            exito: true,
            respuesta: reportes,
        })

    } catch (error) {
        Socket.enviar_a_sockets_conectados("respuesta_trae_reportes", {
            exito: false,
            mensaje: error.message
        })
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error)
    }
}

