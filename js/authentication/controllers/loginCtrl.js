'use strict';

angular.module('app.authentication').controller('LoginCtrl', LoginCtrl);

LoginCtrl.$inject = ['$timeout', '$state', '$window', '$http', '$scope', '$rootScope', 'services', 'settings', 'FocusUtil', 'focusController', 'focus', 'utilities'];

function LoginCtrl($timeout, $state, $window, $http, $scope, $rootScope, services, settings, FocusUtil, focusController, focus, utilities) {

    var vm = this;
    vm.showCapcha = false;
    vm.loginForm = {
        username: '',
        password: '',
        // username: '01692040587',
        // password: '123456a@@',
        captcha: ''
    };
    var playlistId = $state.params.playlistId;
    var movieId = $state.params.movieId;
    var isChangeCaptcha = false;
    var lastCaptcha = "";
    setInterval(function () {
        vm.getCode = $scope.getCode;
    }, 1000);

    function isANumber(str) {
        return !/\D/.test(str);
    }

    vm.enterText = function (text) {
        if ($('#phone-number').hasClass('show-input')) {
            if (isANumber(text) === true) {
                vm.loginForm.username += text;
                console.log(vm.loginForm.username);
            }
        }

        if ($('#pass').hasClass('show-input')) {
            vm.loginForm.password += text;
        }

        if ($('#capcha').hasClass('show-input')) {
            vm.loginForm.captcha += text;
        }
        console.log(vm.loginForm.username, vm.loginForm.password, vm.loginForm.captcha);
    };

    vm.Del = function () {
        if ($('#phone-number').hasClass('show-input')) {
            vm.loginForm.username = vm.loginForm.username.substring(0, vm.loginForm.username.length - 1);
        }

        if ($('#pass').hasClass('show-input')) {
            vm.loginForm.password = vm.loginForm.password.substring(0, vm.loginForm.password.length - 1);
        }

        if ($('#capcha').hasClass('show-input')) {
            vm.loginForm.captcha = vm.loginForm.captcha.substring(0, vm.loginForm.captcha.length - 1);
        }
        console.log(vm.loginForm.username, vm.loginForm.password, vm.loginForm.captcha);
    };


    if ($rootScope.errorVerify) {
        localStorage.removeItem('auth');
        services.isLogin = false;
        delete $http.defaults.headers.common.Authorization;
    }
    vm.continue = function () {
        checkFocus();
        if ($('#phone-number').hasClass('show-input')) {
            if (vm.showCapcha == true) {
                $('#continue-cap').removeClass('hide');
                $('#continue').addClass('hide');
                $('#log').addClass('hide');
                $('#back').removeClass('hide');
                $('#back-first').addClass('hide');
                $('#phone-number').removeClass('show-input');
                $('#pass').addClass('show-input');
                $('#capcha').removeClass('show-input');
            }
        }

        if (vm.loginForm.username.length !== 0) {
            if (vm.showCapcha == false) {
                $('#phone-number').removeClass('show-input');
                $('#pass').addClass('show-input');
                $('#continue').addClass('hide');
                $('#log').removeClass('hide');
                $('#back').removeClass('hide');
                $('#back-first').addClass('hide');

            }
        } else {
            utilities.showMessenge("Vui lòng nhập số điện thoại.");
        }
    };


    vm.continueCap = function () {
        $('#phone-number').removeClass('show-input');
        $('#pass').removeClass('show-input');
        $('#capcha').addClass('show-input');
        $('#continue').addClass('hide');
        $('#log').removeClass('hide');
        $('#continue-cap').addClass('hide');
        checkFocus();
    };

    vm.goTrialForm = function () {
        $state.go('trial_form');
    };

    vm.goLoginForm = function (bool) {
        $state.go('login_form');
        $rootScope.checkLogin = bool;
        console.log($rootScope.check);
    };

    vm.loginCode = function () {
        $state.go('login_code');
    };

    vm.symbol = function () {
        if ($('#content-key-broard').hasClass('content-symbol')) {
            $('#content-key-broard').removeClass('content-symbol').addClass('content-no-capslock').removeClass('content-capslock');
        } else {
            $('#content-key-broard').addClass('content-symbol').removeClass('content-no-capslock').removeClass('content-capslock');
        }
    };

    vm.capslock = function () {
        if ($('#content-key-broard').hasClass('content-capslock')) {
            $('#content-key-broard').addClass('content-no-capslock').removeClass('content-symbol').removeClass('content-capslock');
        } else {
            $('#content-key-broard').removeClass('content-no-capslock').removeClass('content-symbol').addClass('content-capslock');
        }
        var timeFocus = setInterval(function () {
            focusController.focus($('.focus-nocapslock'));
            if ($('.focus-nocapslock').hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100)
    };

    vm.noCapslock = function () {
        if ($('#content-key-broard').hasClass('content-no-capslock')) {
            $('#content-key-broard').addClass('content-capslock').removeClass('content-no-capslock').removeClass('content-symbol');
        }
        else {
            $('#content-key-broard').removeClass('content-capslock').addClass('content-no-capslock').removeClass('content-symbol');
        }
        var timeFocus = setInterval(function () {
            focusController.focus($('.focus-capslock'));
            if ($('.focus-capslock').hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100)
    };

    vm.hidePass = function () {
        if ($("#password").attr("type") === "password") {
            $("#password").attr("type", "text");
            $("#hide-pass").addClass('show-pass').removeClass('hide-pass');
        } else {
            $("#password").attr("type", "password");
            $("#hide-pass").removeClass('show-pass').addClass('hide-pass');
        }
    };

    vm.back = function () {
        if ($('#phone-number').hasClass('show-input')) {
            $('#back').addClass('hide');
            $('#back-first').removeClass('hide');
            $('#continue').removeClass('hide');
            $('#log').addClass('hide');
            $('#continue-cap').addClass('hide');
        }
        if ($('#pass').hasClass('show-input')) {
            $('#back').addClass('hide');
            $('#back-first').removeClass('hide');
            $('#phone-number').addClass('show-input');
            $('#pass').removeClass('show-input');
            $('#capcha').removeClass('show-input');
            $('#continue').removeClass('hide');
            $('#log').addClass('hide');
            $('#continue-cap').addClass('hide');
        }
        if ($('#capcha').hasClass('show-input')) {
            $('#continue-cap').removeClass('hide');
            $('#continue').addClass('hide');
            $('#log').addClass('hide');
            $('#back').removeClass('hide');
            $('#back-first').addClass('hide');
            $('#phone-number').removeClass('show-input');
            $('#pass').addClass('show-input');
            $('#capcha').removeClass('show-input');
        }
        checkFocus();
    };

    function checkPassword() {
        checkFocus();
        if (vm.loginForm.password.trim().length < 2) {
            utilities.showMessenge("Thông tin đăng nhập không hợp lệ");
            $('#phone-number').removeClass('show-input');
            $('#pass').addClass('show-input');
            $('#capcha').removeClass('show-input');
            $('#continue').addClass('hide');
            $('#log').removeClass('hide');
            return true;
        } else
            return false;
    }

    function checkUsername() {
        checkFocus();
        if (vm.loginForm.username.trim().length < 2) {
            utilities.showMessenge("Thông tin đăng nhập không hợp lệ");
            $('#phone-number').removeClass('show-input');
            $('#pass').addClass('show-input');
            $('#capcha').removeClass('show-input');
            $('#continue').removeClass('hide');
            $('#log').addClass('hide');
            return true;
        } else
            return false;
    }

    vm.login = function () {
        if (!vm.loginForm.username || vm.loginForm.username.trim() === '') {
            utilities.showMessenge("Vui lòng nhập số điện thoại.");
            $('#phone-number').addClass('show-input');
            $('#pass').removeClass('show-input');
            $('#capcha').removeClass('show-input');
            $('#continue').removeClass('hide');
            $('#log').addClass('hide');
            return;
        } else if (!vm.loginForm.password || vm.loginForm.password.trim() === '') {
            utilities.showMessenge("Vui lòng nhập mật khẩu.");
            $('#phone-number').removeClass('show-input');
            $('#pass').addClass('show-input');
            $('#capcha').removeClass('show-input');
            $('#continue').addClass('hide');
            $('#log').removeClass('hide');
            return;
        } else if (vm.showCapcha === true && vm.loginForm.captcha.trim() === '') {
            utilities.showMessenge("Vui lòng nhập mã xác nhận.");
            $('#phone-number').removeClass('show-input');
            $('#pass').removeClass('show-input');
            $('#capcha').addClass('show-input');
            $('#continue').addClass('hide');
            $('#log').removeClass('hide');
            $('#continue-cap').addClass('hide');
            checkFocus();
            return;
        } else if (vm.loginForm.username.trim() !== '' || vm.loginForm.password.trim() !== '') {
            if (checkUsername())
                return;
            if (checkPassword())
                return;
        }
        var request = {
            data: {
                username: vm.loginForm.username,
                password: vm.loginForm.password,
                grant_type: 'login',
                captcha: vm.loginForm.captcha,
                os_type: settings.os_type,
                versionCode: settings.version,
                network_device_id: services.deviceId
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Authorization': "Bearer " + 'xxx'
            }
        };

        lastCaptcha = vm.loginForm.captcha;

        services.authenticate(request).then(function (response) {
            console.log(services.deviceId);
            if (response.responseCode == '800') {
                vm.showCapcha = true;
                getCaptcha();
                console.log('800');
                $('#phone-number').removeClass('show-input');
                $('#pass').removeClass('show-input');
                $('#capcha').addClass('show-input');
                $('#continue').addClass('hide');
                $('#log').removeClass('hide');
            } else if (response.responseCode == '200') {
                var timeObject = new Date();
                var data = response.data;
                $http.defaults.headers.common.Authorization = "Bearer " + data.accessToken;
                $http.defaults.headers.common.RefreshToken = data.refressToken;
                data.expire = Date.now() + parseInt(data.expiredTime) * 1000;
                localStorage.auth = JSON.stringify(data);
                services.auth = data;
                services.isLogin = true;
                services.logInRefreshHomeState = true;
                if ($rootScope.checkLogin === true) {
                    if (response.data.accessToken) {
                        var anthorize = {
                            header: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                'Authorization': "Bearer " + response.data.accessToken
                            }
                        };
                        services.freeMonth(anthorize).then(function (response) {
                            vm.show = response;
                            utilities.showMessenge(response.message);
                        });
                    }

                }
                vm.loginForm = {
                    captcha: ''
                };
                if ($rootScope.loginFromSetup) {
                    $rootScope.loginFromSetup = false;
                    $state.go('setup', {}, {reload: true});
                    return;
                }

                if ($rootScope.errorVerify) {
                    $rootScope.errorVerify = false;
                    $rootScope.changeView();
                } else {
                    if (playlistId && movieId) {
                        services.backDetailFormLogin = true;
                        var state = $rootScope.$previousState.name;
                        $state.go(state, {id: playlistId}, {reload: true});
                        // $state.go('avplayer', {playlistId : playlistId , movieId : movieId});
                    }
                    else
                        $state.go('home', {}, {reload: true});
                }
                console.log('200');
            } else if (response.responseCode == "403") {
                if (vm.showCapcha == true) {
                    $('#phone-number').removeClass('show-input');
                    $('#pass').removeClass('show-input');
                    $('#capcha').addClass('show-input');
                    getCaptcha();
                }
                utilities.showMessenge(response.message);
                $('#phone-number').removeClass('show-input');
                $('#pass').addClass('show-input');
                $('#capcha').removeClass('show-input');
                // $('#continue').removeClass('hide');
                // $('#log').addClass('hide');
                console.log('403');
            } else if (response.responseCode == "808") {
                vm.showCapcha = true;
                vm.loginForm.captcha = '';
                getCaptcha();
                $('#phone-number').removeClass('show-input');
                $('#pass').removeClass('show-input');
                $('#capcha').addClass('show-input');
                $('#continue').addClass('hide');
                $('#log').removeClass('hide');
                console.log('808');
                utilities.showMessenge(response.message);
                checkFocus();
            }
        });

        function setCookie(cname, cvalue, cseconds) {
            var d = new Date();
            d.setTime(d.getTime() + (cseconds * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/login";
        }

        function getCaptcha() {
            isChangeCaptcha = true;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://m.5dmax.vn/apiv2.php/v1/auth/get-captcha', true);
            xhr.setRequestHeader("Authorization", "Bearer " + 'xxx');
            xhr.responseType = 'blob';
            xhr.onload = function (e) {
                if (this.status == 200) {
                    var blob = this.response;
                    document.getElementById("img_capcha").src = window.URL.createObjectURL(blob);
                }
            };
            xhr.send();
            $timeout(function () {
                focusController.focus($(".capt_input"));
                $("#capt input").focus();
            }, 500);
        }
    };


    $('#username input').on("input", function () {
        vm.loginForm.username = this.value;
    });
    $('#password input').on("input", function () {
        vm.loginForm.password = this.value;
    });
    $('#capt input').on("input", function () {
        vm.loginForm.captcha = this.value;
    });

    $("#username input").focusin(function () {
        setTimeout(function () {
            if ($("#username input")[0].type === "password")
                $("#username input")[0].type = "text";
        })
    });

    $("#username input").focusout(function () {
        setTimeout(function () {
            if ($("#username input")[0].type === "password")
                $("#username input")[0].type = "text";
        })
    });

    // function checkFocus() {
    //     if ($("#username input").is(':focus')) {
    //         return "#username input";
    //     }
    //     if ($("#password input").is(':focus')) {
    //         return "#password input";
    //     }
    //     if ($("#capt input").is(':focus')) {
    //         return "#capcha input";
    //     }
    //     return null;
    // }

    function fillStr(el, val) {
        if (el != null) {
            var str = $(el).val() + val;
            $(el).val(str);
        }
    }


    function init() {
        document.body.addEventListener('keydown', function (event) {
            if ($state.current.name == 'login_form') {
                switch (event.keyCode) {
                    case 65376 : // Done
                        if ((vm.loginForm.username && vm.loginForm.username.trim() !== '') && (vm.loginForm.password && vm.loginForm.password.trim() !== '')) {
                            if (!vm.showCapcha)
                                vm.login();
                            else {
                                if (vm.loginForm.captcha && vm.loginForm.captcha.trim() !== '') {
                                    if (isChangeCaptcha && lastCaptcha != vm.loginForm.captcha) {
                                        isChangeCaptcha = false;
                                        vm.login();
                                    }
                                }
                            }
                        }
                        break;
                    // case 65385:
                    //     vm.phone = angular.copy(vm.loginForm.username);
                    //     if(vm.loginForm.username && vm.loginForm.username.trim() !== ''){
                    //         setTimeout(function () {
                    //             $("#username input").val(vm.phone);
                    //         })
                    //     }
                    //     vm.pass = vm.loginForm.password;
                    //     if(vm.loginForm.password && vm.loginForm.password.trim() !== ''){
                    //         setTimeout(function () {
                    //             $("#password input").val(vm.pass);
                    //         },100)
                    //     }
                    //     vm.capcha = vm.loginForm.captcha;
                    //     if(vm.loginForm.captcha && vm.loginForm.captcha.trim() !== ''){
                    //         setTimeout(function () {
                    //             $("#capt input").val(vm.capcha);
                    //         },100)
                    //     }
                    //
                    //     break;
                    default :
                        break;
                }
            }
        })
    }


    $scope.$on('$viewContentLoaded', function (event) {
        if ($state.current.name == 'login_form') {
            var timeFocus = setInterval(function () {
                focusController.focus($('.no-capslock #focusKeybroad'));
                if ($('.no-capslock #focusKeybroad').hasClass('focused')) {
                    clearInterval(timeFocus);
                    console.log('focus ');
                }
                console.log('focus zzzzz');
            }, 100);
            init();
        } else {
            $(".splash_page").fadeIn(2000).fadeOut(2000);
            setTimeout(function () {
                utilities.showLoadingLogin();
            }, 3000);
            var timeFocus = setInterval(function () {
                focusController.focus($('#btn_login_first'));
                if ($('#btn_login_first').hasClass('focused')) {
                    clearInterval(timeFocus);
                }
            }, 100)
        }
    });

    function checkFocus() {
        if ($('#content-key-broard').hasClass('content-no-capslock')) {
            var timeFocus = setInterval(function () {
                focusController.focus($('#focusKeybroad'));
                if ($('#focusKeybroad').hasClass('focused')) {
                    clearInterval(timeFocus);
                }
            }, 100)
        } else if ($('#content-key-broard').hasClass('content-capslock')) {
            var timeFocus = setInterval(function () {
                focusController.focus($('#initFocusKey'));
                if ($('#initFocusKey').hasClass('focused')) {
                    clearInterval(timeFocus);
                }
            }, 100)
        }else if ($('#content-key-broard').hasClass('content-symbol')) {
            var timeFocus = setInterval(function () {
                focusController.focus($('#Symbol-key'));
                if ($('#Symbol-key').hasClass('focused')) {
                    clearInterval(timeFocus);
                }
            }, 100)
        } else {
            var timeFocus = setInterval(function () {
                focusController.focus($('#log'));
                if ($('#log').hasClass('focused')) {
                    clearInterval(timeFocus);
                }
            }, 100)
        }
    }
}