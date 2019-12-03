const imprimir = require('./funciones_ayuda/imprimir');
const Sockets = require('./funciones_ayuda/sockets');


exports.enviar_evento= async function (req, res) {
    if(req.route.methods.get) {
        let ruta = req.route.path;
        let tipo = ruta.substr(-10);
        let luminaria = ruta.substr(-1);
        luminaria = Number(luminaria);       
        let request = {
            type: String(tipo),
            datos: req.body
        };
    
        global.requesters[luminaria].send(request, response => {
            imprimir.log(response);
            res.send(response);
        });

    } else if(req.route.methods.post) {
        let {luminaria, tipo} = req.body;
        luminaria = Number(luminaria);
        let request = {
            type: tipo,
            datos: req.body
        };
        global.requesters[luminaria].send(request, response => {
            res.send(response)
            imprimir.log(response)
            require('./datos_para_grafica').datos_para_grafica_pastel()
            Sockets.enviar_a_sockets_conectados("genera_grafica_en_tiempo_real", response.datos)
        });
    }
}
