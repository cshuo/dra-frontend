angular.module('dra.vm')
    .factory('VmsMap', ['$http', '$timeout',
        function($http, $timeout) {
            return {
                data: {
                    nodes: '',
                    edges: ''
                },
                hostArry: [],
                init: function(vms_map){
                    var nodes = [];
                    var edges = [];
                    for(var i=0; i<vms_map.length; i++){
                        this.hostArry.push({label: vms_map[i].id, content: "", contents: []});
                        var title = "<div class='popup-data'>";
                        for(var prop in vms_map[i].data){
                            if(prop === "net") {
                                title += "<b>"+ prop + "</b>: <span>"+ vms_map[i].data[prop] + "KB/s</span><br/>";
                            }else{
                                title += "<b>"+ prop + "</b>: <span>"+ vms_map[i].data[prop] + "%</span><br/>";
                            }
                        }
                        title += "</div>";
                        nodes.push({id: vms_map[i].id, label: vms_map[i].id, level:0, group: 'healthy', title: title});

                        var vms = vms_map[i].children;

                        for(var j=0; j<vms.length; j++){
                            var title ="<div class='popup-data'>";
                            for(var prop in vms_map[i].data){
                                if(prop === "net") {
                                    title += "<b>"+ prop + "</b>: <span>"+ vms[j].data[prop] + "KB/s</span><br/>";
                                }else{
                                    title += "<b>"+ prop + "</b>: <span>"+ vms[j].data[prop] + "%</span><br/>";
                                }
                            }
                            title += "</div>";
                            nodes.push({id: vms[j].id, label:vms[j].name, level: 1, group: 'vms', title: title});
                            edges.push({id: vms[j].id, from: vms_map[i].id, to: vms[j].id});

                            var app = vms[j].children;

                            for(var k=0; k<app.length; k++){
                                nodes.push({id: app[k].id, label: app[k].name, level: 2, group: 'app'});
                                edges.push({id: app[k].id, from: vms[j].id, to: app[k].id});

                                var q=0;
                                for(q=0; q<nodes.length; q++){
                                    if(nodes[q].id === app[k].service){
                                        break;
                                    }
                                }
                                if(q === nodes.length){
                                    nodes.push({id: app[k].service, label: app[k].service,level: 3, group: "service"});
                                }
                                var app_service = app[k].id + app[k].service;
                                edges.push({id: app_service, from: app[k].id, to: app[k].service})
                            }
                        }
                    }
                    this.data.nodes = new vis.DataSet(nodes);
                    this.data.edges = new vis.DataSet(edges);
                },

                updateEdge: function(vm_id, host){
                    var date = new Date();
                    var arrowId = "arrow" + vm_id + date.getTime();
                    console.log(date, arrowId);
                    var edges = this.data.edges;
                    edges.add({id: arrowId, from: vm_id, to: host, arrows: "to", color: "red", width: 4});
                    edges.update({id: vm_id, dashes: true, width: 4});
                    $timeout(function () {
                        edges.remove({id: arrowId});
                        edges.update({id: vm_id, from: host, to: vm_id, dashes: false, width: 1});
                    }, 2000);
                },

                updateStatus: function(id, target, status) {
                    if(status === "warning"){
                        this.data.nodes.update({id: id, color: "red", group: "warning_"+target});
                    }else if(status === "normal"){
                        this.data.nodes.update({id: id, color: '#5087bf', group: target});
                    }else {
                        this.data.nodes.update({id: id, group: status});
                    }
                },

                updateData: function (id, data) {
                    var title = "<div class='popup-data'>";
                    for(var prop in data){
                        if(prop === "net") {
                            title += "<b>"+ prop + "</b>: <span>"+ data[prop] + "KB/s</span><br/>";
                        }else{
                            title += "<b>"+ prop + "</b>: <span>"+ data[prop] + "%</span><br/>";
                        }
                    }
                    title += "</div>";
                    this.data.nodes.update({id: id, title: title});
                },

                remove: function(vm_id){
                    this.data.nodes.remove({id: vm_id});
                },

                get_mtd: function(url){
                    return $http({
                        method: 'GET',
                        url: url,
                        params: {
                            'tenant': 'admin',
                            'username': 'admin',
                            'password': 'artemis'
                        }
                    })
                },

                add: function(vm_ids){
                    for(var i=0; i<vm_ids.length; i++){
                        this.data.nodes.add({
                            id: vm_ids[i],
                            label: vm_ids[i],
                            group: 'vms'
                        })
                    }
                },

                clear: function () {
                    this.hostArry = [];
                }
            }
        }
    ])

