'use strict';

var pm_detail_url = "http://114.212.189.132:9000/api/pm/";

var detail = angular.module('sher.pm_detail',['ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'chart.js', 'ui.router']);

detail.controller("pmdetailCtrl", ['$scope', '$http', '$stateParams', 'PMs',
    function($scope, $http, $stateParams, PMs){
        $http({
            method: 'GET',
            url: pm_detail_url + $stateParams.pmID,
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

        /*
         $http.get('http://114.212.189.132/data/ID.json').success(function(data) {
         $scope.data = data.result;
         });
         */
    }
]);

detail.controller("cpuCtrl", function ($scope, $http) {

    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
        [28, 48, 40, 19, 86, 27, 90],
        [30, 49, 40, 9, 86, 27, 90],
    ];
    setInterval(function(){
        $http.get('data/status.json').success(function(data) {
            $scope.series = ['Series A', 'Series B'];
            $scope.data = [
                [65, 59, 80, 81, 56, 55, 40],
                [28, 48, 40, 19, 86, 27, 90]
            ];
        });
    },10000)
});

detail.controller("memCtrl", function ($scope, $http) {

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
