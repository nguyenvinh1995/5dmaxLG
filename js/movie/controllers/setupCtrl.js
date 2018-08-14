'use strict';

angular.module('app.movie').controller('SetupCtrl', SetupCtrl);

SetupCtrl.$inject = ['$scope', 'services', 'focusController', 'FocusUtil', '$timeout', '$state', '$stateParams', 'utilities', '$rootScope', 'settings', '$http'];

function SetupCtrl($scope, services, focusController, FocusUtil, $timeout, $state, $stateParams, utilities, $rootScope, settings, $http) {

    var vm = this;
    utilities.showLoading();
    vm.listQuality = [];
    vm.listPackage = [];
    vm.isLogin = false;
    vm.name = services.name_quality;
    var confirm = false;
    var itemDialog = {};
    var depthDialog = $rootScope.depth.dialog.val;
    var depthList = $rootScope.depth.list.val;
    console.log(services.isLogin);
    services.logOutRefreshHomeState = false;

    if(!vm.name) {
        vm.name = "Tự Động";
    }
    function getListPackage() {
        services.getListPackage().then(function (response) {
            vm.listPackage = response.data;
            utilities.hideLoading();
        });
    }
    services.getSetting().then(function (response) {
        var data = response.data;
        vm.listQuality = data.quality.reverse();
        utilities.hideLoading();
    });

    function getDetail(){
        services.getDetailUser().then(function (response) {
            var responseCode = response.responseCode;
            switch (responseCode) {
                case utilities.errorCode.success :
                    vm.isLogin = true;
                    getListPackage();
                    initFocus('item_setup');
                    console.log(response);
                    var data = response.data;
                    vm.detaiUser = data.user_detail;
                    vm.changeTab(1);
                    break;
                case utilities.errorCode.login :
                    vm.isLogin = false;
                    initFocus('quality');
                    vm.changeTab(2);
                    break;
                case utilities.errorCode.tokenExpire :
                    services.refreshToken().then(function(res){
                        if(res.responseCode == utilities.errorCode.success){
                            getDetail();
                        }else{
                            utilities.hideLoading();
                            utilities.showMessenge(utilities.tokenExpireMessenger, true);
                            $rootScope.errorVerify = true;
                            $rootScope.loginFromSetup = true;
                            $state.go('login_form');
                        }
                    });
                    break;
                default:
                    break;
            }
            utilities.hideLoading();
        });
    }

    getDetail();

    vm.selectPackage = function (item) {
        $rootScope.currentPopup = 'dialog_setup';
        if (item.status == 1) {
            dialogCancel(item);
            itemDialog = item;
        } else {
            dialogRegister(item);
        }
    };

    function setCurrentPopupDefault() {
        $rootScope.currentPopup = undefined;
    }

    function changeDepth(depth) {
        if (depth == depthList) {
            setCurrentPopupDefault();
        }
        $timeout(function () {
            focusController.setDepth(depth);
            console.log(focusController.getCurrentDepth());
        }, 500);
    }

    function dialogCancel(item) {
        var content = "Bạn có muốn Hủy dịch vụ 5Dmax " + item.name + "?";
        $(".dialog_setup h1.title").html("Hủy gói cước");
        $(".dialog_setup p.content").html(content);
        $(".dialog_setup").removeClass("hidden");
        itemDialog = {};
        confirm = false;
        changeDepth(depthDialog);
        initFocus("btn_cancle");
    }

    function confirmUnRegister() {
        confirm = true;
        var content = "Bạn có chắc chắn muốn hủy gói cước này không ?";
        focusController.focus($("#btn_cancle"));
        $(".dialog_setup p.content").html(content);
    }

    function dialogRegister(item) {
        var content = item.popup[0];
        $(".dialog_setup h1.title").html("Đăng ký gói cước");
        $(".dialog_setup p.content").html(content);
        $(".dialog_setup").removeClass("hidden");
        itemDialog = item;
        confirm = false;
        changeDepth(depthDialog);
        initFocus("btn_cancle");
    }

    vm.cancel = function () {
        changeDepth(depthList);
        $(".dialog_hide").addClass("hidden");
        confirm = false;
        clearTimeout($rootScope.showBanner);
    };


    vm.approve = function () {
        console.log(confirm);
        if (itemDialog.status == 1) {
            if (!confirm) {
                confirmUnRegister();
            } else {
                unregisterPackage();
            }
        } else {
            if (!confirm) {
                confirmRegister();
            } else {
                register();
            }
        }
    };

    vm.approveLogout = function () {
        localStorage.removeItem('auth');
        vm.isLogin = false;
        vm.detaiUser = [];
        services.isLogin = false;
        delete $http.defaults.headers.common.Authorization;
        initFocus('quality');
        vm.changeTab(2);
        $(".dialog_logout_1").addClass("hidden");
        changeDepth(depthList);
        utilities.showMessenge("Tài khoản đã được đăng xuất.");
        clearTimeout($rootScope.showBanner);
        services.logOutRefreshHomeState = true;
    };

    function getListPackageAndFocus(id) {
        services.getListPackage().then(function (response) {
            vm.listPackage = response.data;
            $("#list_package").trigger("reload");
            var setFocus = setInterval(function () {
                focusController.focus($(id));
                if ($(id).hasClass("focused")) {
                    clearInterval(setFocus);
                }
            }, 500)

        });
    }

    // unRegister
    function unregisterPackage() {
        var id = itemDialog.id;
        confirm = false;
        $(".dialog_setup").addClass("hidden");
        focusController.setDepth(depthList);
        services.unregisterPackage(id).then(function (response) {
            var responseCode = response.responseCode;
            switch (responseCode){
                case utilities.errorCode.success :
                    getListPackageAndFocus("#pakage_" + id);
                    utilities.showMessenge(response.message);
                    break;
                case utilities.errorCode.tokenExpire :
                    services.refreshToken().then(function(res){
                        if(res.responseCode == utilities.errorCode.success){
                            unregisterPackage();
                        }else{
                            utilities.hideLoading();
                            utilities.showMessenge(utilities.tokenExpireMessenger, true);
                            $rootScope.errorVerify = true;
                            $state.go('login_form');
                        }
                    });
                    break;
                default :
                    break;
            }

        })
    }

    function confirmRegister() {
        console.log(itemDialog);
        confirm = true;
        var content = itemDialog.popup[1];
        focusController.focus($("#btn_cancle"));
        $(".dialog_setup h1.title").html("Xác nhận đăng ký");
        $(".dialog_setup p.content").html(content);
    }

    // register
    function register() {
        confirm = false;
        changeDepth(depthList);
        $(".dialog_setup").addClass("hidden");
        var id = itemDialog.id;
        services.registerPackage(id).then(function (response) {
            var responseCode = response.responseCode;
            console.log(response);
            switch (responseCode){
                case utilities.errorCode.success :
                    getListPackageAndFocus("#pakage_" + id);
                    utilities.showMessenge(response.message);
                    break;
                case utilities.errorCode.created :
                    if(response.message)
                        utilities.showMessenge(response.message,false, 10000);
                    break;
                case utilities.errorCode.tokenExpire :
                    services.refreshToken().then(function(res){
                        if(res.responseCode == utilities.errorCode.success){
                            register();
                        }else{
                            utilities.hideLoading();
                            utilities.showMessenge(utilities.tokenExpireMessenger, true);
                            $rootScope.errorVerify = true;
                            $state.go('login_form');
                        }
                    });
                    break;
                default :
                    break;
            }
        })
    }

    // Hàm đổi tab
    vm.changeTab = function (index) {
        $scope.current_tab = index;
        console.log(index);
    };

    $scope.isSelectTab = function (index) {
        return index === $scope.current_tab;
    };

    vm.login = function () {
        $state.go('login_form', {}, {reload: true});
        $rootScope.loginFromSetup = true;
    };

    vm.logout = function () {
        $(".dialog_logout_1").removeClass("hidden");
        $rootScope.currentPopup = 'dialog_logout_1';
        /*logout ==> refresh home page*/
        changeDepth(depthDialog);
        initFocus("btn_cancle_out");
    };

    vm.showQuality = function () {
        $('.setup_page').addClass('display-none').removeClass('display-block');
        $('.quality_selection').addClass('display-block').removeClass('display-none');
        var timeFocus = setInterval(function () {
            focusController.focus($('.first-item'));
            if ($('.first-item').hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100)
    };
    vm.quality = function (item) {
        $('.quality_selection').addClass('display-none').removeClass('display-block');
        $('.setup_page').addClass('display-block').removeClass('display-none');
        services.quality = item.vod_profile_id;
        services.name_quality= item.name;
        vm.name = item.name;
        console.log(services.quality);
        var timeFocus = setInterval(function () {
            focusController.focus($('.quality_select'));
            if ($('.quality_select').hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100)
    };
    vm.qualityAuto = function () {
        $('.quality_selection').addClass('display-none').removeClass('display-block');
        $('.setup_page').addClass('display-block').removeClass('display-none');
        var item = {
            vod_profile_id : '0',
            name : "Tự động"
        };
        services.quality = item.vod_profile_id;
        services.name_quality = item.name;
        vm.name = item.name;
        var timeFocus = setInterval(function () {
            focusController.focus($('.quality_select'));
            if ($('.quality_select').hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100)
    };

    function initFocus(id) {
        var idEl = $("#" + id);
        console.log(idEl);
        var timeFocus = setInterval(function () {
            focusController.focus(idEl);
            if ($(idEl).hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100)
    }
}