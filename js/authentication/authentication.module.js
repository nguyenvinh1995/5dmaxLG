'use strict';

angular.module('app.authentication', ['ui.router', 'ngCookies'])
    .config(config);

function config($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: "/login",
            views: {
                'login': {
                    templateUrl: "js/authentication/templates/login.html",
                    controller: "LoginCtrl as vm"
                }
            },
            onEnter: function ($rootScope) {
                var login = $rootScope.depth.login;
                $rootScope.changeDepth(login);
                $rootScope.addState(login);
            }
        })
        .state('login_form', {
            url: "/login_form/:playlistId/:movieId",
            sticky: true,
            views: {
                'login': {
                    templateUrl: "js/authentication/templates/login_form.html",
                    controller: "LoginCtrl as vm"
                }
            },
            onEnter: function ($rootScope) {
                var login = $rootScope.depth.login;
                $rootScope.changeDepth(login);
                $rootScope.addState(login);
            }
        })
        .state('login_code', {
            url: "/login_code",
            views: {
                'login': {
                    templateUrl: "js/authentication/templates/login_code.html",
                    controller: "LoginCodeCtrl as vm"
                }
            },
            onEnter: function ($rootScope) {
                var login = $rootScope.depth.login;
                $rootScope.changeDepth(login);
                $rootScope.addState(login);
            }
        })
        .state('trial_form', {
            url: "/trial_form",
            sticky: true,
            views: {
                'login': {
                    templateUrl: "js/authentication/templates/trial_form.html",
                    controller: "TrialFormCtrl as vm"
                }
            },
            onEnter: function ($rootScope) {
                var login = $rootScope.depth.login;
                $rootScope.changeDepth(login);
                $rootScope.addState(login);
            }
        })
}