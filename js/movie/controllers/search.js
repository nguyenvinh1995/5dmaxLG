'use strict';

angular.module('app.movie').controller('searchCtrl', searchCtrl);

searchCtrl.$inject = ['$scope', 'services', 'focusController', 'FocusUtil', '$timeout', '$state', '$stateParams', 'utilities', '$rootScope', 'settings'];

function searchCtrl($scope, services, focusController, FocusUtil, $timeout, $state, $stateParams, utilities, $rootScope, settings) {

    var vm = this;
    vm.showListMovie = false;
    vm.listSearchMovie = [];
    vm.listSearchMovieSugest = [];
    vm.searchText = '';
    vm.searchData = null;
    var heightCategory = 0;
    var heightCate = 0;

    // vm.currentCategory = 0;


    function searchMovie(key) {
        $timeout.cancel(vm.showSearch);
        vm.showSearch = null;
        vm.showSearch = $timeout(function () {
            utilities.showLoading();
            services.getSearch(key).then(function (response) {
                utilities.hideLoading();
                if (response.responseCode === '200') {
                    if (response.data.length > 0) {
                        $("#text-search").addClass('display-none').removeClass('display-block');
                        vm.showListMovie = true;
                        vm.listSearchMovie = response.data[0].content;
                        $("#list_search").trigger('reload');
                    }
                    if (response.data.length === 0) {
                        vm.listSearchMovie = [];
                    }
                }
                else {
                    vm.message = response.message;
                }
            });
        }, 1000);

        $timeout.cancel(vm.showSearchSuggest);
        vm.showSearchSuggest = null;
        vm.showSearchSuggest = $timeout(function () {
            services.getSearchSuggestion(key).then(function (response) {
                if (response.data.length > 0) {
                    vm.listSearchMovieSugest = response.data[0].content;
                    $("#list_search_suggest").trigger('reload');
                }
                if (response.data.length === 0) {
                    vm.listSearchMovieSugest = [];
                }
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

    vm.focusSuggest = function ($event, items, startIndex, $index) {
        $('#search').addClass('display-no-top');

        if (heightCategory == 0) {
            heightCategory = $('#list_0').outerHeight(true);
        }
        console.log(heightCategory);
        if ($index >= startIndex) {
            $('#list_search_suggest').css({
                transform: 'translate3d(0, -' + (($index - startIndex) * heightCategory) + 'px, 0)'
            });
        } else if ($index === 0) {
            $('#list_search_suggest').css({
                transform: 'translate3d(0, 0px, 0)'
            });
        }
    };

    vm.blurSuggest = function () {
        $('#search').removeClass('display-no-top')
    };

    vm.focusItem = function ($event, $originalEvent, start, $index) {
        if (heightCate == 0) {
            heightCate = $('#listItem_0').outerHeight(true);
        }
        console.log(heightCate);
        vm.checkItemHeight = Math.floor($index / 3);
        if (vm.checkItemHeight >= start) {
            $('#list_search').css({
                transform: 'translate3d(0, -' + (vm.checkItemHeight * heightCate) + 'px, 0)'
            });
        } else if (vm.checkItemHeight === 0) {
            $('#list_search').css({
                transform: 'translate3d(0, 0px, 0)'
            });
        }
    };

    vm.hotkey = function (item) {
        $state.go('movieDetail', {id: item.id}, {reload: true});
    };

    vm.back = function () {
        $rootScope.changeView();
    };

    vm.enterText = function (text) {
        vm.searchText += text;
    };

    vm.onKeyboardDel = function () {
        vm.searchText = '';
        vm.listSearchMovie = [];
        vm.listSearchMovieSugest = [];
        $("#text-search").addClass('display-block').removeClass('display-none');
        $("#list_search").trigger('reload');
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
            focusController.focus($('#initFocusKeySearch'));
            if ($('#initFocusKeySearch').hasClass('focused')) {
                clearInterval(timeFocus);
            }
        }, 100)
    }

    $scope.$on('$viewContentLoaded', function (event) {
        initFocus();
    });

}