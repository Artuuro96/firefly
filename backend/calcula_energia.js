

const calcula_energia_total = (registros_por_luminaria) => {
    try {
        return new Promise((resolver, rechazar) => {
            console.log(registros_por_luminaria[0])
            return
            /*
            for(let i = 0; i < registros_por_luminaria[0].length; i++){

            }
            registros_por_luminaria[0].forEach(registro_por_luminaria => {
                registro_por_luminaria.forEach(registros_por_dia => {
                    registros_por_dia
                })
            });*/
        })
    } catch (error) {
        rechazar(error);
    }
}

module.exports = calcula_energia_total;