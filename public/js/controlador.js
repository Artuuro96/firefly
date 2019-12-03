angular.module("firefly", [
    "btford.socket-io",
    'ngRoute',
    "oc.lazyLoad"
]).config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        events: true
    });
}]).run(function ($rootScope, $location, socket) {
    $rootScope.ocultar_todo = true;
    $rootScope.cargando = false;
    $rootScope.en_sesion = false;
    $rootScope.recuperar_contrasenia = false;
    let url_inicio = $location.absUrl();
    console.log("URL_INICIO: ", url_inicio)

    $rootScope.verificar_usuario = function (menu) {
        let usuario_actual = localStorage.getItem("usuario_actual");
        let contrasenia = localStorage.getItem("contrasenia");
        let menu_actual = localStorage.getItem("menu_actual");
        if (usuario_actual == 0 || contrasenia == 0 || usuario_actual == undefined || contrasenia == undefined || menu_actual == 0 || menu_actual == undefined) {
            $location.path("/")
            $rootScope.en_sesion = false;
        }
        else {
            socket.emit("verificar_sesion", {
                usuario: localStorage.getItem("usuario_actual"),
                contrasenia: localStorage.getItem("contrasenia"),
                menu_actual: localStorage.getItem("menu_actual")
            })
        }
        $rootScope.ocultar_todo = true;
    }
    $rootScope.verificar_usuario();
    socket.removeListener("respuesta_verificar_sesion")
    socket.on('respuesta_verificar_sesion', function (datos) {
        if (datos.exito == true) {
            $rootScope.usuario_actual = datos.respuesta.usuario;
            $rootScope.en_sesion = true;
            $rootScope.menus = datos.menus
            $location.path(localStorage.getItem("menu_actual"))
            $rootScope.cargando = false;
        } else if (datos.exito == false) {
            $rootScope.en_sesion = false;
            $location.path("/")
        }
    })

    $rootScope.cerrar_sesion = function () {
        socket.emit("cerrar_sesion", $rootScope.usuario_actual)
        $rootScope.en_sesion = false;
        localStorage.setItem("usuario_actual", 0);
        localStorage.setItem("contrasenia", 0);
        localStorage.setItem("menu_actual", 0);
    }
    $rootScope.ocultar_todo = true;
});

