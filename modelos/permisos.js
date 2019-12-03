const moongose = require('moongose');
var Schema = moongose.Schema;

var permisos_schema = new Schema({
    usuario: String,
    menu: String,
    crud: {
        leer: {
            type: Boolean,
            default: false
        },
        crear: {
            type: Boolean,
            default: false
        },
        eliminar: {
            type: Boolean,
            default: false
        },
        editar: {
            type: Boolean,
            default: false
        }
    },
    tipo: [String]
});

var Permisos = moongose.model("Permisos", permisos_schema);
modulo.exports = Permisos;