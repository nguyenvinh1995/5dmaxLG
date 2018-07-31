'use strict';

angular.module('app.authentication').controller('TrialFormCtrl', TrialFormCtrl);

TrialFormCtrl.$inject = ['$timeout', '$state', '$window', '$http', '$scope', '$rootScope', 'services', 'settings', 'FocusUtil', 'focusController', 'focus', 'utilities'];

function TrialFormCtrl($timeout, $state, $window, $http, $scope, $rootScope, services, settings, FocusUtil, focusController, focus, utilities) {

    var vm = this;
    vm.phoneNumber = '';
    vm.Otp = '';


    vm.enterText = function (text) {
        vm.phoneNumber += text;
        vm.Otp += text;
    };

    vm.DelAll = function () {
        vm.phoneNumber = '';
        vm.Otp = '';
    };

    vm.Del = function () {
        vm.phoneNumber = vm.phoneNumber.substring(0, vm.phoneNumber.length - 1);
        vm.Otp = vm.Otp.substring(0, vm.Otp.length - 1);
    };

    vm.continue = function () {
        $('#trial').addClass('trial-step');
        vm.Otp = '';
        var timeFocus = setInterval(function () {
            focusController.focus($('#initFocusKeybroad'));
            if ($('#initFocusKeybroad').hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100)
    };

    $scope.$on('$viewContentLoaded', function (event) {
        $(".splash_page").fadeIn(1000).fadeOut(1000);
        $('#content-key-broard').addClass('content-capslock');
        var timeFocus = setInterval(function () {
            focusController.focus($('#initFocusKeybroad'));
            if ($('#initFocusKeybroad').hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100)
    })

}