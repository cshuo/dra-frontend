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
    'ngCookies'
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

.run(['$rootScope', '$state', '$cookieStore', '$http', '$location',
function ($rootScope, $state, $cookieStore, $http, $location) {
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
}]);
