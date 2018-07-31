'use strict';

angular.module('app.movie', ['ui.router'])
    .config(config);

function config($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: "/home",
            sticky: true,
            views: {
                'main': {
                    templateUrl: "js/movie/templates/home.html",
                    controller: "HomeCtrl as vm"
                }
            },
            onEnter: function ($rootScope) {
                var main = $rootScope.depth.main;
                $rootScope.changeDepth(main);
                $rootScope.addState(main);
            }
        })
        .state('movieDetail', {
            url: "/movieDetail/:id/:idMovie",
            sticky: true,
            views: {
                'detail': {
                    templateUrl: "js/movie/templates/movie-detail.html",
                    controller: "movieDetailCtrl as vm"
                }
            },
            onEnter: function ($rootScope) {
                var detail = $rootScope.depth.detail;
                $rootScope.changeDepth(detail);
                $rootScope.addState(detail);
            }
        })
        .state('movieList', {
            url: "/movieList/:id/:idMovie",
            sticky: true,
            views: {
                'list_movie': {
                    templateUrl: "js/movie/templates/movie-detail3.html",
                    controller: "movieDetailCtrl as vm"
                }
            },
            onEnter: function ($rootScope) {
                var list = $rootScope.depth.listMovie;
                $rootScope.changeDepth(list);
                $rootScope.addState(list);
            }
        })
        .state('search', {
            url: "/search",
            sticky: true,
            views: {
                'search': {
                    templateUrl: "js/movie/templates/search.html",
                    controller: "searchCtrl as vm"
                }
            },
            onEnter: function ($rootScope) {
                var search = $rootScope.depth.search;
                $rootScope.changeDepth(search);
                $rootScope.addState(search);
            }
        })
        .state('listPhimLe', {
            url: "/listPhimLe",
            sticky: true,
            views: {
                'list': {
                    templateUrl: "js/movie/templates/list-phim-le.html",
                    controller: "listMoviesCtrl as vm"
                }
            },
            onEnter: function ($rootScope) {
                var list = $rootScope.depth.list;
                $rootScope.changeDepth(list);
                $rootScope.addState(list);
            }
        })
        // .state('listPhimBo', {
        //     url: "/listPhimBo",
        //     sticky: true,
        //     views: {
        //         'list': {
        //             templateUrl: "js/movie/templates/list-phim-bo.html",
        //             controller: "listSeriMoviesCtrl as vm"
        //         }
        //     },
        //     onEnter: function ($rootScope) {
        //         var list = $rootScope.depth.list;
        //         $rootScope.changeDepth(list);
        //         $rootScope.addState(list);
        //     }
        // })
        .state('listPhimThue', {
            url: "/listPhimThue",
            sticky: true,
            views: {
                'list': {
                    templateUrl: "js/movie/templates/list-phim-thue.html",
                    controller: "listRentFilmCtrl as vm"
                }
            },
            onEnter: function ($rootScope) {
                var list = $rootScope.depth.list;
                $rootScope.changeDepth(list);
                $rootScope.addState(list);
            }
        })
        .state('setup', {
            url: "/setup",
            sticky: true,
            views: {
                'list': {
                    templateUrl: "js/movie/templates/setup.html",
                    controller: "SetupCtrl as vm"
                }
            },
            onEnter: function ($rootScope) {
                var list = $rootScope.depth.list;
                $rootScope.changeDepth(list);
                $rootScope.addState(list);
            }
        })
        .state('myList', {
            url: "/myList",
            sticky: true,
            views: {
                'list': {
                    templateUrl: "js/movie/templates/my-list.html",
                    controller: "myListCtrl as vm"
                }
            },
            onEnter: function ($rootScope) {
                var list = $rootScope.depth.list;
                $rootScope.changeDepth(list);
                $rootScope.addState(list);
            }

        })
}