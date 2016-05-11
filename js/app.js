'use strict';

// Declare app level module which depends on views, and components
angular.module('dra', [
    'ui.router',
    'dra.vm',
    'dra.detail',
    'dra.pm',
    'dra.pm_detail',
    'dra.rule',
    'dra.overview',
    'dra.auth',
    'ngRoute',
    'ngCookies',
    'pascalprecht.translate'
])

.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
    .state("login", {
        url: "/login",
        templateUrl: "/app/js/templates/login.html",
        controller: 'LoginController'
    }).state("navbar", {
        templateUrl: "/app/js/templates/navbar.html"
    }).state("navbar.vm", {
        url: "/vm?query",
        templateUrl: "/app/js/templates/vm.html",
        controller: 'VmCtrl'
    }).state("navbar.pm", {
        url: "/pm?query",
        templateUrl: "/app/js/templates/pm.html",
        controller: 'PmCtrl'
    }).state("navbar.rule", {
        url: "/rule?query",
        templateUrl: "/app/js/templates/rule.html",
        controller: 'ruleCtrl'
    }).state("navbar.detail", {
        url: "/vm/:vmID",
        templateUrl: "/app/js/templates/vm.detail.html",
        controller: ''
    }).state("navbar.pm_detail", {
        url: "/pm/:pmID/:pmName",
        templateUrl: "/app/js/templates/pm.detail.html",
        //   params: {pmName: null},
        controller: ''
    }).state("navbar.overview", {
        url: "/overview",
        templateUrl: "/app/js/templates/overview.html",
        controller: ''
    });
    $locationProvider.html5Mode({enabled:true});
    $urlRouterProvider.otherwise('/login');
}])

.config(['$translateProvider', function($translateProvider){
    $translateProvider.translations('en', {
        LOGIN: 'Login',
        USERNAME: 'Username',
        PASSWORD: 'Password',
        OVERVIEW: 'Overview',
        LOGOUT: 'Logout',
        SETTINGS: 'Settings',
        SWITCH_LANGUAGE: 'Swich Language',
        DASHBOARD: 'Dashboard',
        INSTANCES: 'Instances',
        HYPERVISORS: 'Hypervisors',
        RULES: 'Rules',
        APP: 'App',
        ADD_RULE: 'Add Rule',
        VCPUS: 'VCPUS',
        MEM: 'MEM',
        DISK: 'Disk',
        NAME: 'Name',
        IP: 'IP',
        MEMORY: 'Memory',
        CREATED: 'Created',
        CREATE_VM: 'Create VM',
        HOST: 'Host',
        STATE: 'State',
        STATUS: 'Status',
        OPTIONS: 'Options',
        SEARCH_TASK: 'Search...',
        ALL: 'ALL',
        ACTIVE: 'ACTIVE',
        ERROR: 'ERROR',
        REBOOT: 'REBOOT',
        SHUTOFF: 'SHUTOFF',
        SUSPEND: 'SUSPEND',
        DETAILS: 'Details',
        ID: 'ID',
        METERS: 'Meters',
        SHELL: 'Shell',
        TYPE: 'Type',
        VMS: 'VMS',
        STOP: 'Stop',
        START: 'Start',
        DELETE: 'Delete',
        CANCEL: 'Cancel',
        OK: 'Ok',
        STOP_TIPS: 'Sure to stop vm?',
        START_TIPS: 'Sure to start vm?',
        DELETE_TIPS: 'Sure to delete vm?',
        BASIC: 'BASIC',
        FLAVOR: 'Flavor',
        INSTANCE_NUM: 'Instances Account',
        BOOT_SOURCE: 'Boot Source',
        ADVANCE: 'Advance',
        ACCESS_SECURE: 'Access & Security',
        KEY_PAIR: 'Key Pair',
        NETWORK: 'Network',
        OPTION: 'option',
        APP_TYPE: 'App Type',
        ERROR_LOGIN_TIPS: 'Username or password is not correct',
        USERNAME_REQ: 'Username is required',
        PASSWORD_REQ: 'Password is required'

    });
    $translateProvider.translations('cn', {
        LOGIN: '登录',
        USERNAME: '用户名',
        PASSWORD: '密码',
        OVERVIEW: '概览',
        LOGOUT: '登出',
        SETTINGS: '设置',
        SWITCH_LANGUAGE: '切换语言',
        DASHBOARD: '控制面板',
        INSTANCES: '实例',
        HYPERVISORS: '虚拟机管理器',
        RULES: '规则',
        APP: '应用',
        ADD_RULE: '添加规则',
        VCPUS: '虚拟内核',
        MEM: '内存',
        DISK: '磁盘',
        NAME: '名称',
        IP: 'IP',
        MEMORY: '内存',
        CREATED: '创建时间',
        ALL: '所有',
        CREATE_VM: '创建虚拟机',
        HOST: '主机',
        STATE: '状态',
        STATUS: '运行',
        OPTIONS: '操作',
        SEARCH_TASK: '查找...',
        ACTIVE: '正常',
        ERROR: '错误',
        REBOOT: '重启',
        SHUTOFF: '关闭',
        SUSPEND: '挂起',
        DETAILS: '详细信息',
        ID: 'ID',
        METERS: '监控指标',
        SHELL: '终端',
        TYPE: '类型',
        VMS: '虚拟机',
        STOP: '停止',
        START: '启动',
        DELETE: '删除',
        CANCEL: '取消',
        OK: '确认',
        STOP_TIPS: '继续停止虚拟机？',
        START_TIPS: '继续启动虚拟机?',
        DELETE_TIPS: '继续删除虚拟机?',
        BASIC: '基础选项',
        FLAVOR: '虚拟机类型',
        INSTANCE_NUM: '虚拟机数目',
        BOOT_SOURCE: '启动源',
        ADVANCE: '高级选项',
        ACCESS_SECURE: '访问 & 安全',
        KEY_PAIR: '键值对',
        NETWORK: '网络',
        OPTION: '选项',
        APP_TYPE: '应用类型',
        ERROR_LOGIN_TIPS: '用户名或密码错误',
        USERNAME_REQ: '用户名必填',
        PASSWORD_REQ: '密码必填'
    });
    $translateProvider.preferredLanguage('cn');
}])

.run(['$rootScope', '$state', '$cookieStore', '$http', '$location', '$translate',
function ($rootScope, $state, $cookieStore, $http, $location, $translate) {
    // keep user logged in after page refresh
    $rootScope.globals = $cookieStore.get('globals') || {};
    if ($rootScope.globals.currentUser) {
        //    $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
    }

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
        // redirect to login page if not logged in
        if (toState.name !== 'login' && !$rootScope.globals.currentUser) {
            event.preventDefault();
            $state.go('login');
        }
    });

    $rootScope.$on('$locationChangeSuccess', function(event, absNewUrl, absOldUrl){
        $rootScope.previousUrl = absOldUrl;
	});

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
		$rootScope.currentState = toState.name;
		// console.log('preset: '+ toState.name);
		// console.log('previous: '+fromState.name);
	});

    $rootScope.switchLanguage = function(){
        if($translate.use() == 'en'){
            $translate.use('cn');
        } else {
            $translate.use('en');
        }
    }
}]);
