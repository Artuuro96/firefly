angular.module("firefly").
    config(function($routeProvider, $locationProvider){
        $routeProvider
            .when("/", {
                controller: "login",
                templateUrl: "/public/plantillas/login.html"
            })
            .when("#", {
                controller: "login",
                templateUrl: "/public/plantillas/login.html"
            })
            .when("/estadisticas_generales", {
                controller: "estadisticas", 
                templateUrl: "/public/plantillas/estadisticas.html"
            })
            .when("/panel_de_control", {
                controller: "panel_de_control", 
                templateUrl: "/public/plantillas/panel_de_control.html"
            })
            .when("/desarrollador", {
                controller: "desarrollador",
                templateUrl:"/public/plantillas/desarrollador.html"
            })
            .when("/historial", {
                controller: "historial",
                templateUrl:"/public/plantillas/historial.html"
            })
            .when("/mapa", {
                controller: "mapa",
                templateUrl:"/public/plantillas/mapa.html"
            })
            .when("/configuracion", {
                controller: "configuracion",
                templateUrl: "/public/plantillas/configuracion.html"
            })
            .when("/reportes", {
                controller: "reportes",
                templateUrl: "/public/plantillas/reportes.html"
            })
            .otherwise({
                redirectTo: "/404"
            });
});