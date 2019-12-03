console.log("")
console.log(" ██╗     ██╗   ██╗███╗   ███╗██╗███╗   ██╗ █████╗ ██████╗ ██╗ █████╗      ██╗ ");
console.log(" ██║     ██║   ██║████╗ ████║██║████╗  ██║██╔══██╗██╔══██╗██║██╔══██╗    ███║ ");
console.log(" ██║     ██║   ██║██╔████╔██║██║██╔██╗ ██║███████║██████╔╝██║███████║    ╚██║ ");
console.log(" ██║     ██║   ██║██║╚██╔╝██║██║██║╚██╗██║██╔══██║██╔══██╗██║██╔══██║     ██║ ");
console.log(" ███████╗╚██████╔╝██║ ╚═╝ ██║██║██║ ╚████║██║  ██║██║  ██║██║██║  ██║     ██║ ");
console.log(" ╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝     ╚═╝ ");
                                                                            
console.log("Microservicio Luminaria1 [" + process.pid + "]");
var mongoose = require("mongoose");
let opciones_conexion = {
    useMongoClient: true,
    poolSize: 2,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000
};
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/firefly', opciones_conexion, 
    function (err, db){
        if(err) {
            console.log(`[ERROR ✖ ${fecha.obtener()}]`, err)
        } else {
            console.log(`[LOG ▤ ${fecha.obtener()}] Conexión con MongoDB establecida`)
        }
    });
const db = require('../conexion_mongo');
const fecha = require('../funciones_ayuda/fecha');
const cote = require('cote');
const responder = new cote.Responder({
    name: "Microservicio de Luminaria 1",
    key: "LUMINARIA1"
});

responder.on("controlar_luminaria1", async (req, res) => {
    try {
        let res_micro = await require("../guardar").guarda_datos(req)
            .catch(err=>{throw err});
        res(res_micro);
    } catch (error) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, error)
        res({
            mensaje: String(error),
            exito: false
        });
    }   
});

responder.on("luminaria1", async (req, res) => {
    try {
        let res_cambios = await require('../buscar').buscar_registros_de_cambios(req)
            .catch(error => {
                throw error
            })
        if(res_cambios.existe) {
            res({
                exito: true,
                mensaje: JSON.stringify({
                    numero_luminaria: res_cambios.cambios.numero_luminaria
                }),
                voltaje: res_cambios.cambios.voltaje
            });
        } else {
            res({
                exito: false,
                mensaje: "No existe la luminaria"
            })
        }
    } catch (error) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, error)
        res({
            exito: false,
            mensaje: String(error)
        })
    }
})


