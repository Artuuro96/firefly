const Registros = require('../../modelos/registros')
const Luminarias = require('../../modelos/luminarias')
const fs = require('fs');
const fecha = require('../funciones_ayuda/fecha')
var error = require('../guardar_error')

var arreglo_fallos = []

module.exports.inicia_demonio_detector_desconexion = async function () {
    setTimeout(function () {
        try {
            module.exports.detector_desconexion();
        } catch (error) {
            console.error(error)
        }
    }, 120000);
}

module.exports.detector_desconexion = async function () {
    let configs = JSON.parse(fs.readFileSync("./backend/jsons/configuracion.json", 'utf8'));
    luminarias = await Luminarias.find({}).lean().exec()
    for (let i = 0; i < luminarias.length; i++) {

        registros = await Registros.find({
            numero_luminaria: luminarias[i].numero_luminaria
        }).sort({ $natural: -1 }).limit(1);
        if (registros.length != 0) {
            let fecha_registros = registros[0].fecha_medicion
            let fecha_actual = new Date().setHours(new Date().getHours() - 5)
            let intervalo = fecha_actual - fecha_registros

            let fecha_registro_string = fecha_registros.setHours(new Date().getHours() + 5) + "_" + luminarias[i].numero_luminaria

            if (intervalo > configs.tiempo_error) {
                if (!arreglo_fallos.find(error => error.id == fecha_registro_string)) {

                    for (let u = 0; u < arreglo_fallos.length; u++) {
                        if (arreglo_fallos[u].luminaria == luminarias[i].numero_luminaria) {
                            arreglo_fallos.splice(u, 1);
                        }
                    }

                    arreglo_fallos.push({
                        id: fecha_registro_string,
                        luminaria: luminarias[i].numero_luminaria
                    })
                    mensaje = `La luminaria numero: ${luminarias[i].numero_luminaria} con zona en: ${luminarias[i].zona} \n 
Ha dejado de transmitir registros a la base de datos. \n 
Esto es un error debido a que el microservicio de la luminaria esta encendido. \n
El ultimo registro de la luminaria fue a las ${fecha_registros} \n
\n
El registro de este error tiene la siguiente fecha: ${fecha.obtener()}`

                    error.guardar(mensaje, "node_mcu", luminarias[i].numero_luminaria)
                }
            }

        }
    }


    setTimeout(function () {
        try {
            module.exports.detector_desconexion();
        } catch (error) {
            console.error(error)
        }
    }, configs.tiempo_error);
}