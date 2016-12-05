'use strict';

var base_url = 'http://114.212.189.132:9000/api/';
var overview = angular.module("dra.overview", ['ngResource', 'ui.bootstrap', 'chart.js', 'nvd3']);
var base_zabbix_ip = '114.212.189.132';

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

        get_mthd(base_url+'flavors').then(function success(response) {
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


overview.controller("warnCtrl", ['$http', '$scope', '$interval', '$mdDialog', '$mdMedia', function($http, $scope, $interval, $mdDialog,$mdMedia) {
    var update_warning = function(warnings){
        for(var i=0; i < warnings.length; i++){
            switch (warnings[i].priority) {
                case '1':
                    warnings[i].label_class = 'warning';
                    break;
                case '2':
                    warnings[i].label_class = 'warning';
                    break;
                default:
                    warnings[i].label_class = 'danger';
            }
        }
        return warnings;
    }
    var reload = function () {
        $http({
            method:'get',
            url: base_url + 'warnings',
            params: {
                'baseip': base_zabbix_ip
            }
        }).then(
            function(response){
                $scope.warnings = update_warning(response.data);
            },
            function(response){
                $scope.rules = [];
        })
    };
    reload();

    $scope.rowClick = function(warn_id, warn_content, warn_level, warn_label, ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
        $mdDialog.show({
            locals: {id: warn_id, content: warn_content, level: warn_level, label: warn_label},
            controller: DialogController,
            templateUrl: '/app/js/templates/warning.detail.html',
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

    var DialogController = function($scope, $mdDialog, id, content, level, label){
        $scope.id = id;
        $scope.content = content;
        $scope.level = level;
        $scope.label = label;
        if(content.indexOf('\n') > -1){
            console.log('contains nnn');
        }
        // $scope.content = content;
        $scope.close = function(){
            $mdDialog.cancel();
        }
    }

}]);
