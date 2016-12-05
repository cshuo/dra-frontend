'use strict';

var detail_url = "http://114.212.189.132:9000/api/vm/";
var meters_url = "http://114.212.189.132:9000/api/meters/";
var vnc_url = "http://114.212.189.132:9000/api/vnc/";
var auth_d = {'tenant': 'admin', 'username':'admin', 'password': 'artemis'};

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
		console.log(response.data.addresses);
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
        }

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
                    console.log('delete success');
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
    var reload_chart = function(){
        $http({
            method: 'GET',
            url: meters_url + 'cpu_util',
            params: {
                'tenant': 'admin',
                'username': 'admin',
                'password': 'artemis',
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
    var cpu_interval = $interval(function () {
        reload_chart();
    }, 6000);

    $scope.$on('$destroy', function() {
        $interval.cancel(cpu_interval);
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
                $scope.vnc_url = $sce.trustAsResourceUrl(response.data.vnc);
            }, function error(response) {
                //    error
            });
        }
        get_vnc_url();
    }
]);

detail.controller("vmTaskCtrl", [
    '$scope',
    '$interval',
    '$http',
    '$state',
    '$stateParams',
    function ($scope, $interval, $http, $state, $stateParams) {
        $scope.rowClick = function(){
            $state.go('navbar.task');
        };
    }
]);
