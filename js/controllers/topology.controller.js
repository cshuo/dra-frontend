angular.module('dra.topology', ['ngVis'])

.controller('topologyCtrl', function ($scope, $location, $timeout) {
    // create an array with nodes

    var nodes = [
        {id: 'compute1', label: 'Compute1', group:'host'},
        {id: 2, label: 'vm2', group:'vms'},
        {id: 3, label: 'vm3', group:'vms'},
        {id: 4, label: 'vm4', group:'vms'},
        {id: 5, label: 'vm5', group:'vms'},
        {id: 11, label: 'Compute2', group:'host'},
        {id: 12, label: 'vm6', group:'vms'},
        {id: 13, label: 'vm7', group:'vms'},
        {id: 14, label: 'vm8', group:'vms'},
    ];

    // create an array with edges
    var edges = [
        {from: 'compute1', to: 3},
        {from: 'compute1', to: 2},
        {from: 'compute1', to: 4},
        {from: 'compute1', to: 5},
        {from: 11, to: 13},
        {from: 11, to: 12},
        {from: 11, to: 14},
    ];

    // create a network
    $scope.data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    $scope.options = {
        autoResize: true,
        height: '600px',
        width: '100%',
        groups:{
            host:{
                shape: 'icon',
                icon:{
                    face: 'FontAwesome',
                    code: '\uf1c0',
                    size: 50,
                    // color: '#57169a'
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
});
