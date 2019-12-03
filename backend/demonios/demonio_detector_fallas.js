var Luminarias = require('../../modelos/luminarias')
var Registros = require('../../modelos/registros')
var Errores = require('../../modelos/errores')
var error = require('../guardar_error')
const fecha = require('../funciones_ayuda/fecha')
const fs = require('fs');
const Reportes = require('../../modelos/reportes')
/**
 * El demonio detector de fallas
 * Este demonio tiene como proposito detectar cuando una luminaria no responde de manera correcta
 * con el valor asignado en la base de datos, ejemplo. Si el estado de la luminaria es "Activo" y 
 * el sensor me esta dando un valor menor de un umbral este debe generar un reporte y enviar correo
 * al JSON 
 */
var arreglo_fallas = []


module.exports.detector_fallos = async function () {
    var configuracion = JSON.parse(fs.readFileSync("./backend/jsons/configuracion.json", 'utf8'));
    luminarias = await Luminarias.find({}).lean().exec()
    for (let i = 0; i < luminarias.length; i++) {
        let bandera = 0
        let umbral = 30
        let mensaje = ""
        registros = await Registros.find({
            numero_luminaria: luminarias[i].numero_luminaria
        }).sort({ $natural: -1 }).limit(3);
        for (let index = 0; index < registros.length; index++) {

            if (registros[index].porcentaje_asignado == 1023) {
                if (registros[index].potencia < umbral) {
                    bandera = bandera + 1
                    mensaje = `La luminaria numero: ${luminarias[i].numero_luminaria} con zona en: ${luminarias[i].zona} \n 
Esta registrando valores de energia que corresponden a una luminaria APAGADA. \n 
Esto es un ERROR debido a que la luminaria deberia estar encendida. \n
\n
El registro de este error tiene la siguiente fecha: ${fecha.obtener()}`
                }
            }
            else if (registros[index].porcentaje_asignado == 0) {
                if (registros[index].potencia > umbral) {
                    bandera = bandera + 1
                    mensaje = `La luminaria numero: ${luminarias[i].numero_luminaria} con zona en: ${luminarias[i].zona} \n 
Esta registrando valores de energia que corresponden a una luminaria ENCENDIDA. \n 
Esto es un ERROR debido a que la luminaria deberia estar apagada. \n
\n
El registro de este error tiene la siguiente fecha: ${fecha.obtener()}`
                }
            }
            if (bandera > 2) {
                reportes = await Registros.find({
                    numero_luminaria: luminarias[i].numero_luminaria
                }).sort({ $natural: -1 }).limit(1);
                if (reportes.length != 0) {

                    let fecha_registro_string = reportes[0].fecha_medicion.setHours(new Date().getHours() + 5) + "_" + luminarias[i].numero_luminaria
                    if (!arreglo_fallas.find(error => error.id == fecha_registro_string)) {
                        for (let u = 0; u < arreglo_fallas.length; u++) {
                            if (arreglo_fallas[u].luminaria == luminarias[i].numero_luminaria) {
                                arreglo_fallas.splice(u, 1);
                            }
                        }
                        arreglo_fallas.push({
                            id: fecha_registro_string,
                            luminaria: luminarias[i].numero_luminaria
                        })

                        error.guardar(mensaje, "node_mcu", luminarias[i].numero_luminaria)
                    }
                }
            }
        }
    }
    setTimeout(function () {
        try {
            module.exports.detector_fallos();
        } catch (error) {
            console.error(error)
        }
    }, configuracion.tiempo_error);
}
