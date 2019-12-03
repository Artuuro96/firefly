var Luminarias = require('../modelos/luminarias')
var Socket = require('./funciones_ayuda/sockets')
var log = require('./funciones_ayuda/log')

module.exports.modificar_voltaje = async function (socket, datos) {
    try {
        let guardar_datos = await new Promise(async (resolver, rechazar) => {
            await Luminarias.findOneAndUpdate({
                numero_luminaria: datos.luminaria
            }, {
                    $set: {
                        voltaje: datos.voltaje,
                        estado: datos.estado
                    }
                }).exec((error, update) => {
                    if (error) {
                        return rechazar(false)
                    }
                })
            return resolver(true)
        })
        let ver_especificaciones = await Luminarias.findOne({
            numero_luminaria: datos.luminaria
        }).catch(function (err) {
            socket.emit("respuesta_modificar_luminaria", {
                exito: false
            })
            return
        })

        if (guardar_datos) {
            await resolver_luminarias(socket);

            socket.emit("respuesta_ver_especificaciones", {
                respuesta: ver_especificaciones,
                exito: true
            })
            let valor = "apagada"
            if (datos.estado == "activa")
                valor = "encendida"

            log.guardar_log("La luminaria " + datos.luminaria + " ha sido " + valor)
        }
        else {
            socket.emit("respuesta_modificar_luminaria", {
                exito: false
            })
        }
    } catch (err) {
        socket.emit("respuesta_modificar_luminaria", {
            exito: false
        })
    }
}

module.exports.modificacion_total = async function (socket, datos) {
    if (datos.opcion == "Apaga todas") {
        try {
            let apagar_todas = await Luminarias.updateMany(
                { estado: "activa" },
                {
                    $set: {
                        estado: "inactiva",
                        voltaje: 0
                    }
                }
            ).catch(function (err) {
                throw err
            })


            if (apagar_todas) {
                resolver_luminarias(socket)

                socket.emit("modificacion_total_luminaria", {
                    exito: true
                })
                log.guardar_log("Todas las luminarias han sido apgadas")

                return
            }

        } catch (err) {
            try {
                socket.emit("modificacion_total_luminaria", {
                    exito: false
                })
            } catch (err) {
                console.log("La funcion no tiene socket")
            }
        }
    }
    else if (datos.opcion == "Enciende todas") {
        try {
            let encender_todas = await Luminarias.updateMany(
                { estado: "inactiva" },
                {
                    $set: {
                        estado: "activa",
                        voltaje: 1023
                    }
                }
            ).catch(function (err) {
                throw err
            })

            if (encender_todas) {
                resolver_luminarias(socket)

                socket.emit("modificacion_total_luminaria", {
                    exito: true
                })
                log.guardar_log("Todas las luminarias han sido encendidas")
                return
            }
            socket.emit("modificacion_total_luminaria", {
                exito: false
            })

        } catch (err) {
            try {
                socket.emit("modificacion_total_luminaria", {
                    exito: false
                })
            } catch (err) {
                console.log("La funcion no tiene socket")
            }
        }

    }
    else {
        try {
            if (datos.opcion == "Encender seleccionadas") {
                var estado = `activa`
                var estado_mensaje = "encendida"
                var valor = 1023
            }
            if (datos.opcion == "Apagar Seleccionadas") {
                var estado = `inactiva`
                var estado_mensaje = "apagada"
                var valor = 0
            }
            for (let i = 0; i < datos.luminarias_modificar.length; i++) {
                await Luminarias.updateOne({
                    numero_luminaria: datos.luminarias_modificar[i]
                },
                    {
                        $set: {
                            estado: estado,
                            voltaje: valor
                        },
                        upsert: true
                    }).catch(function (err) {
                        socket.emit("modificacion_total_luminaria", {
                            exito: false
                        })
                        console.log(err)
                        throw err
                    });
                log.guardar_log("La luminaria: " + datos.luminarias_modificar[i] + " ha sido " + estado_mensaje)
            }
        } catch (err) {
            if (socket == undefined)
                console.log("La funcion no tiene socket")
            console.log(err)
        }
        resolver_luminarias(socket)

    }
}


resolver_luminarias = async function (socket) {
    let luminarias = await Luminarias.find({}).lean().exec().catch(function (err) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, error);
        socket.emit("respuesta_luminarias", {
            exito: false
        })
    })
    Socket.enviar_a_sockets_conectados("respuesta_luminarias", {
        respuesta: luminarias,
        exito: true
    })
}