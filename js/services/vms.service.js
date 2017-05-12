var base_url = 'http://20.0.1.9:9000/api/';
var auth_d = {'tenant': 'admin', 'username':'admin', 'password': 'artemis'};

angular.module('dra.vm')

    .factory('VMs', ['$resource', '$http', '$mdToast', '$timeout', '$filter',
        function($resource, $http, $mdToast, $timeout, $filter) {
        var vms = [];
        var resource = $resource(base_url+'vms', {}, {
            query: {
                method: 'get',
                timeout: 20000
            },
        })

        var getTasks = function(callback) {
            return resource.query({
                'tenant':'admin',
                'username':'admin',
                'password':'artemis'
            }, function(r) {
                return callback && callback(r);
            })
        };

        var action_tips = function(cmd, sign){
            if(cmd == 'stop'){
                if(sign == 'success'){
                    return $filter('translate')('STOP_SUCCESS_TIPS');
                } else {
                    return $filter('translate')('STOP_FAIL_TIPS');
                }
            } else if(cmd == 'start') {
                if(sign == 'success'){
                    return $filter('translate')('START_SUCCESS_TIPS');
                } else {
                    return $filter('translate')('START_FAIL_TIPS');
                }
            } else if(cmd == 'create'){
                if(sign == 'success'){
                    return $filter('translate')('CREATE_SUCCESS_TIPS');
                } else {
                    return $filter('translate')('CREATE_FAIL_TIPS');
                }
            } else {
                if(sign == 'success'){
                    return $filter('translate')('DELETE_SUCCESS_TIPS');
                } else {
                    return $filter('translate')('DELETE_FAIL_TIPS');
                }
            }
        };

        // for stop and start vms
        var action = function(cmd, vmId, vmName, callback){
            // if(confirm('Sure to '+ cmd+'?')){
                var put_d = auth_d;
                put_d['cmd'] = cmd;
                $http({
                    url: detail_url + vmId,
                    method: 'PUT',
                    data: put_d
                }).then(
                    function(response){
                        $mdToast.show(
                          $mdToast.simple()
                            .textContent(action_tips(cmd, 'success') + vmName)
                            .position('right')
                            .hideDelay(3000)
                            .theme('success-toast')
                        );
                        $timeout(function() {return callback && callback();}, 4000);
                    },
                    function(response){
                        $mdToast.show(
                          $mdToast.simple()
                            .textContent(action_tips(cmd, 'fail') + vmName)
                            .position('right')
                            .hideDelay(3000)
                            .theme('error-toast')
                        );
                    }
                );
            // }
        }

		return {
            // 刷新任务
            refresh: function() {
                return getTasks(function(response) {
                    vms = response.vms;
                    for(var i = 0; i < vms.length; i++) {
                        switch (vms[i].status) {
                            case "ACTIVE":
                                vms[i].label_class="primary";
                                break;
                            case "ERROR":
                                vms[i].label_class="danger";
                                break;
                            case "REBOOT":
                                vms[i].label_class="warning";
                                break;
                            case "SHUTOFF":
                                vms[i].label_class="info";
                                break;
                            case "SUSPENDED":
                                vms[i].label_class="muted";
                                break;
                            default:
                                vms[i].label_class="default";
                        }
                    }
                })
            },

            // 重置数据
            resetData: function() {
                vms = [];
            },

            // 获取全部的任务
            getAllTasks: function() {
                return vms;
            },

            // 搜索任务
            getTasks: function(key) {
                if(key == 'all') {
                    return vms;
                } else {
                    var result = [];
                    var pattern = new RegExp(key,'ig');
                    for (var i = 0; i < vms.length; i++) {
                        if(JSON.stringify(vms[i]).match(pattern)) {
                            result.push(vms[i]);
                        }
                    }
                    return result;
                }
            },

            // 按ID获取任务
            getById: function(name) {
                if (!!vms) {
                    for (var i = 0; i < vms.length; i++) {
                        if (vms[i].name === name) {
                            return vms[i];
                        }
                    }
                } else {
                    return null;
                }
            },

            getInfos: function(){
                return $http({
                    method: 'get',
                    url: base_url + 'infos',
                    params:{
                        'tenant':'admin',
                        'username': 'admin',
                        'password': 'artemis'
                    }
                });
            },

            test: function(){
                return 'test';
            },

            // 提交任务
            submitTask: function(info) {
                post_d = auth_d;
                server_info = {
                    'name': info.name,
                    'imageRef': info.image,
                    'key_name': info.keypair,
                    'flavorRef': info.flavor,
                    'min_count': info.count,
                    'max_count': info.count,
                    'app_type': info.app_type || 'general',
                    'networks': []
                };
                for(var i=0; i < info.nets.length; i++){
                    server_info['networks'].push({'uuid': info.nets[i]});
                }
                post_d['server'] = JSON.stringify(server_info);
                $http({
                    method: 'POST',
                    url: base_url + 'vms',
                    data : post_d,
                }).then(
                    function(response){
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent(action_tips('create', 'success') + info.name)
                            .position('right')
                            .hideDelay(3000)
                            .theme('success-toast')
                        );
                    },
                    function(response){
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent(action_tips('create', 'fail') + info.name)
                            .position('right')
                            .hideDelay(3000)
                            .theme('error-toast')
                        );
                    }
                )
            },

            // stop vms
            stopVm: function(vmId, vmName, callback){
                action('stop', vmId, vmName,  callback);
            },

            startVm: function(vmId, vmName, callback){
                action('start', vmId, vmName, callback);
            },

            deleteVm: function(vmId, vmName, callback){
                // if(confirm('Sure to delete?')){
                $http({
                    url: detail_url + vmId,
                    method: 'DELETE',
                    data: auth_d,
                    headers: {"Content-Type": "application/json"}
                }).then(
                    function(response){
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent(action_tips('delete', 'success') + vmName)
                            .position('right')
                            .hideDelay(3000)
                            .theme('success-toast')
                        );
                        $timeout(function() {return callback && callback();}, 4000);
                    },
                    function(response){
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent(action_tips('delete', 'fail') + vmName)
                            .position('right')
                            .hideDelay(3000)
                            .theme('error-toast')
                        );
                    }
                );
                // }
            }
        }
    }])
