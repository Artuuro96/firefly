var mongoose = require('mongoose');
var Schema = mongoose.Schema

var registros_schema = new Schema({
    numero_luminaria: String,
    fecha_medicion: Date,
    voltaje: Number,
    corriente: Number,
    potencia: Number,
    energia: Number,
    porcentaje_asignado: Number
});

registros_schema.post("save", function (res) {
    procesa_datos_guardados(res, mongoose.model("registros", registros_schema));
})

var Registros = mongoose.model("Registros", registros_schema);
module.exports = Registros;

function procesa_datos_guardados(datos, Modelo) {
    if(!datos) return;
    return datos;
    
}