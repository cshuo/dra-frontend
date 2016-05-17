angular.module('dra.topology', ['ngVis'])

.controller('topologyCtrl', function ($scope, $location, $timeout) {
    // create an array with nodes
    var nodes = [
        {id: 1, label: 'Compute1'},
        {id: 2, label: 'vm2'},
        {id: 3, label: 'vm3'},
        {id: 4, label: 'vm4'},
        {id: 5, label: 'vm5'},
        {id: 11, label: 'Compute2'},
        {id: 12, label: 'vm6'},
        {id: 13, label: 'vm7'},
        {id: 14, label: 'vm8'},
    ];

    // create an array with edges
    var edges = [
        {from: 1, to: 3},
        {from: 1, to: 2},
        {from: 1, to: 4},
        {from: 1, to: 5},
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
        width: '100%'
    };
});
