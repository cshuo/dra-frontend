var base_url = 'http://114.212.189.132:9000/api/';

angular.module('dra.vm')

    .factory('VMs', ['$resource', '$http', function($resource, $http) {
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

            // 提交任务
            submitTask: function(task, callback) {
                $http({
                    method: 'POST',
                    url: API + '/vms',
                    data : task,
                    headers:{
                        'Accept': 'application/json',
                        'Content-Type': 'application/json; ; charset=UTF-8'
                    }
                }).success(function(response) {
                    return callback;
                });
            },

            // 监控任务
            monitor: function(callback) {
                $http({
                    method: 'GET',
                    url: API,
                }).success(function(response) {
                    return callback && callback(response);
                });
            },

            // 删除任务
            deleteTask: function(id, callback) {
                $http({
                    method: 'DELETE',
                    url: API + '/vms/' + id
                }).success(function(response) {
                    return callback && callback(response);
                })
            },

            // 杀死任务
            killTask: function(id, callback) {
                $http({
                    method: 'PUT',
                    url: API + '/vms/' + id + '/kill'
                }).success(function(response) {
                    return callback && callback(response);
                })
            }
        }
    }])
