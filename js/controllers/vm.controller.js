angular.module('dra.vm', ['ngResource', 'ui.bootstrap', 'ngMaterial'])

.controller('VmCtrl', [
    '$scope',
    '$interval',
    '$http',
    '$timeout',
    '$state',
    '$stateParams',
    '$uibModal',
    '$mdDialog',
    '$timeout',
    'VMs',
    function($scope, $interval, $http, $timeout, $state, $stateParams, $uibModal, $mdDialog, $timeout, VMs) {
        $scope.query = $stateParams.query || "all";
        $scope.filter = $scope.query;

        // 加载数据
        var reload = function (query) {
            VMs.refresh().$promise.then(function(response) {
                //TODO 错误处理
                $scope.vms = VMs.getTasks(query);
            });
        };

        var originatorEv;
        $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.opClick = function(item, vmId){
            var cfir = $mdDialog.confirm()
            .title("Sure to " + item + " vm?")
            .targetEvent(originatorEv)
            .ok('ok')
            .cancel('cancel');
            $mdDialog.show(cfir).then(function() {
                if(item == 'stop'){
                    VMs.stopVm(vmId, function(){reload($scope.query);});
                } else if (item == 'start'){
                    VMs.startVm(vmId, function(){reload($scope.query);});
                } else {
                    VMs.deleteVm(vmId, function(){reload($scope.query);});
                }
            }, function() {
                // do nothing when cancel clicked
            });

            originatorEv = null;
        }

        // 搜索任务
        $scope.search = function () {
            $state.go('navbar.vm', {query: $scope.search_key})
        };

        $scope.stateSel = function (stt) {
            if(stt != "all"){
                $scope.stt = {status: stt};
            } else {
                $scope.stt = {};
            }
            switch(stt){
                case "active":
                $scope.color_class = "text-navy";
                break;
                case "error":
                $scope.color_class = "text-danger";
                break;
                case "reboot":
                $scope.color_class = "text-warning";
                break;
                case "suspend":
                $scope.color_class = "text-muted";
                break;
                case "shutoff":
                $scope.color_class = "text-info";
                break;
                default:
                $scope.color_class = "";
            }
        };

        // 打开提交任务的模态框
        $scope.openTaskModal = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/app/js/templates/task.modal.html',
                controller: TaskModalCtrl,
                size: 'md',
                windowTemplateUrl: '/app/js/components/modal/modal.window.html',
                resolve: {
                }
            });
        };

        $scope.rowClick = function(vmID, e){
            $state.go('navbar.detail',{vmID: vmID});
        };

        // 加载任务, 定时监控
        reload($scope.query);
        var vms_interval = $interval(function () {
            reload($scope.query);
        }, 10000);
        $scope.$on('$destroy', function() {
            $interval.cancel(vms_interval);
        });
    }]);


    // 模块对话框控制器
    var TaskModalCtrl = function ($scope, $uibModalInstance, $mdToast, VMs) {
        VMs.getInfos().then(
            function(response){
                $scope.infos = response.data;
            },
            function(response){
                console.log('error req of infos');
            }
        );

        $scope.deleteVolume = function(index) {
            $scope.task.volumes.splice(index, 1);
        }

        $scope.submit = function () {
            if($scope.vm == undefined || $scope.vm.name == undefined || $scope.vm.count == undefined || $scope.vm.flavor == undefined
                || $scope.vm.image == undefined || $scope.vm.nets == undefined || $scope.vm.keypair == undefined){
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Field missed!')
                        .position('right')
                        .hideDelay(3000)
                        .theme('error-toast')
                    );
                }
                else {
                    VMs.submitTask($scope.vm);
                    $uibModalInstance.close();
                }
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        };
