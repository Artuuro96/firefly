var Registros = require('../../modelos/registros')
var Registros_dia = require('../../modelos/registros_dia')
var Luminarias = require('../../modelos/luminarias')

module.exports.carga_registros_dia = async function () {
    datos = new Date();
    desde_fecha = new Date(datos.getFullYear(), datos.getMonth(), datos.getDate(), -4, -59, -59)
    hasta_fecha = new Date(datos.getFullYear(), datos.getMonth(), datos.getDate(), 18, 59, 59)

    let luminarias = await Luminarias.find({})
    for (let index = 0; index < luminarias.length; index++) {
        registros_dia = await Registros.find({
            numero_luminaria: luminarias[index].numero_luminaria,
            fecha_medicion: {
                $gte: new Date(desde_fecha),
                $lt: new Date(hasta_fecha)
            }
        }).lean().exec();
        registros_dia.sort(function compare(a, b) {
            var dateA = new Date(a.fecha_medicion);
            var dateB = new Date(b.fecha_medicion);
            return dateA - dateB;
        });
        let energia_dia = 0
        let potencia_dia = 0
        let corriente_dia = 0
        for (let i = 0; i < registros_dia.length; i++) {
            registros_dia[i].potencia = parseFloat(registros_dia[i].energia)
            energia_dia = energia_dia + registros_dia[i].energia

            registros_dia[i].potencia = parseFloat(registros_dia[i].potencia)
            potencia_dia = potencia_dia + registros_dia[i].potencia

            registros_dia[i].corriente = parseFloat(registros_dia[i].corriente)
            corriente_dia = corriente_dia + registros_dia[i].corriente

        }
        potencia_dia = potencia_dia / registros_dia.length
        corriente_dia = corriente_dia / registros_dia.length

        if (registros_dia.length == 0) {
            potencia_dia = 0
            corriente_dia = 0
        }

        await Registros_dia.findOneAndUpdate({
            numero_luminaria: luminarias[index].numero_luminaria,
            fecha_medicion: desde_fecha
        },
            {
                numero_luminaria: luminarias[index].numero_luminaria,
                fecha_medicion: new Date(desde_fecha),
                energia: energia_dia.toFixed(3),
                potencia: potencia_dia.toFixed(3),
                corriente: corriente_dia.toFixed(3)

            }, { upsert: true }, function (err) {})
    }
}