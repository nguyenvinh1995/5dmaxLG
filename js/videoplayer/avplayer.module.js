'use strict';

angular
    .module('app.avplayer', ['ui.router'])
    .config(config);

function config($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('avplayer', {
        url: "/avplayer/:playlistId/:movieId",
        views : {
        	'player' : {
        		 controller: 'AVPlayerCtrl',
		        controllerAs: 'vm',
		        templateUrl: 'js/videoplayer/templates/avplayer.html'
        	}
        },
        onEnter : function($rootScope){
            var player = $rootScope.depth.player;
            $rootScope.changeDepth(player);
            $rootScope.addState(player);
        }
    })
}