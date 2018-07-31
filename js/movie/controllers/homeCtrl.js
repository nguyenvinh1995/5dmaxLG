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

    services.getHomeFilm().then(function (response) {
        vm.homeFilms = response.data;
        vm.banner = vm.homeFilms[0].content;
        currentBannerItem = vm.banner[0];
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
                'nextFocus : { up : ' + i + ' == 1  ? \'btn_play\' : \'\',right : $last ? \'menu-type-' + i + '-0\' : \'\',down: \'menu-type-' + (i+1) + '-0\'}}"'
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

    vm.initBanner = function () {
        console.log("init");
        owl.owlCarousel({
            items: 1,
            autoplay: true,
            autoplayTimeout: 30000,
            autoplayHoverPause: true,
            loop: true,
            dots: false,
            animateOut: 'fadeOut'
        });
        owl.on('translated.owl.carousel', function (event) {
            if (currentIndexBanner >= 0 && currentIndexBanner < vm.banner.length - 1) {
                currentIndexBanner++;
            } else if (currentIndexBanner == vm.banner.length - 1) {
                currentIndexBanner = 0;
            }
            currentBannerItem = vm.banner[currentIndexBanner];
            console.log(currentBannerItem);
            services.backgroundMenu = currentBannerItem.imageForTVLarge;
        });
    };

///// Watch-Button

    vm.clickPlay = function () {
        console.log(currentBannerItem);
        // owl.trigger('stop.owl.autoplay');
        services.getDetailFilm(currentBannerItem.itemId).then(function (response) {
                console.log(response);
                services.checkBanner = false;
                if (response.responseCode === '201' || response.responseCode === '404') {
                    utilities.showMessenge(response.message);
                    $(".message span").css({
                        "max-width": "700px",
                        "top": "50%"
                    });
                    owl.trigger("play.owl.autoplay", [30000]);
                }
                // return;
                // } else {
                if (response.responseCode === '200') {
                    console.log('gfdhs');
                    if (response.data.streams) {
                        switch (response.data.streams.errorCode) {
                            case 201 :
                                utilities.showMessenge(response.data.streams.message, true);
                                // owl.trigger("play.owl.autoplay", [30000]);
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
        $('#av-container').remove();
        $("#home_page").removeClass('focusMenu');
        $("#home_page .menu_page").removeClass('display-none');
        vm.isFocuseMovie = false;
        // vm.checkTrailer = false;
        // owl.trigger("play.owl.autoplay", [30000]);
        console.log("abc");
        services.backgroundMenu = currentBannerItem.imageForTVLarge;
        vm.currentCategory = 0;
        $('#list_container').css({
            transform: 'translate3d(0, 260px, 0)'
        });
        $("#group_btn").removeClass('hidden_opacity');
        $(".movie_article_wrapper").removeClass('background-none');
        $(".btn-up-to-top").removeClass('display-none').addClass('display-block');
    };

///// Detail-Button

    vm.viewDetail = function () {
        // owl.trigger('stop.owl.autoplay');
        $state.go('movieDetail', {id: currentBannerItem.itemId}, {reload: true});
    };
    vm.focusDetail = function () {
        // owl.trigger("play.owl.autoplay", [30000]);
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
        if (vm.isFocuseMovie == false) {
            vm.isFocuseMovie = true;
            $("#home_page .menu_page").addClass('display-none');
            $(".home_slider").trigger('stop.owl.autoplay');
            $("#group_btn").addClass('hidden_opacity');
            $('#list_container').removeClass('lastCategory');
            $(".btn-up-to-top").addClass('display-none').removeClass('display-block');
        }

        // console.log(services.imgCurrentItem);

        // services.imgCurrentItem = item.imageForTVLarge;
        //process
        vm.processItem = Math.floor(item.durationPercent);
        if (vm.processItem != '0') {
            $('.progress-bar-marker').css('width', vm.processItem + '%');
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
        if(services.idTrailer){
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
                        }, 4000);
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
                transform: 'translateX(-' + ((tempWidth * blockToTransform + (blockToTransform * 32)) / 25) + 'rem)'
            });
        } else if ($index === 0) {
            $wrapper.css({
                transform: 'translateX(0px)'
            });
        }

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


    // function showTrailer() {
    //     // utilities.showLoading();
    //     var listenerCallback = {
    //         onevent: function (eventType, eventData) {
    //         }
    //         // onerror: function (eventType) {
    //         //     console.log(eventType);
    //         //     utilities.showMessenge("Đã xảy ra lỗi !");
    //         //     utilities.hideLoading();
    //         // }
    //     };
    //     TizenAVPlayer.listener = listenerCallback;
    //     //-------------------- config and play video ------------------//
    //     TizenAVPlayer.initialize({
    //         avPlayerDomElement: $("#av-player")[0],
    //         listener: listenerCallback
    //     });
    //     $("#av-player").addClass('video-trailer');
    //     var mediaUrl = 'http://www.streambox.fr/playlists/test_001/stream.m3u8';
    //     TizenAVPlayer.mediaUrl = mediaUrl;
    //     TizenAVPlayer.executeAction({
    //         action: "play"
    //     });
    //     console.log('show-trailer');
    //     setTimeout(function () {
    //         TizenAVPlayer.playTrailer(mediaUrl);
    //     }, 500);
    //     $("#av-player").show();
    // }

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

    function changeDepth(depth) {
        if (depth == depthMain) {
            setCurrentPopupDefault();
        }
        $timeout(function () {
            focusController.setDepth(depth);
        }, 500);
    }

    function setCurrentPopupDefault() {
        $rootScope.currentPopup = undefined;
    }

    function logOut() {
        $(".dialog_exit").removeClass("hidden");
        changeDepth(depthDialog);
        focusCancel();
    }

    function focusCancel() {
        var timeFocus = setInterval(function () {
            focusController.focus($('#btn_cancle_exit'));
            $rootScope.currentPopup = 'dialog_logout';
            if ($('#btn_cancle_exit').hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100);
    }

    vm.approveExit = function () {
        webOS.platformBack();
    };

    vm.cancel = function () {
        $(".dialog_hide").addClass("hidden");
        changeDepth(depthMain);
    };

    vm.focusText = function ($event, items, startIndex, $index) {
        $("#home_page").addClass('focusMenu');
        vm.title = items.title;
        vm.description = items.description;
        var $ele = $($event.currentTarget);
        var $wrapper = $ele.parent();
        console.log($wrapper, $index, 'index of vod ');
        var tempWidth;
        var blockToTransform;

        if ($index >= startIndex) {
            blockToTransform = $index - (startIndex - 1);
            tempWidth = $ele.outerWidth();
            console.log('scroll');
            $wrapper.css({
                transform: 'translateX(-' + ((tempWidth * blockToTransform + (blockToTransform * 37)) / 36) + 'rem)'
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

}


