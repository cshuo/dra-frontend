angular.module('dra.topology', ['ngVis', 'ngWebSocket'])

.controller('topologyCtrl', [
    '$scope',
    '$http',
    '$location',
    '$timeout',
    '$interval',
    '$websocket',
    'VmsMap',
    function ($scope, $http, $location, $timeout, $interval, $websocket, VmsMap) {

    // init vms map to hosts
    var map_url = "http://114.212.189.132:9000/api/maps";

    VmsMap.get_mtd(map_url).then(function(response){
        VmsMap.init(response.data);
        $scope.data = VmsMap.data;
    }, function(response){})

    /*** 
    var topo_interval = $interval(function(){
        VmsMap.get_mtd(map_url).then(function(response){
            VmsMap.init(response.data);
        }, function(response){})
    }, 3000);
    
    $scope.$on('$destroy', function(){
        $interval.cancel(topo_interval);
    });
    ***/

    $scope.options = {
        autoResize: true,
        height: '550px',
        width: '100%',
        groups:{
            host:{
                shape: 'icon',
                icon:{
                    face: 'FontAwesome',
                    code: '\uf1c0',
                    size: 50,
                }
            },
            vms:{
                shape: 'icon',
                icon:{
                    face: 'FontAwesome',
                    code: '\uf108',
                    size: 30,
                    color: '#5087bf'
                }
            }
        }
    };

    var ws = $websocket('ws://114.212.189.132:8070/soc');
    ws.onMessage(function(message){
        update_msg = JSON.parse(message.data);
        console.log("websocket msg: ");
        console.log(update_msg.vm_id + ", " +  update_msg.host);
        VmsMap.update(update_msg.vm_id, update_msg.host);
    });
    ws.onClose(function(event){
        console.log('connection closed...');
    });

}]);
