angular.module('dra.vm', ['ngResource', 'ui.bootstrap', 'ngMaterial'])

.controller('VmCtrl', [
    '$scope',
    '$http',
    '$timeout',
    '$state',
    '$stateParams',
    '$uibModal',
    '$mdDialog',
    'VMs',
function($scope, $http, $timeout, $state, $stateParams, $uibModal, $mdDialog, VMs) {
    $scope.query = $stateParams.query || "all";
    $scope.filter = $scope.query;

    // 加载数据
    var reload = function (query) {
        VMs.refresh().$promise.then(function(response) {
            //TODO 错误处理
            $scope.vms = VMs.getTasks(query);
        });
    };

    $scope.stop = function(vmId, ev){
        var cfir = $mdDialog.confirm()
              .title('Sure to stop vm?')
              .targetEvent(ev)
              .ok('ok')
              .cancel('cancel');
        $mdDialog.show(cfir).then(function() {
            VMs.stopVm(vmId, reload($scope.query));
        }, function() {
            // do nothing when cancel clicked
        });
        ev.stopPropagation();
    }

    $scope.start = function(vmId, ev){
        var cfir = $mdDialog.confirm()
              .title('Sure to start vm?')
              .targetEvent(ev)
              .ok('ok')
              .cancel('cancel');
        $mdDialog.show(cfir).then(function() {
            VMs.startVm(vmId, reload($scope.query));
        }, function() {
            // do nothing when cancel clicked
        });
        ev.stopPropagation();
    }

    // delete vm
    $scope.delete = function(vmId, ev) {
        var cfir = $mdDialog.confirm()
              .title('Sure to delete vm?')
              .targetEvent(ev)
              .ok('ok')
              .cancel('cancel');
        $mdDialog.show(cfir).then(function() {
            VMs.deleteVm(vmId, reload($scope.query));
        }, function() {
            // do nothing when cancel clicked
        });
        ev.stopPropagation();
    };

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
    setInterval(function(){
        reload($scope.query);
    },10000)
}]);


// 模块对话框控制器
var TaskModalCtrl = function ($scope, $uibModalInstance, VMs) {
    // 数据初始化
    $scope.task = {
        cpus:'0.1',
        mem:'32',
        disk:'0',
        docker_image:'busybox',
        cmd:'ls',
        volumes: [
            {
                container_path: "/data",
                host_path: "/vagrant",
                mode: "RW"
            }
        ],
        port_mappings: [
            {
                container_port: "8000",
                host_port: "8080",
                protocol: "TCP"
            }
        ]
    }

    $scope.addPortMapping = function() {
        $scope.task.port_mappings.push({
            container_port: "8000",
                host_port: "8080",
            protocol: "TCP"
        })
    }

    $scope.deletePortMapping = function(index) {
        $scope.task.port_mappings.splice(index, 1);
    }

    $scope.addVolume = function() {
        $scope.task.volumes.push({
            container_path: "/data",
            host_path: "/vagrant",
            mode: "RW"
        })
    }

    $scope.deleteVolume = function(index) {
        $scope.task.volumes.splice(index, 1);
    }

    $scope.submit = function () {
        VMs.submitTask($scope.task, function(){
            // TODO 消息通知
        });
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
};
