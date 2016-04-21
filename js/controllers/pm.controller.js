/**
 * Created by cshuo on 16/3/9.
 */

angular.module('dra.pm', ['ngResource', 'ui.bootstrap'])

    .controller('PmCtrl', [
        '$scope',
        '$http',
        '$timeout',
        '$state',
        '$stateParams',
        '$uibModal',
        'PMs',
        function($scope, $http, $timeout, $state, $stateParams, $uibModal, PMs) {
            $scope.query = $stateParams.query || "all";
            $scope.filter = $scope.query;

            // 加载数据
            var reload = function (query) {
                PMs.refresh().$promise.then(function(response) {
                    //TODO 错误处理
                    $scope.pms = PMs.getTasks(query)
                });
            };

            // 杀死任务
            $scope.kill = function (task) {
                PMs.killTask(task.id, reload($scope.query));
            };

            // 删除任务
            $scope.delete = function (task) {
                PMs.deleteTask(task.id, reload($scope.query));
            };

            // 搜索任务
            $scope.search = function () {
                $state.go('navbar.pm', {query: $scope.search_key})
            };

            $scope.stateSel = function (state) {
                console.log(state);
                if(state == "up"){
                    $scope.stt = {state: 'up'};
                    $scope.color_class = "text-navy"
                } else if (state == "down") {
                    $scope.stt = {state: 'down'};
                    $scope.color_class = "text-warning"
                } else {
                    $scope.stt = {};
                    $scope.color_class = ""
                }
            };
            
            $scope.rowClick = function(pmID, pmName){
                $state.go('navbar.pm_detail',{pmID: pmID, pmName:pmName});
            };

            // 加载任务, 定时监控
            reload($scope.query);
            setInterval(function(){
                PMs.monitor(reload($scope.query))
            },10000)
        }]);
