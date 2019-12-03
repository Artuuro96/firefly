var Usuarios = require('../modelos/usuarios');
var Menus = require('../modelos/menus');
var Sesiones = require('../modelos/sesiones');
var fecha = require('./funciones_ayuda/fecha');
var md5 = require('md5');
var Socket = require('./funciones_ayuda/sockets')

module.exports.login = async function (socket, datos) {
    try {
        var contrasenia = md5(datos.contrasena)
        var Usuario = await Usuarios.findOne({
            usuario: datos.usuario,
            contrasenia: contrasenia
        }).lean().exec().catch(err => { throw err; })

        if (Usuario) {
            console.log(`[LOG ▤ ${fecha.obtener()}] Ha iniciado sesion el usuario: ${datos.usuario}`)
            if (Usuario.en_sesion == false) {
                await Usuarios.updateOne({
                    usuario: datos.usuario
                },
                    {
                        $set: {
                            en_sesion: true,
                            socket_id: socket.id
                        },
                        upsert: true
                    }).catch(err => { throw err; })

                var nueva_sesion = new Sesiones({
                    usuario: datos.usuario,
                    menu_actual: "/estadisticas_generales",
                    socket_id: socket.id
                });

                nueva_sesion.save().catch(err => { })


                var Menu = await Menus.find({
                    _id: {
                        $in: Usuario.menus
                    }
                })

                socket.emit('respuesta_login', {
                    respuesta: Usuario,
                    menus: Menu,
                    exito: true
                })
            }
            else {
                console.log("En sesion")
                socket.emit('respuesta_login', {
                    respuesta: Usuario,
                    exito: "en_sesion"
                })
            }

        }
        else {
            socket.emit('respuesta_login', {
                respuesta: Usuario,
                exito: false
            })
        }
    } catch (err) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, err)
    }

}

module.exports.cerrar_sesion = async function (socket, datos) {
    try {
        await Usuarios.updateOne({
            usuario: datos
        },
            {
                $set: {
                    en_sesion: false,
                },
                upsert: true
            }).catch(function (err) { });

        await Sesiones.deleteOne({
            usuario: datos
        }).catch(function (err) {
            console.log(`[ERROR ✖ ${fecha.obtener()}]`, err)
        });

        let sesiones = await Sesiones.find({}).lean().exec().catch(function(err){
            console.log(`[ERROR ✖ ${fecha.obtener()}]`, err)
        })

        console.log(sesiones)
        Socket.enviar_a_sockets_conectados("respuesta_refresca_sesiones",{
            respuesta: sesiones,
            exito: true
        })

    } catch (err) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, err)
    }
}

module.exports.cierre_forzado = async function (socket, datos) {
    try {
        await Usuarios.updateOne({
            socket_id: datos
        },
            {
                $set: {
                    en_sesion: false,
                },
                upsert: true
            }).catch(function (err) { })

        var prueba = await Sesiones.deleteOne({
            socket_id: datos
        }).catch(function (err) {
            console.err(err);
        });
    } catch (err) {
        console.log(err)
        //errores.imprimir(err, "login.js")
    }
}

module.exports.verificar_sesion = async function (socket, datos) {
    try {
        var contrasenia = md5(datos.contrasenia)
        var Usuario = await Usuarios.findOne({
            usuario: datos.usuario,
            contrasenia: contrasenia
        })

        var existe_sesion = await Sesiones.findOne({
            usuario: datos.usuario
        }).catch(function (err) {
            console.log(`[ERROR ✖ ${fecha.obtener()}]`, err);
        })

        if (Usuario && existe_sesion) {
            var Sesion = await Sesiones.updateOne({
                usuario: datos.usuario
            },
                {
                    $set: {
                        menu_actual: datos.menu_actual,
                        socket_id: socket.id
                    }

                }).catch(function (err) {
                    console.log(`[ERROR ✖ ${fecha.obtener()}]`, err);
                })

            var sesiones = await Sesiones.find({}).catch(err => {
                console.log(`[ERROR ✖ ${fecha.obtener()}]`, err);
            })

            refresca_sesiones(sesiones);

            if (Sesion) {
                var Menu = await Menus.find({
                    _id: {
                        $in: Usuario.menus
                    }
                }).catch(function (err) {
                    console.log(`[ERROR ✖ ${fecha.obtener()}]`, err)
                })

                console.log(`[LOG ▤ ${fecha.obtener()}] Usuario verificado`);
                socket.emit('respuesta_verificar_sesion', {
                    respuesta: Usuario,
                    menus: Menu,
                    exito: true
                })
            } else {
                console.log(`[ERROR ✖ ${fecha.obtener()}] No se pudo verficar el usuario`);
                socket.emit('respuesta_verificar_sesion', {
                    respuesta: Usuario,
                    exito: false
                })
            }
        }
        else if (Usuario || existe_sesion) {

            try {
                try {
                    await Sesiones.deleteOne({
                        usuario: Usuario.usuario
                    }).catch(function (err) { });
                } catch (err) {
                    await Sesiones.deleteOne({
                        usuario: existe_sesion.usuario
                    })
                }
            } catch (err) {

            }
            console.log(`[ERROR ✖ ${fecha.obtener()}] No se pudo verficar el usuario`);
            socket.emit('respuesta_verificar_sesion', {
                respuesta: Usuario,
                exito: false
            })
        }

    } catch (err) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, err);
        socket.emit('respuesta_verificar_sesion', {
            respuesta: Usuario,
            exito: false
        })
    }

    function refresca_sesiones(sesiones) {
        Object.keys(io.sockets.connected).forEach(function (socket_id) {
            var socket = io.sockets.connected[socket_id];
            socket.emit("respuesta_refresca_sesiones", {
                respuesta: sesiones,
                exito: true
            })
        })
    }
}

module.exports.guarda_codigo = async function (socket, datos) {
    try {
        await Usuarios.findOneAndUpdate({
            correo: datos.destino
        }, {
                $set: {
                    codigo: datos.codigo
                }
            }, function (err, usuarios) {
                if (err) {
                    console.log(`[ERROR ✖ ${fecha.obtener()}]`, error)
                }
                if (usuarios) {
                    socket.emit("respuesta_guardar_codigo", {
                        exito: true,
                        datos: usuarios,
                        mensaje: "Correo validado"
                    });
                } else {
                    socket.emit("respuesta_guardar_codigo", {
                        exito: false,
                        mensaje: "El correo que proporcionaste no existe o no su cuenta no esta vinculada con este correo",
                        datos: ""
                    });
                }
            })
    } catch (error) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error)
        socket.emit("respuesta_guardar_codigo", {
            exito: false,
            mensaje: String(error),
            datos: ""
        });
    }
}

module.exports.confirmar_codigo = async function (socket, datos) {
    try {
        let { codigo, correo } = datos;
        await Usuarios.findOne({
            correo,
            codigo
        }, function (err, usuario) {
            if (err) {
                console.log(`[ERROR ✖ ${fecha.obtener()}]`, error);
                socket.emit("respuesta_confirmar_codigo", {
                    exito: false,
                    mensaje: String(err),
                    respuesta: ""
                });
            } else if (usuario) {
                console.log(`[LOG ▤ ${fecha.obtener()}] Código de cambio de contrasenia verificado`);
                socket.emit("respuesta_confirmar_codigo", {
                    exito: true,
                    mensaje: "Contraseña modificada con exito",
                    respuesta: usuario
                });
            } else {
                socket.emit("respuesta_confirmar_codigo", {
                    exito: false,
                    mensaje: "",
                    respuesta: ""
                });
                console.log(`[LOG ▤ ${fecha.obtener()}] Código no confirmado`);
            }
        })
    } catch (error) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error);
    }
}

module.exports.cambiar_contrasenia = async function (socket, datos) {
    try {
        let {
            id,
            codigo,
            contrasenia
        } = datos;
        
        await Usuarios.findOneAndUpdate({
            _id: id,
            codigo
        }, {
                $set: {
                    contrasenia: md5(contrasenia)
                }
            }, function (err, usuario) {
                if (err) {
                    socket.emit("respuesta_cambiar_contrasenia", {
                        exito: false,
                        mensaje: String(err)
                    })
                    console.log(`[ERROR ✖ ${fecha.obtener()}]`, err);
                } else if (usuario) {

                    socket.emit("respuesta_cambiar_contrasenia", {
                        exito: true,
                        mensaje: "Constraseña cambiada con exito"
                    });
                    console.log(`[LOG ▤ ${fecha.obtener()}] Contraseña cambiada => usuario: ${usuario.usuario}`);
                } else {
                    socket.emit("respuesta_cambiar_contrasenia", {
                        exito: false,
                        mensaje: "Algo salio mal, no se pudo cambiar la contraseña"
                    })
                    console.log(`[LOG ▤ ${fecha.obtener()}] Algo salio mal, no se pudo cambiar la contraseña => usuario: ${usuario.usuario}`);
                }
            })
    } catch (error) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error);
    }
}