const nodemailer = require("nodemailer");
const fecha = require('./funciones_ayuda/fecha');
const Socket = require('./funciones_ayuda/sockets')

module.exports.enviar_correo_electronico = async (socket, datos) => {
    try {
        enviar(datos).then(respuesta => {
            if (socket !== undefined) {
                socket.emit("respuesta_enviar_correo", {
                    exito: true,
                    mensaje: `Se ha enviado el código de recuperación de contraseña al correo ${respuesta.accepted[0]}`,
                    correo: respuesta.accepted[0]
                })
                console.log(`[LOG ▤ ${fecha.obtener()}] Correo enviado exitosamente a: ${respuesta.accepted[0]}`)
            }

            else {
                console.log(`[LOG ▤ ${fecha.obtener()}] Correo enviado exitosamente a: ${respuesta.accepted[0]}`)
            }

        })
            .catch(error => {
                socket.emit("respuesta_enviar_correo", {
                    exito: false,
                    mensaje: String(error)
                });
                console.error(`[ERROR ✖ ${fecha.obtener()}] No se pudo enviar el correo: `, error);
            });
    } catch (err) {
        console.error(`[ERROR ✖ ${fecha.obtener()}] No se pudo enviar el correo: `, error);
    }
}

function enviar(datos) {
    return new Promise((resolver, rechazar) => {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "sistemafirefly@gmail.com",
                pass: "Chivas400!"
            }
        });

        let { destino, asunto, texto, html } = datos;

        transporter.sendMail({
            from: "sistemafirefly@gmail.com",
            to: destino,
            subject: asunto,
            text: texto,
            html: html ? html : ""
        }).then(resultado_envio => {
            resolver(resultado_envio);
        }).catch(error => {
            rechazar(error);
        })
    })
}