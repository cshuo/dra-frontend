'use strict';

var pm_detail_url = "http://20.0.1.9:9000/api/pm/";
var meters_url = "http://20.0.1.9:9000/api/meters/";

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
                'interval': '0.5'
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

detail.controller("pmLogCtrl", ['$scope','$http', '$interval', '$mdDialog', '$mdMedia','$stateParams',
  function ($scope, $http, $interval, $mdDialog, $mdMedia, $stateParams) {
    var logs = [];
    var reload_log = function(){
      $http({
          method: 'GET',
          url: log_url,
          params: {
            'holder':$stateParams.pmName,
            'type': 'all',
            'num': '6'
          }
      }).then(function success(response){
        console.log('------------------------------');
        logs = response.data;
        console.log(logs);
        for(var i=0; i<logs.length; i++){
          switch (logs[i].type) {
            case "warn":
              logs[i].label_class = 'warning';
              break;
            case "operation":
              logs[i].label_class = 'primary';
            default:
              logs[i].label_class = 'primary';
          }
        }
        $scope.logs = logs;
      }, function error(response){
        console.log("error");
      });
    }

    var rowClick = function(log, ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
        $mdDialog.show({
            locals: {name: log.holder, content: log.info, type: log.type, time: log.time, label: log.label_class},
            controller: DialogController,
            templateUrl: '/app/js/templates/log.modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: useFullScreen
        })
        .then(function(answer) {
        }, function() {
        });
        $scope.$watch(function() {
            return $mdMedia('xs') || $mdMedia('sm');
        }, function(wantsFullScreen) {
            $scope.customFullscreen = (wantsFullScreen === true);
        });
    };

    $scope.rowClick = rowClick;

    var DialogController = function($scope, $mdDialog, name, content, type, time, label){
        $scope.name = name;
        $scope.content = content;
        $scope.type = type;
        $scope.time = time;
        $scope.label = label;
        // $scope.content = content;
        $scope.close = function(){
            $mdDialog.cancel();
        }
    }

    reload_log();
    var log_interval = $interval(function(){
      reload_log();
    }, 30000);
    $scope.$on('$destroy', function(){
      $interval.cancel(log_interval);
    });
}]);
