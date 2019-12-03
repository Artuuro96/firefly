angular.module("firefly").controller("mapa", function ($rootScope, $scope, socket, $location) {
	localStorage.setItem("menu_actual", "/mapa")
	$rootScope.verificar_usuario();
	mapboxgl.accessToken = 'pk.eyJ1IjoiYXJ0dXJvcm9kciIsImEiOiJjanQ4Nmk1N2gwNWtpNDRudnUxd3F1MTc3In0.fBVK5Z-brvPYYwvRW2JvIg';
	var features = [];
	socket.emit("luminarias")
	$rootScope.cargando = true;
	socket.removeListener("respuesta_luminarias")
	socket.on("respuesta_luminarias", function (datos) {
		$rootScope.cargando = false;
		try {
			datos.respuesta.map(objeto => {
				features.push({
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [parseFloat(objeto.coordenada_x), parseFloat(objeto.coordenada_y)]
					},
					properties: {
						title: 'Mapbox',
						description: objeto.zona,
						state: objeto.estado,
						lng: objeto.coordenada_y,
						lat: objeto.coordenada_x
					}
				})
			})

			var map = new mapboxgl.Map({
				container: 'map', // container id
				style: 'mapbox://styles/mapbox/streets-v9', // Estilo del mapa
				center: [-99.1346531,19.5037195], // Posicion Inicial Gustavo A. MAdero [lng, lat]
				zoom: 10 // Nivel de Zoom sobre la zona
			});

			$scope.geojson = {
				type: 'FeatureCollection',
				id: 'places',
				features
			}

			$scope.geojson.features.forEach(function (marker) {
				// create a HTML element for each feature
				var el = document.createElement('div');
				el.className = 'marker';

				var popup = new mapboxgl.Popup()
					.setLngLat(marker.geometry.coordinates)
					.setHTML(`	<h5 onclick = 'obtener_grafica()'>
									<button class='btn btn-link'><b>${marker.properties.description}</b></button>
								</h5>
								<p><b>Estado: </b>${marker.properties.state}</p>
								<p><b>Lng: </b>${marker.properties.lng}</p>
								<p><b>Lat: </b>${marker.properties.lat}</p>`)
					.addTo(map)

				// make a marker for each feature and add to the map
				new mapboxgl.Marker(el)
					.setLngLat(marker.geometry.coordinates)
					.setPopup(popup)
					.addTo(map);
			});
		} catch (err) {
			console.err(err)
		}
	});

	$scope.obtener_grafica = function () {
		$('#informacion_de_luminaria').modal('show')
	}
	$scope.etiquetas = [];
	$scope.datos = [];
	$scope.datos1 = [];
	$scope.datos2 = [];
	$scope.datos3 = [];
	$scope.datos4 = [];
	

	
	socket.removeListener("genera_grafica_en_tiempo_real")
	socket.on("genera_grafica_en_tiempo_real", function(datos){

		$scope.$apply(function(){
			let fecha = datos.fecha_medicion.substr(11,17).replace("T", " ").replace("Z", "");
			$scope.etiquetas.push(fecha.substr(-13, 8));
			$scope.datos.push(datos.energia);
			
		})
		genera_grafica_en_tiempo_real($scope.etiquetas, $scope.datos);
		
	})

	function genera_grafica_en_tiempo_real(etiquetas, datos){
		if($scope.grafica1 != undefined)
            $scope.grafica1.destroy();
		$scope.grafica1 = new Chart(document.getElementById("consumo_tiempo_real"), {
			type: 'line',
			data: {
			  labels: etiquetas,
			  datasets: [{ 
				  	data: datos,
					borderColor: "#3e95cd",
					label: "Luminarias"
					  
				}
			  ]
			},
			options: {
			  title: {
				display: true,
				text: 'Consumo en tiempo real de la red de alumbrado público'
			  }
			}
		});
	}

	
});

function obtener_grafica() {
	scope = angular.element(document.getElementById('mapa')).scope();
	scope.$apply(function () {
		scope.obtener_grafica();
	})
}

