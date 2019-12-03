var Errores = require('../modelos/errores');
var correo = require('./correo');
var correos = require('../backend/jsons/configuracion');
const reporte = require('./reportes');
const fecha_base = require('./funciones_ayuda/fecha_base');
const fecha = require('./funciones_ayuda/fecha');

module.exports.guardar = async function (detalle, tipo, luminaria) {
    try {
        console.log(`[LOG ▤ ${fecha.obtener()}] Error || ${tipo}`)
        tipo = undefined ? tipo : "sistema"
        fecha_dia = fecha_base.obtener();
        nuevo_error = new Errores({
            tipo: tipo,
            fecha_dia,
            detalle: detalle
        })
        for (let index = 0; index < correos.correos_errores.length; index++) {
            datos = {
                destino: correos.correos_errores[index],
                asunto: "Error " + tipo,
                texto: detalle
            }
            correo.enviar_correo_electronico(undefined, datos)
        }

        await nuevo_error.save().catch(function (err) {
            throw err;
        });
        fecha_bonita = fecha.obtener()
        console.log(fecha_bonita)
        reporte.procesa_falla({
            fecha_dia: fecha_bonita,
            detalle,
            luminaria,
            tipo
        }).catch(err=>{
            throw err;
        })

    } catch (err) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, err);
    }
}