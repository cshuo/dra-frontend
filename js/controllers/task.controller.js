'use strict';

var app_detail = angular.module('dra.task',['ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'chart.js', 'nvd3', 'ui.router']);
var base_url = "http://114.212.189.132:9000/api/";
var base_zabbix_ip = "114.212.189.132";

app_detail.controller("appCtrl", [
    '$scope',
    '$http',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$filter',
    function($scope, $http, $state, $stateParams, $mdDialog, $filter){
        var init_data = function(){
            $scope.data = {
                "id":"234765",
                "name":"搜索引擎#1",
                "status":"NORMAL",
                "url":"http://114.212.189.132/zabbix",
                "created":"2016-11-20"
            };
        }
        init_data();
    }
]);


app_detail.controller("taskMetricCtrl", [
    '$scope',
    '$interval',
    '$http',
    function ($scope, $interval, $http) {
        $scope.series = ['ResponseTime', 'Throughput'];
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        $scope.options = {
            scales: {
              yAxes: [
                {
                  id: 'y-axis-1',
                  type: 'linear',
                  display: true,
                  position: 'left'
                },
                {
                  id: 'y-axis-2',
                  type: 'linear',
                  display: true,
                  position: 'right'
                }
              ]
            }
          };
        var fake_rt_data = [11, 12, 11, 11, 11.5, 11.5, 11, 12, 11, 11];
        var fake_tp_data = [129, 128, 129, 129, 128, 128, 130, 129, 130, 127];
        var load_metric = function(){
            $http({
                method:'get',
                url: base_url + 'metrics',
                params: {
                    'baseip': base_zabbix_ip
                }
            }).then(
                function(response){
                    $scope.labels = response.data.responsetime.time;
                    // $scope.data = [response.data.responsetime.value, response.data.throughput.value];
                    $scope.data = [fake_rt_data, fake_tp_data];
                },
                function(response){
                    console.log("Error!!!!!!!!!!!!!11");
            })
        };

        load_metric();

		var metric_interval = $interval(function(){
			load_metric();
		}, 30000);

		$scope.$on('$destroy', function(){
			$interval.cancel(metric_interval);
		});
    }
]);
