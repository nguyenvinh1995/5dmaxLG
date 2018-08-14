'use strict';

angular.module('app.movie').controller('listSeriMoviesCtrl', listSeriMoviesCtrl);

listSeriMoviesCtrl.$inject = ['$scope', 'services', 'focusController', 'FocusUtil', '$timeout', '$state', '$stateParams', 'utilities', '$rootScope', 'settings'];

function listSeriMoviesCtrl($scope, services, focusController, FocusUtil, $timeout, $state, $stateParams, utilities, $rootScope, settings) {

    var vm = this;
    utilities.showLoading();
    vm.category = [];
    vm.content = [];
    var enableCategory = true;
    vm.activeId = 0;
    vm.itemInPage = 5;
    vm.currentItem;
    services.getSetting().then(function (response) {
        var data = response.data;
        vm.category = data.countries;
        console.log(vm.category);
        initFocus();
        utilities.hideLoading();
    });
    vm.showFilm = function (bool, id, item) {
        if (bool === true && id != null) {
            vm.srcImg = '';
            if(!enableCategory)
                enable();
            $(".genres2").removeClass('move-left');
            $(".img-arrow-left").addClass('display-none').removeClass('display-block');
            if(vm.activeId == item.id) {
                return;
            }
            vm.currentItem = item;
            vm.activeId = item.id;
            console.log(vm.activeId);
            console.log(item);
            services.getListSeriMovies(id).then(function (response) {
                console.log(id);
                vm.data = response.data;
                vm.content = vm.data.content;
                $("#list-movie").trigger('reload');
            });
        }
        if (bool === false && item != null) {
            // if(enableCategory)
            //     disable();
            $(".genres2").addClass('move-left');
            $(".img-arrow-left").addClass('display-block').removeClass('display-none');
            vm.srcImg = item.imageForTVLarge;
            vm.item = item;
            vm.selectMovie = function(item) {
                $rootScope.index_item = 0;
                $state.go('movieDetail', {id:item.id}, { reload : true });
            }
        }
    };

    // function disable() {
    //     for (var i = 0; i < vm.category.length; i++) {
    //         if(vm.category[i].id != vm.activeId) {
    //             var id = $("#category_seri_"+vm.category[i].id);
    //             focusController.disable(id);
    //             enableCategory = false;
    //         }
    //     }
    // }
    //
    // function enable() {
    //     for (var i = 0; i < vm.category.length; i++) {
    //         var id = $("#category_seri_"+vm.category[i].id);
    //         focusController.enable(id);
    //         enableCategory = true;
    //     }
    // }

    function initFocus () {
        var timeFocus = setInterval(function(){
            focusController.focus($('.category_seri_active'));
            if($('.category_seri_active').hasClass('focused')){
                clearInterval(timeFocus);
            }
        },100)
    }


}