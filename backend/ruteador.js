const express = require ('express');
const router = express.Router();
const procesa = require('./procesa_peticiones_http');
const path = require ('path');
const Micro = require ("../modelos/microservicios");
const jsonfile = require('jsonfile');
const cote = require('cote');

var peticiones_recibidas = 0

router.get('/',  function (req, res) {
    try {
        res.sendFile(path.resolve('public/index.html'));
    } catch (err) {
        console.error(err)
    }
})

var luminarias_json = jsonfile.readFileSync('backend/jsons/luminarias.json')

luminarias_json.forEach(luminaria => {
    router.post('/api/monitorear/' + luminaria.microservicio, require('../backend/servidor_cote').enviar_evento)
    router.get('/api/controlar/' + luminaria.microservicio, require('../backend/servidor_cote').enviar_evento)
});

/*
router.get('/api/obtener', async function(req, res) {
    
router.post('/api/subir', procesa.peticion_post);
*/
module.exports = router;
