const Luminarias = require('../modelos/luminarias');
const Reportes = require('../modelos/reportes');
const Socket = require('./funciones_ayuda/sockets');
const fecha = require('./funciones_ayuda/fecha');

module.exports.traer_luminarias_activas = async function (socket, datos) {
    try {
        let luminarias_activas = await Luminarias.aggregate([{
            $match: {
                estado: "activa"
            },
        },{
            $group: {
                _id: '',
                activas : {
                    $sum: 1
                }
            } 
        }]);

        if(luminarias_activas.length > 0){
            Socket.enviar_a_sockets_conectados("respuesta_traer_luminarias_activas", {
                exito: true,
                activas: luminarias_activas[0].activas 
            });
        } else {
            Socket.enviar_a_sockets_conectados("respuesta_traer_luminarias_activas", {
                exito: true,
                activas: 0
            });
        }
    } catch (error) {
        socket.emit("respuesta_traer_luminarias_activas", {
            exito: false,
            respuesta:"",
            mensaje: error.message
        })
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error)
    }
}

module.exports.traer_luminarias_inactivas = async (socket, datos) => {
    try {
        let luminarias_inactivas = await Luminarias.aggregate([{
            $match: {
                estado: "inactiva"
            },
        },{
            $group: {
                _id: '',
                inactivas : {
                    $sum: 1
                }
            } 
        }]);

        if(luminarias_inactivas.length > 0){
            Socket.enviar_a_sockets_conectados("respuesta_traer_luminarias_inactivas", {
                exito: true,
                inactivas: luminarias_inactivas[0].inactivas 
            });
        } else {
            Socket.enviar_a_sockets_conectados("respuesta_traer_luminarias_inactivas", {
                exito: true,
                inactivas: 0
            });
        }
    } catch (error) {
        socket.emit("respuesta_traer_luminarias_inactivas", {
            exito: false,
            inactivas: "",
            mensaje: error.message
        });
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error)
    } 
}

module.exports.reportes = async (socket, datos) => {
    try {
        let reportes = await Reportes.aggregate({
            $group: {
                _id: '',
                numero : {
                    $sum: 1
                }
            } 
        });

        if(reportes.length > 0){
            Socket.enviar_a_sockets_conectados("respuesta_numero_reportes", {
                exito: true,
                reportes: reportes.numero
            });
        } else {
            Socket.enviar_a_sockets_conectados("respuesta_numero_reporte", {
                exito: true,
                reportes: 0
            });
        }
    } catch (error) {
        socket.emit("respuesta_numero_reporte", {
            exito: false,
            inactivas: "",
            mensaje: error.message
        });
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error)
    } 
}

module.exports.reportes_sistema = async function (socket){
    cantidad = await Reportes.find({terminado: false}).count()
    socket.emit("respuesta_traer_cantidad_reportes_sin_terminar",{
        cantidad_reportes: cantidad,
        exito: true
    })
}