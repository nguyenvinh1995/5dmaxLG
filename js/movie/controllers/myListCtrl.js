'use strict';

angular.module('app.movie').controller('myListCtrl', myListCtrl);

myListCtrl.$inject = ['$scope', 'services', 'focusController', 'FocusUtil', '$timeout', '$state', '$stateParams', 'utilities', '$rootScope', 'settings'];

function myListCtrl($scope, services, focusController, FocusUtil, $timeout, $state, $stateParams, utilities, $rootScope, settings) {

    var vm = this;
    utilities.showLoading();
    vm.objects = [];
    vm.activeId = 'film_history';
    vm.currentLeftCat = 'cate-1';
    var disableId = '';
    var enableCategory = true;
    vm.srcImg = '';
    vm.value = "";

    getMyList();
    getHistory();

    function getMyList(){
        services.getMyList("MYLIST",0,0).then(function (response) {
        var responseCode = response.responseCode;
            if(responseCode == '200'){
                vm.lastFilm = response.data.content;
            } else if(responseCode == utilities.errorCode.tokenExpire){
                services.refreshToken().then(function(res){
                    if(res.responseCode == utilities.errorCode.success){
                        getMyList();
                    }else{
                        // utilities.hideLoading();
                        utilities.showMessenge(utilities.tokenExpireMessenger, true);
                        $rootScope.errorVerify = true;
                        $state.go('login_form');
                    }
                })
            }
        });
    }

    function getHistory(){
        services.getMyList("film_history",0,0).then(function (response) {
            var responseCode = response.responseCode;
            if(responseCode == '200') {
                vm.historyFilm = response.data.content;
                utilities.hideLoading();
            } else if(responseCode == utilities.errorCode.tokenExpire){
                services.refreshToken().then(function(res){
                    if(res.responseCode == utilities.errorCode.success){
                        getHistory();
                    }else{
                        // utilities.hideLoading();
                        $rootScope.errorVerify = true;
                        utilities.showMessenge(utilities.tokenExpireMessenger, true);
                        $state.go('login_form');
                    }
                })
            }
        });
    }

    function getFilmByType(value){
        services.getMyList(value).then(function (response) {
            if(response.responseCode == utilities.errorCode.success){
                vm.objects = response.data.content;
                if (vm.srcImg == "") {
                    if (vm.objects[0].imageForTVLarge) {
                        vm.srcImg = vm.objects[0].imageForTVLarge;
                    } else {
                        vm.srcImg = vm.objects[0].coverImage;
                    }
                }
                $timeout(function() {
                    $("#my_list_caph").trigger('reload');
                }, 10);
            }else if(response.responseCode == utilities.errorCode.tokenExpire){
                services.refreshToken().then(function(res){
                    if(res.responseCode == utilities.errorCode.success){
                        getFilmByType(vm.value);
                    }else{
                        utilities.hideLoading();
                        utilities.showMessenge(utilities.tokenExpireMessenger, true);
                        $rootScope.errorVerify = true;
                        $state.go('login_form');
                    }
                })
            }
        });
    }

    vm.getFilms = function (value) {
        $(".genres2").removeClass('move-left');
        $(".img-arrow-left").addClass('display-none').removeClass('display-block');
        if(value == vm.activeId && vm.objects.length > 0)
            return;
        
        if(value == 'MYLIST') {
            vm.currentLeftCat = 'cate-2';
            vm.activeId = "MYLIST";
        }
        else {
            vm.currentLeftCat = 'cate-1';
            vm.activeId = "film_history";
        }

        vm.value = value;

        getFilmByType(value);

        vm.srcImg = "";
        vm.ItemImg = ""; 
    };

    vm.showFilm = function(item) {
        $(".genres2").addClass('move-left');
        $(".img-arrow-left").addClass('display-block').removeClass('display-none');
        if (item.imageForTVLarge) {
            vm.srcImg = item.imageForTVLarge;
        } else {
            vm.srcImg = item.coverImage;
        }
        vm.item = item;
    };

    vm.selectMovie = function (item) {
        var id;
        var idMovie;
        if(item.parentId){
            id = item.parentId;
            idMovie = item.id;
        } else{
            id = item.id;
        }
        services.itemFromListMovie = item;
        $state.go('movieDetail', {id: id, idMovie : idMovie}, { reload : true });
    };

    function initFocus() {
        var timeFocus = setInterval(function () {
            focusController.focus($('#film_history'));
            if ($('#film_history').hasClass('focused')) {
                clearInterval(timeFocus);
                utilities.hideLoading();
            }
        }, 100)
    }

    $scope.$on('$viewContentLoaded', function () {
        initFocus();
    })
}