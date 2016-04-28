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

detail.controller("pmCpuCtrl", ['$scope', '$interval', '$http', '$stateParams', function ($scope, $interval, $http, $stateParams) {
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
    var cpu_interval = $interval(function () {
        reload_chart();
    }, 60000);
    $scope.$on('$destroy', function() {
        $interval.cancel(cpu_interval);
    });
}
]);


detail.controller("pmVmsCtrl", [
    '$scope',
    '$interval',
    '$http',
    '$state',
    '$stateParams',
    'VMs',
    function ($scope, $interval, $http, $state, $stateParams, VMs) {
        var reload = function(){
            VMs.refresh().$promise.then(function(response){
                $scope.vms = VMs.getTasks($stateParams.pmName);
            });
        }

        $scope.rowClick = function(vmID){
            $state.go('navbar.detail', {vmID: vmID});
        };
        reload();
        var vms_interval = $interval(function () {
            reload();
        }, 10000);
        $scope.$on('$destroy', function() {
            $interval.cancel(vms_interval);
        });
    }
]);
