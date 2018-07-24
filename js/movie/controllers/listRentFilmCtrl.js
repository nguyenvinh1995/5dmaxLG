'use strict';

angular.module('app.movie').controller('listRentFilmCtrl', listRentFilmCtrl);

listRentFilmCtrl.$inject = ['$scope', '$timeout', '$state', '$window', 'services', 'settings', 'FocusUtil', 'focusController', '$rootScope', '$compile', 'FocusConstant', 'utilities'];

function listRentFilmCtrl($scope, $timeout, $state, $window, services, settings, FocusUtil, focusController, $rootScope, $compile, FocusConstant, utilities) {

    var vm = this;
    vm.banner = [];
    vm.homeFilms = [];
    vm.currentCategory = 0;
    vm.currentItem = [];
    vm.isFocuseMovie = false;
    // vm.checkTrailer = false;
    var lengthCategory = 0;
    var lastCategory = [];
    var heightCategory = 0;
    var currentIndexBanner = 0;
    var currentBannerItem = {};
    // utilities.showLoading();
    // var timeFocus = setInterval(function () {
    services.getHomeFilmv2(2).then(function (response) {
        vm.homeFilms = response.data;
        vm.banner = vm.homeFilms[0].content;
        currentBannerItem = vm.banner[0];
        services.backgroundMenu = currentBannerItem.imageForTVLarge;
        var raw = '';
        for (var i = 0; i < vm.homeFilms.length; i++) {
            raw += '<div class="list_movies overlay" ng-class="{ \'overlay\' : vm.currentCategory != ' + i + ' } "id="list_' + i + '">'
                + '<p class="list_title">{{vm.homeFilms[' + i + '].name}}</p>'
                + '<div class="movies scroll-movie">'
                + '<div class="list-scroll-wrapper" ng-repeat="obj in vm.homeFilms[' + i + '].content" > '
                + '<div class="item" ng-class="{ \'first_category_items\' : !$index && ' + i + ' == 0}"'
                + 'focusable="{name:\'menu-rent-' + i + '-{{$index}}\',depth : $root.depth.list.val , nextFocus : { up : ' + i + ' == 0  ? \'btn_pl\' : \'\',right : $last ? \'menu-rent-' + i + '-0\' : \'{{\'menu-rent-' + i + '-\' + ($index + 1)}}\',down: $last ? \'\' : \'menu-rent-' + (i + 1) + '-0\'}}"'
                + 'on-selected="vm.selectMovie(obj)" on-blurred="vm.blurItem($event, $originalEvent, ' + i + ' , obj , $index )" on-focused="vm.focusItem($event, $originalEvent, 4, obj , $index,' + i + ')">'
                + '<div id="test" style="background:url(\'{{obj.coverImageH ? obj.coverImageH : obj.coverImage}}\') no-repeat"></div>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>'

        }
        lengthCategory = vm.homeFilms.length - 1;
        lastCategory = vm.homeFilms.length;
        angular.element(document.getElementById('list_container_rent')).append($compile(raw)($scope));
        utilities.hideLoading();

        //     if ($('.first_category_item').hasClass('focused')) {
        //         clearInterval(timeFocus);
        //         utilities.hideLoading();
        //     }
        // }, 100);
    });
///// ITEM

    vm.blurItem = function ($event, $originalEvent, category, item, $index) {
        clearTimeout(vm.ShowTrailer);
        $(".movie_article_wrapper").removeClass('background-none');
        $("#av-container-rent").addClass('display-trainer');
        // $("#av-player").addClass('display-trainer');
        WebOsPlayer.player.dispose();
        console.log('stop-trailer')
    };
    vm.focusItem = function ($event, $originalEvent, startIndex, item, $index, category) {
        if (vm.isFocuseMovie == false) {
            vm.isFocuseMovie = true;
            $('#list_container_rent').removeClass('lastCategory');
        }

        ///Trailer-Focus//////

        $rootScope.idTrailer = item.trailer;
        if (item.trailer !== '0' && item.trailer) {
            services.getTrailer(item.trailer).then(function (response) {
                console.log(response);
                if (response.responseCode == 200) {
                    vm.ShowGif = $timeout(function () {
                        $rootScope.mediaTrailer = response.data.streams.urlStreaming;
                        var raw = '';
                        raw += '<video id=av-player class="video-js vjs-default-skin"></video>';
                        angular.element(document.getElementById('av-container')).append($compile(raw)($scope));
                        showTrailer();
                        console.log('play-trailer')
                    }, 4000);
                    $timeout.cancel(vm.show);
                    vm.show = null;
                    vm.show = $timeout(function () {
                        // $("#av-player").removeClass('display-trainer');
                        $("#av-container").removeClass('display-trainer');
                        $(".movie_article_wrapper").addClass('background-none');
                    }, 7000);
                }
            });
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
                $('#list_container_rent').css({
                    transform: 'translate3d(0, 0, 0)'
                });
                // }
                vm.currentCategory = 1;
            }
            if (category > vm.currentCategory) {
                var val = (category - 1) * (heightCategory + 167);
                if (category == lengthCategory && !lastCategory) {
                    val -= heightCategory;
                    $('#list_container_rent').addClass('lastCategory');
                }

                $('#list_container_rent').css({
                    transform: 'translate3d(0, -' + val + 'px, 0)'
                });
                vm.currentCategory = category;
            }
            /*key up*/
            if (category < vm.currentCategory && category > 1) {
                $('#list_container_rent').removeClass('lastCategory');
                var val = (category - 1) * (heightCategory + 167);
                $('#list_container_rent').css({
                    transform: 'translate3d(0, -' + val + 'px,0)'
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
                transform: 'translateX(-' + ((tempWidth * blockToTransform + (blockToTransform * 32)) / 24) + 'rem)'
            });
        } else if ($index === 0) {
            $wrapper.css({
                transform: 'translateX(0px)'
            });
        }
    };


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
        console.log('show-trailer',mediaUrl);
        setTimeout(function () {
            WebOsPlayer.playVideo(mediaUrl, avPlayerListenerCallback);
        }, 100);
    }



////////

    vm.selectMovie = function (obj) {
        var id = "";
        var idMovie;
        clearTimeout(vm.ShowTrailer);
        $timeout.cancel(vm.ShowTrailer);
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
        // utilities.showLoading();
        var timeFocus = setInterval(function () {
            focusController.focus($('.first_category_items'));
            if ($('.first_category_items').hasClass('focused')) {
                clearInterval(timeFocus);
                utilities.hideLoading();
            }
        }, 100);
    }

    // $scope.$on('$viewContentLoaded', function (event) {
    //     initFocus();
    // });

    $scope.$on('$viewContentLoaded', function (event) {
        initFocus()
    });

}

