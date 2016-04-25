'use strict';

var pm_detail_url = "http://114.212.189.132:9000/api/pm/";
var meters_url = "http://114.212.189.132:9000/api/meters/";

var detail = angular.module('dra.pm_detail',['ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'chart.js', 'ui.router']);

detail.controller("pmdetailCtrl", ['$scope', '$http', '$stateParams', 'PMs',
    function($scope, $http, $stateParams, PMs){
        $http({
            method: 'GET',
            url: pm_detail_url + $stateParams.pmID,
            params: {
                'tenant': 'admin',
                'username': 'admin',
                'password': 'artemis'
            }
        }).then(function success(response) {
            $scope.data= response.data;
        }, function error(response) {
            //    error
        });
    }
]);

detail.controller("pmCpuCtrl", ['$scope', '$http', '$stateParams', function ($scope, $http, $stateParams) {
    var reload_chart = function(){
        $http({
            method: 'GET',
            url: meters_url + 'compute.node.cpu.percent',
            params: {
                'tenant': 'admin',
                'username': 'admin',
                'password': 'artemis',
                'resource': $stateParams.pmName+'_'+$stateParams.pmName,
                'interval': '1'
            }
        }).then(function success(response) {
            $scope.series = ['cpu'];
            $scope.labels = response.data.time;
            $scope.data = [response.data.value];
        }, function error(response) {
        //    error
        });
    }
    reload_chart();
    setInterval(function(){
        reload_chart();
    },60000)
}
]);

detail.controller("pmMemCtrl", function ($scope, $http) {

    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
        [28, 42, 41, 19, 86, 27, 90],
        [30, 56, 40, 14, 80, 23, 91],
    ];
    setInterval(function(){
        $http.get('data/status.json').success(function(data) {
            $scope.series = ['Series A', 'Series B'];
            $scope.data = [
                [65, 59, 80, 81, 56, 55, 40],
                [22, 44, 49, 12, 81, 22, 94]
            ];
        });
    },10000)
});


detail.controller("pmVmsCtrl", [
    '$scope',
    '$http',
    '$state',
    '$stateParams',
    'VMs',
    function ($scope, $http, $state, $stateParams, VMs) {
        var reload = function(){
            VMs.refresh().$promise.then(function(response){
                $scope.vms = VMs.getTasks($stateParams.pmName);
            });
        }

        $scope.rowClick = function(vmID){
            $state.go('navbar.detail', {vmID: vmID});
        };
        reload();
        setInterval(function(){
            reload();
        }, 10000);
    }
]);
