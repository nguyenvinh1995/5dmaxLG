'use strict';

angular.module('app.movie').controller('searchCtrl', searchCtrl);

searchCtrl.$inject = ['$scope', 'services', 'focusController', 'FocusUtil', '$timeout', '$state', '$stateParams', 'utilities', '$rootScope', 'settings'];

function searchCtrl($scope, services, focusController, FocusUtil, $timeout, $state, $stateParams, utilities, $rootScope, settings) {

    var vm = this;
    vm.showListMovie = false;
    vm.listSearchMovie = [];
    vm.searchText = '';
    vm.searchData = null;

    function searchMovie(key) {
        $timeout.cancel(vm.showSearch);
        vm.showSearch = null;
        vm.showSearch = $timeout(function () {
            utilities.showLoading();
            services.getSearch(key).then(function (response) {
                utilities.hideLoading();
                // vm.searchText = "";
                // if (response.responseCode !== '200' || response.data.length === 0) {
                //     utilities.showMessenge("Không tìm thấy kết quả nào.");
                // } else {
                    if (response.data.length > 0) {
                        $("#text-search").addClass('display-none').removeClass('display-block');
                        vm.showListMovie = true;
                        vm.listSearchMovie = response.data[0].content;
                        $("#list_search").trigger('reload');
                    }
                // }
            });
        }, 1000);
    }

    services.getSetting().then(function (response) {
        var data = response.data;
        vm.hotKey = data.hotKeywords;
        console.log(vm.hotKey);
    });
    $scope.$watch('vm.searchText', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            searchMovie(newVal);
            console.log('time');
        }
    });


    vm.hotkey = function (item) {
        vm.searchText = item;
    };

    vm.back = function () {
        $rootScope.changeView();
    };

    // $scope.back = function () {
    //     window.history.back();
    // };

    vm.enterText = function (text) {
        vm.searchText += text;
    };

    vm.onKeyboardDel = function () {
        vm.searchText = '';
        vm.searchData = [];
    };


    //     services.getSearchSuggestion(vm.searchText).then(function (response) {
    //         utilities.hideLoading();
    //         console.log(vm.Number, vm.searchText);
    //         if (response.data.length > 0) {
    //             vm.showListMovie = true;
    //             vm.listSearchMovie = response.data[0].content;
    //             $("#list_search").trigger('reload');
    //         }
    //     });
    // }

    vm.selectMovie = function (item) {
        $state.go('movieDetail', {id: item.id}, {reload: true});
    };

    // function init() {
    //     document.body.addEventListener('keydown', function (event) {
    //         switch (event.keyCode) {
    //             case 65376: // Done
    //                 if ($state.current.name == 'search' && vm.searchText.trim() != '')
    //                     searchMovie(vm.searchText);
    //                 break;
    //             case 13: // Done
    //                 if ($state.current.name == 'search' && vm.searchText.trim() != '')
    //                     searchMovie(vm.searchText);
    //                 break;
    //             default :
    //                 break;
    //         }
    //     })
    // }

    function initFocus() {
        $("#text-search").addClass('display-block').removeClass('display-none');
        var timeFocus = setInterval(function () {
            focusController.focus($('#initFocusKeybroad'));
            if ($('#initFocusKeybroad').hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100)
    }

    $scope.$on('$viewContentLoaded', function (event) {
        initFocus();
    });

}