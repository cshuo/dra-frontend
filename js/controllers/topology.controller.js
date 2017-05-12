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
    var map_url = "http://20.0.1.9:9000/api/maps";
    VmsMap.get_mtd(map_url).then(function(response){
        console.log(response.data);
        VmsMap.init(response.data);
        $scope.data = VmsMap.data;
    }, function(response){})


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
                    size: 50
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

    var ws = $websocket('ws://20.0.1.9:8070/soc');
    ws.onMessage(function(message){
        update_msg = JSON.parse(message.data);
        VmsMap.update(update_msg.vm_id, update_msg.host);
    });

    var alive_interval = $interval(function(){
        ws.send(JSON.stringify({msg:'alive'}));
    }, 20000);

    ws.onClose(function(event){
        console.log('connection closed...');
        $interval.cancel(alive_interval);
    });

}]);
