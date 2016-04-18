/**
 * Created by jeff on 16/3/9.
 */

var FILTER_NAME = ['All', 'Running', 'Finished', 'Failed', 'Killed', 'Lost', 'Staging', 'Error'];

angular.module('dra.vm', ['ngResource', 'ui.bootstrap'])

.controller('VmCtrl', [
    '$scope',
    '$http',
    '$timeout',
    '$state',
    '$stateParams',
    '$uibModal',
    'VMs',
function($scope, $http, $timeout, $state, $stateParams, $uibModal, VMs) {
    $scope.query = $stateParams.query || "all";
    $scope.filter = $scope.query;

    // 加载数据
    var reload = function (query) {
        VMs.refresh().$promise.then(function(response) {
            //TODO 错误处理
            $scope.vms = VMs.getTasks(query)
        });
    }

    // 提交任务
    $scope.submitTask = function (vm) {
        VMs.submitTask(vm, reload($scope.query))
    }

    // 杀死任务
    $scope.kill = function (vm) {
        VMs.killTask(vm.name, reload($scope.query));
    }

    // 删除任务
    $scope.delete = function (vm) {
        VMs.deleteTask(vm.name, reload($scope.query));
    }

    // 搜索任务
    $scope.search = function () {
        $state.go('vm', {query: $scope.search_key})
    }

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
    }

    $scope.rowClick = function(vmID){
		$state.go('navbar.detail',{vmID: vmID});
	};

    // 加载任务, 定时监控
    reload($scope.query);
    setInterval(function(){
        reload($scope.query);
        //VMs.monitor(reload($scope.query))
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
