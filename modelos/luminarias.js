const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var luminarias_schema = new Schema ({
    numero_luminaria: {
        type: String,
        unique: true,
        required : true
    },
    nombre_luminaria: String,
    coordenada_x : String,
    coordenada_y : String,
    estado: {
        type: String,
        enum: {
            values: ['activa', 'inactiva', 'en reparacion'],
            message: "No existe ese estado"
        }
    },
    zona: {
        type: String
    },
    node_id: {
        type: Number,
        unique: true,
        required: true
    },
    voltaje: Number,
    estado_logico: Boolean,
    codigo: {
        type: Number,
        default: 000000
    },
    especificaciones: {
        consumo: String,
        voltaje: String,
        numero_lumenes: String,
        temperatura: String,
        angulo_iluminacion: String,
        vida_util: String,
        medidas: {
            largo: String,
            ancho: String,
            alto: String
        }
    }

});



var Luminarias = mongoose.model("Luminarias", luminarias_schema);
module.exports = Luminarias;