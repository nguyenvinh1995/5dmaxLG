'use strict';

function utilities($window, $http, $q, $filter, config, $rootScope, $httpParamSerializer, $timeout) {
    // Private variables
    /**
     * Resolve a request
     *
     * @param url
     * @param method
     * @param successCallback
     * @param errorCallback
     * @returns {*}
     */
    function resolve(url, method, successCallback, errorCallback) {

        if (angular.isUndefined(url)) {
            return $q.reject('Undefined url in an $http call.');
        }

        var _method = method || 'GET';

        var deferred = $q.defer();

        $http({
            method: _method,
            url: url
        }).then(function (response) {
            deferred.resolve(response.data);

            if (angular.isDefined(successCallback) && angular.isFunction(successCallback)) {
                successCallback();
            }

        }, function (response) {
            deferred.reject(response.statusText);

            if (angular.isDefined(errorCallback) && angular.isFunction(errorCallback)) {
                errorCallback();
            }

        });

        return deferred.promise;
    }

    /**
     * Resolve a request
     *
     * @param url
     * @param method
     * @param params
     * @param data
     * @param headers
     * @param successCallback
     * @param errorCallback
     * @returns {*}
     */
    function resolveAlt(url, method, params, data, headers, successCallback, errorCallback) {

        if (angular.isUndefined(url)) {
            return $q.reject('Undefined url in an $http call.');
        }

        var _method = method || 'GET';
        var _params = params || null;
        var _data = data || {};
        var _headers = headers || {};

        var deferred = $q.defer();
        $http({
            method: _method,
            url: url,
            params: _params,
            data: _data,
            headers: headers,
            cache: false
        }).then(function (response) {
            deferred.resolve(response.data);

            if (angular.isDefined(successCallback) && angular.isFunction(successCallback)) {
                successCallback();
            }

        }, function (response) {
            deferred.reject(response.statusText);

            if (angular.isDefined(errorCallback) && angular.isFunction(errorCallback)) {
                errorCallback();
            }

        });

        return deferred.promise;
    }

    function transformRequest(url, method, params, data, headers, successCallback, errorCallback) {

        if (angular.isUndefined(url)) {
            return $q.reject('Undefined url in an $http call.');
        }

        var _method = method || 'GET';
        var _params = params || null;
        var _data = data || {};
        var _headers = headers || {};

        var deferred = $q.defer();
        $http({
            method: _method,
            url: url,
            transformRequest: function (obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            params: _params,
            data: _data,
            headers: headers,
            cache: false
        }).then(function (response) {
            deferred.resolve(response.data);

            if (angular.isDefined(successCallback) && angular.isFunction(successCallback)) {
                successCallback();
            }

        }, function (response) {
            deferred.reject(response.statusText);

            if (angular.isDefined(errorCallback) && angular.isFunction(errorCallback)) {
                errorCallback();
            }
        });
        return deferred.promise;
    }

    function showMessenge(messenge, long, time) {
        if(!time)
            time = 3000;
        $("#mess").empty();
        $("#mess").append('<span>' + messenge + '</span>');
        $("#mess span").fadeIn().fadeOut(time);
        if (long)
            $(".message span").css({"max-width": "700px"});
    }

    var lastOnlineStatus = true;
    var isOnline = true;
    var vm = this;
    // function doesConnectionExist()
    // {
    //
    // }


    function showLoadingLogin() {
        console.log("show loading login");
        // setInterval(function () {
        //     isOnline = navigator.onLine;
        //     if (!isOnline) {
        //         lastOnlineStatus = false;
        //         setTimeout(function () {
        //             if(state)
        //             vm.show = true;
        //             $("#mess-offline").show();
        //             $("#mess-offline").append('<span>Mất kết nối Internet. Vui lòng kết nối lại.</span>');
        //         }, 100)
        //     } else {
        //         if (!lastOnlineStatus) {
        //             lastOnlineStatus = true;
        //             setTimeout(function () {
        //                 vm.show = false;
        //                 $("#mess-offline").hide();
        //             }, 100);
        //         }
        //     }
        // }, 100);
    }

    function showLoading() {
        var loading = $("#loading_screen");
        if (loading.hasClass('hidden'))
            loading.removeClass("hidden");
        var timeLoading = setInterval(function () {
            if (!navigator.onLine) {
                hideLoading();
                clearInterval(timeLoading);
            }
        }, 1000);
    }

    function hideLoading() {
        var loading = $("#loading_screen");
        if (!loading.hasClass('hidden'))
            loading.addClass("hidden");
    }

    function checkIsLoading() {
        if ($("#loading_screen").hasClass('hidden'))
            return false;
        else
            return true;
    }

    var errorCode = {
        'success': "200",
        'tokenExpire': '403',
        'created'    : '201',
        'login': '401'
    }

    var keyCode = {
        'EXIT': 10182
    }

    var tokenExpireMessenger = "Phiên đăng nhập đã hết hạn hoặc tài khoản của bạn đã được đăng nhập trên một thiết bị khác. Hãy đăng nhập lại để tiếp tục sử dụng";

    var service = {
        resolve: resolve,
        resolveAlt: resolveAlt,
        transformRequest: transformRequest,
        showMessenge: showMessenge,
        showLoading: showLoading,
        hideLoading: hideLoading,
        showLoadingLogin: showLoadingLogin,
        // processRequest : processRequest,
        // doesConnectionExist: doesConnectionExist,
        errorCode: errorCode,
        tokenExpireMessenger: tokenExpireMessenger,
        checkIsLoading: checkIsLoading,
        keyCode: keyCode
    };
    return service;

}

app.factory('utilities', utilities);
utilities.$inject = [
    '$window',
    '$http',
    '$q',
    '$filter',
    '$rootScope',
    '$timeout'
];
