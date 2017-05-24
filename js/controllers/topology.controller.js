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
            };

            function wrapText(context, text, x, y, maxWidth, lineHeight) {
                var cars = text.split("\n");

                for (var ii = 0; ii < cars.length; ii++) {

                    var line = "";
                    var words = cars[ii].split(" ");

                    for (var n = 0; n < words.length; n++) {
                        var testLine = line + words[n] + " ";
                        var metrics = context.measureText(testLine);
                        var testWidth = metrics.width;

                        if (testWidth > maxWidth) {
                            context.fillText(line, x, y);
                            line = words[n] + " ";
                            y += lineHeight;
                        }
                        else {
                            line = testLine;
                        }
                    }

                    context.fillText(line, x, y);
                    y += lineHeight;
                }
            }

            function drawNetwork(){
                $timeout(function () {
                    $scope.warning_data = {
                    };
                    var container = document.getElementById('network');
                    console.log(container);
                    $scope.network = new vis.Network(container, $scope.data, $scope.options);
                    $scope.network.on("showPopup", function (params) {
                        $scope.interval = $interval(function () {
                            var tooltip = document.getElementsByClassName("vis-network-tooltip");
                            var popup_data = tooltip[0].firstChild;
                            //console.log(tooltip);
                            popup_data.innerHTML = $scope.data.nodes.get(params).title;
                            //console.log(popup_data);
                        },1000);

                    });
                    $scope.network.on("hidePopup", function (params) {
                        $interval.cancel($scope.interval);
                    });
                    $scope.network.on("beforeDrawing", function (ctx) {
                        for(var id in $scope.warning_data){
                            var nodeId = id;
                            var nodePosition = $scope.network.getPositions([nodeId]);
                            ctx.fillStyle = '#fe6f5e';
                            ctx.font = 14 + "px Arial";
                            var text = "";
                            var warning = $scope.warning_data[id];
                            for(var prop in warning){
                                if(prop === "net") {
                                    text += prop + ": "+ warning[prop] + "KB/s\n";
                                }else{
                                    text += prop + ": "+ warning[prop] + "%\n";
                                }
                            }
                            wrapText(ctx, text, nodePosition[nodeId].x + 30, nodePosition[nodeId].y, 100, 16);
                        }
                    })
                });
            }



            $scope.initData = function () {
                // init vms map to hosts
                var map_url = base_ip + "api/maps";
                // var map_url = "data/vms_map.json";
                VmsMap.clear();
                VmsMap.get_mtd(map_url).then(function(response){
                    VmsMap.init(response.data);
                    $scope.hosts = VmsMap.hostArry;
                    $scope.hosts[0].open = true;
                    $scope.data = VmsMap.data;
                    drawNetwork();
                }, function(response){});
            }

            $scope.options = {
                autoResize: true,
                height: '550px',
                width: '100%',
                edges: {
                    length: 10
                },
                interaction: {
                    hover: true
                },
                physics:{
                    barnesHut:{
                        gravitationalConstant:-30000,
                        avoidOverlap: 1
                    },
                    stabilization: {iterations:2500}
                },
                layout: {
                    hierarchical: {
                        direction: "DU",
                        edgeMinimization: true
                    }
                },
                groups:{
                    healthy:{
                        shape: 'icon',
                        icon:{
                            face: 'FontAwesome',
                            code: '\uf1c0',
                            size: 40,
                            color: '#6de89b'
                        }
                    },
                    overload:{
                        shape: 'icon',
                        icon:{
                            face: 'FontAwesome',
                            code: '\uf1c0',
                            size: 40,
                            color: '#e32636'
                        }
                    },
                    underload:{
                        shape: 'icon',
                        icon:{
                            face: 'FontAwesome',
                            code: '\uf1c0',
                            size: 40,
                            color: '#ffa700'
                        }
                    },
                    sleeping:{
                        shape: 'icon',
                        icon:{
                            face: 'FontAwesome',
                            code: '\uf1c0',
                            size: 40,
                            color: '#a6a6a6'
                        }
                    },
                    vms:{
                        shape: 'icon',
                        icon:{
                            face: 'FontAwesome',
                            code: '\uf108',
                            size: 30,
                            color: '#bf94e4'
                        }
                    },
                    warning_vms:{
                        shape: 'icon',
                        icon:{
                            face: 'FontAwesome',
                            code: '\uf108',
                            size: 30,
                            color: '#e32636'
                        }
                    },
                    app:{
                        shape: 'icon',
                        icon:{
                            face: 'FontAwesome',
                            code: '\uf1b2',
                            size: 30,
                            color: '#e75480'
                        }
                    },
                    warning_app:{
                        shape: 'icon',
                        icon:{
                            face: 'FontAwesome',
                            code: '\uf1b2',
                            size: 30,
                            color: '#e32636'
                        }
                    },
                    service:{
                        shape: 'icon',
                        icon:{
                            face: 'FontAwesome',
                            code: '\uf1b3',
                            size: 30,
                            color: '#6495ed'
                        }
                    },
                    warning_service:{
                        shape: 'icon',
                        icon:{
                            face: 'FontAwesome',
                            code: '\uf1b3',
                            size: 30,
                            color: '#e32636'
                        }
                    },
                    data:{
                        shape: 'box'
                    }
                }
            };

            function scrollBottom() {
                var element = document.getElementsByClassName("panel-body");
                //console.log(element);
                for(var index=0; index<element.length; index ++){
                    element[index].scrollTop = element[index].scrollHeight;
                }
            }

            // var updateArr = [{type: "update", vm_id: "vm_id2", host: "kolla2"}];
            // var updateArr = [{type: "status", id: "vm_id4", target:"vms", status: "warning", warning: {cpu: 80, mem: 90}},
            //     {type: "status", id: "app_id4", target:"app", status: "warning"},
            //     {type: "status", id: "vm_id5", target:"vms", status: "warning"},
            //     {type: "status", id: "app_id5", target:"app", status: "warning"},
            //     {type: "status", id: "service2", target:"service", status: "warning"},
            //     {type: "status", id: "vm_id1", target:"vms", status: "normal"}];
            // var updateArr = [{type: "message", host: "kolla1", content: "This content is straight in the template."}];
            // var updateArr = [{type: "scheduler", content: "This content is straight in the template."}];
            // var updateArr = [{type: "data", id: "kolla1", data: {cpu: "30", mem: "50",disk: "30", net: "400"}}];
            // var count = 0;
            // function update() {
            //     var update_interval = $interval(function(){
            //         // count ++;
            //         // var updateData = {};
            //         // if(count % 2 === 0){
            //         // 	updateData = updateData2;
            //         // }else{
            //         // 	updateData = updateData1;
            //         // }
            //
            //         updateArr.forEach(function (updateData) {
            //             if(updateData.type === "update") {
            //                 VmsMap.updateEdge(updateData.vm_id, updateData.host);
            //             }else if(updateData.type === "status"){
            //                 if(updateData.warning !== undefined){
            //                     $scope.warning_data[updateData.id] = updateData.warning;
            //                 }
            //                 if((updateData.status === "normal" || updateData.status === "healthy") && $scope.warning_data[updateData.id] !== undefined){
            //                     delete $scope.warning_data[updateData.id];
            //                 }
            //                 VmsMap.updateStatus(updateData.id, updateData.target, updateData.status);
            //             }else if(updateData.type === "data"){
            //                 if($scope.warning_data[updateData.id] !== undefined){
            //                     for(var prop in updateData.data){
            //                         if($scope.warning_data[updateData.id][prop] !== undefined) {
            //                             $scope.warning_data[updateData.id][prop] = updateData.data[prop];
            //                         }
            //                     }
            //                 }
            //                 VmsMap.updateData(updateData.id, updateData.data);
            //             }else if(updateData.type === "message"){
            //                 count ++;
            //                 var i=0;
            //                 for(i=0; i<$scope.hosts.length; i++){
            //                     if($scope.hosts[i].label === updateData.host){
            //                         break;
            //                     }
            //                 }
            //                 if($scope.hosts[i].contents.length < 10){
            //                     $scope.hosts[i].contents.push({content: updateData.content + count});
            //                 }else{
            //                     $scope.hosts[i].contents.splice(0,1);
            //                     $scope.hosts[i].contents.push({content: updateData.content + count});
            //                 }
            //                 $scope.hosts[i].content = "";
            //                 $scope.hosts[i].contents.forEach(function (content) {
            //                     $scope.hosts[i].content += content.content + "\n";
            //                 });
            //
            //                 var element = document.getElementsByClassName("panel-body");
            //                 element[i].innerText = $scope.hosts[i].content;
            //                 element[i].scrollTop = element[i].scrollHeight;
            //                 //console.log($scope.hosts[i].content);
            //             }else{  //type === "scheduler"
            //                 count ++;
            //                 if($scope.scheduler.contents.length < 10){
            //                     $scope.scheduler.contents.push({content: updateData.content + count});
            //                 }else{
            //                     $scope.scheduler.contents.splice(0,1);
            //                     $scope.scheduler.contents.push({content: updateData.content + count});
            //                 }
            //                 $scope.scheduler.content = "";
            //                 $scope.scheduler.contents.forEach(function (content) {
            //                     $scope.scheduler.content += content.content + "\n";
            //                 });
            //
            //                 var element = document.getElementById("scheduler-panel");
            //                 element.innerText = $scope.scheduler.content;
            //                 element.scrollTop = element.scrollHeight;
            //             }
            //         });
            //
            //         $interval.cancel(update_interval);
            //     }, 3000);
            // }
            // update();

            $scope.initWS = function () {
                $scope.ws = $websocket('ws://20.0.1.10:8070/soc');
                $scope.ws.onMessage(function(message){
                    var updateArr = JSON.parse(message.data);
                    updateArr.forEach(function (updateData) {
                        if(updateData.type === "update") {
                            VmsMap.updateEdge(updateData.vm_id, updateData.host);
                        }else if(updateData.type === "status"){
                            if(updateData.warning !== undefined){
                                $scope.warning_data[updateData.id] = updateData.warning;
                            }
                            if((updateData.status === "normal" || updateData.status === "healthy") && $scope.warning_data[updateData.id] !== undefined){
                                delete $scope.warning_data[updateData.id];
                            }
                            VmsMap.updateStatus(updateData.id, updateData.target, updateData.status);
                        }else if(updateData.type === "data"){
                            if($scope.warning_data[updateData.id] !== undefined){
                                for(var prop in updateData.data){
                                    if($scope.warning_data[updateData.id][prop] !== undefined) {
                                        $scope.warning_data[updateData.id][prop] = updateData.data[prop];
                                    }
                                }
                            }
                            VmsMap.updateData(updateData.id, updateData.data);
                        } else if (updateData.type === "message") {
                            var i = 0;
                            for (i = 0; i < $scope.hosts.length; i++) {
                                if ($scope.hosts[i].label === updateData.host) {
                                    break;
                                }
                            }
                            if ($scope.hosts[i].contents.length < 10) {
                                $scope.hosts[i].contents.push({content: updateData.content});
                            } else {
                                $scope.hosts[i].contents.splice(0, 1);
                                $scope.hosts[i].contents.push({content: updateData.content});
                            }
                            $scope.hosts[i].content = "";
                            $scope.hosts[i].contents.forEach(function (content) {
                                $scope.hosts[i].content += content.content + "\n";
                            });

                            var element = document.getElementsByClassName("panel-body");
                            element[i].innerText = $scope.hosts[i].content;
                            element[i].scrollTop = element[i].scrollHeight;

                        } else {  //type === "scheduler"
                            if ($scope.scheduler.contents.length < 10) {
                                $scope.scheduler.contents.push({content: updateData.content});
                            } else {
                                $scope.scheduler.contents.splice(0, 1);
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
                });

                var alive_interval = $interval(function(){
                    $scope.ws.send(JSON.stringify({msg:'alive'}));
                }, 20000);

                $scope.ws.onClose(function(event){
                    console.log('connection closed...');
                });

                $scope.$on('$destroy', function(){
                    $interval.cancel(alive_interval);
                    $scope.ws.close();
                });
            }


        }]);
