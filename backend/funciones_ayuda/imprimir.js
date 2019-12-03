var fecha = require('./fecha');
var sockets = require('./sockets');

module.exports.log = async (mensaje) => {
    let datos = {};
    if(mensaje.exito) {
        datos.error = false;
        datos.msj_estandar = `[LOG ▤ ${fecha.obtener()}]`;
        datos.mensaje = mensaje;
        
    } else {
        datos.error = true;
        datos.msj_estandar = `[ERROR ✖ ${fecha.obtener()}]`;
        datos.mensaje = mensaje;
    }
    sockets.enviar_a_sockets_conectados("genera_log_en_tiempo_real", datos)
}