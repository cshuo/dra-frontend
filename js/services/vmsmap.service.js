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
                    var hosts = Object.keys(vms_map);
                    for(var i=0; i<hosts.length; i++){
	                    this.hostArry.push({label: hosts[i], content: "", contents: []});
                        nodes.push({id: hosts[i], label: hosts[i], group: 'healthy'});
                        for(var j=0; j<vms_map[hosts[i]].length; j++){
                            nodes.push({id: vms_map[hosts[i]][j][0], label:vms_map[hosts[i]][j][1], group: 'vms' });
                            edges.push({id: vms_map[hosts[i]][j][0], from: hosts[i], to: vms_map[hosts[i]][j][0]});
                        }
                    }
                    this.data.nodes = new vis.DataSet(nodes);
                    this.data.edges = new vis.DataSet(edges);
                },

                updateEdge: function(vm_id, host){
                    var arrowId = "arrow" + vm_id;
                    var edges = this.data.edges;
                    edges.add({id: arrowId, from: vm_id, to: host, arrows: "to", color: "red", width: 4});
                    edges.update({id: vm_id, dashes: true, width: 4});
                    $timeout(function () {
                        edges.remove({id: arrowId});
                        edges.update({id: vm_id, from: vm_id, to: host, dashes: false, width: 1});
                    }, 3000);
                },

                updateStatus: function(host, status) {
                    this.data.nodes.update({id: host, group: status});
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
