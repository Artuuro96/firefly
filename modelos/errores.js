var mongoose = require('mongoose');
var Schema = mongoose.Schema

var errores_schema = new Schema ({
    tipo: {
        type: String,
        required: true,
        enum: {
            values: ["sistema", "node_mcu", "api"],
            message: "El tipo de error no existe"
        }
    },
    fecha_dia: Date,
    detalle: String

});

var Errores_schema = mongoose.model("Errores", errores_schema);
module.exports = Errores_schema;