'use strict';

var flavor_url = "http://114.212.189.132:9000/api/flavors";
var map_url = "http://114.212.189.132:9000/api/maps";
var overview = angular.module("dra.overview", ['ngResource', 'ui.bootstrap', 'chart.js']);

overview.controller("tableCtrl", [
    '$scope',
    '$interval',
    '$http',
    '$state',
    '$stateParams',
    'VmOverview',
    function ($scope, $interval, $http, $state, $stateParams, VmOverview) {
        $scope.query = $stateParams.query || "all";
        $scope.filter = $scope.query;

        var get_mthd = function(url){
            return $http({
                method: 'GET',
                url: url,
                params: {
                    'tenant': 'admin',
                    'username': 'admin',
                    'password': 'artemis'
                }
            })
        }

        get_mthd(flavor_url).then(function success(response) {
            $scope.flavors = response.data;
        }, function error(response) {
            //    error
        });

        var reload = function (query){
            VmOverview.refresh().$promise.then(function(response) {
                //TODO 错误处理
                $scope.vms = VmOverview.getTasks(query)
            });
        }

        $scope.rowClick = function(vmID){
            $state.go('navbar.detail',{vmID: vmID});
        };

        reload($scope.query);
        var vms_intval = $interval(function () {
            reload($scope.query);
        }, 10000);
        $scope.$on('$destroy', function() {
            $interval.cancel(vms_intval);
        });
    }
]);

overview.controller("chartCtrl", ['$scope', '$interval', 'VmOverview', function ($scope, $interval, VmOverview) {
    $scope.labels = ["Used", "Free"];
    var reload = function(){
        VmOverview.overview_data().then(function(d){
            $scope.cpu_data = [d.vcpus_used, d.vcpus - d.vcpus_used];
            $scope.mem_data = [d.memory_mb_used, d.free_ram_mb];
            $scope.disk_data = [d.local_gb_used, d.free_disk_gb];
        })
    };
    reload();
    var chart_intval = $interval(function () {
        reload();
    }, 10000);
    $scope.$on('$destroy', function() {
        $interval.cancel(chart_intval);
    });
}]);
