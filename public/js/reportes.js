angular.module("firefly").controller("reportes", function ($rootScope, $scope, socket, $location) {
	localStorage.setItem("menu_actual", "/reportes")
	$rootScope.verificar_usuario();
	socket.emit("trae_reportes")
	socket.removeListener("respuesta_trae_reportes");
	socket.on("respuesta_trae_reportes", function(datos){
		if(datos.exito) {
			$scope.$apply(function(){
				$scope.reportes = datos.respuesta;
			})
		} else {
			swal("Error", datos.mensaje, "error")
		}
	})
});

