
var moongose = require('mongoose');
var Schema = moongose.Schema;

var usuarios_schema = new Schema({
    usuario: {
        type: String,
        unique: true,
        minlenght: [6, "Nombre de usuario debe ser minimo de 6 caracteres"],
        maxlenght: [8, "Nombre de usuario no debe ser mayor a 8 caracteres"],
        lowercase: true
    },
    nombre: String,
    correo: {
        type: String,
        unique: true,
        match: [/([\w+\._%-]+@[\w+\.-]+\.[\w+]{2,4}[^,;\s])/, "Correo inválido"]
    },
    contrasenia: String,
    menus: [Number],
    socket_id: String,
    tipo_usuario: {
        type: String,
        enum: {
            values: ['desarrollador','administrador','usuario'],
            message: "No existe el tipo de usuario"
        }
    },
    en_sesion: { 
        type: Boolean,
        default: false
    }, 
    recuperar_contrasenia: {
        type: Boolean,
        default: false
    },
    codigo:{
        type: Number,
    }
});

var Usuarios = moongose.model("Usuarios", usuarios_schema);
module.exports = Usuarios;