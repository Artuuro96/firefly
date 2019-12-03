
module.exports.escucha_peticiones_de_sockets = function () {

    global.io.on('connection', function (socket) {

        socket.on("login", function (datos) {
            require('./login').login(socket, datos);
        })

        socket.on("cerrar_sesion", function (datos) {
            require('./login').cerrar_sesion(socket, datos);
        })

        socket.on("verificar_sesion", function (datos) {
            require('./login').verificar_sesion(socket, datos);
        })

        socket.on("sesiones", function (datos) {
            require('./sesiones').sesiones_activas(socket, datos);
        })

        socket.on("luminarias", function (datos) {
            require('./luminarias').luminarias_guardadas(socket, datos);
        })

        socket.on("ver_especificaciones", function (datos) {
            require('./luminarias').ver_especificaciones(socket, datos);
        })

        socket.on("guardar_luminaria", function (datos) {
            require("./desarrollador").guardar_luminaria(socket, datos);
        })

        socket.on("modificar_luminaria", function (datos) {
            require("./desarrollador").modificar_luminaria(socket, datos);
        })

        socket.on("eliminar_luminaria", function (datos) {
            require("./desarrollador").eliminar_luminaria(socket, datos);
        })

        socket.on("usuarios", function (datos) {
            require('./desarrollador').traer_usuarios(socket, datos);
        })

        socket.on("eliminar_usuario", function (datos) {
            require('./desarrollador').eliminar_usuario(socket, datos);
        })

        socket.on("menus", function (datos) {
            require('./desarrollador').todos_los_menus(socket, datos);
        })

        socket.on("permisos_por_usuario", function (datos) {
            require('./desarrollador').permisos_por_usuario(socket, datos);
        })

        socket.on("asignar_menus", function(datos){
            console.log(datos)
            require('./desarrollador').asignar_menus(socket, datos)
        })

        socket.on("guardar_usuario", function (datos){
            require('./desarrollador').guardar_usuario(socket, datos);
        })

        socket.on("modificar_usuario", function (datos){
            require('./desarrollador').editar_usuario(socket, datos)
        })

        socket.on("modificar_voltaje", function(datos){
            require('./panel_de_control').modificar_voltaje(socket, datos);
        })

        socket.on("modificacion_total", function (datos) {
            require('./panel_de_control').modificacion_total(socket, datos);
        })

        socket.on("desconectar_usuario", function (datos) {
            require('./sesiones').desconectar_usuario(socket, datos);
        })

        socket.on("historial_actual", function (datos) {
            require('./historial').historial_actual(socket, datos);
        })

        socket.on("buscar_luminaria", function (datos) {
            require('./historial').buscar_luminaria(socket, datos);
        })

        socket.on("graficar", function (datos) {
            require('./historial').graficar(socket, datos);
        })

        socket.on("apagar_luminaria", function (datos) {
            require('./panel_de_control').modificar_voltaje(socket, datos);
        })

        socket.on("encender_luminaria", function (datos) {
            require('./panel_de_control').modificar_voltaje(socket, datos);
        })

        socket.on("guardar_codigo", function (datos) {
            require('./login').guarda_codigo(socket, datos);
        })

        socket.on("envia_correo", function (datos) {
            require('./correo').enviar_correo_electronico(socket, datos);
        })

        socket.on("confirmar_codigo", function (datos) {
            require('./login').confirmar_codigo(socket, datos);
        })

        socket.on("cambiar_contrasenia", function (datos) {
            require('./login').cambiar_contrasenia(socket, datos);
        })

        socket.on("generar_pdf_grafica_historial", function (datos) {
            require('./historial').generar_pdf_grafica_historial(socket, datos);
        })

        socket.on("genera_pdf_reportes", function (datos) {
            require('./reportes').genera_pdf_reportes(socket, datos);
        })

        socket.on("luminarias_activas", function (datos) {
            require('./estadisticas').traer_luminarias_activas(socket, datos);
        })

        socket.on("luminarias_inactivas", function(datos){
            require('./estadisticas').traer_luminarias_inactivas(socket, datos)
        })

        socket.on("datos_grafica_general_pastel", function (datos) {
            require('./datos_para_grafica').datos_para_grafica_pastel(socket, datos)
        })

        socket.on("guarda_configuraciones", function (datos) {
            require('./configuracion').guardar_configuracion(socket, datos);
        })

        socket.on("cargar_configuraciones", function(datos){
            require('./configuracion').cargar_configuracion(socket);
        })

        socket.on("numero_reportes", function(datos){
            require('./estadisticas').reportes(socket, datos);
        })

        socket.on("trae_reportes", function(datos){
            require('./reportes').trae_reportes(socket, datos);
        })

        socket.on("traer_logs", function(){
            require('./funciones_ayuda/log').consultar_logs();
        })

        socket.on("traer_cantidad_reportes_sin_terminar", function(){
            require('./estadisticas').reportes_sistema(socket);
        })


        //socket.on("disconnect", function(){
        //require('./login').cierre_forzado(socket, socket.id)
        //})
    })
}