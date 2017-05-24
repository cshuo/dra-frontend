var base_url = base_ip + 'api/';

angular.module('dra.overview')

    .factory('VmOverview', ['$resource', '$http', function($resource, $http) {
        var vms = [];
        var resource = $resource(base_url+'vms', {}, {
            query: {
                method: 'get',
                timeout: 20000
            }
        });

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
            overview_data: function(){
                return $http({
                    method: 'GET',
                    url: base_url + 'usages',
                    params: {
                        'tenant': 'admin',
                        'username': 'admin',
                        'password': 'artemis'
                    }
                }).then(function (response){
                    return response.data
                });
            },

            refresh: function() {
                return getTasks(function(response) {
                    vms = response.vms;
                });
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
            }
        }
    }])
