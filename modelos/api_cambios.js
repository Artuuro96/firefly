var mongoose = require('mongoose');
var Schema = mongoose.Schema

var api_cambios_schema = new Schema ({
    luminaria: String,
    numero_luminaria: Number,
    voltaje: Number,
});

var Api_cambios_schema = mongoose.model("Api_cambios", api_cambios_schema);
module.exports = Api_cambios_schema;