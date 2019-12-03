var Logs = require('../../modelos/logs')
var fecha = require('./fecha')
var Socket = require('./sockets')

module.exports.guardar_log = async function (mensaje) {
    log = new Logs({
        fecha: fecha.obtener(),
        mensaje: mensaje

    });
    await log.save().catch(function (err) {
        console.log("No se pudo guardar el log", err)
    });

    module.exports.consultar_logs()
}

module.exports.consultar_logs = async function () {
    try {
        var logs = await Logs.find({}).sort({$natural:-1}).limit(5);
        Socket.enviar_a_sockets_conectados("respuesta_traer_logs", logs)
    } catch (err) {
        console.log("No se pudieron traer los logs ", err)
    }
}
