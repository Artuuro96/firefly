angular.module("firefly").factory('socket', function(socketFactory, $rootScope){
    var socket = socketFactory({
        ioSocket:socket_original
    });
    return socket;
})