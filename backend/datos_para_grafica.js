const fecha = require('./funciones_ayuda/fecha');
const calcula_energia_por_luminaria = require('./procesa_datos_dia');
const fs = require('fs');
const Socket = require('./funciones_ayuda/sockets')

module.exports.datos_para_grafica_pastel = async (socket) => {
    try {
        let configs = fs.readFileSync("./backend/jsons/configuracion.json");
        configs = JSON.parse(configs);

        let datos = await calcula_energia_por_luminaria(parseInt(configs.intervalo)).catch(error => {
            throw error;
        });
        if (!socket == undefined) {
            socket.emit("respuesta_datos_para_grafica_pastel", {
                exito: true,
                respuesta: datos
            });
        }
        Socket.enviar_a_sockets_conectados("respuesta_datos_para_grafica_pastel", {
            exito: true,
            respuesta: datos
        });

    } catch (error) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error);
        socket.emit("respuesta_datos_para_grafica_pastel", {
            exito: false,
            respuesta: datos,
            mensaje: error.message
        })
    }
}

