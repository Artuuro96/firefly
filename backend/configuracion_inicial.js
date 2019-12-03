
var Menus = require('../modelos/menus');
var Usuarios = require('../modelos/usuarios');
var fecha = require('./funciones_ayuda/fecha');
var Registros = require('../modelos/registros')

module.exports = async function (){

    try {
        await Menus.deleteMany();

        menu_nuevo = new Menus ({
            nombre_menu: "Panel de control",
            ubicacion : "/panel_de_control",
            _id: 0
        });
        menu_nuevo.save().catch(function (err){});

        menu_nuevo = new Menus ({
            nombre_menu: "Mapa",
            ubicacion: "/mapa",
            _id: 1
        });
        menu_nuevo.save().catch(function (err){});
        
        menu_nuevo = new Menus ({
            nombre_menu: "Reportes",
            ubicacion: "/reportes",
            _id: 2
        });
        menu_nuevo.save().catch(function (err){});
        
        menu_nuevo = new Menus ({
            nombre_menu: "Historial",
            ubicacion: "/historial",
            _id: 3
        });
        menu_nuevo.save().catch(function (err){});
        
        menu_nuevo = new Menus ({
            nombre_menu: "Configuración",
            ubicacion: "/configuracion",
            _id: 4
        });
        menu_nuevo.save().catch(function (err){});

        menu_nuevo = new Menus ({
            nombre_menu: "Desarrollador",
            ubicacion: "/desarrollador",
            _id:5
        })
        menu_nuevo.save().catch(function (err){});

        await Usuarios.deleteMany({
            tipo_usuario: 'desarrollador'
        });
        
        var md5 = require('md5');
    
        var usuario_nuevo = new Usuarios({
            usuario: "desarturo",
            contrasenia: md5("desrodriguez"),
            nombre: "Arturo",
            correo: "arturorodr96@gmail.com",
            menus: [0, 1, 2, 3, 4, 5, 6],
            tipo_usuario: 'desarrollador'
        });
        usuario_nuevo.save().catch(function(err){});
    
        var usuario_nuevo = new Usuarios({
            usuario: "desjosue",
            contrasenia: md5("desramirez"),
            nombre: "Josue",
            correo: "josuers823@gmail.com",
            menus: [0, 1, 2, 3, 4, 5, 6],
            tipo_usuario: 'desarrollador'
        });
        usuario_nuevo.save().catch(function(err){}); 
        
        /*await Registros.deleteMany();
        /*
        for(let index = 1; index < 30; index++){
            let registro = new Registros({
                numero_luminaria: 1,
                fecha_medicion: new Date("2019",1,index),
                voltaje: 50,
                corriente: 50,
                potencia: index*2,
                porcentaje_asignado: 788 
            })
            await registro.save().catch(function(){});
        }
        for(let index = 1; index < 31; index++){
            let registro = new Registros({
                numero_luminaria: 1,
                fecha_medicion: new Date("2019",0,index),
                voltaje: 50,
                corriente: 50,
                potencia: index*2,
                porcentaje_asignado: 788 
            })
            await registro.save().catch(function(){});
        }*/
            

        }
    catch(err) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, err)
    }
}
