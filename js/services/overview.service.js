var base_url = 'http://114.212.189.132:9000/api/';

angular.module('dra.overview')

    .factory('VmOverview', ['$resource', '$http', function($resource, $http) {
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
                'password':'cshuo'
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
                        'password': 'cshuo'
                    }
                }).then(function (response){
                    return response.data
                });
            },

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
                                vms[i].label_class="info";
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
            }
        }
    }])
