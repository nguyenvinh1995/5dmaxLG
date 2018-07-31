'use strict';
if (typeof window.app == 'undefined') {
    var app = angular.module("app", ['ui.router', 'oc.lazyLoad', 'ngCookies', 'caph.focus', 'caph.ui', 'ct.ui.router.extras.core', 'ct.ui.router.extras.sticky', 'app.authentication', 'app.movie', 'app.avplayer']);
    window.app = app;
}


app.config(function ($urlRouterProvider, $httpProvider, $provide, focusControllerProvider, $compileProvider, $injector) {
    $compileProvider.debugInfoEnabled(false);
    $httpProvider.useApplyAsync(1000); //true
    // $httpProvider.interceptors.push('httpRequestInterceptor'); 
    focusControllerProvider.setInitialDepth(1);
    // $urlRouterProvider.otherwise('/menu');

});

app.factory('focus', ['$timeout', '$window', function ($timeout, $window) {
    return function (id) {
        $timeout(function () {
            var element = $window.document.getElementsByClassName(id)[0];
            if (element)
                element.focus();
        });
    };
}]);

// setting
app.factory('settings', ['$rootScope', function ($rootScope) {
    // supported languages
    var settings = {
        locale: 'vi-VN',
        api: {
            // baseUrl: 'http://m.5dmax.vn/apiv2.php/v1/'
            baseUrl: 'http://5dmax.vn/apiv3.php/v1/'
        },
        os_type: 'WEB_ANDROID',
        version: '4.0.0'
    };
    $rootScope.settings = settings;
    return settings;
}]);

app.factory('focus', ['$timeout', '$window', function ($timeout, $window) {
    return function (id) {
        $timeout(function () {
            var element = $window.document.getElementById(id);
            if (element)
                element.focus();
        });
    };
}]);

app.factory('httpRequestInterceptor',
    function ($location, $rootScope, $injector, $timeout, $q, $window) {
        var $login, $http, $auth, request;
        $timeout(function () {
            $http = $injector.get('$http');
            $auth = $injector.get('services');
        });
        var token = JSON.parse($window.localStorage.auth || null);
        if (token) {
            request = {
                data: {
                    grant_type: 'refresh_token',
                    refresh_token: token.refressToken
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Authorization': "Bearer " + services.deviceId
                }
            };
        }
        return {
            'request': function (config) {
                config.headers = config.headers || {};
                if (token) {
                    if (token.expire && token.expire < Date.now()) {
                    } else if (token.accessToken) {
                        config.headers.Authorization = 'Bearer ' + token.accessToken;
                    }
                }
                return config;
            },
            'response': function (response) {
                if (typeof response.data === 'object') {
                    var streams = response.data.data ? response.data.data.streams : null;
                    $auth = $injector.get('services');
                    if ($auth.isObject(streams) && (streams.errorCode == '401' || streams.errorCode == '403')) {
                        var deferred = $q.defer();
                        $auth.authenticate(request).then(function (res) {
                            if (res.responseCode == "200") {
                                var data = res.data;
                                token.accessToken = data.accessToken;
                                token.refressToken = data.refressToken;
                                token.expire = Date.now() + parseInt(data.expiredTime) * 1000;
                                $window.localStorage.auth = JSON.stringify(token);
                                // window.location.reload(true);
                                $injector.get("$http")(response.config).then(function (resp) {
                                    deferred.resolve(resp);
                                }, function (resp) {
                                    deferred.reject();
                                });

                            }
                        })
                    }
                }
                return response;
                // return $q.reject(response);
            }
        }
    });

app.run(function ($rootScope, $state, $stateParams, $http, services, settings) {
    $rootScope.$state = $state;
    $rootScope.index_item = 0;
    var UID;
    try {
        UID = webapis.avplay.setDrm("VERIMATRIX", "GetUID", "");
    } catch (ex) {
    }

    if (UID != true) {
        services.deviceId = UID;
        TizenAVPlayer.UID = UID;
        services.supportDrm = true;
    } else {
        new Fingerprint2().get(function (result, components) {
            services.deviceId = result;
            TizenAVPlayer.UID = result;
        });
    }

    $rootScope.$on('$stateChangeSuccess', function (event, to, toParams, from, fromParams) {
        $rootScope.$previousState = from;
        $rootScope.currentStateBack = "default";
    });

    var auth;
    if (localStorage.auth)
        auth = JSON.parse(localStorage.auth);

    function refreshToken() {
        services.authenticate(request).then(function (res) {
            if (res.responseCode == "200") {
                var data = res.data;
                auth.accessToken = data.accessToken;
                auth.refressToken = data.refressToken;
                auth.expire = Date.now() + parseInt(data.expiredTime) * 1000;
                services.auth = auth;
                localStorage.auth = JSON.stringify(auth);
                $http.defaults.headers.common.Authorization = "Bearer " + data.accessToken;
                $state.go('home');
                services.isLogin = true;
            } else {
                $state.go('login');
                services.isLogin = false;
            }
        })
    }

    if (auth) {
        var request = {
            data: {
                grant_type: 'refresh_token',
                refresh_token: auth.refressToken,
                os_type: settings.os_type,
                versionCode: settings.version
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Authorization': "Bearer " + services.deviceId
            }
        };

        services.getDetailUser().then(function (response) {
            if (response.responseCode == '401' || response.responseCode == '403') {
                refreshToken();
            } else {
                $state.go('home');
                services.isLogin = true;
                services.auth = auth;
                $http.defaults.headers.common.Authorization = "Bearer " + auth.accessToken;
            }
        })

    } else {
        $state.go('login');
    }
});

app.controller('appCtrl', ['$scope', '$timeout', '$state', '$window', 'services', 'settings', 'FocusUtil', 'focusController', '$rootScope', '$compile', 'FocusConstant', '$http', 'utilities',
    function appCtrl($scope, $timeout, $state, $window, services, settings, FocusUtil, focusController, $rootScope, $compile, FocusConstant, $http, utilities) {
        $rootScope.errorVerify = false;
        $rootScope.currentPopup = undefined;
        $rootScope.loginFromSetup = false;
        var doc = document;
        var index = 1;
        var currentIndexBanner = -1;
        var lastOnlineStatus = true;
        var isSuspend = false;
        var isOnline = true;
        $rootScope.currentStateBack = "default";

        $scope.currentLocation = window.location;
        $scope.backState = function () {
            window.history.go(-1);
        }
        // ============== depth ================//
        $rootScope.depth = {
            main: {
                val: 1,
                name: 'main'
            },
            list: {
                val: 2,
                name: 'list'
            },
            detail: {
                val: 3,
                name: 'detail'
            },
            login: {
                val: 4,
                name: 'login'
            },
            search: {
                val: 5,
                name: 'search'
            },
            // menu: {
            //     val: 6,
            //     name: 'menu'
            // },
            player: {
                val: 7,
                name: 'player'
            },
            dialog: {
                val: 8,
                name: 'dialog'
            },
            listMovie: {
                val: 9,
                name: 'list_movie'
            }
        };

        $rootScope.itemFromListMovie = null;

        $rootScope.listState = [];
        var lastDepth;
        var currentDepth = $rootScope.depth.login;

        $scope.reload = function () {
            // window.location.reload(true);
            var auth;
            if (localStorage.auth)
                auth = JSON.parse(localStorage.auth);
            if (auth) {
                auth.accessToken = "qsO8Cffoqyfv5ertYP7WM8+C1wxb6hyCzxjJqjowLsJl+V09j41uTPS4tOPXsw71s80yyi7sJhObDYV2GfQLA1RSdHhljtUCh8kVWfrXExnWbH7KhlIWoETBQE1sPwAGuDtIfFDIhYf19hUOSmYP3q3qTgmYikgBorNqAGPtdiA=";
                auth.refressToken = "DD030EC2-0852-7BAD-E58C-26AE44018B23";
                $http.defaults.headers.common.Authorization = "Bearer " + "qsO8Cffoqyfv5ertYP7WM8+C1wxb6hyCzxjJqjowLsJl+V09j41uTPS4tOPXsw71s80yyi7sJhObDYV2GfQLA1RSdHhljtUCh8kVWfrXExnWbH7KhlIWoETBQE1sPwAGuDtIfFDIhYf19hUOSmYP3q3qTgmYikgBorNqAGPtdiA=";
            }
            localStorage.auth = JSON.stringify(auth);
        };

        function setView(lastDepth, currentDepth) {
            var lastEl = "#" + lastDepth.name + "";
            var currentEL = "#" + currentDepth.name + "";
            var timeHideEl = setInterval(function () {
                $(lastEl).addClass('hidden');
                if (($(lastEl)).hasClass('hidden')) {
                    clearInterval(timeHideEl);
                }
            }, 10);

            var timeShowEl = setInterval(function () {
                $(currentEL).removeClass('hidden');
                if (!($(currentEL)).hasClass('hidden')) {
                    clearInterval(timeShowEl);
                }
            }, 10);
        }

        function checkListMenu() {
            $(".home_slider").trigger('stop.owl.autoplay');
            if (!services.checkLogin() && $rootScope.listMenu && $rootScope.listMenu.length == 6) {
                $rootScope.listMenu.splice(3, 1);
                $("#list_menu").trigger("resize");
                $("#list_menu").trigger("reload");
                $timeout(function () {
                    focusController.focus($("#m_setting"));
                }, 500);
            }
        }

        $rootScope.changeDepth = function (depth) {
            lastDepth = currentDepth;
            currentDepth = depth;
            $rootScope.currentDepth = currentDepth;
            setView(lastDepth, currentDepth);

            $timeout(function () {
                focusController.setDepth(depth.val);
                console.log(depth.val);
                console.log(focusController.getCurrentDepth());
            }, 500);
            // if (currentDepth.val == $rootScope.depth.main.val) {
            //     checkListMenu();
            // }
        };

        function initListState() {
            $rootScope.listState = [
                $rootScope.depth.login
            ];
        }

        $rootScope.getTransform = function (el) {
            var transform = window.getComputedStyle(el, null).getPropertyValue('-webkit-transform');
            var results = transform.match(/matrix(?:(3d)\(-{0,1}\d+(?:, -{0,1}\d+)*(?:, (-{0,1}\d+))(?:, (-{0,1}\d+))(?:, (-{0,1}\d+)), -{0,1}\d+\)|\(-{0,1}\d+(?:, -{0,1}\d+)*(?:, (-{0,1}\d+))(?:, (-{0,1}\d+))\))/);
            if (!results) return [0, 0, 0];
            if (results[1] === '3d') return results.slice(2, 5);
            results.push(0);
            return results.slice(5, 8);
        };

        $rootScope.addState = function (state) {
            $rootScope.listState.push(state);
        };

        $rootScope.changeView = function () {
            utilities.hideLoading();
            if ($rootScope.currentPopup != undefined) {
                var id = $rootScope.currentPopup;
                $("#" + id).addClass('hidden');

                $timeout(function () {
                    if ($rootScope.currentPopup == 'popup_movie_detail') {
                        focusController.setDepth($rootScope.depth.detail.val);
                    } else if ($rootScope.currentPopup == 'popup_movie_list') {
                        focusController.setDepth($rootScope.depth.listMovie.val);
                    } else if ($rootScope.currentPopup == 'dialog_logout' || $rootScope.currentPopup == 'popup_movie_detail_2') {
                        focusController.setDepth($rootScope.depth.main.val);
                    } else if ($rootScope.currentPopup == 'popup_movie_detail_1') {
                        focusController.setDepth($rootScope.depth.player.val);
                    } else
                        focusController.setDepth($rootScope.depth.list.val);
                    $rootScope.currentPopup = undefined;
                }, 500);

                return;
            }

            if ($rootScope.currentStateBack == $state.current.name) {
                console.log('return back');
                // if ($state.current.name === 'main' && !services.checkLogin()) {
                //     $state.go('login-form', {}, {reload: true});
                //     return;
                // }
                return;
            }

            // if ($state.current.name === 'main' && !services.checkLogin()) {
            //     $state.go('login-form', {}, {reload: true});
            //     return;
            // }

            $rootScope.currentStateBack = $state.current.name;
            var array = angular.copy($rootScope.listState);
            var last = array[array.length - 1];
            var _last = array[array.length - 2];
            var _three = array[array.length - 3];
            console.log(_last.val);
            console.log($rootScope.$previousState);

            switch ($state.current.name) {
                case 'home' :
                    if (!services.checkLogin()) {
                        $state.go('login_form', {}, {reload: true});
                        $(".dialog_hide").addClass("hidden");
                        clearTimeout(vm.ShowGif);
                        $(".movie_article_wrapper").removeClass('background-none');
                        $("#av-container").addClass('display-trailer');
                        // TizenAVPlayer.executeAction({
                        //     action: "stop"
                        // });
                        WebOsPlayer.pause();
                        TizenAVPlayer.close();
                    }
                    else {
                        clearTimeout(vm.ShowGif);
                        $(".movie_article_wrapper").removeClass('background-none');
                        $("#av-container").addClass('display-trailer');
                        // TizenAVPlayer.executeAction({
                        //     action: "play"
                        // });
                        WebOsPlayer.playPause();
                    }
                    return;
                    break;
                case
                'login_form'
                :
                    // setTimeout(function () {
                    //     $("#username input").blur();
                    //     $("#password input").blur();
                    //     $("#capt input").blur();
                    // }, 200);
                    // if(_last.val == $rootScope.depth.login.val) {
                    if ($rootScope.errorVerify || _last.val == $rootScope.depth.login.val) {
                        $state.go('home', {}, {reload: true});
                        return;
                    }
                    break;
                case
                'search'
                :
                    setTimeout(function () {
                        $("#search_txt input").blur();
                    }, 200);
                    break;
                case
                'login'
                :
                    return;
                    break;
                case
                'listPhimThue'
                :
                    var newArr = array.slice(0, -1);
                    var depthCurrent = newArr[newArr.length - 1];
                    $rootScope.listState = newArr;
                    services.returnBack = true;
                    $rootScope.changeDepth(depthCurrent);
                    window.history.back();
                    // $(".item").blur();
                    var timeFocus = setInterval(function () {
                        focusController.focus($('#m_rent_movies'));
                        if ($('#m_rent_movies').hasClass('focused')) {
                            clearInterval(timeFocus);
                        }
                    }, 100);
                    return;
                    break;
                case
                'avplayer'
                :
                    // TizenAVPlayer.executeAction({
                    //     action: "stop"
                    // });
                    WebOsPlayer.pause();
                    TizenAVPlayer.close();
                    if (_last.val == $rootScope.depth.login.val || _last.val == $rootScope.depth.player.val) {
                        var index = 2;
                        var newArr = array.slice(0, -2);
                        var depthCurrent = newArr[newArr.length - 1];
                        $rootScope.listState = newArr;
                        $rootScope.changeDepth(depthCurrent);
                        window.history.go(-2);
                        return;
                    }
                    if (_last.val == $rootScope.depth.detail.val) {
                        var newArr = array.slice(0, -2);
                        var depthCurrent = $rootScope.depth.detail;
                        $rootScope.listState = newArr;
                        //
                        if (services.indexBack == 0) {
                            services.indexBack = 3;
                        } else {
                            services.indexBack += 2;
                        }
                        services.backDetails = true;
                        $state.go("movieDetail", {
                            id: services.currentPlayMovie.idMovie,
                            idMovie: services.currentPlayMovie.idPart
                        }, {reload: true});
                        // $rootScope.changeDepth(depthCurrent);
                        return;
                    }
                    break;
                case
                'setup'
                :
                    var logIn = services.logInRefreshHomeState;
                    var logOut = services.logOutRefreshHomeState;
                    if (logOut || logIn) {
                        $state.go('home', {}, {reload: true});
                        if (logOut)
                            services.logOutRefreshHomeState = false;
                        if (logIn)
                            services.logInRefreshHomeState = false;
                        return;
                    }
                    services.loginFromSetting = false;
                    if (_last.val == $rootScope.depth.login.val) {
                        var newArr = array.slice(0, -3);
                        var depthCurrent = newArr[newArr.length - 1];
                        $rootScope.listState = newArr;
                        $rootScope.changeDepth(depthCurrent);
                        window.history.go(-3);
                        return;
                    }
                    break;
                case
                'movieDetail'
                :
                    console.log(newArr);
                    console.log(depthCurrent);
                    console.log(_last.val);
                    console.log($rootScope.$previousState);
                    TizenAVPlayer.close();
                    if (_last.val == $rootScope.depth.login.val) {
                        var newArr = array.slice(0, -3);
                        var depthCurrent = newArr[newArr.length - 1];
                        $rootScope.listState = newArr;
                        $rootScope.changeDepth(depthCurrent);
                        window.history.go(-3);
                        return;
                    }
                    if (_last.val == $rootScope.depth.listMovie.val) {
                        var newArr = array.slice(0, -5);
                        var depthCurrent = newArr[newArr.length - 1];
                        $rootScope.listState = newArr;
                        $rootScope.changeDepth(depthCurrent);
                        window.history.go(-5);
                        return;
                    }
                    if (_last.val == $rootScope.depth.main.val && services.backDetails == true) {
                        var newArr = array.slice(0, -1);
                        var depthCurrent = newArr[newArr.length - 1];
                        $rootScope.listState = newArr;
                        $rootScope.changeDepth(depthCurrent);
                        window.history.go(-services.indexBack);
                        services.indexBack = 0;
                        services.backDetails = false;
                        return;
                    }
                    if ((_last.val == $rootScope.depth.list.val || _last.val == $rootScope.depth.search.val) && services.backDetails == true) {
                        var newArr = array.slice(0, -1);
                        var depthCurrent = newArr[newArr.length - 1];
                        $rootScope.listState = newArr;
                        $rootScope.changeDepth(depthCurrent);
                        services.backDetails = false;
                        window.history.go(-services.indexBack);
                        services.indexBack = 0;
                        return;
                    }
                    if ($rootScope.$previousState.name === 'avplayer') {
                        // TizenAVPlayer.executeAction({
                        //     action: "stop"
                        // });
                        WebOsPlayer.pause();
                        $state.go('home', {}, {reload: true});
                        // console.log($rootScope.$previousState.name);
                        // console.log('false-xxxx');
                        // var newArr = array.slice(0, -3);
                        // var depthCurrent = newArr[newArr.length - 1];
                        // $rootScope.changeDepth(depthCurrent);
                        // window.history.go(-3);
                        // console.log(newArr);
                        // console.log(depthCurrent);
                        $state.go('home', {}, {reload: true});
                        return;
                    }
                    // if ($rootScope.$previousState.name === 'detail') {
                    //     console.log($rootScope.$previousState.name);
                    //     console.log('false-xxxx');
                    //     var newArr = array.slice(0,-3);
                    //     var depthCurrent = newArr[newArr.length - 3];
                    //     $rootScope.changeDepth(depthCurrent);
                    //     window.history.go(-3);
                    //     console.log(newArr);
                    //     console.log(depthCurrent);
                    //     return;
                    // }
                    // var newArr = array.slice(0, -1);
                    // var depthCurrent = newArr[newArr.length - 1];
                    // $rootScope.listState = newArr;
                    // services.returnBack = true;
                    // $rootScope.changeDepth(depthCurrent);
                    // $('.trial').removeClass('trial-step');
                    // window.history.back();

                    break;
                case
                'movieList'
                :
                    if (_last.val != $rootScope.depth.detail.val) {
                        var newArr = array.slice(0, -4);
                        // var depthCurrent = newArr[newArr.length - 1];
                        // $rootScope.listState = newArr;
                        // $rootScope.changeDepth(depthCurrent);
                        // window.history.go(-3);
                        var item = $rootScope.itemFromListMovie;
                        if (item != null) {
                            $state.go('movieDetail', {id: item.movieId}, {reload: true});
                            services.itemFromListMovie = null;
                            return;
                        }

                    }
                    break;
                // case 'search' :
                //     setTimeout(function () {
                //         $("#search_txt input").blur();
                //     },500)
                // break;
                default :
                    break;
            }
            var newArr = array.slice(0, -1);
            var depthCurrent = newArr[newArr.length - 1];
            $rootScope.listState = newArr;
            services.returnBack = true;
            $rootScope.changeDepth(depthCurrent);
            $('.trial').removeClass('trial-step');
            window.history.back();
            console.log(newArr);
            console.log(depthCurrent);

        };

        function checkNetWork() {
            setInterval(function () {
                isOnline = navigator.onLine;
                if (!isOnline) {
                    lastOnlineStatus = false;
                    console.log('suspend' + isSuspend);
                    setTimeout(function () {
                        if ($state.current.name == 'avplayer' && !isSuspend) {
                            console.log('suspend');
                            webapis.avplay.suspend();
                            isSuspend = true;
                        }
                        $("#mess-offline").show();
                        $("#mess-offline").append('<span>Mất kết nối Internet. Vui lòng kết nối lại.</span>');
                    }, 100)
                } else {
                    if (!lastOnlineStatus) {
                        lastOnlineStatus = true;
                        setTimeout(function () {
                            if ($state.current.name == 'avplayer' && isSuspend) {
                                console.log('restore');
                                isSuspend = false;
                                webapis.avplay.restore(TizenAVPlayer.mediaUrl, TizenAVPlayer.currentTime, true);
                                try {
                                    if (TizenAVPlayer.isDrm) {
                                        TizenAVPlayer.setVerimarix();
                                    }
                                    WebOsPlayer.playPause();
                                } catch (ex) {
                                    console.log(ex);
                                }
                            }
                            $("#mess-offline").hide();
                        }, 100);
                    }
                }
            }, 100);
        }

        function updateStatusOffline() {
            $("#mess-offline").empty();
            $("#mess-offline").append('<span>Mất kết nối Internet. Vui lòng kết nối lại.</span>');
            $("#mess-offline span").show();
            utilities.hideLoading();
        }

        function updateStatusOnline() {
            $("#mess-offline span").hide();
        }
        focusController.addBeforeKeydownHandler(function (context) {
            console.log(context.event.keyCode, $state.current.name);
            if (context.event.keyCode === utilities.keyCode.EXIT || (context.event.keyCode == '10009' && $state.current.name == 'login')) {
                webOS.platformBack();
                return;
            }
        });

        var init = function () {
            var inEvent = function (e) {
                if (e.keyCode === 27) {
                    try {
                        $rootScope.changeView();
                    }
                    catch (ex) {
                    }
                }
            };
            var exitMessenge = function () {
                var $element = $('#mess');
                if ($element.is(':visible')) {
                    $element.hide();
                }

            };
            checkNetWork();
            // document.addEventListener('tizenhwkey', backEvent);
            document.addEventListener("keydown", inEvent, true);
            // TizenInputDevice.registerMediaKeys();
            // TizenInputDevice.initialize();
            window.addEventListener('online', updateStatusOnline);
            window.addEventListener('offline', updateStatusOffline);

        };
        window.onload = init;
    }]);
// if($rootScope.currentState == $rootScope.DEPTH.MAIN) {
//     tizen.application.getCurrentApplication().exit();
//     return;
// }

// return {
//     response: function (response) {
//         if(typeof response.data === 'object'){
//             var result = response.data;
//             if(result.responseCode == '200'){
//                 if(result.data && result.data.streams){
//                     if(result.data.streams.errorCode == '401' || result.data.streams.errorCode == '403') {
//                         $location.url('/login_form');
//                         $rootScope.errorVerify = true;
//                         return;
//                     }
//                 }
//                 if(!response)
//                     return $q.reject(response);
//             } else if(result.errorCode) {
//                 alert(result.message);
//                 //return;
//             }
//         }
//         return response;
//     }
// };