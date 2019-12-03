const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var microservicios_schema = new Schema({
    nombre: String,
    microservicio: String,
    api: String  
});

var Microservicios = mongoose.model("Microservicios", microservicios_schema)
module.exports = Microservicios;

