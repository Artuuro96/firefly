const Luminarias = require('../modelos/luminarias');

module.exports.buscar_registros_de_cambios = async function(req){
    try {
        var respuesta = {}
        return new Promise(resolver => {
            Luminarias.findOne({
                numero_luminaria: Number(req.type.substr(-1)) //Number(req.type.substr(-1))
            }, function (error, cambios) {
                if(cambios) {
                    respuesta.exito = true;
                    respuesta.existe = true;
                    respuesta.cambios = cambios;
                } else if (error) {
                    respuesta.exito = false;
                    respuesta.error = "Se ha producido un error buscando cambios: " + error
                } else {
                    respuesta.exito = false;
                    respuesta.existe = false;
                }
                return resolver(respuesta);
            })
        })
    } catch (error) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, error);
        return error;
    }
}
