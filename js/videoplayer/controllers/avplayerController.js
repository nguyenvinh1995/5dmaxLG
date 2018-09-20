angular.module('app.avplayer').controller('AVPlayerCtrl', AVPlayerCtrl);

AVPlayerCtrl.$inject = ['$scope', 'services', '$state', 'FocusUtil', 'focusController', '$timeout', '$stateParams',
    'utilities', '$rootScope', 'settings', '$http', '$compile'];

var showMediaControllerTimeout;
var loadingProgress, videoTitle, sysTime, playPosElement, endPosElement, progressBarMarkerElement,
    progressBarBkgdElement,
    progressDot, previousBtn, nextBtn, operations, btnPlayingModeTitle;
var controllerConfig = {
    showControllTimeout: 5000,
    forWardTimeRange: 30000,
    rewindTimeRange: 30000,
    fastForwardTimeRange: 30000,
    farstRewindTimeRange: 30000
};
var currentidMovie;
var doc = document;
var rorate;
var tokenExpireMessenger = utilities.tokenExpireMessenger;
var currentPlayingTime = 0;
var duration = 0;
var keydown = false;
var isNext = false;
var nextVideo;
var isDrm = false;

function AVPlayerCtrl($scope, services, $state, FocusUtil, focusController, $timeout, $stateParams, utilities, $rootScope, settings, $http, $compile) {

    initLayout();

    $scope.detailMovie = {
        name: TizenAVPlayer.name ? TizenAVPlayer.name : '',
        description: TizenAVPlayer.description ? TizenAVPlayer.description : '',
        alias: TizenAVPlayer.alias ? TizenAVPlayer.alias : ''
    };
    /*close avplayer*/
    TizenAVPlayer.close();
    TizenAVPlayer.ffAndRewData.changeTime = 0;
    $scope.isPlaying = true;

    $("#av-player").hide();

    // showMediaController($scope, focusController);

    TizenAVPlayer.registerredHardKeys = registerKeyHandler($scope, focusController, $rootScope, $stateParams, utilities, services, $state);

    try {
        // addEventAttributeChanged();
    } catch (ex) {
    }

    var vm = this;
    var isForward = true;
    vm.checkPlayTrailer = services.check;
    $rootScope.linkM3u8 = [];
    $rootScope.checkSelectprocess = false;

    setTimeout(function () {
        startingPlay($scope, services, $state, FocusUtil, focusController, $timeout, $stateParams, utilities, $rootScope, settings, $http);
        // vm.bannerItem = services.backgroundMenu;

        if (services.imgCurrentItem) {
            vm.imgCurrentItem = services.imgCurrentItem;
        } else {
            vm.imgCurrentItem = vm.currentItem;
        }

        var timeFocus = setInterval(function () {
            services.getHomeFilm().then(function (response) {
                vm.homeFilms = response.data;
                vm.banner = vm.homeFilms[0].content;
                // var i = Math.floor(Math.random() * vm.banner.length);
                vm.bannerItem = vm.banner[0].imageForTVLarge;
                vm.logoItem = vm.banner[0].logoImage;
                vm.currentItem = vm.banner[0].coverImage;
                vm.id = vm.banner[0].itemId;
                vm.name = vm.banner[0].name;
            });
            if (vm.homeFilms) {
                clearInterval(timeFocus);
            }
        }, 100);

        console.log(vm.bannerItem, vm.imgCurrentItem, vm.logoItem, 'ccccc');

        vm.selectItem = function () {
            services.checkSuggest = true;
            $state.go('movieDetail', {id: vm.id}, {reload: true});
        };

        vm.watchMovie = function () {
            services.getDetailFilm(services.idItem).then(function (response) {
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
                        $rootScope.changeView();
                    }
                    if (response.responseCode === '200') {
                        console.log('gfdhs');
                        if (response.data.streams) {
                            switch (response.data.streams.errorCode) {
                                case 201 :
                                    if (response.data.video.drm_content_id === null || response.data.video.drm_content_id === '') {
                                        if (response.data.streams.errorCode == '201' && response.data.streams.popup) {
                                            utilities.hideLoading();
                                            if (isObject(response.data.streams.popup) && (response.data.video.drm_content_id === null || response.data.video.drm_content_id === ''))
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
                                    } else {
                                        utilities.showMessenge('Thiết bị chưa hỗ trợ xem phim này');
                                    }

                                    break;
                                case "401" :
                                    $state.go('login_form', {}, {reload: true});
                                    break;
                                case 200 :
                                    if (response.data.video.drm_content_id === null || response.data.video.drm_content_id === '') {
                                        console.log('tesst', response.data.video.drm_content_id);
                                        services.checkSuggest = false;
                                        services.mediaUrlSuggest = response.data.streams.urlStreaming;
                                        TizenAVPlayer.name = response.data.detail.name;
                                        TizenAVPlayer.description = response.data.detail.description;
                                        TizenAVPlayer.alias = response.data.parts.alias;
                                        $state.go('avplayer', {
                                            playlistId: response.data.detail.id,
                                            movieId: response.data.parts[0].id
                                        });
                                        console.log('ddddd');
                                    } else {
                                        utilities.showMessenge('Thiết bị chưa hỗ trợ xem phim này');
                                    }
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
    }, 200);

    function checkSuggestMovie() {
        $('#playerNone').remove();
        setTimeout(function () {
            $("#play_btn").blur();
        }, 100);
        // TizenAVPlayer.executeAction({
        //     action: "stop"
        // });
        // TizenAVPlayer.close();
        $(".avplayer_page").addClass('display-none').removeClass('display-block');
        $(".relate_film_background").removeClass('display-none').addClass('display-block');
        if ($("#avplayer_suggest").hasClass('display-block')) {
            var timeFocus = setInterval(function () {
                focusController.focus($('#detail-sugget'));
                if ($('#detail-sugget').hasClass('focused')) {
                    clearInterval(timeFocus);
                }
            }, 100);
        }
    }

    function startingPlay($scope, services, $state, FocusUtil, focusController, $timeout, $stateParams, utilities, $rootScope, settings, $http) {
        $scope.key = settings.authToken;

        var playlistId = $state.params.playlistId;
        var movieId = $state.params.movieId;
        currentidMovie = $state.params.movieId;

        //-------------------- config and play video ------------------//

        WebOsPlayer.initialize({
            avPlayerDomElement: $("av-player")[0]
            // listener: avPlayerListenerCallback()
        });

        TizenAVPlayer.nextVideo = function () {
            TizenAVPlayer.ffAndRewData.changeTime = 0;
            var index = ++TizenAVPlayer.currentTrack;
            var item = TizenAVPlayer.mediaList[index];
            $scope.detailMovie.description = TizenAVPlayer.description = item.description;
            $scope.detailMovie.alias = TizenAVPlayer.alias = item.alias;
            getStreaming(playlistId, item.id);
            currentidMovie = item.id;
            TizenAVPlayer.close();
            console.log(item);
        };

        function getStreaming(idPlay, idMovie) {
            services.currentPlayMovie = {
                "idMovie": idPlay,
                "idPart": idMovie
            };
            console.log(services.mediaTrailer, services.check, services.attribute, services.mediaUrlBanner);
            if (services.check === false && services.checkBanner === false) {
                if (services.drmUrl) {
                    console.log("drm..........");
                    isDrm = true;
                    utilities.showMessenge('Thiết bị chưa hỗ trợ xem phim này');
                    $rootScope.changeView();
                    // var mediaUrl = services.drmUrl;
                    // TizenAVPlayer.mediaUrl = mediaUrl;
                    // setTimeout(function () {
                    //     WebOsPlayer.playVideo(mediaUrl, avPlayerListenerCallback);
                    //     $scope.isPlaying = true;
                    //     $scope.$digest();
                    // }, 500);
                    // $("#av-player").show();
                } else {
                    console.log("not drm.....");
                    // clearTimeout(vm.nextMovie);
                    services.getStreaming(idPlay, idMovie, services.quality).then(function (response) {
                        var data = response.data;
                        isDrm = false;
                        console.log(response);
                        // if (data.streams.errorCode == '401') {
                        //     $state.go('login_form', {}, {reload: true});
                        // }

                        if (data.streams && data.streams.errorCode == '200') {
                            console.log(data.streams.urlStreaming);
                            var mediaUrl = data.streams.urlStreaming;
                            TizenAVPlayer.mediaUrl = mediaUrl;
                            setTimeout(function () {
                                // TizenAVPlayer.playVideo(mediaUrl, isDrm);
                                WebOsPlayer.playVideo(mediaUrl, avPlayerListenerCallback);
                                $scope.isPlaying = true;
                                $scope.$digest();
                                // if(TizenAVPlayer.currentTime != 0 && isNext == false){
                                //     var time = TizenAVPlayer.currentTime * 1000;
                                //     ff(time);
                                // }
                            }, 500);
                            $("#av-player").show();
                            getLinkM3U8(mediaUrl);
                        } else if (data.streams && data.streams.popup) {
                            utilities.hideLoading();
                            setTimeout(function () {
                                if (loading.addClass("hidden")) {
                                    utilities.showNetworkDisconnected();
                                }
                            }, 500);
                            utilities.showMessenge(data.streams.popup.confirm);
                        } else if (data.streams && data.streams.errorCode == utilities.errorCode.tokenExpire) {
                            refreshToken();
                        }
                    });
                    $("#av-player").show();
                }
                // return;
            }
            if (services.check === true && services.playTrailer) {
                console.log(services.playTrailer);
                if (services.playTrailer) {
                    TizenAVPlayer.ffAndRewData.changeTime = 0;
                    var mediaUrl = services.playTrailer;
                    TizenAVPlayer.mediaUrl = mediaUrl;
                    setTimeout(function () {
                        WebOsPlayer.playVideo(mediaUrl, avPlayerListenerCallback);
                        $scope.isPlaying = true;
                        $scope.$digest();
                    }, 500);
                    $("#av-player").show();
                    services.playTrailer = '';
                } else {
                    $rootScope.changeView();
                    utilities.showMessenge("Đã có lỗi xảy ra");
                }
            }
            if (services.mediaUrlBanner && services.checkBanner === true) {
                TizenAVPlayer.ffAndRewData.changeTime = 0;
                var mediaUrl = services.mediaUrlBanner;
                TizenAVPlayer.mediaUrl = mediaUrl;
                setTimeout(function () {
                    WebOsPlayer.playVideo(mediaUrl, avPlayerListenerCallback);
                    $scope.isPlaying = true;
                    $scope.$digest();
                }, 500);
                $("#av-player").show();
                services.checkBanner = false;
                services.mediaUrlBanner = '';
                // getLinkM3U8(mediaUrl);
            }
        }

        function getLinkM3U8(mediaUrl) {
            console.log(mediaUrl);
            var tmp = mediaUrl.lastIndexOf("/");
            console.log(tmp);
            if (tmp != -1) {
                var base_url = mediaUrl.substr(0, tmp + 1);
                console.log(base_url);
                var m3u8 = mediaUrl;
                $.ajax({
                    type: "GET",
                    url: m3u8,
                    success: function (data) {
                        function convertInto2KOM(m3u) {
                            return m3u
                                .replace('#EXTM3U', '')
                                .split('x')
                                .slice(1)
                                .map(function (str) {
                                    var channel = str.split('\n').slice(0, -1);
                                    return {
                                        "quality": channel[0],
                                        "url": base_url + channel[1]
                                    };
                                });
                        }

                        var parseM3U = convertInto2KOM(data);
                        vm.linkM3u8 = parseM3U;
                        console.log(vm.linkM3u8)
                    }
                });
            }
        }

        vm.selectLink = function (item, bool) {
            $rootScope.checkLink = bool;
            WebOsPlayer.currentTime = $rootScope.checkTime;
            console.log(item.url, TizenAVPlayer.ffAndRewData.changeTime);
            var mediaUrl = item.url;
            TizenAVPlayer.mediaUrl = mediaUrl;
            setTimeout(function () {
                WebOsPlayer.playVideo(mediaUrl, avPlayerListenerCallback);
                $scope.isPlaying = true;
                $scope.$digest();
            }, 500);
            $("#av-player").show();
        };

        vm.selectProcess = function () {
            $rootScope.checkSelectprocess = true;
        };


        function ff(time) {
            TizenAVPlayer.ff(time, function () {
            }, function () {
            });
        }

        function refreshToken() {
            var token = JSON.parse(localStorage.auth);
            if (token) {
                var request = {
                    data: {
                        grant_type: 'refresh_token',
                        refresh_token: token.refressToken
                    },
                    header: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Authorization': "Bearer " + 'xxx'
                    }
                };
                services.authenticate(request).then(function (res) {
                    if (res.responseCode == "200") {
                        var data = res.data;
                        token.accessToken = data.accessToken;
                        token.refressToken = data.refressToken;
                        token.expire = Date.now() + parseInt(data.expiredTime) * 1000;
                        services.auth = token;
                        localStorage.auth = JSON.stringify(token);
                        $http.defaults.headers.common.Authorization = "Bearer " + data.accessToken;
                        getStreaming(playlistId, movieId);
                    } else {
                        utilities.hideLoading();
                        $rootScope.errorVerify = true;
                        utilities.showMessenge(utilities.tokenExpireMessenger, true);
                        $state.go('login_form', {}, {reload: true});

                    }
                })
            } else {
                utilities.hideLoading();
                $state.go('login_form');
            }
        }

        if (playlistId && movieId) {
            // utilities.showLoading();
            initLayoutCallBack();
            getStreaming(playlistId, movieId);

        }
        // if ($("video").length)
        //     addVideoListener($scope);
    }

    function loadBackground() {
        if ($("#background-music-detail").length)
            $("#background-music-detail").addClass('background-music-detail');
    }

    // function addVideoListener($scope) {
    //     // var video = $("video")[0];
    //     // $("video").on("play", function (e) {
    //     //     setTimeout(function () {
    //     //         loadingProgress.css('display', 'none');
    //     //     }, 1000);
    //     // });
    //
    //     $("video").on("timeupdate", function (e) {
    //         // TizenAVPlayer.duration = $("video")[0].duration * 1000;
    //         // updateCurrentProgress($("video")[0].currentTime * 1000);
    //         console.log('tesst');
    //     });
    //
    //     $("video").on("ended", function () {
    //     });
    // }

    function updateCurrentProgress(currentTime) {
        currentTime = currentTime < 0 ? 0 : currentTime > WebOsPlayer.duration ? WebOsPlayer.duration : currentTime;
        var timeLeft = WebOsPlayer.duration - currentTime;
        var progress = Math.min(currentTime, WebOsPlayer.duration) / WebOsPlayer.duration * progressBarBkgdElement.width();
        console.log(progress, currentTime, WebOsPlayer.duration, currentPlayingTime);
        // $timeout.cancel(vm.nextMovie);
        // vm.nextMovie = null;
        $timeout(function () {
            if (timeLeft == 0 && WebOsPlayer.duration > 0) {
                utilities.showLoading();
                console.log(timeLeft);
                // var timeLeft = 0;
                // endPosElement.html(WebOsPlayer.formatTime(timeLeft));
                if (TizenAVPlayer.currentTrack < TizenAVPlayer.mediaList.length - 1 && services.attribute === 0) {
                    console.log('phim le');
                    $timeout.cancel(vm.nextMovie);
                    vm.nextMovie = null;
                    vm.nextMovie = $timeout(function () {
                        WebOsPlayer.duration = 0;
                        WebOsPlayer.currentTime = 0;
                        timeLeft = -1;
                        isNext = true;
                        console.log('phim bo');
                        TizenAVPlayer.nextVideo();
                        $("#av-player").show();
                        $rootScope.checkNextMovieList = true;
                        clearTimeout(showMediaControllerTimeout);
                    }, 1000);
                } else {
                    if (services.attribute === 0) {
                        // $timeout(function () {
                        utilities.hideLoading();
                        WebOsPlayer.player.dispose();
                        $rootScope.changeView();
                        // }, 500);
                    } else {
                        checkSuggestMovie();
                        $timeout(function () {
                            utilities.hideLoading();
                            console.log('phim le');
                        }, 500);
                    }
                }
                // endPosElement.html(WebOsPlayer.formatTime(timeLeft));
            }
        }, 800);

        if (Math.min(currentTime, WebOsPlayer.duration) === WebOsPlayer.duration) {
            progressBarMarkerElement.css('width', progressBarBkgdElement.width() + '%');
            progressDot.css('margin-left', (progress) + '%');
            return;
        }
        playPosElement.html(WebOsPlayer.formatTime(currentTime));
        endPosElement.html(WebOsPlayer.formatTime(timeLeft));
        progressBarMarkerElement.css('width', progress + '%');
        progressDot.css('margin-left', (progress) + '%');
    }

    function initLayout() {
        loadingProgress = $('#loading-player');
        videoTitle = $('.video-title-lable');
        sysTime = $('.sys-time');
        playPosElement = $('.play-position');
        endPosElement = $('.end-position');
        progressBarMarkerElement = $('.progress-bar-marker');
        progressBarBkgdElement = $('.progress-bar-bkgd.video');
        progressDot = $('.progress-bar-dot');
    }

    function initLayoutCallBack() {
        operations = $('.operations');
        btnPlayingModeTitle = $('.playing-mode-text')
    }

    function updateTimeout($scope, focusController) {
        if (showMediaControllerTimeout || !$scope.isPlaying) {
            clearTimeout(showMediaControllerTimeout);
        }

        showMediaControllerTimeout = setTimeout(function () {
            $('.video-title').addClass('fade-out');
            $('.controls-bar').addClass('fade-out');
            focusController.focus($('.play-btn'));
        }, controllerConfig.showControllTimeout);
    }

    function showMediaController($scope, focusController) {
        if ($('.controls-bar').hasClass('fade-out')) {
            $('.video-title').removeClass('fade-out');
            $('.controls-bar').removeClass('fade-out');
            focusController.focus($('.play-btn'));
            if ($('#player-content .focused').length === 0) {
                focusController.focus($('.play-btn'));
            }
        }
    }

    function checkProgressBarForcus() {
        var progressEle = document.getElementById("controls_bar");
        if (!progressEle) return false;
        if (progressEle.className.indexOf("fade-out") == -1) return true;
        return false;
    }

    var startTime = new Date().getTime();

    function registerKeyHandler($scope, focusController, $rootScope, $stateParams, utilities, services, $state) {
        var movieId = $stateParams.movieId;
        var playlistId = $stateParams.playlistId;
        var pageIndex = 0;

        function activePlayBtn() {
            keydown = false;
            // utilities.showLoading();
            var checkPlay = setInterval(function () {
                var currentStatus = WebOsPlayer.player.paused();
                if ($scope.isPlaying != currentStatus) {
                    $scope.isPlaying = currentStatus;
                    $scope.$digest();
                    clearInterval(checkPlay);
                }
            }, 100)

        }

        function stepFfAndRw(diffTime) {
            try {
                updateCurrentProgress($("video")[0].currentTime * 1 + diffTime, $rootScope);
            } catch (error) {
                updateCurrentProgress(currentPlayingTime + diffTime, $rootScope);
            }
        }

        $scope.playPauseHandle = function (forcedAction) {
            // if (!forcedAction && $('.controls-bar').hasClass('fade-out')) {
            //     return;
            // }
            $scope.isPlaying = WebOsPlayer.playPause();

            if (!$scope.isPlaying) {
                clearTimeout(showMediaControllerTimeout);
            }
        };

        $scope.rewindHanle = function () {
            WebOsPlayer.rewind(controllerConfig.rewindTimeRange, stepFfAndRw, isForward);
        };

        $scope.forwardHanle = function () {
            WebOsPlayer.rewind(controllerConfig.rewindTimeRange, stepFfAndRw, isForward);
        };


        $scope.focusAction = function () {
            if (doc.getElementById("controls_bar").classList.contains("focused-on-list-video"))
                doc.getElementById("controls_bar").classList.remove("focused-on-list-video");
        };

        $rootScope.stop = function () {
            TizenAVPlayer.close();
            $rootScope.isPlayingMusic = false;
        };

        function saveTime() {
            var data = {
                id: movieId,
                time: currentPlayingTime / 1000,
                type: "FILM"
            };
            services.saveTime(data).then(function (response) {
            })
        }

        function checkPlay() {
            setTimeout(function () {
                $scope.isPlaying = WebOsPlayer.player.paused();
            }, 1000);
        }

        var CurTime = new Date().getTime();
        localStorage.setItem("timeFlag", CurTime);

        TizenAVPlayer.playerKeyEventCallback = function (e) {
            if (CurTime != localStorage.getItem("timeFlag")) return;
            console.log(e.keyCode);
            switch (e.keyCode) {
                case 37:
                    if ($state.current.name == 'avplayer') {
                        if (checkProgressBarForcus()) {
                            clearTimeout(showMediaControllerTimeout);
                            WebOsPlayer.rewind(controllerConfig.rewindTimeRange, stepFfAndRw, isForward);
                            event.stopPropagation();
                            keydown = true;
                            // $rootScope.checkSelectprocess = false;
                        } else {
                            showMediaController($scope, focusController);
                        }
                    }
                    break;
                case 39:
                    if ($state.current.name == 'avplayer') {
                        var current = new Date().getTime();
                        startTime = current;
                        if (checkProgressBarForcus()) {
                            keydown = true;
                            clearTimeout(showMediaControllerTimeout);
                            WebOsPlayer.jump(controllerConfig.forWardTimeRange, stepFfAndRw, isForward);
                            event.stopPropagation();
                            // $rootScope.checkSelectprocess = false;

                        } else {
                            showMediaController($scope, focusController);
                        }
                    }
                    break;
                case 38: //UP arrow

                    if ($state.current.name == 'avplayer') {
                        if ($('.controls-bar').hasClass('fade-out')) {
                            $timeout(function () {
                                if ($rootScope.checkNextMovieList = true) {
                                    $timeout(function () {
                                        showMediaController($scope, focusController);
                                        $rootScope.checkNextMovieList = false;
                                    }, 8000);
                                }
                                showMediaController($scope, focusController);
                            }, 1500);
                            event.stopPropagation();
                        } else if ($('.video-progress-bar-wrapper.focused').length > 0) {
                            focusController.focus($('#play-list .lastIndex'));
                            event.stopPropagation();
                        }
                    }
                    break;
                case 40: //DOWN arrow
                    if ($state.current.name == 'avplayer') {
                        if ($('.controls-bar').hasClass('fade-out')) {
                            $timeout(function () {
                                if ($rootScope.checkNextMovieList = true) {
                                    $timeout(function () {
                                        showMediaController($scope, focusController);
                                        $rootScope.checkNextMovieList = false;
                                    }, 8000);
                                }
                                showMediaController($scope, focusController);
                            }, 1500);
                            event.stopPropagation();
                        }
                    }
                    break;
                case 10252: // MediaPlayPause
                    $scope.playPauseHandle(true);
                    break;
                case 415: // MediaPlay
                    if ($('.btn').hasClass('icon_play')) {
                        $scope.playPauseHandle(true);
                        $timeout(function () {
                            if ($rootScope.checkNextMovieList = true) {
                                $timeout(function () {
                                    showMediaController($scope, focusController);
                                    $rootScope.checkNextMovieList = false;
                                }, 8000);
                            }
                            showMediaController($scope, focusController);
                        }, 1500);
                        clearTimeout(showMediaControllerTimeout);
                        $('.btn').removeClass('opacity-1').add('opacity-0');
                        return;
                    }
                    break;
                case 19: // MediaPause
                    if ($('.btn').hasClass('icon_pause')) {
                        $scope.playPauseHandle(true);
                        $timeout(function () {
                            if ($rootScope.checkNextMovieList = true) {
                                $timeout(function () {
                                    showMediaController($scope, focusController);
                                    $rootScope.checkNextMovieList = false;
                                }, 8000);
                            }
                            showMediaController($scope, focusController);
                        }, 1500);
                        clearTimeout(showMediaControllerTimeout);
                        $('.btn').addClass('opacity-1').remove('opacity-0');
                        return;
                    }
                    break;
                case 413: // MediaStop
                    WebOsPlayer.player.dispose();
                    $rootScope.changeView();
                    break;
                case 417: // MediaFastForward
                    showMediaController($scope, focusController);
                    clearTimeout(showMediaControllerTimeout);
                    keydown = true;
                    WebOsPlayer.jump(controllerConfig.forWardTimeRange, stepFfAndRw, isForward);
                    event.stopPropagation();
                    break;
                case 412: // MediaRewind
                    showMediaController($scope, focusController);
                    clearTimeout(showMediaControllerTimeout);
                    keydown = true;
                    TizenAVPlayer.rew(controllerConfig.rewindTimeRange, stepFfAndRw, activePlayBtn);
                    event.stopPropagation();
                    break;
                case 48: //key 0
                    console.log('suspend');
                    webapis.avplay.suspend();
                    break;
                case 49: //Key 1
                    TizenAVPlayer.set4K();
                    break;
                case 50: //Key 2
                    console.log('restore');
                    webapis.avplay.restore(TizenAVPlayer.mediaUrl, 0, true);
                    //player.getTracks();
                    break;
                case 51: //Key 3
                    //player.getProperties();
                    break;
                case 461: // Return
                    if (showMediaControllerTimeout)
                        clearTimeout(showMediaControllerTimeout);
                    if ($rootScope.$previousState.name == 'avplayer' || $state.current.name == 'avplay') {
                        saveTime();
                        console.log('stop');
                        // TizenAVPlayer.executeAction({
                        //     action: "stop"
                        // });
                        WebOsPlayer.player.dispose();
                    }
                    // setTimeout(function () {
                    if ($state.current.name == 'avplayer') {
                        WebOsPlayer.player.dispose();
                        var data = {
                            id: movieId,
                            time: currentPlayingTime / 1000,
                            type: "FILM"
                        };
                        services.saveTime(data).then(function (response) {
                        })
                    }
                    break;
                case 27: // Return
                    if (showMediaControllerTimeout)
                        clearTimeout(showMediaControllerTimeout);
                    if ($rootScope.$previousState.name == 'avplayer' || $state.current.name == 'avplay') {
                        saveTime();
                        console.log('stop');
                        // TizenAVPlayer.executeAction({
                        //     action: "stop"
                        // });
                        WebOsPlayer.player.dispose();
                    }
                    // setTimeout(function () {
                    if ($state.current.name == 'avplayer') {
                        WebOsPlayer.player.dispose();
                        var data = {
                            id: movieId,
                            time: currentPlayingTime / 1000,
                            type: "FILM"
                        };
                        services.saveTime(data).then(function (response) {
                        })
                    }
                    break;
                case 13 :
                    // $scope.playPauseHandle(true);
                    $scope.playPauseHandle(true);
                    showMediaController($scope, focusController);

                    if ($('.btn').hasClass('icon_play')) {
                        $('#controls_bar').removeClass('fade-in').add('fade-out');
                    }

                    if ($('.btn').hasClass('icon_pause')) {
                        $('#controls_bar').addClass('fade-in').remove('fade-out');
                    }
                    break;
                default:
                    console.log("Unhandled key");
            }

        };
        var keyUp = function (e) {
            if ($state.current.name == 'avplayer') {
                if ($scope.isPlaying)
                    updateTimeout($scope, focusController);
            }
        };

        var visibilitychange = function (e) {
            if (document.hidden) {
                if ($state.current.name == 'avplayer') {
                    // TizenAVPlayer.executeAction({
                    //     action: "pause"
                    // });
                    WebOsPlayer.pause();

                }

            } else {
                if ($state.current.name == 'avplayer') {
                    // TizenAVPlayer.executeAction({
                    //     action: "play"
                    // });
                    WebOsPlayer.playPause();
                }
            }
        };

        document.addEventListener('keydown', TizenAVPlayer.playerKeyEventCallback, true);
        document.addEventListener('keyup', keyUp, true);
        document.addEventListener("visibilitychange", visibilitychange, true);

        return true;
    }

    // function playMedia($scope) {
    //     TizenAVPlayer.close();
    //     loadingProgress.css('display', 'block');
    //     if ($('#controls_bar.focused-on-list-video').length === 1) {
    //         focusController.focus($('.play-btn'));
    //     }
    //
    //     document.getElementById("controls_bar").classList.remove("focused-on-list-video");
    //
    //     var videoUrl = TizenAVPlayer.mediaUrl,
    //         name = media.name;
    //
    //     console.log(videoUrl);
    //     loadBackground();
    //     videoTitle.html(name);
    //     TizenAVPlayer.close();
    //     //TizenAVPlayer.executeAction({ action: "stop" });
    //     setTimeout(function () {
    //         WebOsPlayer.playVideo(videoUrl, avPlayerListenerCallback);
    //         // TizenAVPlayer.playVideo(videoUrl, isDrm);
    //     }, 1000);
    // }

    var timeoutCheckForcus = -1;

    function checkForcusListVideo() {
        var listVideoItemFocused = $("#list-next-video .item-in-text.ng-scope.focused");
        if (listVideoItemFocused.length > 0) {
            document.getElementById("controls_bar").classList.add("focused-on-list-video");
        } else {
            document.getElementById("controls_bar").classList.remove("focused-on-list-video");
        }
    }

    function addEventAttributeChanged() {
        var ele = document.getElementById('list-next-video');
        var observer = new MutationObserver(function (mutations) {
            checkForcusListVideo();
        });
        observer.observe(ele, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    function isObject(item) {
        return (typeof item === "object" && !Array.isArray(item) && item !== null);
    }

    vm.viewContinue = false;
    var idMovie = $state.params.idMovie;
    var currentTypePopup = 0;
    var isConfirm = false;
    var depthDialog = $rootScope.depth.dialog.val;
    var depthDetail = $rootScope.depth.player.val;
    var refreshTokenType = {
        getDetail: '1',
        buyPackage: '2',
        buyFilm: '3'
    };
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
    console.log(services.idItem);

    function configFirmGroup() {
        for (var i = 0; i < vm.listFilms.length; i++) {
            vm.listFilms[i].durationMinute = Math.floor(vm.listFilms[i].duration / 60);
        }
        focusController.focus($('.itemFirst'));
    }

    function setUrlFilmDrm() {
        if (vm.streams.errorCode == 200 && vm.detailFilms.drm_content_id) {
            services.drmUrl = vm.streams.urlStreaming;
            WebOsPlayer.currentTime = vm.data.currentTime > 0 ? vm.data.currentTime : 0;
        }
        else
            services.drmUrl = undefined;
    }

    function setCurrentPopupDefault() {
        $rootScope.currentPopup = undefined;
    }

    function changeDepth(depth) {
        if (depth == depthDetail) {
            setCurrentPopupDefault();
        }
        $timeout(function () {
            focusController.setDepth(depth);
        }, 500);
        if (depth == depthDialog) {
            var focusCancel = setInterval(function () {
                if ($state.current.name == 'movieDetail') {
                    focusController.focus($("#cancel_buy_player"));
                    if ($("#cancel_buy_player").hasClass('focused')) {
                        $rootScope.currentPopup = "popup_movie_detail_1";
                        clearInterval(focusCancel);
                    }
                } else {
                    focusController.focus($(".yes_buy_list"));
                    if ($(".yes_buy_list").hasClass('focused')) {
                        $rootScope.currentPopup = "popup_movie_list_1";
                        clearInterval(focusCancel);
                    }
                }
            }, 100)
        }
    }

    function showHideDialog() {
        $rootScope.currentPopup = 'popup_movie_detail_1';
        var $popup = $("#popup_movie_detail_1");
        if ($state.current.name == 'avplayer')
            $popup = $("#popup_movie_detail_1");
        if ($popup.hasClass('hidden')) {
            $popup.removeClass('hidden');
            $timeout(function () {
                changeDepth(depthDialog);
            }, 100)
        } else {
            $popup.addClass('hidden');
            if ($state.current.name == 'avplayer')
                changeDepth(depthDetail);
            else
                changeDepth(depthDetail);
        }
    }

    function checkBuy(popup) {
        console.log(popup);
        services.popup1 = popup;
        if (popup.is_buy_playlist == typePopup.isBuy.type && !popup.package_id) {
            isConfirm = false;
            currentTypePopup = typePopup.isBuy.type;
            $(".popup_movie_detail_1 .title_messenger").html(typePopup.isBuy.title);
            $(".popup_movie_detail_1 .messenger").html(popup.confirm);
            showHideDialog();
            utilities.showMessenge('Thiết bị chưa hỗ trợ xem phim này');
        } else if (popup.is_buy_playlist == typePopup.isPackage.type && popup.package_id) {
            isConfirm = false;
            currentTypePopup = typePopup.isPackage.type;
            $(".popup_movie_detail_1 .title_messenger").html(typePopup.isPackage.title);
            $(".popup_movie_detail_1 .messenger").html(popup.confirm);
            showHideDialog();
        }
    }

    vm.yes = function () {
        console.log(services.popup1);
        switch (currentTypePopup) {
            case typePopup.isBuy.type :
                if (!isConfirm) {
                    isConfirm = true;
                    $(".popup_movie_detail_1 .messenger").html(services.popup1.confirm_buy_playlist);
                    $("detail_player").removeClass('yes_buy_detail').addClass('yes_buy_detail_yes');
                } else {
                    buyFilm();
                }
                break;
            case typePopup.isPackage.type :
                if (!isConfirm) {
                    isConfirm = true;
                    $(".popup_movie_detail_1 .messenger").html(services.popup1.confirm_register_sub);
                    $("detail_player").removeClass('yes_buy_detail').addClass('yes_buy_detail_yes');
                } else {
                    registerPackage(services.popup1.package_id);
                }
                break;
        }
    };

    vm.cancel = function () {
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
        var id = vm.detailFilms.id;
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
                        setUrlFilmDrm();
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

    function avPlayerListenerCallback(player) {
        $('.end-position').html(player.duration());

        player.on('loadedmetadata', function () {
            console.log('video is done!');
            clearTimeout(showMediaControllerTimeout);
        });

        player.on('loadeddata', function () {
            event.stopPropagation();
            var duration = WebOsPlayer.formatTime(player.duration());
            WebOsPlayer.duration = player.duration();
            $('.end-position').html(duration);
            $("play_btn").blur();
            $timeout(function () {
                clearTimeout(showMediaControllerTimeout);
                utilities.hideLoading();
                console.log('eeee1');
            }, 3000);
        });

        player.on('timeupdate', function () {
            $timeout(function () {
                clearTimeout(showMediaControllerTimeout);
                utilities.hideLoading();
                console.log('eeee1');
            }, 5000);
            $rootScope.isPlaying = true;
            //  if($rootScope.checkLink === true){
            //  }
            // else{
            currentPlayingTime = player.currentTime();
            // }
            $rootScope.checkTime = currentPlayingTime;
            // console.log('xxxxxx', currentPlayingTime);
            updateCurrentProgress(currentPlayingTime);
            try {
                if ($(".mini-player")) {
                    $('.icon-image-poster').addClass('rorate');
                    $('#mini-icon').addClass('mini-pause').removeClass('mini-play');
                    $('#text-pause-play').html('Dừng');
                }
            } catch (ex) {
                console.log(ex);
            }
        });

        player.on('ended', function () {
            console.log("success", services.attribute, services.check);
            if (services.attribute === 0) {
                if (services.check === false) {
                    if (TizenAVPlayer.currentTrack < TizenAVPlayer.mediaList.length - 1) {
                        TizenAVPlayer.nextVideo();
                        isNext = true;
                        console.log('next video');
                    } else {
                        WebOsPlayer.player.dispose();
                        $rootScope.changeView();
                    }
                }
                if (services.check === true) {
                    WebOsPlayer.player.dispose();
                    $rootScope.changeView();
                    services.check = false;
                }
            }
            if (services.attribute === 1) {
                if (services.check === false) {
                    utilities.showLoading();
                    $timeout(function () {
                        utilities.hideLoading();
                        checkSuggestMovie();
                        WebOsPlayer.player.dispose();
                    }, 2000);

                }
                if (services.check === true) {
                    WebOsPlayer.player.dispose();
                    $rootScope.changeView();
                    services.check = false;
                }
            }
        });
        player.on('canplay', function () {
            // setCurrentTime(player);
        })
    }


}



