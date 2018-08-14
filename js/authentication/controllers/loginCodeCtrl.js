'use strict';

angular.module('app.authentication').controller('LoginCodeCtrl', LoginCodeCtrl);

LoginCodeCtrl.$inject=['$timeout', '$state', '$window', '$http', '$scope' , '$rootScope', 'services', 'settings', 'FocusUtil', 'focusController'];

function LoginCodeCtrl($timeout, $state, $window, $http, $scope, $rootScope, services, settings, FocusUtil, focusController) {
    console.log('login code');
	var vm = this;
    var requestCode = 600000;
    var requestLogin = 5000;
    var request = {
        data : {
            grant_type      : 'smart_tv',
            smart_tv_token  : services.deviceId,
            os_type         : settings.os_type,
            versionCode     : settings.version
        },
        header : {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' ,
            'Authorization' : "Bearer " + services.deviceId 
        }
    };

	function getCode() {
        console.log('ccc');
        services.getCode(services.deviceId).then(function (response) {
        	if(response.responseCode == '200'){
        		$("#code").html(response.data.code);
        	} else {
                $("#mess").fadeIn(100);
                $("#mess").fadeOut(5000);
                $("#text-mess").text(response.message);
        	}
        	console.log(response);
        });
    }

    function loginCode(){
    	services.authenticate(request).then(function(response){
            if(response.responseCode == '200'){
                clearInterval(loginCodeTime);
                var timeObject = new Date();
                var data =  response.data;
                $http.defaults.headers.common.Authorization = "Bearer " + data.accessToken;
                $http.defaults.headers.common.RefreshToken = data.refressToken;
                localStorage.auth =  JSON.stringify(data);
                services.auth = data;
                services.isLogin = true;
                if($rootScope.errorVerify) {
                     $rootScope.changeView();
                     $rootScope.errorVerify = false;
                }else {
                    $state.go('home', {} , {reload : true});
                }
            }
    	})
    }
    getCode();

    var loginCodeTime = setInterval(function(){
        loginCode();
    }, requestLogin);

    setInterval(function () {
        console.log('3333333');
        getCode();
    }, requestCode);
}