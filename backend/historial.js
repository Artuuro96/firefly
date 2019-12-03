var Registros = require('../modelos/registros')
var Registros_dia = require('../modelos/registros_dia')
var Luminarias = require('../modelos/luminarias')
const pdf = require('./generar_pdf')
var fs = require('fs')

var fecha = require('./funciones_ayuda/fecha');


module.exports.grafica_dia = async function (socket, datos) {
    datos = new Date();

    desde_fecha = new Date(datos.getFullYear(), datos.getMonth(), datos.getDate(), 0, 0, 0)
    hasta_fecha = new Date(datos.getFullYear(), datos.getMonth(), datos.getDate(), 23, 59, 59)

    console.log("desde_fecha", desde_fecha)
    console.log("hasta_fecha", hasta_fecha)

    let registro_dia = await Registros.find({
        fecha_medicion: {
            $gte: desde_fecha,
            $lt: hasta_fecha
        }
    })
    console.log("registro_dia", registro_dia)
}

module.exports.buscar_luminaria = async function (socket, datos) {
    try {
        fechas = await Registros.distinct("fecha_medicion", { numero_luminaria: parseInt(datos) })
        if (fechas.length > 0) {
            let anios = []
            for (let index = 0; index < fechas.length; index++) {
                anios[index] = fechas[index].getFullYear()
            }

            let anios_unicos = anios.filter(onlyUnique);
            socket.emit("respuesta_buscar_luminaria", {
                exito: true,
                anios: anios_unicos
            })
        }
        else {
            socket.emit("respuesta_buscar_luminaria", {
                exito: false,
            })
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports.graficar = async function (socket, datos) {
    try {
        let fechas = []
        let valores = []
        let registro = []

        try {

            if (datos.por_dias) {
                fecha = new Date(datos.dia)
                desde_fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), -4, -59, -59)
                hasta_fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 18, 59, 59)
                historial = await Registros.find({
                    numero_luminaria: datos.luminaria,
                    fecha_medicion: {
                        $gte: new Date(desde_fecha),
                        $lt: new Date(hasta_fecha)
                    }
                }).lean().exec();

                historial = historial.sort(function compare(a, b) {
                    var dateA = new Date(a.fecha_medicion);
                    var dateB = new Date(b.fecha_medicion);
                    return dateA - dateB;
                });

                for (let index = 0; index < historial.length; index++) {
                    fechas.push(historial[index].fecha_medicion)
                    valores.push(historial[index].energia)
                    registro.push(historial[index])
                }
                for (let index = 0; index < historial.length; index++) {
                    fechas[index] = fecha_corregida_dia(fechas[index])
                }
                for (let index = 0; index < registro.length; index++) {
                    registro[index].fecha_medicion = fechas[index]
                    registro[index].potencia = parseFloat(registro[index].potencia).toFixed(3)
                    registro[index].energia = parseFloat(registro[index].energia).toFixed(3)
                    registro[index].corriente = parseFloat(registro[index].corriente).toFixed(3)
                }
            }


            else if (datos.por_meses) {
                console.log("meses")
                datos.mes = parseInt(datos.mes)
                try {
                    desde_fecha = new Date(datos.anio, datos.mes)
                    hasta_fecha = new Date(new Date(datos.anio, datos.mes + 1) - 86400000)
                } catch (err) {
                    socket.emit("respuesta_graficar", {
                        exito: false
                    })
                }
                console.log(desde_fecha)
                console.log(hasta_fecha)
                historial = await Registros_dia.find({
                    numero_luminaria: datos.luminaria,
                    fecha_medicion: {
                        $gte: new Date(desde_fecha),
                        $lt: new Date(hasta_fecha)
                    }
                }).lean().exec();
                historial = historial.sort(function compare(a, b) {
                    var dateA = new Date(a.fecha_medicion);
                    var dateB = new Date(b.fecha_medicion);
                    return dateA - dateB;
                });

                for (let index = 0; index < historial.length; index++) {
                    fechas.push(historial[index].fecha_medicion)
                    valores.push(historial[index].energia)
                    registro.push(historial[index])

                }
                for (let index = 0; index < historial.length; index++) {
                    fechas[index] = fecha_corregida_mes(fechas[index])
                }

                for (let index = 0; index < registro.length; index++) {
                    registro[index].fecha_medicion = fechas[index]
                    registro[index].potencia = parseFloat(registro[index].potencia).toFixed(3)
                    registro[index].energia = parseFloat(registro[index].energia).toFixed(3)
                    registro[index].corriente = parseFloat(registro[index].corriente).toFixed(3)
                }
            }

        } catch (err) {
            socket.emit("respuesta_graficar", {
                exito: false
            })
        }


        if (historial.length != 0) {
            socket.emit("respuesta_graficar", {
                exito: true,
                fechas: fechas,
                valores: valores,
                registro: registro
            })
        }
        else {
            socket.emit("respuesta_graficar", {
                exito: false
            })
        }
    } catch (err) {
        socket.emit("respuesta_graficar", {
            exito: false
        })
    }
}

module.exports.generar_pdf_grafica_historial = async function (socket, datos) {

    var configuracion = JSON.parse(fs.readFileSync("./backend/jsons/configuracion.json", 'utf8'));
    let detalle = configuracion.numero_registros_pdf
    let energia_total = 0
    if (datos.datos_consulta.por_dias) {
        var fecha_grafica = datos.datos_consulta.dia.toString().substring(0, 10)
        var hoy = "L" + datos.datos_consulta.luminaria + "_"
    }
    else {
        var fecha_grafica = datos.datos_consulta.anio + "-" + datos.datos_consulta.mes
        var hoy = "L" + datos.datos_consulta.luminaria + "_"
    }

    let datos_para_enviar = []
    let cantidad_datos = datos.datos_para_imprimir.length
    let cantidad_de_datos_por_columna = Math.ceil(cantidad_datos / detalle)

    try {
        if (cantidad_datos > detalle) {
            for (let i = 0; i < (cantidad_datos); i = i + cantidad_de_datos_por_columna) {

                let objeto_ayuda = {
                    fecha_medicion: [],
                    corriente: 0,
                    potencia: 0,
                    energia: 0
                }
                objeto_ayuda.fecha_medicion.push(datos.datos_para_imprimir[i].fecha_medicion)
                for (let j = i; j < (i + cantidad_de_datos_por_columna); j++) {
                    if (j == cantidad_datos)
                        break
                    objeto_ayuda.corriente = parseFloat(datos.datos_para_imprimir[j].corriente) + objeto_ayuda.corriente
                    objeto_ayuda.potencia = parseFloat(datos.datos_para_imprimir[j].potencia) + objeto_ayuda.potencia
                    objeto_ayuda.energia = parseFloat(datos.datos_para_imprimir[j].energia) + objeto_ayuda.energia

                    energia_total = parseFloat(datos.datos_para_imprimir[j].energia) + energia_total
                }
                if (i < (cantidad_datos)) {
                    objeto_ayuda.corriente = objeto_ayuda.corriente / cantidad_de_datos_por_columna
                    objeto_ayuda.potencia = objeto_ayuda.potencia / cantidad_de_datos_por_columna
                }
                if (datos.datos_para_imprimir[i + cantidad_de_datos_por_columna - 1] !== undefined) {
                    objeto_ayuda.fecha_medicion.push(datos.datos_para_imprimir[i + cantidad_de_datos_por_columna - 1].fecha_medicion)
                }

                objeto_ayuda.fecha_medicion = objeto_ayuda.fecha_medicion.join("--")

                objeto_ayuda.corriente = objeto_ayuda.corriente.toFixed(3)
                objeto_ayuda.potencia = objeto_ayuda.potencia.toFixed(3)
                objeto_ayuda.energia = objeto_ayuda.energia.toFixed(3)

                datos_para_enviar.push(objeto_ayuda)
            }
        }
        else {
            datos_para_enviar = datos.datos_para_imprimir

        }
    } catch (err) {
        console.log(err)
        throw err
    }
    energia_total = energia_total.toFixed(3)
    let titulo =  datos.datos_consulta.luminaria
    let subitulo =  fecha_grafica
    let datos_envio = {
        numero_luminaria: titulo,
        fecha: subitulo,
        datos_para_enviar: datos_para_enviar,
        energia_total: energia_total
    }
    console.log(titulo)
    try {
        var resultado_pdf = await pdf.genera_pdf({
            titulo: "Historia_" + hoy + fecha_grafica,
            carpeta: "historial",
            plantilla: "historial"
        }, datos_envio);
    } catch (err) {
        console.log("Error")
        console.log(err)
        socket.emit("respuesta_generar_pdf_grafica_historial", {
            exito: false
        })
    }
    if (resultado_pdf.exito == true) {
        socket.emit("respuesta_generar_pdf_grafica_historial", {
            ruta: resultado_pdf.ruta,
            exito: true
        })
    }
    else {
        socket.emit("respuesta_generar_pdf_grafica_historial", {
            exito: false
        })
    }
}

fecha_corregida_mes = function (date) {
    year = date.getFullYear(),
        month = (date.getMonth() + 1).toString(),
        formatedMonth = (month.length === 1) ? ("0" + month) : month,
        day = (date.getDate() + 1).toString(),
        formatedDay = (day.length === 1) ? ("0" + day) : day;
    return formatedDay + "/" + formatedMonth + "/" + year;
};

fecha_corregida_dia = function (date) {
    hour = (date.getHours() + 5).toString(),
        formatedHour = (hour.length === 1) ? ("0" + hour) : hour,
        minute = date.getMinutes().toString(),
        formatedMinute = (minute.length === 1) ? ("0" + minute) : minute,
        second = date.getSeconds().toString(),
        formatedSecond = (second.length === 1) ? ("0" + second) : second;
    return formatedHour + ':' + formatedMinute + ':' + formatedSecond;
};

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}




