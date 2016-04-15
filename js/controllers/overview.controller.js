'use strict';

var flavor_url = "http://114.212.189.132:9000/api/flavors";
var overview = angular.module("sher.overview", ['ngResource', 'ui.bootstrap', 'chart.js']);

overview.controller("tableCtrl", [
    '$scope',
    '$http',
    '$state',
    '$stateParams',
    'VmOverview',
    function ($scope, $http, $state, $stateParams, VmOverview) {
        $scope.query = $stateParams.query || "all";
        $scope.filter = $scope.query;

        $http({
            method: 'GET',
            url: flavor_url,
            params: {
                'tenant': 'admin',
                'username': 'admin',
                'password': 'cshuo'
            }
        }).then(function success(response) {
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
        setInterval(function(){
            reload($scope.query);
        }, 10000)
    }
]);

overview.controller("chartCtrl", ['$scope', 'VmOverview', function ($scope, VmOverview) {
    $scope.labels = ["Used", "Free"];
    var reload = function(){
        VmOverview.overview_data().then(function(d){
            $scope.cpu_data = [d.vcpus_used, d.vcpus - d.vcpus_used];
            $scope.mem_data = [d.memory_mb_used, d.free_ram_mb];
            $scope.disk_data = [d.local_gb_used, d.free_disk_gb];
        })
    };
    reload();
    setInterval(function(){
        reload();
    }, 10000);
}]);

// overview.controller("pmemCtrl", function ($scope) {
//     $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
//     $scope.data = [200, 500, 100];
// });
//
// overview.controller("pnetCtrl", function ($scope) {
//     $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
//     $scope.data = [300, 500, 400];
// });
