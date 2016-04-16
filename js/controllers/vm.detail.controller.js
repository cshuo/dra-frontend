'use strict';

var detail_url = "http://114.212.189.132:9000/api/vm/";
var meters_url = "http://114.212.189.132:9000/api/meters/";
var vnc_url = "http://114.212.189.132:9000/api/vnc/";

var detail = angular.module('sher.detail',['ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'chart.js', 'ui.router']);

detail.controller("detailCtrl", [
    '$scope',
    '$rootScope',
    '$http',
    '$stateParams',
    'VMs',
	function($scope, $rootScope, $http, $stateParams, VMs){
        $http({
            method: 'GET',
            url: detail_url + $stateParams.vmID,
            params: {
                'tenant': 'admin',
                'username': 'admin',
                'password': 'cshuo'
            }
        }).then(function success(response) {
            $scope.data= response.data;
        }, function error(response) {
        //    error
        });

	}
]);

detail.controller("stateCtrl", [
    '$scope',
    '$rootScope',
    function($scope, $rootScope){
        $scope.previousState = $rootScope.previousState || 'navbar.overview';
    }
]);

detail.controller("vmCpuCtrl", ['$scope', '$http', '$stateParams', function ($scope, $http, $stateParams) {
    var vmid = $stateParams.vmID;
    var reload_chart = function(){
        $http({
            method: 'GET',
            url: meters_url + 'cpu_util',
            params: {
                'tenant': 'admin',
                'username': 'admin',
                'password': 'cshuo',
                'resource': vmid,
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
	},6000)
}]);

detail.controller("vmMemCtrl", function ($scope, $http) {

	$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
	// $scope.series = ['Series A', 'Series B'];
	$scope.data = [
		[28, 42, 41, 19, 86, 27, 90],
		[30, 56, 40, 14, 80, 23, 91],
	];
	setInterval(function(){
		$http.get('data/status.json').success(function(data) {
			$scope.series = ['Series', 'Series B'];
            $scope.data = [
                [65, 59, 80, 81, 56, 55, 40],
                [22, 44, 49, 12, 81, 22, 94]
			];
		});
	},10000)
});


detail.controller('vncCtrl', [
    '$scope',
    '$sce',
    '$stateParams',
    '$http',
    function($scope, $sce, $stateParams, $http) {
        var get_vnc_url = function() {
            $http({
                method: 'GET',
                url: vnc_url + $stateParams.vmID,
                params: {
                    'tenant': 'admin',
                    'username': 'admin',
                    'password': 'cshuo',
                }
            }).then(function success(response) {
                $scope.vnc_url = $sce.trustAsResourceUrl(response.data.vnc);
            }, function error(response) {
                //    error
            });
        }
        get_vnc_url();
    }
]);
// detail.controller('vncCtrl', ['$scope', '$http', function($scope, $http){
//     var get_vnc_url = function(){
//         $http({
//             method: 'GET',
//             url: meters_url + 'cpu_util',
//             params: {
//                 'tenant': 'admin',
//                 'username': 'admin',
//                 'password': 'cshuo',
//                 'resource': $stateParams.vmID,
//                 'interval': '1'
//             }
//         }).then(function success(response) {
//             $scope.series = ['cpu'];
//             $scope.labels = response.data.time;
//             $scope.data = [response.data.value];
//         }, function error(response) {
//         });
// }]);
