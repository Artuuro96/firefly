const mongoose = require('mongoose');

module.exports.establece_conexion_mongodb  = function (){
    return new Promise((resolver, rechazar) => {
        mongoose.connect('mongodb://localhost:27017/firefly', {useNewUrlParser: true, useCreateIndex: true}, 
        function (err, db){
            if(err) {
                console.log('No se ha podido iniciar el servidor de MongoDB', err);
                rechazar(err);
            } else {
                resolver(true)
            }
        });
    })
    
}

module.exports.cierra_conexion_mongodb = function() {
    return new Promise((resolver, rechazar) => {
        mongoose.connection.close(function(err){
            rechazar(false);
        });
        resolver(true);
    })
}