angular.module('dra.topology', ['ngVis', 'ngWebSocket', 'ui.bootstrap'])

.controller('topologyCtrl', [
    '$scope',
    '$http',
    '$location',
    '$timeout',
    '$interval',
    '$websocket',
    'VmsMap',
    function ($scope, $http, $location, $timeout, $interval, $websocket, VmsMap) {

    $timeout(function () {
    	scrollBottom();
    }, 100);

	$scope.init = function () {
		$scope.scheduler = {};
		$scope.scheduler.content = "";
		$scope.scheduler.contents = [];
		// $scope.scheduler.open = true;
		$scope.initData();
		$scope.initWS();
	}


	$scope.initData = function () {
		// init vms map to hosts
		var map_url = "http://20.0.1.9:9000/api/maps";
		// var map_url = "data/vms_map.json";
		VmsMap.clear();
		VmsMap.get_mtd(map_url).then(function(response){
			VmsMap.init(response.data);
			$scope.hosts = VmsMap.hostArry;
			// console.log($scope.hosts);
			$scope.hosts[0].open = true;
			$scope.data = VmsMap.data;
		}, function(response){});
	}


    $scope.options = {
        autoResize: true,
        height: '550px',
        width: '100%',
        groups:{
            healthy:{
                shape: 'icon',
                icon:{
                    face: 'FontAwesome',
                    code: '\uf1c0',
                    size: 50,
                    color: '#6de89b'
                }
            },
	        overload:{
		        shape: 'icon',
		        icon:{
			        face: 'FontAwesome',
			        code: '\uf1c0',
			        size: 50,
			        color: '#e32636'
		        }
	        },
	        underload:{
		        shape: 'icon',
		        icon:{
			        face: 'FontAwesome',
			        code: '\uf1c0',
			        size: 50,
			        color: '#ffa700'
		        }
	        },
	        sleeping:{
		        shape: 'icon',
		        icon:{
			        face: 'FontAwesome',
			        code: '\uf1c0',
			        size: 50,
			        color: '#a6a6a6'
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

    function scrollBottom() {
	    var element = document.getElementsByClassName("panel-body");
	    for(var index=0; index<element.length; index ++){
		    element[index].scrollTop = element[index].scrollHeight;
	    }
    }

    // var updateData1 = {type: "update", vm_id: "vm_id1", host: "kolla2"};
    // var updateData2 = {type: "update", vm_id: "vm_id1", host: "kolla1"};
    // var updateData = {type: "status", host: "kolla2", status: "overload"};
    // var updateData = {type: "message", host: "kolla1", content: "This content is straight in the template."};
	/*
    var updateData = {type: "scheduler", content: "This content is straight in the template."};

    var count = 0;
    var updateData;
    function update(update) {
		var update_interval = $interval(function(){
		    console.log(updateData);

			if(updateData.type === "update") {
				count++;
			    VmsMap.updateEdge(updateData.vm_id, updateData.host);
			    //VmsMap.remove(update.vm_id);
			    console.log("update: "+ updateData);
			}else if(updateData.type === "status"){
				console.log("status");
				VmsMap.updateStatus(updateData.host, updateData.status);
			}else if(updateData.type === "message"){
				count ++;
				var i=0;
				for(i=0; i<$scope.hosts.length; i++){
					if($scope.hosts[i].label === updateData.host){
						break;
					}
				}
				if($scope.hosts[i].contents.length < 10){
					$scope.hosts[i].contents.push({content: updateData.content + count});
				}else{
					$scope.hosts[i].contents.splice(0,1);
					$scope.hosts[i].contents.push({content: updateData.content + count});
				}
				$scope.hosts[i].content = "";
				$scope.hosts[i].contents.forEach(function (content) {
					$scope.hosts[i].content += content.content + "\n";
				});

				var element = document.getElementsByClassName("panel-body");
				element[i].innerText = $scope.hosts[i].content;
				element[i].scrollTop = element[i].scrollHeight;
			}else{  //type === "scheduler"
				count ++;
				if($scope.scheduler.contents.length < 10){
					$scope.scheduler.contents.push({content: updateData.content + count});
				}else{
					$scope.scheduler.contents.splice(0,1);
					$scope.scheduler.contents.push({content: updateData.content + count});
				}
				$scope.scheduler.content = "";
				$scope.scheduler.contents.forEach(function (content) {
					$scope.scheduler.content += content.content + "\n";
				});

				var element = document.getElementById("scheduler-panel");
				element.innerText = $scope.scheduler.content;
				element.scrollTop = element.scrollHeight;
			}
			//$interval.cancel(update_interval);
		}, 3000);
    }
    update(updateData);
    */

    $scope.initWS = function () {
	    $scope.ws = $websocket('ws://20.0.1.9:8070/soc');
	    $scope.ws.onMessage(function(message){
		    var updateData = JSON.parse(message.data);
		    if(updateData.type === "update") {
			    VmsMap.updateEdge(updateData.vm_id, updateData.host);
			    //VmsMap.remove(update.vm_id);
		    }else if(updateData.type === "status"){
			    VmsMap.updateStatus(updateData.host, updateData.status);
		    }else if(updateData.type === "message"){
			    var i=0;
			    for(i=0; i<$scope.hosts.length; i++){
				    if($scope.hosts[i].label === updateData.host){
					    break;
				    }
			    }
			    if($scope.hosts[i].contents.length < 10){
				    $scope.hosts[i].contents.push({content: updateData.content});
			    }else{
				    $scope.hosts[i].contents.splice(0,1);
				    $scope.hosts[i].contents.push({content: updateData.content});
			    }
			    $scope.hosts[i].content = "";
			    $scope.hosts[i].contents.forEach(function (content) {
				    $scope.hosts[i].content += content.content + "\n";
			    });

			    var element = document.getElementsByClassName("panel-body");
			    element[i].innerText = $scope.hosts[i].content;
			    element[i].scrollTop = element[i].scrollHeight;

		    }else{  //type === "scheduler"
			    if($scope.scheduler.contents.length < 10){
				    $scope.scheduler.contents.push({content: updateData.content});
			    }else{
				    $scope.scheduler.contents.splice(0,1);
				    $scope.scheduler.contents.push({content: updateData.content});
			    }
			    $scope.scheduler.content = "";
			    $scope.scheduler.contents.forEach(function (content) {
				    $scope.scheduler.content += content.content + "\n";
			    });

			    var element = document.getElementById("scheduler-panel");
			    element.innerText = $scope.scheduler.content;
			    element.scrollTop = element.scrollHeight;
		    }
	    });

	    var alive_interval = $interval(function(){
		    $scope.ws.send(JSON.stringify({msg:'alive'}));
	    }, 20000);

	    $scope.ws.onClose(function(event){
		    console.log('connection closed...');
		    $interval.cancel(alive_interval);
	    });
    }


}]);
