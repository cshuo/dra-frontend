'use strict';

angular.module('dra.auth')

.controller('LoginController',
    ['$scope', '$rootScope', '$state', '$filter', 'AuthenticationService',
    function ($scope, $rootScope, $state, $filter, AuthenticationService) {
        // reset login status
        AuthenticationService.ClearCredentials();

        $scope.login = function () {
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, function (response) {
                if (response.data.access) {
                    AuthenticationService.SetCredentials($scope.username, $scope.password);
                    $state.go('navbar.overview');
                } else {
                    $scope.error = $filter('translate')('ERROR_LOGIN_TIPS');
                    $scope.dataLoading = false;
                }
            });
        };
    }]);
