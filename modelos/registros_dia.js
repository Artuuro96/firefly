var mongoose = require('mongoose');
var Schema = mongoose.Schema

var registros_dia_schema = new Schema({
    numero_luminaria: String,
    fecha_medicion: Date,
    corriente: Number,
    potencia: Number,
    energia: Number
});

registros_dia_schema.index({
    numero_luminaria: 1,
    fecha_medicion: 1
}, {
    unique: true
});

var Registros_dia = mongoose.model("Registros_dia", registros_dia_schema);
module.exports = Registros_dia;