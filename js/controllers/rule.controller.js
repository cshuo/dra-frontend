angular.module('dra.rule', ['ngResource', 'ui.bootstrap'])

.controller('ruleCtrl', [
    '$scope',
    '$interval',
    '$http',
    '$timeout',
    '$state',
    '$stateParams',
    '$uibModal',
function($scope, $interval, $http, $timeout, $state, $stateParams, $uibModal) {
    $scope.query = $stateParams.query || "all";
    $scope.filter = $scope.query;

    // 加载数据
    var reload = function (query) {
        $scope.rules = [
            {
                'name': 'r1',
                'app_type': 'app1',
            },
            {
                'name': 'r2',
                'app_type': 'app2',
            }
        ]
    };

    // 删除任务
    $scope.delete = function (vm) {
    };

    // 搜索任务
    $scope.search = function () {
        // $state.go('navbar.vm', {query: $scope.search_key})
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
            templateUrl: '/app/js/templates/rule.modal.html',
            controller: RuleModalCtrl,
            size: 'md',
            windowTemplateUrl: '/app/js/components/modal/modal.window.html',
            resolve: {

            }
        });
    };

    $scope.rowClick = function(vmID){
        // add some response action
	};

    // 加载任务, 定时监控
    reload($scope.query);
    var rule_interval = $interval(function () {
        reload($scope.query);
    },60000);
    $scope.$on('$destroy', function() {
        $interval.cancel(rule_interval);
    });
}]);


// 模块对话框控制器
var RuleModalCtrl = function ($scope, $uibModalInstance, VMs) {
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
