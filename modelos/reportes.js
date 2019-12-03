const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reportes_schema = new Schema({
    numero_luminaria: String,
    fecha: Date,
    zona: String,
    estado: String,
    usuario_reporte: String,
    ubicacion: [String],
    ruta: String,
    terminado:{
        type: Boolean,
        default: false
    }
});

var Reportes = mongoose.model("Reportes", reportes_schema);
module.exports = Reportes;