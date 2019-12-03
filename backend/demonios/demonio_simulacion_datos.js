var request = require('request');
var Registros = require('../../modelos/registros')

module.exports.simulacion_datos = function () {
    console.log("Demonio de simulacion de datos activos")
    voltaje = Math.random() * (0, 1023) + 0;
    watts = Math.random() * (0, 80) + 0;
    id = Math.floor(Math.random() * (0 - 3) + 3)

    voltaje1 = Math.random() * (0, 1023) + 0;
    watts1 = Math.random() * (0, 80) + 0;
    id1 = Math.floor(Math.random() * (0 - 3) + 3)

    voltaje2 = Math.random() * (0, 1023) + 0;
    watts2 = Math.random() * (0, 80) + 0;
    id2 = Math.floor(Math.random() * (0 - 3) + 3)

    for (let i = 1; i < 4; i++) {
        let nuevo_registro = new Registros({
            numero_luminaria: i,
            fecha_medicion: new Date(),
            voltaje: voltaje,
            corriente: voltaje / watts,
            potencia: watts,
            porcentaje_asignado: 100
        })
        nuevo_registro.save().catch(function (err) { });
    }


    setTimeout(function () {
        try {
            module.exports.simulacion_datos();
        } catch (error) {
            console.error(error)
        }

    }, 3000);
}
