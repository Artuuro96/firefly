var Sesiones = require('../modelos/sesiones');
var Usuarios = require('../modelos/usuarios');
var mongoose = require('mongoose');
const Socket = require('./funciones_ayuda/sockets')
const fecha = require('./funciones_ayuda/fecha')

module.exports.sesiones_activas = async function(socket, datos){
    var sesiones = await Sesiones.find({}).catch(function(err){})
    socket.emit("respuesta_sesiones", {
        respuesta: sesiones,
        exito: true
    });
}

module.exports.verfica_usuarios_conectados = function() {
    return new Promise(resolver => {
        let respuesta = {};
        let usuarios_conectados = Sesiones.find({}).lean().exec()
            .catch(err=>{throw err});
        if(usuarios_conectados){
            respuesta.datos = usuarios_conectados;
            respuesta.exito = true;
        }
        else {
            respuesta.exito = false;
            respuesta.mensaje = "No hay usuarios conectados"
        }
        resolver(respuesta);
    })  
}

module.exports.desconectar_usuario = async function(socket, datos){
    try {

        debugger;
        const usuario_en_sesion = await Sesiones.findOne({
            socket_id: datos.socket_id,
        }).catch(err => {throw err})

        await Usuarios.findOneAndUpdate({
            socket_id: datos.socket_id
        }, {
            $set: {
                en_sesion: false
            }
        }).catch(err => {
            throw err
        })

        let sesiones = await Sesiones.deleteOne({
            socket_id: datos.socket_id
        }).catch(err=>{throw err})

        desconectar_en_tiempo_real("respuesta_desconectar_usuario", usuario_en_sesion.socket_id);
    } catch (error) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error)
    }
   
}

function desconectar_en_tiempo_real(mensaje, socket_id) {
    var socket = io.sockets.connected[socket_id];
    socket.emit(mensaje, "desconecte al usuario")
}

