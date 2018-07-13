'use strict';

angular.module('app.movie').controller('listMoviesCtrl', listMoviesCtrl);

listMoviesCtrl.$inject = ['$scope', 'services', 'focusController', 'FocusConstant', 'FocusUtil', '$timeout', '$state', '$stateParams', 'utilities', '$rootScope', 'settings'];

function listMoviesCtrl($scope, services, focusController, FocusConstant, FocusUtil, $timeout, $state, $stateParams, utilities, $rootScope, settings) {

    var vm = this;
    utilities.showLoading();
    vm.content = [];
    vm.category = [];
    vm.itemInPage = 5;
    var enableCategory = true;
    vm.activeId = 0;
    vm.currentItem;
    services.getSetting().then(function (response) {
        var data = response.data;
        vm.category = data.categories;
        console.log(vm.category);
        initFocus();
        // utilities.hideLoading();
    });
    vm.showFilm = function (bool, id, item) {
        if (bool === true && id != null) {
            vm.srcImg = '';
            $(".genres2").removeClass('move-left');
            $(".img-arrow-left").addClass('display-none').removeClass('display-block');
            // if (!enableCategory)
            //     enable();
            if(vm.activeId == item.id) {
                return;
            }
            vm.currentItem = item;
            vm.activeId = item.id;
            services.getListMovies(id).then(function (response) {
                var data = response.data;
                vm.content = data.content;
                $("#list-movie").trigger('reload');
            });
        }
        if (bool === false && item != null) {
            // if (enableCategory)
            //     disable();
            $(".genres2").addClass('move-left');
            $(".img-arrow-left").addClass('display-block').removeClass('display-none');
            vm.srcImg = item.imageForTVLarge;
            vm.item = item;
            vm.selectMovie = function (item) {
                $rootScope.index_item = 0;
                $state.go('movieDetail', {id: item.id}, {reload: true});
            };
        }
    };

    vm.blur = function (item) {
    };
    function initFocus() {
        var timeFocus = setInterval(function () {
            focusController.focus($('.category_movie_active'));
            if ($('.category_movie_active').hasClass('focused')) {
                clearInterval(timeFocus);
                utilities.hideLoading();
            }
        }, 100);
    }

    // function disable() {
    //     for (var i = 0; i < vm.category.length; i++) {
    //         if (vm.category[i].id != vm.activeId) {
    //             var id = $("#category_" + vm.category[i].id);
    //             focusController.disable(id);
    //             enableCategory = false;
    //         }
    //     }
    // }
    //
    // function enable() {
    //     for (var i = 0; i < vm.category.length; i++) {
    //         var id = $("#category_" + vm.category[i].id);
    //         focusController.enable(id);
    //         enableCategory = true;
    //     }
    // }

    $scope.$on('$viewContentLoaded', function () {
        initFocus()
    })

}