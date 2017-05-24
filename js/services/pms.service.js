var base_url = base_ip + 'api/';

angular.module('dra.pm')

    .factory('PMs', ['$resource', '$http', function($resource, $http) {
        var pms = [];
        var resource = $resource(base_url+'pms', {}, {
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
                    pms = response.pms;
                    for(var i = 0; i < pms.length; i++) {
                        if(pms[i].state == 'up'){
                            pms[i].label_class = 'primary';
                        }
                        else {
                            pms[i].label_class = 'warning'
                        }
                    }
                })
            },

            // 重置数据
            resetData: function() {
                pms = [];
            },

            // 获取全部的任务
            getAllTasks: function() {
                return pms;
            },

            // 搜索任务
            getTasks: function(key) {
                if(key == 'all') {
                    return pms;
                } else {
                    var result = [];
                    var pattern = new RegExp(key,'ig');
                    for (var i = 0; i < pms.length; i++) {
                        if(JSON.stringify(pms[i]).match(pattern)) {
                            result.push(pms[i]);
                        }
                    }
                    return result;
                }
            },

            // 按ID获取任务
            getById: function(id) {
                if (!!pms) {
                    for (var i = 0; i < pms.length; i++) {
                        if (pms[i].id === id) {
                            return pms[i];
                        }
                    }
                } else {
                    return null;
                }
            },

            // 监控任务
            monitor: function(callback) {
                $http({
                    method: 'GET',
                    url: base_url + 'pms',
                    params:{
                        'tenant':'admin',
                        'username': 'admin',
                        'password': 'artemis'
                    }
                }).success(function(response) {
                    return callback && callback(response);
                });
            },

            // 删除任务
            deleteTask: function(id, callback) {
                $http({
                    method: 'DELETE',
                    url: API + '/pms/' + id
                }).success(function(response) {
                    return callback && callback(response);
                })
            },

            // 杀死任务
            killTask: function(id, callback) {
                $http({
                    method: 'PUT',
                    url: base_url + '/pms/' + id + '/kill'
                }).success(function(response) {
                    return callback && callback(response);
                })
            }
        }
    }]);
