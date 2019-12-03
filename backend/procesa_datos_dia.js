const Registros = require('../modelos/registros');
const Luminarias = require('../modelos/luminarias');
const fecha_base = require('./funciones_ayuda/fecha_base');

const calcula_energia_por_luminaria = async (intervalo) => {
    
    try {
        let promesas = [];
        let fecha_fin = fecha_base.obtener();

        let dia_inicio = fecha_fin.getDate() - intervalo,
        mes = fecha_fin.getMonth()+1,
        anio = fecha_fin.getUTCFullYear(),
        fecha_inicio = new Date(anio, mes-1, dia_inicio, -5, 0, 0, 0)
        let luminarias = await Luminarias.aggregate({
            $group: {
                _id: '',
                numero_luminarias : {
                    $sum: 1
                }
            } 
        })
        
        for (let i=0; i<luminarias[0].numero_luminarias; i++) {
            promesas.push(
                Registros.aggregate([{
                    $match: {
                        numero_luminaria: String(i),
                        fecha_medicion: {
                            $gte: fecha_inicio,
                            $lt: fecha_fin  
                        },
                    }
                }, {
                    $group: {
                        _id: i,
                        energia_total: {
                            $sum: '$energia'
                        }
                    }
                }])
            )        
        }
        

        let resultado = await Promise.all(promesas).catch(error => {
            console.error(error)
        });
        
        return resultado;
    } catch (error) {
        throw error;
    }
}

module.exports = calcula_energia_por_luminaria;