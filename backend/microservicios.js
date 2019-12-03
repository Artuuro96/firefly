const jsonfile = require('jsonfile');
const cote = require('cote');

module.exports.carga_microservicios_asincronamente = function() {
    try {
        return new Promise(resolve => {
            let i = 0;
            global.requesters = [];
            var micros_json = jsonfile.readFileSync('backend/jsons/solicitantes.json');
    
            micros_json.forEach(micro => {
                global.requesters[i] = new cote.Requester({
                    name: micro.nombre,
                    key: micro.key
                })
                i = i+1;
            });
            resolve(true);
        })
    } catch (error) {
        resolve(false);
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error)
    }
}