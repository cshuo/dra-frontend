'use strict';

var base_url = "http://114.212.189.132:9000/api";
var flavor_url = base_url + "/flavors";
var map_url = base_url + "/maps";
var log_url = base_url + "/logs";
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

        $scope.rowClick = function(vmID, vmName){
            $state.go('navbar.detail',{vmID: vmID, vmName: vmName});
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


overview.controller("logCtrl", ['$scope','$http', '$interval', '$mdDialog', '$mdMedia',
  function ($scope, $http, $interval, $mdDialog, $mdMedia) {
    var logs = [];
    var reload_log = function(){
      $http({
          method: 'GET',
          url: log_url,
          params: {
            'holder':'all',
            'type': 'all',
            'num': '6'
          }
      }).then(function success(response){
        logs = response.data;
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
