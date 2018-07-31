'use strict';

angular.module('app.movie').controller('HomeCtrl', HomeCtrl);

HomeCtrl.$inject = ['$scope', '$timeout', '$state', '$window', 'services', 'settings', 'FocusUtil', 'focusController', '$rootScope', '$compile', 'FocusConstant', 'utilities'];

function HomeCtrl($scope, $timeout, $state, $window, services, settings, FocusUtil, focusController, $rootScope, $compile, FocusConstant, utilities) {

    var vm = this;
    vm.banner = [];
    vm.homeFilms = [];
    vm.currentCategory = 0;
    vm.currentItem = [];
    vm.isFocuseMovie = false;
    // vm.checkTrailer = false;
    var lengthCategory = 0;
    var heightCategory = 0;
    var currentIndexBanner = 0;
    var currentBannerItem = {};
    var owl = $('.home_slider');
    services.checkBanner = false;
    services.mediaUrlBanner = '';
    services.getHomeFilm().then(function (response) {
        vm.homeFilms = response.data;
        vm.banner = vm.homeFilms[0].content;
        currentBannerItem = vm.banner[0];
        console.log(currentBannerItem);
        // services.backgroundSuggetionMovie = currentBannerItem.imageForTVLarge;
        services.backgroundMenu = currentBannerItem.imageForTVLarge;
        services.idItem = vm.homeFilms[0].content[0].itemId;
        console.log(services.idItem);
        var raw = '';
        for (var i = 1; i < vm.homeFilms.length; i++) {
            raw += '<div class="list_movies overlay" ng-class="{ \'overlay\' : vm.currentCategory != ' + i + ' } "id="list_' + i + '">'
                + '<p class="list_title">{{vm.homeFilms[' + i + '].name}}</p>'
                + '<div class="movies scroll-movie">'
                + '<div class="list-scroll-wrapper" ng-repeat="obj in vm.homeFilms[' + i + '].content" > '
                + '<div class="item" ng-class="{ \'first_category\' : !$index && ' + i + ' == 1}"'
                + 'focusable="{name:\'menu-type-' + i + '-{{$index}}\',depth : $root.depth.main.val , ' +
                'nextFocus : { up : ' + i + ' == 1  ? \'btn_play\' : \'\',right : $last ? \'menu-type-' + i + '-0\' : \'\',down:\'menu-type-' + (i + 1) + '-0\'}}"'
                + 'on-selected="vm.selectMovie(obj)" on-blurred="vm.blurItem($event, $originalEvent, ' + i + ' , obj , $index )" on-focused="vm.focusItem($event, $originalEvent, 4, obj , $index,' + i + ')">'
                + '<div id="test" style="background:url(\'{{obj.coverImageH ? obj.coverImageH : obj.coverImage}}\') no-repeat"></div>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>'
        }
        lengthCategory = vm.homeFilms.length - 1;
        angular.element(document.getElementById('list_container')).append($compile(raw)($scope));
        utilities.hideLoading();
    });

    console.log(currentBannerItem);

    var i = 0;

    setInterval(function () {
        $(".banner_" + [i]).removeClass('active');
        i++;
        if (i > (vm.banner.length - 1)) {
            i = 0;
            $(".banner_0").addClass('active');
        }
        else {
            $(".banner_" + [i]).addClass('active');
        }
    }, 30000);

///// Watch-Button

    vm.clickPlay = function (bool) {
        services.checkBanner = bool;
        console.log(vm.banner[i].id);
        owl.trigger('stop.owl.autoplay');
        services.getDetailFilm(vm.banner[i].itemId).then(function (response) {
                console.log(response);
                services.BannerId = response.data.detail.id;
                services.BannerIdMovie = response.data.parts[0].id;
                services.checkBanner = false;
                if (response.responseCode === '201' || response.responseCode === '404') {
                    utilities.showMessenge(response.message);
                    $(".message span").css({
                        "max-width": "700px",
                        "top": "50%"
                    });
                    // owl.trigger("play.owl.autoplay", [5000]);
                    // owl.trigger('owl.play',5000);
                }
                // return;
                // } else {
                if (response.responseCode === '200') {
                    console.log('gfdhs');
                    if (response.data.streams) {
                        switch (response.data.streams.errorCode) {
                            case 201 :
                                // utilities.showMessenge(response.data.streams.message, true);
                                // owl.trigger("play.owl.autoplay", [30000]);

                                // popUPBanner();
                                if (response.data.streams.errorCode == '201' && response.data.streams.popup) {
                                    utilities.hideLoading();
                                    if (isObject(response.data.streams.popup))
                                        checkBuy(response.data.streams.popup);
                                    else {
                                        utilities.showMessenge(response.data.streams.message);
                                        showHideDialog();
                                    }
                                    return;
                                } else if (response.data.streams.errorCode == utilities.errorCode.tokenExpire) {
                                    refreshToken(refreshTokenType.playItem);
                                    return;
                                }
                                $state.go('avplayer', {
                                    playlistId: response.data.detail.id,
                                    movieId: response.data.parts[0].id
                                });
                                utilities.hideLoading();


                                break;
                            case "401" :
                                $state.go('login_form', {}, {reload: true});
                                break;
                            case 200 :
                                console.log('tesst');
                                services.checkBanner = true;
                                services.mediaUrlBanner = response.data.streams.urlStreaming;
                                TizenAVPlayer.name = response.data.detail.name;
                                TizenAVPlayer.description = response.data.detail.description;
                                TizenAVPlayer.alias = response.data.parts.alias;
                                $state.go('avplayer', {
                                    playlistId: response.data.detail.id,
                                    movieId: response.data.parts[0].id
                                });
                                break;
                            default :
                                break;
                        }
                    }
                }
            }
        );
        services.imgCurrentItem = vm.banner[0].coverImage;
    };
    vm.focusPlay = function () {
        // owl.trigger("play.owl.autoplay", [5000]);
        // owl.trigger('owl.play',5000);
        $('#av-container').remove();
        $("#home_page").removeClass('focusMenu');
        $("#home_page .menu_page").removeClass('display-none');
        vm.isFocuseMovie = false;
        // vm.checkTrailer = false;
        console.log("abc");
        services.backgroundMenu = vm.banner[i].imageForTVLarge;
        vm.currentCategory = 0;
        $('#list_container').css({
            transform: 'translate3d(0, 260px, 0)'
        });
        $("#group_btn").removeClass('hidden_opacity');
        $(".movie_article_wrapper").removeClass('background-none');
        $(".btn-up-to-top").removeClass('display-none').addClass('display-block');
    };

// if ($('#btn-detail').hasClass('focused')) {
//     owl.trigger("play.owl.autoplay", [5000]);
// }


///// Detail-Button

    vm.viewDetail = function () {
        owl.trigger('stop.owl.autoplay');
        $state.go('movieDetail', {id: vm.banner[i].itemId}, {reload: true});
    };
    vm.focusDetail = function () {
        // owl.trigger("play.owl.autoplay", [5000]);
        // owl.trigger('owl.play',5000);
        services.backgroundMenu = currentBannerItem.imageForTVLarge;
    };

///// ITEM

    vm.blurItem = function ($event, $originalEvent, category, item, $index) {
        clearTimeout(vm.ShowGif);
        $(".movie_article_wrapper").removeClass('background-none');
        // $("#av-container").addClass('display-trainer');
        // $("#av-player").addClass('display-trainer');
        WebOsPlayer.player.dispose();
        console.log('stop-trailer');
        $('#av-container').remove();
    };
    vm.focusItem = function ($event, $originalEvent, startIndex, item, $index, category) {
        // owl.trigger('stop.owl.autoplay');
        if (vm.isFocuseMovie == false) {
            vm.isFocuseMovie = true;
            $("#home_page .menu_page").addClass('display-none');
            owl.trigger('stop.owl.autoplay');
            $("#group_btn").addClass('hidden_opacity');
            $('#list_container').removeClass('lastCategory');
            $(".btn-up-to-top").addClass('display-none').removeClass('display-block');
        }

        // console.log(services.imgCurrentItem);

        // services.imgCurrentItem = item.imageForTVLarge;
        //process
        vm.processItem = Math.floor(item.durationPercent);
        if (vm.processItem != '0') {
            if (vm.processItem < '100') {
                $('.progress-bar-marker').css('width', vm.processItem + '%');
            } else {
                $('.progress-bar-marker').css('width', 100 + '%');
            }
        } else {
            $('.progress-bar-marker').css('width', 1 + 'px');
        }
        console.log(vm.processItem + 'check');

        vm.checkFilm = item.duration.charAt(1);
        if (vm.checkFilm === 'h') {
            var timeHour = Number(item.duration.slice(0, 1));
            var timeMinute = Number(item.duration.slice(3, 5));
            vm.time = Math.floor(((timeHour * 60) + (timeMinute)) * ((100 - vm.processItem) / 100));
        } else {
            var timeMinutes = Number(item.duration.slice(0, 2));
            var timeSecond = Number(item.duration.slice(4, 6));
            vm.time = Math.floor((((timeMinutes * 60) + (timeSecond)) * ((100 - vm.processItem) / 100)) / 60);
        }
        ///Trailer-Focus//////
        services.idTrailer = item.trailer;
        if (services.idTrailer) {
            if (item.trailer !== '0') {
                services.getTrailer(item.trailer).then(function (response) {
                    console.log(response);
                    services.mediaTrailer = response.data.streams.urlStreaming;
                    if (response.responseCode === '200') {
                        vm.ShowGif = $timeout(function () {
                            $rootScope.mediaTrailer = response.data.streams.urlStreaming;
                            var raw = '';
                            raw += '<div id="av-container" class="trainer display-trainer">'
                                + '<video id=av-player class="video-js vjs-default-skin"></video>'
                                + '</div>';
                            angular.element(document.getElementById('showTrailer')).append($compile(raw)($scope));
                            showTrailer();
                            console.log('play-trailer')
                        }, 6500);
                        $timeout.cancel(vm.show);
                        vm.show = null;
                        vm.show = $timeout(function () {
                            // $("#av-player").removeClass('display-trainer');
                            $("#av-container").addClass('display-block');
                            $(".movie_article_wrapper").addClass('background-none');
                        }, 7000);
                    }
                });
            }
        }
        vm.currentItem = item;

        if (item.imageForTVLarge) {
            services.backgroundMenu = item.imageForTVLarge;
            $(".movie_article_wrapper").css({
                "background": 'url(' + vm.currentItem.imageForTVLarge + ')'
            });
        } else {
            services.backgroundMenu = item.coverImage;
            $(".movie_article_wrapper").css({
                "background": 'url(' + vm.currentItem.coverImage + ')'
            });
        }
        if (heightCategory == 0) {
            heightCategory = $('#list_1').outerHeight(true);
        }
        if (vm.currentCategory != category) {
            if (category == 1) {
                $('#list_container').css({
                    transform: 'translate3d(0, 0, 0)'
                });
                // }
                vm.currentCategory = 1;
            }
            if (category > vm.currentCategory) {
                var val = (category - 1) * heightCategory;
                if (category == lengthCategory) {
                    val -= heightCategory;
                    $('#list_container').addClass('lastCategory');
                }

                $('#list_container').css({
                    transform: 'translate3d(0, -' + val + 'px, 0)'
                });
                vm.currentCategory = category;
            }
            /*key up*/

            if (category < vm.currentCategory && category > 1) {
                $('#list_container').removeClass('lastCategory');
                var val = (category - 1) * heightCategory;
                $('#list_container').css({
                    transform: 'translate3d(0, -' + val + 'px, 0)'
                });
                vm.currentCategory = category;
            }
        }
        var $ele = $($event.currentTarget);
        var $wrapper = $ele.parent().parent();
        // var $scroll = $wrapper.parent();
        console.log($wrapper, $index, 'index of vod ');
        var tempWidth;
        var blockToTransform;

        if ($index >= startIndex) {
            blockToTransform = $index - (startIndex - 1);
            tempWidth = $ele.outerWidth();
            console.log('scroll');
            $wrapper.css({
                // transform: 'translateX(-' + ((tempWidth * blockToTransform + (blockToTransform * 40)) / 36) + 'rem)'
                transform: 'translateX(-' + (($index - (startIndex - 1)) * 11.1875) + 'rem)'
            });
        } else if ($index === 0) {
            $wrapper.css({
                transform: 'translateX(0px)'
            });
        }

        // if(!item.coverImageH){
        //     services.imgCurrentItem = item.coverImage;
        // }else{
        //     services.imgCurrentItem = item.coverImageH;
        // }

    };

////////

    vm.selectMovie = function (obj) {
        var id = "";
        var idMovie;
        $('#av-container').remove();
        clearTimeout(vm.ShowGif);
        $timeout.cancel(vm.ShowGif);
        $(".movie_article_wrapper").removeClass('background-none');
        // $("#av-container").addClass('display-trainer');
        // $("#av-container").addClass('display-none').removeClass('display-block');

        // $("#av-player").addClass('display-trainer');
        if (obj.type == 'VOD' && obj.publishedTime) {
            id = obj.parentId;
            idMovie = obj.id;
            services.itemFromListMovie = obj;
        }
        else {
            id = obj.id;
            services.itemFromListMovie = null;
        }
        $state.go('movieDetail', {id: id, idMovie: idMovie}, {reload: true});
    };

    function initFocus() {
        utilities.showLoading();
        // owl.trigger("play.owl.autoplay", [5000]);
        var timeFocus = setInterval(function () {
            focusController.focus($('#btn_watch'));
            if ($('#btn_watch').hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100);
    }

    focusController.addAfterKeydownHandler(function (context, item, value) {
        if (context.event.keyCode === FocusConstant.DEFAULT.KEY_MAP.DOWN && vm.currentCategory === lengthCategory) {
            focusController.focus($('#btn_watch'));
        }
    });

    $scope.$on('$viewContentLoaded', function (event) {
        initFocus();
    });

///// Trailer-Home

    function avPlayerListenerCallback(player) {
        player.on('loadedmetadata', function () {
            console.log('done!');
        });
        player.on('ended', function () {
            console.log("success");
            showTrailer()
        });
    }

    function showTrailer() {
        WebOsPlayer.initialize({
            avPlayerDomElement: $("av-player")[0]
        });
        $("#av-player").addClass('video-trailer');
        var mediaUrl = $rootScope.mediaTrailer;
        console.log('show-trailer', mediaUrl);
        setTimeout(function () {
            WebOsPlayer.playVideo(mediaUrl, avPlayerListenerCallback);
        }, 100);
    }

///// MENU

    vm.isLogin = services.isLogin;
    var depthDialog = $rootScope.depth.dialog.val;
    var depthMain = $rootScope.depth.main.val;

    $rootScope.listMenu = [
        {
            id: "m_search",
            type: 'search',
            title: 'Tìm kiếm',
            description: 'Tìm theo tên phim, diễn viên, đạo diễn'
        },
        {
            id: "m_movies",
            type: 'movies',
            title: 'Phim theo thể loại',
            description: 'Sắp xếp phim theo thể loại'
        },
        // {
        //     id: "m_series_movies",
        //     type: 'series-movie',
        //     title: 'Phim thuê',
        //     description: 'Sắp xếp phim theo quốc gia'
        // },
        {
            id: "m_rent_movies",
            type: 'rent-movie',
            title: 'Phim thuê',
            description: 'Sắp xếp phim theo quốc gia'
        },
        {
            id: "m_setting",
            type: 'establish',
            title: 'Thiết lập',
            description: 'Thiết lập chất lượng, đăng nhập, đăng xuất'
        },
        {
            id: "m_logout",
            type: 'sign-out',
            title: 'Thoát 5DMax',
            description: 'Thoát khỏi ứng dụng 5DMax'
        }

    ];
    if (vm.isLogin) {
        var obj = {
            id: 'm_myList',
            type: 'my-list',
            title: 'Danh sách',
            description: 'Danh sách phim của tôi'
        };
        $rootScope.listMenu.splice(3, 0, obj);
    }

    vm.onSelect = function (items) {
        switch (items.type) {
            case 'search' :
                $state.go('search', {}, {reload: true});
                break;
            case 'movies' :
                $state.go('listPhimLe', {}, {reload: true});
                break;
            // case 'series-movie' :
            //     $state.go('listPhimBo', {}, {reload: true});
            //     break;
            case 'rent-movie' :
                $state.go('listPhimThue', {}, {reload: true});
                break;
            case 'my-list' :
                $state.go('myList', {}, {reload: true});
                break;
            case 'establish' :
                $state.go('setup', {}, {reload: true});
                break;
            case 'sign-out' :
                logOut();
                break;
            default:
                break;
        }
    };


    function setCurrentPopupDefault() {
        $rootScope.currentPopup = undefined;
    }

    function logOut() {
        $(".dialog_exit").removeClass("hidden");
        changeDepth(depthDialog);
        focusCancel1();
    }

    function focusCancel1() {
        var timeFocus = setInterval(function () {
            focusController.focus($('#btn_cancle_exit'));
            $rootScope.currentPopup = 'dialog_logout';
            if ($('#btn_cancle_exit').hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100);
    }

    vm.approveExit = function () {
        tizen.application.getCurrentApplication().exit();
    };

    vm.cancel = function () {
        $(".dialog_hide").addClass("hidden");
        changeDepth(depthMain);
    };

    vm.focusText = function ($event, items, startIndex, $index) {
        $('#av-container').remove();
        owl.trigger('stop.owl.autoplay');
        $("#home_page").addClass('focusMenu');
        vm.title = items.title;
        vm.description = items.description;
        var $ele = $($event.currentTarget);
        var $wrapper = $ele.parent();
        // console.log($wrapper, $index, 'index of vod ');
        var tempWidth;
        var blockToTransform;

        if ($index >= startIndex) {
            blockToTransform = $index - (startIndex - 1);
            tempWidth = $ele.outerWidth();
            console.log('scroll');
            $wrapper.css({
                transform: 'translateX(-' + (($index - (startIndex - 1)) * 11.125) + 'rem)'
            });
        } else if ($index === 0) {
            $wrapper.css({
                transform: 'translateX(0px)'
            });
        }

        clearTimeout(vm.ShowGif);
        $timeout.cancel(vm.ShowTrailer);
        // $('#av-container').remove();

    };

    function isObject(item) {
        return (typeof item === "object" && !Array.isArray(item) && item !== null);
    }

////Popup
    var isConfirm = false;
    var typePopup = {
        isBuy: {
            type: 1,
            title: "Thuê phim"
        },
        isPackage: {
            type: 0,
            title: "Đăng ký gói cước"
        }
    };
    var currentTypePopup = 0;
// var depthDialog = $rootScope.depth.dialog.val;
// var depthDetail = $rootScope.depth.main.val;
//

// function popUPBanner() {
    vm.viewContinue = false;
    var refreshTokenType = {
        getDetail: '1',
        buyPackage: '2',
        buyFilm: '3'
    };

// function configFirmGroup() {
//     for (var i = 0; i < vm.listFilms.length; i++) {
//         vm.listFilms[i].durationMinute = Math.floor(vm.listFilms[i].duration / 60);
//     }
//     focusController.focus($('.itemFirst'));
// }
//
// function setUrlFilmDrm() {
//     if (vm.streams.errorCode == 200 && vm.detailFilms.drm_content_id) {
//         services.drmUrl = vm.streams.urlStreaming;
//         TizenAVPlayer.currentTime = vm.data.currentTime > 0 ? vm.data.currentTime : 0;
//     }
//     else
//         services.drmUrl = undefined;
// }


// }
    function showHideDialog() {
        $rootScope.currentPopup = 'popup_movie_detail_2';
        var $popup = $("#popup_movie_detail_2");
        if ($state.current.name == 'home')
            $popup = $("#popup_movie_detail_2");
        if ($popup.hasClass('hidden')) {
            $popup.removeClass('hidden');
            $timeout(function () {
                changeDepth(depthDialog);
            }, 100)
        } else {
            $popup.addClass('hidden');
            if ($state.current.name == 'avplayer')
                changeDepth(depthMain);
            else
                changeDepth(depthMain);
        }
    }


    function changeDepth(depth) {
        if (depth == depthMain) {
            setCurrentPopupDefault();
        }
        $timeout(function () {
            focusController.setDepth(depth);
        }, 500);
        if (depth == depthDialog) {
            var focusCancel = setInterval(function () {
                if ($state.current.name == 'home') {
                    focusController.focus($(".yes_buy_detail"));
                    if ($(".yes_buy_detail").hasClass('focused')) {
                        $rootScope.currentPopup = "popup_movie_detail_2";
                        clearInterval(focusCancel);
                    }
                } else {
                    focusController.focus($(".yes_buy_list"));
                    if ($(".yes_buy_list").hasClass('focused')) {
                        $rootScope.currentPopup = "popup_movie_list_2";
                        clearInterval(focusCancel);
                    }
                }
            }, 100)
        }
    }

    function checkBuy(popup) {
        console.log(popup);
        services.popup = popup;
        if (popup.is_buy_playlist == typePopup.isBuy.type && !popup.package_id) {
            isConfirm = false;
            currentTypePopup = typePopup.isBuy.type;
            $(".popup_movie_detail_2 .title_messenger").html(typePopup.isBuy.title);
            $(".popup_movie_detail_2 .messenger").html(popup.confirm);
            showHideDialog();
        } else if (popup.is_buy_playlist == typePopup.isPackage.type && popup.package_id) {
            isConfirm = false;
            currentTypePopup = typePopup.isPackage.type;
            $(".popup_movie_detail_2 .title_messenger").html(typePopup.isPackage.title);
            $(".popup_movie_detail_2 .messenger").html(popup.confirm);
            showHideDialog();
        }

    }

    vm.yes1 = function () {
        console.log(services.popup, services.popup.confirm_buy_playlist);
        switch (currentTypePopup) {
            case typePopup.isBuy.type :
                if (!isConfirm) {
                    isConfirm = true;
                    $(".popup_movie_detail_2 .messenger").html(services.popup.confirm_buy_playlist);
                    // $("detail_home").removeClass('yes_buy_detail').addClass('yes_buy_detail_yes');
                } else {
                    buyFilm();
                }
                break;
            case typePopup.isPackage.type :
                if (!isConfirm) {
                    isConfirm = true;
                    $(".popup_movie_detail_2 .messenger").html(services.popup.confirm_register_sub);
                    // $("detail_home").removeClass('yes_buy_detail').addClass('yes_buy_detail_yes');
                } else {
                    registerPackage(services.popup.package_id);
                }
                break;
        }
    };

    vm.cancel1 = function () {
        showHideDialog();
    };

    function registerPackage(id) {
        utilities.showLoading();
        services.registerPackage(id).then(function (response) {
            console.log(response);
            var responseCode = response.responseCode;
            if (responseCode == utilities.errorCode.success) {
                var messageRegister = response.message;
                utilities.showMessenge(messageRegister);
                services.getDetailFilm(vm.detailFilms.id).then(function (response) {
                    showHideDialog();
                    utilities.hideLoading();
                    if (response.responseCode == utilities.errorCode.success) {
                        var data = response.data;
                        vm.streams = data.streams;
                        if (vm.streams.errorCode == 200) {
                            $state.go('avplayer', {playlistId: vm.detailFilms.id, movieId: vm.listFilms[0].id});
                        } else {
                            utilities.showMessenge(vm.streams.message);
                        }
                    }

                })
            } else if (responseCode == '401' || responseCode == '403') {
                console.log("refreshToken");
                refreshToken(refreshTokenType.buyPackage);
            } else {
                utilities.showMessenge(response.message);
                showHideDialog();
                utilities.hideLoading();
            }
        })
    }

    function buyFilm() {
        var type = "PLAYLIST";
        var id = services.idItem;
        utilities.showLoading();
        services.buy(id, type).then(function (response) {
            if (response.responseCode == '403') {
                utilities.hideLoading();
                refreshToken(refreshTokenType.buyFilm);
            } else if (response.responseCode == '200') {
                utilities.showMessenge('Mua lẻ thành công');
                setTimeout(function () {
                    services.getDetailFilm(id, idMovie).then(function (response) {
                        utilities.hideLoading();
                        var data = response.data;
                        vm.data = data;
                        if (data.streams)
                            vm.streams = data.streams;
                        // setUrlFilmDrm();
                        vm.playMovie(currentItemPlay);
                    })
                }, 500)

            } else {
                utilities.hideLoading();
                utilities.showMessenge('Mua lẻ không thành công');
                showHideDialog();
            }
        })
    }

}


