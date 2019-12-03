var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logs_schema = new Schema ({
    fecha: String,
    mensaje: String
});

var logs = mongoose.model("logs", logs_schema);
module.exports = logs;