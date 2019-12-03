var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var menus_schema = new Schema ({
    _id: Number,
    nombre_menu: String,
    ubicacion: String,
    scripts: String,
    icono: String, 
    estilo: String
});

var Menus = mongoose.model("Menus", menus_schema);
module.exports = Menus;