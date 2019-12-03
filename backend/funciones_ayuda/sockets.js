const Sesiones = require('../../modelos/sesiones');

module.exports.envia_al_frente = async datos => {
    let respuesta = await require('../sesiones').verfica_usuarios_conectados();
    if(respuesta.exito)
        module.exports.enviar_a_sockets_conectados("genera_grafica_en_tiempo_real", datos)
    else
        console.log("No hay usuarios conectados")  
}

module.exports.enviar_a_sockets_conectados = (mensaje, datos) => {
    Object.keys(global.io.sockets.connected).forEach(socket_id => {
        var socket = io.sockets.connected[socket_id]
        socket.emit(mensaje, datos)
    });
}

