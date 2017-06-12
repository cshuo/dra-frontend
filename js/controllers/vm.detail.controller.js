'use strict';

var detail_url = base_ip + "api/vm/";
var meters_url = base_ip + "api/meters/";
var vnc_url = base_ip + "api/vnc/";
var rel_url =  base_ip + "api/relatobj";
var auth_d = {'tenant': 'admin', 'username':'admin', 'password': 'artemis'};
var old_vnc = "20.0.1.10";
var forward_vnc = "114.212.189.132";

var detail = angular.module('dra.detail',['ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'chart.js', 'ui.router']);

detail.controller("detailCtrl", [
    '$scope',
    '$http',
    '$state',
    '$stateParams',
    '$mdDialog',
    '$filter',
    'VMs',
    function($scope, $http, $state, $stateParams, $mdDialog, $filter, VMs){
        var reload = function(){
            $http({
                method: 'GET',
                url: detail_url + $stateParams.vmID,
                params: auth_d
            }).then(function success(response) {
                $scope.data= response.data;
		// console.log(response.data.addresses);
            }, function error(response) {
            });
        }

        $scope.stop = function(vmId, e){
            var cfir = $mdDialog.confirm()
              .title($filter('translate')('STOP_TIPS'))
              .targetEvent(e)
              .ok($filter('translate')('OK'))
              .cancel($filter('translate')('CANCEL'));
            $mdDialog.show(cfir).then(function() {
                VMs.stopVm(vmId, function(){reload();});
            }, function() {
                // do nothing when cancel clicked
            });
        };

        $scope.start = function(vmId, e){
            var cfir = $mdDialog.confirm()
              .title($filter('translate')('START_TIPS'))
              .targetEvent(e)
              .ok($filter('translate')('OK'))
              .cancel($filter('translate')('CANCEL'));
            $mdDialog.show(cfir).then(function() {
                VMs.startVm(vmId, function(){reload();});
            }, function() {
                // do nothing when cancel clicked
            });
        }

        $scope.delete= function(vmId, vmName, e){
            var cfir = $mdDialog.confirm()
              .title($filter('translate')('DELETE_TIPS'))
              .targetEvent(e)
              .ok($filter('translate')('OK'))
              .cancel($filter('translate')('CANCEL'));
            $mdDialog.show(cfir).then(function() {
                VMs.deleteVm(vmId, vmName, function(){
                    // console.log('delete success');
                    $state.go('navbar.vm');
                });
            }, function() {
                // do nothing when cancel clicked
            });

        }
        reload();
    }
]);

detail.controller("vmCpuCtrl", [
    '$scope',
    '$interval',
    '$http',
    '$stateParams',
    function ($scope, $interval, $http, $stateParams) {
    var vmid = $stateParams.vmID;
    var reload_chart = function(name){
        $http({
            method: 'GET',
            url: meters_url + name,
            params: {
                'tenant': 'admin',
                'username': 'admin',
                'password': 'artemis',
                'resource': vmid,
                'interval': '0.4'
            }
        }).then(function success(response) {
            if(name == 'cpu_util'){
              $scope.cpu_series = ['cpu'];
              $scope.cpu_labels = response.data.time;
              $scope.cpu_data = [response.data.value];
            } else if(name == 'memory.usage'){
              $scope.mem_series = ['memory'];
              $scope.mem_labels = response.data.time;
              $scope.mem_data = [response.data.value];
            } else if(name == 'disk.usage'){
              $scope.disk_series = ['disk'];
              $scope.disk_labels = response.data.time;
              $scope.disk_data = [response.data.value];
            } else {
              $scope.net_series = ['network'];
              $scope.net_labels = response.data.time;
              $scope.net_data = [response.data.value];
            }
        }, function error(response) {
            //    error
        });
    }

    reload_chart('cpu_util');
    reload_chart('memory.usage');
    reload_chart('network.outgoing.bytes.rate');
    reload_chart('disk.usage');
    var mtc_interval = $interval(function () {
      reload_chart('cpu_util');
      reload_chart('memory.usage');
      reload_chart('network.outgoing.bytes.rate');
      reload_chart('disk.usage');
    }, 60000);

    $scope.$on('$destroy', function() {
        $interval.cancel(mtc_interval);
    });
}]);

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
                params: auth_d
            }).then(function success(response) {
				var temp = response.data.vnc;
                // $scope.vnc_url = $sce.trustAsResourceUrl(temp.replace(old_vnc, forward_vnc));
                $scope.vnc_url = $sce.trustAsResourceUrl(temp);
            }, function error(response) {
                //    error
            });
        }
        // console.log($stateParams);
        get_vnc_url();
    }
]);

detail.controller('relCtrl', [
    '$scope',
    '$stateParams',
    '$state',
    '$http',
    function($scope, $stateParams, $state, $http) {
        $scope.rels = [];
        var get_rel = function() {
            $http({
                method: 'GET',
                url: rel_url,
                params:{
                    type: 'app',
                    object: $stateParams.vmName
                }
            }).then(function success(response) {
                var rels = response.data;
                for(var i=0; i<rels.length; i++){
                    if(rels[i].name != $stateParams.vmName){
                        $scope.rels.push(rels[i]);
                    }
                }
            }, function error(response) {
                //    error
            });

            $http({
                method: 'GET',
                url: rel_url,
                params:{
                    type: 'vm',
                    object: $stateParams.vmName
                }
            }).then(function success(response) {
                $scope.rel_host = response.data;
            }, function error(response) {
                //    error
            });
        }
        get_rel();

        $scope.rowClick = function(rel, sign){
            if(sign)
                $state.go('navbar.detail',{vmID: rel.id, vmName:rel.name});
            else
                $state.go('navbar.pm_detail',{pmID: rel.id, pmName: rel.name});
        };
    }
]);

detail.controller("vmLogCtrl", ['$scope','$http', '$interval', '$mdDialog', '$mdMedia','$stateParams',
  function ($scope, $http, $interval, $mdDialog, $mdMedia, $stateParams) {
    var logs = [];
    var reload_log = function(){
      $http({
          method: 'GET',
          url: log_url,
          params: {
            'holder':$stateParams.vmName,
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
