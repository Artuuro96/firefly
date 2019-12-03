const fecha = require('./funciones_ayuda/fecha'),
    Luminarias = require('../modelos/luminarias'),
    Registros = require('../modelos/registros'),
    PETICIONES_POST = 0


exports.peticion_post = async function(req, res) {
    try {
        let { tipo, luminaria, corriente, potencia } = req.body;
        let request = {
            type: String(tipo),
            datos: {
                luminaria,
                corriente,
                potencia
            }
        }
        
        global.requester.send(request, (response) => {
            response.luminaria = luminaria
            
        });
    } catch (error) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, error)
    }
}

exports.peticion_get = async function(req, res) {
    try {
        console.log("peticion 1")
        var request = {
            type: "hola",
            datos: {parametro: 1, COM: 7}
        }
        
        global.requester.send(request, (res) => {
            console.log("Respuesta", res)
        })
        
        /*let datos = req.body.datos.split("|")
        console.log("Cantidad de cambios ",datos.length)
        datos.forEach(i => {
            datos_p.push(i.split(","))
        }); 
        console.log("Areglo: ",datos_p)
        for(let i = 0; i < datos.length; i++){
            for(let j = 0; j < 3; j++){
                let help = datos_p[i][j].split(":")
                datos_e.push(help[1])
            }
            datos_f.push(datos_e)
            datos_e = []
        }
        for(let index = 0; index < datos_f.length; index++){
            let luminaria = await Luminarias.findOne({
                numero_luminaria: datos_f[index][0]
            })
            if(luminaria){
                let registro = new Registros({
                    numero_luminaria: datos_f[index][0],
                    fecha_medicion: fecha.obtener(),
                    voltaje: datos_f[index][1],
                    corriente: datos_f[index][2]/datos_f[index][1],
                    potencia: datos_f[index][2],
                    porcentaje_asignado: luminaria.voltaje
                });
                await registro.save().catch(function (err){});
            }
        }
    
        res.send({
            respuesta: "Datos recibidos"
        })*/
    } catch (err) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, err);
    }
}