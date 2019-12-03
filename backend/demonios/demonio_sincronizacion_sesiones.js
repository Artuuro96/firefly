var Sesiones = require('../../modelos/sesiones');

module.exports.sincronizador_sesion = async function () {
    var sesiones = await Sesiones.find({})
    
    global.io.emit("respuesta_sesiones", {
        respuesta: sesiones,
        exito: true
    });
    
    setTimeout(function () {
        try {
            module.exports.sincronizador_sesion();
        } catch (err) {
            console.error(err);
        }
    }, 4000); 
}