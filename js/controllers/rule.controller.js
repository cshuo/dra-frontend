var base_url = 'http://114.212.189.132:9000/api/';

angular.module('dra.rule', ['ngResource', 'ui.bootstrap', 'ngMaterial'])

.controller('ruleCtrl', [
    '$scope',
    '$interval',
    '$http',
    '$timeout',
    '$state',
    '$stateParams',
    '$uibModal',
    '$mdDialog',
    '$mdMedia',
    '$mdToast',
    '$filter',
    function($scope, $interval, $http, $timeout, $state, $stateParams, $uibModal, $mdDialog, $mdMedia, $mdToast, $filter) {
        // 加载数据.
        var reload = function () {
            $scope.rules = [
                {
                    "name":"test",
                    "app_type": "web",
                    "content": " a || c => b"
                }
            ];

            // $http({
            //     method:'get',
            //     url: base_url + 'rules'
            // }).then(
            //     function(response){
            //         // $scope.rules = response.data;
            //     },
            //     function(response){
            //         $scope.rules = [];
            //     }
            // )
        };

        // 删除任务
        $scope.delete = function (rule_name, event) {
            var cfir = $mdDialog.confirm()
            .title($filter('translate')('DELETE_RULE_TIPS'))
            .targetEvent(event)
            .ok($filter('translate')('OK'))
            .cancel($filter('translate')('CANCEL'));
            event.stopPropagation();

            $mdDialog.show(cfir).then(
                function(){
                    $http({
                        method: 'delete',
                        url: base_url + 'rule/' + rule_name
                    }).then(
                        function(response){
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent($filter('translate')('DELETE_SUCCESS_TIPS') + rule_name)
                                .position('right')
                                .hideDelay(3000)
                                .theme('success-toast')
                            );
                            reload();
                        },
                        function(response){
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent($filter('translate')('DELETE_FAIL_TIPS') + rule_name)
                                .position('right')
                                .hideDelay(3000)
                                .theme('error-toast')
                            );
                        }
                    )
                },
                function(){
                });


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
                        reload: function(){
                            return reload;
                        }
                    }
                });
            };

            $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

            $scope.rowClick = function(rule_name, rule_content, ev) {
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
                $mdDialog.show({
                    locals: {name: rule_name, content: rule_content},
                    controller: DialogController,
                    templateUrl: '/app/js/templates/rule.detail.html',
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

            // 加载任务, 定时监控
            reload();
            var rule_interval = $interval(function () {
                reload();
            },60000);
            $scope.$on('$destroy', function() {
                $interval.cancel(rule_interval);
            });
        }]);


        // 模块对话框控制器
        var RuleModalCtrl = function ($scope, $http, $uibModalInstance, $mdToast, $filter, reload) {
            $scope.submit = function(){
                if($scope.rule == undefined || $scope.rule.name == undefined || $scope.rule.app_type == undefined || $scope.rule.content == undefined){
                    $scope.error = $filter('translate')('ALL_FIELDS_REQ');
                }
                else{
                    post_d = {'name': $scope.rule.name, 'app_type': $scope.rule.app_type, 'content': $scope.rule.content};
                    $http({
                        method: 'post',
                        url: base_url + 'rules',
                        data: post_d
                    }).then(
                        function(response){
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent($filter('translate')('ADD_RULE_SUCCESS') + $scope.rule.name)
                                .position('right')
                                .hideDelay(3000)
                                .theme('success-toast')
                            );
                            reload();
                        },
                        function(response){
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent($filter('translate')('ADD_RULE_FAIL') + $scope.rule.name)
                                .position('right')
                                .hideDelay(3000)
                                .theme('error-toast')
                            );
                        }
                    )
                    $uibModalInstance.close();
                }
            }

            $scope.cancel = function(){
                $uibModalInstance.dismiss('cancel');
            }
        };


        var DialogController = function($scope, $mdDialog, name, content){
            $scope.name = name;
            $scope.content = content;
            if(content.indexOf('\n') > -1){
                console.log('contains nnn');
            }
            // $scope.content = content;
            $scope.close = function(){
                $mdDialog.cancel();
            }
        }
