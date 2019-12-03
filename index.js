const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
const jsonfile = require('jsonfile');
const favicon = require('serve-favicon');
const path = require('path');
const fecha = require('./backend/funciones_ayuda/fecha');
const fecha_base = require('./backend/funciones_ayuda/fecha_base')
const port = 4000;
var app = express();
var MongoClient = require('mongodb').MongoClient

let opciones_conexion = {
    useMongoClient: true,
    poolSize: 2,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000
};

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

var connection = mongoose.connect('mongodb://localhost:27017/firefly', opciones_conexion, function(err){
if(err){
        console.log("No hay conexión a la base de datos");
    }
    else {
        console.log("Conexión a mongodb establecida");
    }
})

mongoose.connection.on('connected', function() {
    require('./backend/configuracion_inicial')();
})

var server = require('http').createServer(app);

server.listen(port, async function(err){
    if(err){
        console.log(err);
    }
    else {
        console.log("");
        console.log("  ███████╗██╗██████╗ ███████╗███████╗██╗  ██╗   ██╗ ");
        console.log("  ██╔════╝██║██╔══██╗██╔════╝██╔════╝██║  ╚██╗ ██╔╝ ");
        console.log("  █████╗  ██║██████╔╝█████╗  █████╗  ██║   ╚████╔╝  ");
        console.log("  ██╔══╝  ██║██╔══██╗██╔══╝  ██╔══╝  ██║    ╚██╔╝   ");
        console.log("  ██║     ██║██║  ██║███████╗██║     ███████╗██║    ");
        console.log("  ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝     ╚══════╝╚═╝    ");
        console.log("")   
        console.log("Hilo general [" + process.pid + "]");
        console.log("Se ha iniciado el servidor en el puerto " + port);
        server.timeout = 150000;
        let respuesta = await require('./backend/microservicios').carga_microservicios_asincronamente()
        if(respuesta){
            console.log(`[LOG ▤ ${fecha.obtener()}] Microservicios cargados`)
        } else {
            console.log(`[LOG ▤ ${fecha.obtener()}] Error al cargar microservicios`)
        }
    }
});


const io = require("socket.io").listen(server);
global.io = io;

app.use("/public", express.static("public"));
app.use(favicon(__dirname + '/public/images/barra_logo.ico'));

var ruteador = require('./backend/ruteador');
app.use("/", ruteador);

require('./backend/peticiones').escucha_peticiones_de_sockets();
const datos = require('./datos.json');

//require('./backend/demonios/demonio_simulacion_datos').simulacion_datos();
require('./backend/demonios/demonio_actualizacion_registros').carga_registros_dia();
require('./backend/demonios/demonio_detector_fallas').detector_fallos();
require('./backend/demonios/demonio_encendido_apagado').demonio_configuracion_apagado();
require('./backend/demonios/demonio_encendido_apagado').demonio_configuracion_encendido();
require('./backend/demonios/demonio_detector_desconexion').inicia_demonio_detector_desconexion();