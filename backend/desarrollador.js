const Luminarias = require('../modelos/luminarias'),
    Usuarios = require('../modelos/usuarios'),
    Menus = require('../modelos/menus'),
    fecha = require('./funciones_ayuda/fecha'),
    md5 = require('md5');
    


module.exports.guardar_luminaria = async function (socket, datos){
    try {
        
        var cambiar_voltaje = (datos.voltaje * 1023)/100
        var nueva_luminaria = new Luminarias({
                numero_luminaria: datos.numero_luminaria,
                coordenada_x: datos.coordenada_x,
                coordenada_y: datos.coordenada_y,
                estado: datos.estado,
                zona: datos.zona,
                node_id: datos.node_id,
                voltaje: cambiar_voltaje,
                especificaciones: {
                    consumo: datos.especificaciones.consumo,
                    voltaje: datos.especificaciones.voltaje,
                    numero_lumenes: datos.especificaciones.numero_lumenes,
                    temperatura: datos.especificaciones.temperatura,
                    angulo_iluminacion: datos.especificaciones.angulo_iluminacion,
                    vida_util: datos.especificaciones.vida_util,
                    medidas: {
                        largo: datos.especificaciones.medidas.largo,
                        ancho: datos.especificaciones.medidas.ancho,
                        alto: datos.especificaciones.medidas.alto
                    }
                }
        });
        guardar = await new Promise(async(resolver, rechazar) => {
            try{
            await nueva_luminaria.save()
            resolver(true);

            }catch(err){
                console.log(err)
                rechazar(false)
            }
        })
        
        if(guardar){
            socket.emit("respuesta_guardar_luminaria", {
                respuesta: "",
                exito: true
            })
        }
        else{
            console.log(`[ERROR ✖ ${fecha.obtener()}] Llave duplicada`)
            socket.emit('respuesta_guardar_luminaria', {
                respuesta: "Campo duplicado",
                exito: false
            })
        }
    } catch (err) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, err)
        socket.emit("respuesta_guardar_luminaria", {
            respuesta: "llenar_campos",
            exito: false
        })
    }
}

module.exports.modificar_luminaria = async function (socket, datos){
    try{
        var cambiar_voltaje = (datos.voltaje * 1023)/100
        if(datos.voltaje == 0 || datos.voltaje == 10 || datos.voltaje == 20 || datos.voltaje == 30 || datos.voltaje == 40 || datos.voltaje == 50 || datos.voltaje == 60 || datos.voltaje == 70 || datos.voltaje == 80 || datos.voltaje == 90 || datos.voltaje == 100){
        if(datos.numero_luminaria || datos.estado || datos.voltaje){
            modificar_luminaria = await Luminarias.updateOne({
                numero_luminaria: datos.luminaria_modificar
                },
                {
                    $set: {
                        numero_luminaria: datos.numero_luminaria,
                        coordenada_x: datos.coordenada_x,
                        coordenada_y: datos.coordenada_y,
                        estado: datos.estado,
                        zona: datos.zona,
                        node_id: datos.node_id,
                        arduino_id: datos.arduino_id,
                        voltaje: cambiar_voltaje,
                        especificaciones: {
                            consumo: datos.especificaciones.consumo,
                            voltaje: datos.especificaciones.voltaje,
                            numero_lumenes: datos.especificaciones.numero_lumenes,
                            temperatura: datos.especificaciones.temperatura,
                            angulo_iluminacion: datos.especificaciones.angulo_iluminacion,
                            vida_util: datos.especificaciones.vida_util,
                            medidas: {
                                largo: datos.especificaciones.medidas.largo,
                                ancho: datos.especificaciones.medidas.ancho,
                                alto: datos.especificaciones.medidas.alto
                            }
                        }
                    }
                })
    
                if(modificar_luminaria){
                    console.log("Luminaria modificada")
                    socket.emit("respuesta_modificar_luminaria",{
                        respuesta: modificar_luminaria,
                        exito: true
                    })
                }
                else{
                    console.log("Luminaria no modificada")
                    socket.emit("respuesta_modificar_luminaria",{
                        respuesta: modificar_luminaria,
                        exito: false
                    })
                }
            }
            else{
                console.log("Luminaria no modificada")
                socket.emit("respuesta_modificar_luminaria",{
                    respuesta: modificar_luminaria,
                    exito: "llenar_campos"
                })
            }
        }
        else{
            console.log("Luminaria no modificada")
            socket.emit("respuesta_modificar_luminaria",{
                respuesta: modificar_luminaria,
                exito: "llenar_voltaje"
            })
        }
    } catch (err) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, err)
    }    
}

module.exports.eliminar_luminaria = async function(socket, datos){
    try {
        var luminaria = await Luminarias.deleteOne({
            numero_luminaria: datos
        }).catch(function(err){});
    
        if(luminaria){
            socket.emit("respuesta_eliminar_luminaria",{
                exito: true
            })
        }
        else{
            socket.emit("respuesta_eliminar_luminaria",{
                exito: false
            })
        }
    } catch(err){
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, err)
    }
}

module.exports.traer_usuarios = async function(socket, datos){
    try{
        var usuarios = await Usuarios.find({}).lean().exec();
        if(usuarios){
            var menus = [];
            for(let i = 0; i < usuarios.length; i++){
                menus[i] = await Menus.find({
                    _id: {
                        $in: usuarios[i].menus
                    }
                });
                usuarios[i].menus = menus[i];
            }
            socket.emit("respuesta_usuarios", {
                exito: true,
                respuesta: usuarios,
            });
        } else {
            socket.emit("respuesta_usuarios", {
                exito: false
            });
        }
    } catch (err) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, err)
    }
}

module.exports.eliminar_usuario = async function(socket, datos){
    try{
        var eliminar_usuario = Usuarios.deleteOne({
            usuario: datos.usuario
        }).catch(err => {})
    } catch (err) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, err)
        socket.emit("respuesta_eliminar_usuario", {
            exito: false,
            respuesta: err
        });
    }

    if(eliminar_usuario){
        socket.emit("respuesta_eliminar_usuario", {
            exito: true,
            respuesta: eliminar_usuario
        })
        //envia.sockets_conectados("respuesta_eliminar_usuario", Usuarios)
    }
}

module.exports.permisos_por_usuario = async function(socket, datos) {
    try {
        await Usuarios.findById({
            _id: datos.id
        }, async(err, usuario) => {
            if(usuario) {
                var menus = await Menus.find({
                    _id: {
                        $in: usuario.menus
                    }
                })
                socket.emit("respuesta_permisos_por_usuario", {
                    exito: true,
                    respuesta: menus
                });
            } else {
                console.error(`[ERROR ✖ ${fecha.obtener()}]`, err)
            }
        })
    } catch (err){
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, err)
    }
}

module.exports.guardar_usuario = async function(socket, datos) {
    let contrasenia = md5(datos.contrasena);
    try {
        var nuevo_usuario = new Usuarios({
            nombre: datos.nombre,
            usuario: datos.usuario,
            correo: datos.correo,
            contrasenia,
            menus: datos.menus,
            tipo_usuario: datos.tipo_usuario
        });

        nuevo_usuario.save().catch((err)=>{
            throw err;
        })
        if(nuevo_usuario){
            socket.emit("respuesta_guardar_usuario", {
                respuesta: "",
                exito: true
            })
        }

    } catch (err) {
        socket.emit("respuesta_guardar_usuario", {
            respuesta: err,
            exito: false
        })
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, err)
    }
}

module.exports.todos_los_menus = async function (socket, datos){
    try {
        let menus = await Menus.find({}).lean().exec().catch(err=>{
            throw err;
        });
        socket.emit("respuesta_menus", {
            exito: true,
            respuesta: menus,
        });
    } catch (error) {
        socket.emit("respuesta_menus", {
            exito: false,
            respuesta: menus,
        });
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, err);
    }
}

module.exports.editar_usuario = async (socket, datos) => {
    try {
        let {
            tipo_usuario,
            nombre,
            correo,
            contrasena,
            usuario,
            _id
        } = datos;

        await Usuarios.findOneAndUpdate({
            _id
        },{
            $set: {
                usuario,
                nombre,
                correo,
                contrasenia: md5(contrasena),
                tipo_usuario
            }
        }, function(err, usuario_editado){
            if(err){
                throw err;
            }
            if(usuario_editado) {
                socket.emit("respuesta_modificar_usuario", {
                    exito: true,
                    mensaje: "Usuario modificado"
                })
            } else {
                socket.emit("respuesta_guardar_codigo", {
                    exito: false,
                    mensaje: "No se puedo guardar",
                    datos: ""
                });
            }
        })
        
    } catch (error) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, err);
        socket.emit("respuesta_modificar_usuario", {
            exito: false,
            mensaje: error.message
        })
    }
} 

module.exports.asignar_menus = async(socket, datos) => {
    try {
        let {id, menus} = datos;
        await Usuarios.findOneAndUpdate({
            _id : id
        },{
            $set: {
                menus
            }
        }, function(err, usuario_con_menus){
            if(err){
                throw err;
            }
            if(usuario_con_menus) {
                socket.emit("respuesta_asignar_menus", {
                    exito: true,
                    mensaje: "Usuario modificado"
                })
            } else {
                socket.emit("respuesta_asignar_menus", {
                    exito: false,
                    mensaje: "No se puedo guardar",
                    datos: ""
                });
            }
        })
    } catch (error) {
        console.error(`[ERROR ✖ ${fecha.obtener()}]`, error);
        socket.emit("respuesta_modificar_usuario", {
            exito: false,
            mensaje: error.message
        })
    }
}