const pdf = require('html-pdf');
const fecha = require('./funciones_ayuda/fecha');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const moment = require('moment');

hbs.registerHelper('dateFormat', function (value, format) {
    return moment(value).format(format);
});

module.exports.genera_pdf = async function (pdf, dat1) {
    try {
        datos_para_pdf = {}
        datos_para_pdf.info = dat1
        if (!dat1.fecha_dia == undefined) {
            datos_para_pdf.info.fecha_dia = dat1.fecha_dia.toISOString().substr(0, 19).replace("T", " ")
        }
        let { plantilla, carpeta, titulo } = pdf;
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage()
        const contenido = await compile(plantilla, datos_para_pdf);
        await page.setContent(contenido);
        await page.emulateMedia('screen');
        await page.pdf({
            'path': `./public/pdf/${carpeta}/${titulo}.pdf`,
            'format': "A4",
            'printBackground': true
        });
        await browser.close();
        console.log(`[LOG ▤ ${fecha.obtener()}] PDF generado exitosamente: pdf/${carpeta}/${titulo}.pdf`)
        let ruta = '/public/pdf/' + carpeta + '/' + titulo + '.pdf'
        return {
            ruta: ruta,
            exito: true
        }
    } catch (error) {
        console.log(`[ERROR ✖ ${fecha.obtener()}]`, error)
        return {
            exito: false
        }
    }
}

const compile = async function (plantilla, datos) {
    const ruta_archivo = path.join(process.cwd(), 'plantillas_pdf', `${plantilla}.hbs`);
    const html = fs.readFileSync(ruta_archivo, 'utf-8');
    const css = fs.readFileSync('./public/estilo/css/impresion.css', 'utf-8');
    let html_con_css = `<style>${css}</style>` + html;
    return hbs.compile(html_con_css)(datos);
};
