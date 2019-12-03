var Luminarias = require('../modelos/luminarias')
var mongoose = require('mongoose')

module.exports.luminarias_guardadas = async function(socket){
    var luminarias = await Luminarias.find({}).lean().exec().catch(function(err){})
    socket.emit("respuesta_luminarias", {
        respuesta: luminarias,
        exito: true
    })
}

module.exports.ver_especificaciones = async function(socket,datos){
    var ver_especificaciones = await Luminarias.findOne({
        numero_luminaria: datos
    }).catch(function(err){
        console.log(err)
    })
    socket.emit("respuesta_ver_especificaciones", {
        respuesta: ver_especificaciones,
        exito: true
    })
}