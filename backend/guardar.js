const Luminarias = require('../modelos/luminarias');
const Registros = require('../modelos/registros');
const fecha_base = require('./funciones_ayuda/fecha_base');

module.exports.guarda_datos = function (req){
    return new Promise(async (resolver, rechazar) => {
        let res_micro = {};
        try {
            let {luminaria, corriente, potencia, energia} = req.datos;
            let respuesta = await existe_luminaria (luminaria);
            console.log(req.datos);
            corriente = parseFloat(corriente);
            potencia= parseFloat(potencia);
            energia = parseFloat(energia);

            if(corriente<0 || corriente>100 || potencia>100 || potencia<10) {
                energia = 0;
                potencia = 0;
                corriente = 0;
            }

            if(respuesta.existe) {
                let nuevo_registro = new Registros({
                    numero_luminaria: luminaria,
                    fecha_medicion : fecha_base.obtener(),
                    corriente: corriente,
                    potencia: potencia,
                    energia: energia,
                    porcentaje_asignado:respuesta.luminaria.voltaje
                });
                let datos = await nuevo_registro.save().catch(function(err){throw err;});
                res_micro.exito = true;
                res_micro.datos = datos;
                res_micro.mensaje = "Datos guardados en Mongo";
            } else if(respuesta.error) {
                res_micro.exito = false;
                res_micro.mensaje = String(respuesta.error);
            } else {
                res_micro.exito = false;
                res_micro.mensaje = "No existe la Luminaria, por la tanto no es posible guadar los datos"
            }
            return resolver(res_micro)
        } catch (error) {
            res_micro.exito = false;
            res_micro.mensaje = String(error)
            resolver(res_micro)
            console.error(`[ERROR ✖ ${fecha.obtener()}]`, error)
        }
    })
}

function existe_luminaria (numero_luminaria) {
    try {
        var respuesta = {};
        return new Promise(resolve => {
            Luminarias.findOne({
                numero_luminaria
            }, function(err, luminaria) {
                if(luminaria){
                    respuesta = {
                        existe: true,
                        luminaria
                    };
                } else if(err) {
                    respuesta = {
                        error: "Se ha producido un error buscando la luminaria"
                    };
                } else {
                    respuesta = {
                        existe: false
                    };
                }
                return resolve(respuesta);
            })
        });
    } catch (error) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, error)
        return error;
    }
}