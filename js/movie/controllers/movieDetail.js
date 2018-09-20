'use strict';

angular.module('app.movie').controller('movieDetailCtrl', movieDetailCtrl);

movieDetailCtrl.$inject = ['$scope', '$timeout', '$state', '$window', 'services', 'settings', 'FocusUtil', 'focusController', '$rootScope', '$http', 'utilities'];

function movieDetailCtrl($scope, $timeout, $state, $window, services, settings, FocusUtil, focusController, $rootScope, $http, utilities) {

    var vm = this;
    var count = 0;
    utilities.showLoading();
    vm.actor = "";
    vm.type = "";
    vm.listFilms = [];
    vm.viewContinue = false;
    var currentItemPlay = {};
    var currentContinueMovie = {};
    var isConfirm = false;
    var currentIsContinue = false;
    services.check = false;
    var currentTypePopup = 0;
    var heightCategory = 0;
    var depthDialog = $rootScope.depth.dialog.val;
    var depthDetail = $rootScope.depth.detail.val;
    var depthList = $rootScope.depth.listMovie.val;
    var refreshTokenType = {
        getDetail: '1',
        buyPackage: '2',
        buyFilm: '3',
        likeUnlike: '4',
        playItem: '5',
        playDefault: '6'

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
    var id = $state.params.id;
    var idMovie = $state.params.idMovie;
    var stringLike = "Thêm vào xem sau";
    var stringUnLike = "Xóa xem sau";
    var btn_likeUnLike = $("#likeUnLike .text-btn");
    var icon_likeUnLike = $("#likeUnLike .img-tool");


    console.log(idMovie);

    if (id !== undefined) {
        getFilm(id, idMovie);
    }

    function getFilm(id, idMovie) {
        console.log(idMovie, id);
        services.getDetailFilm(id, idMovie).then(function (response) {
            console.log(response);
            if (response.responseCode === '201' || response.responseCode === '404') {
                utilities.showMessenge(response.message, true);
                $rootScope.changeView();
                utilities.hideLoading();
                return;
            }
            if (response.responseCode == utilities.errorCode.success) {
                console.log(response.responseCode, response.errorCode);
                // $("#movie-detail").removeClass('hidden');
                var data = response.data;
                services.trailerId = Number(data.detail.video_trailer);
                services.imgCurrentItem = data.detail.avatarImageH;
                $rootScope.idTrailers = data.detail.video_trailer;
                services.attribute = Number(data.detail.attributes);
                console.log(services.imgCurrentItem);
                vm.data = data;
                vm.detailFilms = data.detail;
                vm.listFilms = data.parts;
                vm.ep = vm.listFilms.length;
                vm.streams = data.streams;
                setUrlFilmDrm();
                trailerShow();
                currentContinueMovie = findPart(vm.detailFilms.currentVideoId, vm.listFilms);
                $rootScope.index_item = parseInt(currentContinueMovie.index);
                if (data.currentTime && data.currentTime != 0) {
                    // console.log(data);
                    // console.log(data.currentTime);
                    vm.viewContinue = true;
                    WebOsPlayer.currentTime = data.currentTime;
                    vm.currentTime = data.currentTime;
                    if (Object.keys(currentContinueMovie).length > 0) {
                        // var processBar = currentContinueMovie.duration;
                        // var progress = Math.min(data.currentTime, processBar) / processBar * $('.progress-bar-bkgd').width();
                        // $('.progress-bar-marker').css('width', progress + '%');
                        var alias = currentContinueMovie.alias;
                        if (vm.detailFilms.attributes == "1") {
                            alias = "";
                        }
                        $("#btn_continue .text-btn").html("Xem tiếp " + alias);
                    }
                    focus($("#btn_continue"));
                } else {
                    focus($("#btn_common"));
                }
                if (vm.streams.errorCode == "403") {
                    /*refresh token*/
                    refreshToken(refreshTokenType.getDetail);
                }

                TizenAVPlayer.mediaList = vm.listFilms;
                TizenAVPlayer.currentTrack = 0;
                if (vm.detailFilms.attributes === "0") {
                    configFirmGroup();
                }
                if (vm.detailFilms.isFavourite == 1) {
                    like();
                } else {
                    unlike();
                }
                createActor();
                createCategory();
                utilities.hideLoading();
                if (services.backDetailFormLogin) {
                    var item = $rootScope.itemFromListMovie;
                    if (item != null) {
                        // focusController.focus($("#list_"+item.id));
                        vm.playMovie(item)

                    } else {
                        vm.goToPlayer(vm.viewContinue);
                    }
                    services.backDetailFormLogin = false;
                } else {
                    utilities.hideLoading();
                }
            } else {
                utilities.showMessenge(response.message);
            }

            utilities.hideLoading();
            initFocus();
        });
    }


    function findPart(id, parts) {
        for (var i = 0; i < parts.length; i++) {
            if (parts[i].id == id) {
                return parts[i];
            }
        }
        return {};
    }

    function setUrlFilmDrm() {
        if (vm.streams.errorCode == 200 && vm.detailFilms.drm_content_id) {
            services.drmUrl = vm.streams.urlStreaming;
            WebOsPlayer.currentTime = vm.data.currentTime > 0 ? vm.data.currentTime : 0;
        }
        else
            services.drmUrl = undefined;
    }

    vm.likeOrUnlike = function () {
        if (services.checkLogin()) {
            if (vm.detailFilms.id) {
                services.likeUnlike(vm.detailFilms.id).then(function (response) {
                    var responseCode = response.responseCode;
                    switch (responseCode) {
                        case utilities.errorCode.success:
                            if (response.data) {
                                if (response.data.isLike) {
                                    like();
                                    utilities.showMessenge("Đã thêm vào xem sau");
                                } else {
                                    unlike();
                                    utilities.showMessenge("Đã xóa khỏi xem sau");
                                }
                            }
                            break;
                        case utilities.errorCode.tokenExpire :
                            refreshToken(refreshTokenType.likeUnlike);
                            break;
                        case utilities.errorCode.login :
                            $state.go("login_form", {}, {reload: true});
                            break;
                    }
                })
            }
        } else {
            $state.go("login_form", {}, {reload: true});
        }
    };

    function like() {
        btn_likeUnLike.html(stringUnLike);
        $(".img-tool.img-remove").removeClass('hidden');
        $(".img-tool.img-add").addClass('hidden');
        // vm.isLike = false;
    }

    function unlike() {
        btn_likeUnLike.html(stringLike);
        $(".img-tool.img-remove").addClass('hidden');
        $(".img-tool.img-add").removeClass('hidden');
        // vm.isLike = true;;
    }

    function createActor() {
        var first = true;
        for (var i = 0; i < vm.detailFilms.infos.length; i++) {
            if (vm.detailFilms.infos[i].type === "1") {
                if (first)
                    first = false;
                else
                    vm.actor += ", ";
                vm.actor += vm.detailFilms.infos[i].name;
            }
        }
    }

    function createCategory() {
        for (var j = 0; j < vm.detailFilms.categories.length; j++) {
            if (j !== 0)
                vm.type += ", ";
            vm.type += vm.detailFilms.categories[j].name;
        }
    }

    function configFirmGroup() {
        for (var i = 0; i < vm.listFilms.length; i++) {
            vm.listFilms[i].durationMinute = Math.floor(vm.listFilms[i].duration / 60);
        }
        focusController.focus($('.itemFirst'));
    }

    $scope.selectList = function () {
        $rootScope.itemFromListMovie = null;
        $state.go('movieList', {id: vm.detailFilms.id, idMovie: idMovie}, {reload: true});
    };

    vm.goToPlayer = function (isContinue) {
        console.log(services.isLogin, 'rtry');
        var mId;
        if (vm.detailFilms.drm_content_id != null && services.supportDrm == false) {
            utilities.showMessenge("Thiết bị chưa hỗ trợ xem phim này");
            return;
        }
        if (idMovie) {
            mId = idMovie;
        } else
            mId = vm.listFilms[0].id;
        currentIsContinue = isContinue;
        if (!isContinue)
            WebOsPlayer.currentTime = 0;
        currentItemPlay = {
            id: mId
        };
        TizenAVPlayer.name = vm.detailFilms.name;
        if (Object.keys(currentContinueMovie).length > 0) {
            TizenAVPlayer.description = currentContinueMovie.description;
            if (vm.detailFilms.attributes == "1")
                TizenAVPlayer.alias = "";
            else
                TizenAVPlayer.alias = currentContinueMovie.alias;
            TizenAVPlayer.currentTrack = currentContinueMovie.index - 1;
        } else {
            TizenAVPlayer.description = vm.listFilms[0].description;
            if (vm.detailFilms.attributes == "1")
                TizenAVPlayer.alias = "";
            else
                TizenAVPlayer.alias = vm.listFilms[0].alias;
        }
        if (services.isLogin === false) {
            $state.go('login_form', {playlistId: vm.detailFilms.id, movieId: mId}, {reload: true});
            return;
        }
        if (services.checkLogin() || vm.streams.errorCode != '401' || services.isLogin === true) {
            if (vm.detailFilms.drm_content_id === null || vm.detailFilms.drm_content_id === '') {
                if (vm.streams.errorCode == '201' && vm.streams.popup) {
                    utilities.hideLoading();
                    if (isObject(vm.streams.popup))
                        checkBuy(vm.streams.popup);
                    else
                        utilities.showMessenge(vm.streams.message);
                    return;
                } else if (vm.streams.errorCode == utilities.errorCode.tokenExpire) {
                    refreshToken(refreshTokenType.playDefault);
                    return;
                }
                $state.go('avplayer', {
                    playlistId: vm.detailFilms.id,
                    movieId: mId,
                    drmId: vm.detailFilms.drm_content_id
                });
                utilities.hideLoading();
            } else {
                utilities.showMessenge('Thiết bị chưa hỗ trợ xem phim này');
            }
        }
        else {
            $state.go('login_form', {playlistId: vm.detailFilms.id, movieId: mId}, {reload: true});
        }
    };

    // services.getTrailer(services.idTrailer).then(function (response) {
    //     console.log(response);
    //     services.playTrailer = response.data.streams.urlStreaming;
    //     vm.videoTrailer = services.playTrailer;
    // });
    //
    // vm.trailer = function (check) {
    //     console.log(services.check);
    //     services.check = check;
    //     console.log(services.playTrailer);
    //     $state.go('avplayer', {playlistId: vm.detailFilms.id, movieId: vm.listFilms[0].id});
    // };

    function trailerShow() {
        console.log(services.trailerId);
        services.getTrailer(services.trailerId).then(function (response) {
            console.log(response);
            services.playTrailer = response.data.streams.urlStreaming;
            vm.videoTrailer = services.playTrailer;
        });

        vm.trailer = function (check) {
            // vm.checkPlayTrailer = check;
            services.check = check;
            console.log(services.idTrailer, services.playTrailer);
            $state.go('avplayer', {playlistId: vm.detailFilms.id, movieId: vm.listFilms[0].id});
        };

    }


    vm.playMovie = function (item) {
        console.log(services.isLogin, 'rtry');
        console.log(item);
        if (vm.detailFilms.drm_content_id != null && services.supportDrm == false) {
            utilities.showMessenge("Thiết bị chưa hỗ trợ xem phim này");
            return;
        }
        currentItemPlay = item;
        TizenAVPlayer.name = vm.detailFilms.name;
        WebOsPlayer.currentTime = 0;
        TizenAVPlayer.description = item.description;
        if (vm.detailFilms.attributes == "1")
            TizenAVPlayer.alias = "";
        else
            TizenAVPlayer.alias = item.alias;
        TizenAVPlayer.currentTrack = item.index - 1;
        if (services.isLogin === false) {
            item.movieId = vm.detailFilms.id;
            $rootScope.itemFromListMovie = item;
            $state.go('login_form', {playlistId: vm.detailFilms.id, movieId: item.id}, {reload: true});
            return;
        }
        if (services.checkLogin() || vm.streams.errorCode != '401') {
            if (vm.streams.errorCode == '201' && vm.streams.popup) {
                utilities.hideLoading();
                if (isObject(vm.streams.popup))
                    checkBuy(vm.streams.popup);
                else {
                    utilities.showMessenge(vm.streams.message);
                    showHideDialog();
                }
                return;
            } else if (vm.streams.errorCode == utilities.errorCode.tokenExpire) {
                refreshToken(refreshTokenType.playItem);
                return;
            }
            $state.go('avplayer', {
                playlistId: vm.detailFilms.id,
                movieId: item.id,
                drmId: vm.detailFilms.drm_content_id
            });
            utilities.hideLoading();
        }
        else {
            item.movieId = vm.detailFilms.id;
            $rootScope.itemFromListMovie = item;
            $state.go('login_form', {playlistId: vm.detailFilms.id, movieId: item.id}, {reload: true});
        }
    };

    function isObject(item) {
        return (typeof item === "object" && !Array.isArray(item) && item !== null);
    }

    function setCurrentPopupDefault() {
        $rootScope.currentPopup = undefined;
    }

    function changeDepth(depth) {
        if (depth == depthDetail || depth == depthList) {
            setCurrentPopupDefault();
        }
        $timeout(function () {
            focusController.setDepth(depth);
        }, 500);
        if (depth == depthDialog) {
            var focusCancel = setInterval(function () {
                if ($state.current.name == 'movieDetail') {
                    focusController.focus($("#cancel_buy_detail"));
                    if ($("#cancel_buy_detail").hasClass('focused')) {
                        $rootScope.currentPopup = "popup_movie_detail";
                        clearInterval(focusCancel);
                    }
                } else {
                    focusController.focus($(".cancel_buy_list"));
                    if ($(".cancel_buy_list").hasClass('focused')) {
                        $rootScope.currentPopup = "popup_movie_list";
                        clearInterval(focusCancel);
                    }
                }
            }, 100)
        }
    }

    function showHideDialog() {
        var $popup = $("#popup_movie_list");
        if ($state.current.name == 'movieDetail')
            $popup = $("#popup_movie_detail");
        if ($popup.hasClass('hidden')) {
            $popup.removeClass('hidden');
            $timeout(function () {
                changeDepth(depthDialog);
            }, 100)
        } else {
            $popup.addClass('hidden');
            if ($state.current.name == 'movieDetail')
                changeDepth(depthDetail);
            else
                changeDepth(depthList);
        }
    }

    function checkBuy(popup) {
        if (popup.is_buy_playlist == typePopup.isBuy.type && !popup.package_id) {
            utilities.showMessenge('Thiết bị chưa hỗ trợ xem phim này');
            // isConfirm = false;
            // currentTypePopup = typePopup.isBuy.type;
            // showHideDialog();
            // $(".popup_movie_detail .title_messenger").html(typePopup.isBuy.title);
            // $(".popup_movie_detail .messenger").html(popup.confirm);
        } else if (popup.is_buy_playlist == typePopup.isPackage.type && popup.package_id) {
            isConfirm = false;
            currentTypePopup = typePopup.isPackage.type;
            showHideDialog();
            $(".popup_movie_detail .title_messenger").html(typePopup.isPackage.title);
            $(".popup_movie_detail .messenger").html(popup.confirm);
        }
    }

    vm.yes = function () {
        switch (currentTypePopup) {
            // case typePopup.isBuy.type :
            //     if (!isConfirm) {
            //         isConfirm = true;
            //         $(".popup_movie_detail .messenger").html(vm.streams.popup.confirm_buy_playlist);
            //     } else {
            //         buyFilm();
            //     }
            //     break;
            case typePopup.isPackage.type :
                if (!isConfirm) {
                    isConfirm = true;
                    $(".popup_movie_detail .messenger").html(vm.streams.popup.confirm_register_sub);
                } else {
                    registerPackage(vm.streams.popup.package_id);
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


    // function buyFilm() {
    //     var type = "PLAYLIST";
    //     var id = vm.detailFilms.id;
    //     utilities.showLoading();
    //     services.buy(id, type).then(function (response) {
    //         if (response.responseCode == '403') {
    //             utilities.hideLoading();
    //             refreshToken(refreshTokenType.buyFilm);
    //         } else if (response.responseCode == '200') {
    //             utilities.showMessenge('Mua lẻ thành công');
    //             setTimeout(function () {
    //                 services.getDetailFilm(id, idMovie).then(function (response) {
    //                     utilities.hideLoading();
    //                     var data = response.data;
    //                     vm.data = data;
    //                     if (data.streams)
    //                         vm.streams = data.streams;
    //                     setUrlFilmDrm();
    //                     vm.playMovie(currentItemPlay);
    //                 })
    //             }, 500)
    //
    //         } else {
    //             utilities.hideLoading();
    //             utilities.showMessenge('Mua lẻ không thành công');
    //             showHideDialog();
    //         }
    //     })
    // }

    function focus(id) {
        var timeFocusDetail = setInterval(function () {
            focusController.focus(id);
            if (id.hasClass('focused') && $state.current.name == 'movieDetail') {
                clearInterval(timeFocusDetail);
            }
        }, 100)
    }

    function initFocus() {
        if ($state.current.name == 'movieDetail') {
            var detail = $rootScope.depth.detail;
            console.log('change depth detail');
            if ($rootScope.currentDepth.val != detail.val) {
                $rootScope.changeDepth(detail);
            }
        } else {
            var item = services.itemFromListMovie;
            var timeFocus = setInterval(function () {
                if (item == null) {
                    focusController.focus($('.active_list_film'));
                    if ($('.active_list_film').hasClass('focused') && $state.current.name == 'movieList') {
                        services.itemFromListMovie == null;
                        clearInterval(timeFocus);
                    }
                } else {
                    focusController.focus($('.list_' + item.id));
                    if ($('.list_' + item.id).hasClass('focused') && $state.current.name == 'movieList') {
                        clearInterval(timeFocus);
                        services.itemFromListMovie == null;
                    }
                }
            }, 100)
        }
    }

    function refreshToken(type) {
        services.refreshToken().then(function (res) {
            if (res.responseCode == utilities.errorCode.success) {
                switch (type) {
                    case  refreshTokenType.getDetail :
                        services.getDetailFilm(id, idMovie).then(function (response) {
                            var data = response.data;
                            vm.data = data;
                            if (data.streams)
                                vm.streams = data.streams;
                            setUrlFilmDrm();
                        });
                        break;
                    case refreshTokenType.buyPackage :
                        registerPackage(vm.streams.popup.package_id);
                        break;
                    case refreshTokenType.buyFilm :
                        buyFilm();
                        break;
                    case refreshToken.likeUnlike :
                        vm.likeOrUnlike();
                        break;
                    case refreshTokenType.playItem :
                        services.getDetailFilm(id, idMovie).then(function (response) {
                            var data = response.data;
                            vm.data = data;
                            if (data.streams)
                                vm.streams = data.streams;
                            setUrlFilmDrm();
                            vm.playMovie(currentItemPlay);
                        });
                        break;
                    case refreshTokenType.playDefault :
                        services.getDetailFilm(id, idMovie).then(function (response) {
                            var data = response.data;
                            vm.data = data;
                            if (data.streams)
                                vm.streams = data.streams;
                            vm.goToPlayer(currentIsContinue);
                        });
                        break;
                }
            } else {
                if (type == refreshTokenType.getDetail)
                    return;
                utilities.hideLoading();
                utilities.showMessenge(utilities.tokenExpireMessenger, true);
                $rootScope.errorVerify = true;
                $state.go('login_form');
            }
        })
    }

    vm.focusListMovie = function ($event, items, startIndex, $index) {
        $('#search').addClass('display-no-top');

        if (heightCategory == 0) {
            heightCategory = $('#listMovie_0').outerHeight(true);
        }
        console.log(heightCategory);
        if ($index >= startIndex) {
            $('#list_item').css({
                transform: 'translate3d(0, -' + (($index - startIndex) * heightCategory) + 'px, 0)'
            });
        } else if ($index === 0) {
            $('#list_item').css({
                transform: 'translate3d(0, 0px, 0)'
            });
        }
    };

    // $scope.$on('$viewContentLoaded', function(event) {
    //     initFocus();
    // })
}