var mongoose = require('mongoose');
var Schema = mongoose.Schema

var sesiones_schema = new Schema({
    usuario: String,
    contrasenia: String,
    menu_actual: String,
    socket_id: String,
    socket_anterior: String
});

var Sesiones = mongoose.model("Sesiones", sesiones_schema);
module.exports = Sesiones;