'use strict';

function services($q, $http, settings, utilities) {
    this.isLogin = false;
    this.returnBack = false;
    this.indexBack = 0;
    this.currentPlayMovie = {};
    this.logOut = false;
    // login xong quay về màn trước đó.
    this.itemFromListMovie = null;
    this.keepStateWhenLogin = false;
    this.loginFromSetting = false;
    this.supportDrm = false;
    this.backgroundMenu = '';
    this.getHomeFilm = getHomeFilm;
    this.getDetailFilm = getDetailFilm;
    this.authenticate = authenticate;
    this.getCaptcha = getCaptcha;
    this.getSearch = getSearch;
    this.getSearchSuggestion = getSearchSuggestion;
    this.getSetting = getSetting;
    this.getListMovies = getListMovies;
    this.getListSeriMovies = getListSeriMovies;
    this.getStreaming = getStreaming;
    this.getListPackage = getListPackage;
    this.getDetailUser = getDetailUser;
    this.getMyList = getMyList;
    this.saveTime = saveTime;
    this.likeUnlike = likeUnlike;
    this.registerPackage = registerPackage;
    this.unregisterPackage = unregisterPackage;
    this.getCode = getCode;
    this.checkLogin = checkLogin;
    this.buy = buy;
    this.isObject = isObject;
    this.refreshToken = refreshToken;
    this.freeMonth = freeMonth;
    this.getHomeFilmv2 = getHomeFilmv2;
    this.getTrailer = getTrailer;


    function checkLogin() {
        return this.isLogin;
    }

    function getHomeFilm() {
        var url = settings.api.baseUrl + "film/get-home-film";
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function getHomeFilmv2(number) {
        var url = settings.api.baseUrl + "collection/get-by-position?p=" + number;
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function getDetailFilm(id, idMovie) {
        var str = "playlist/get-detail?id=" + id + "&device_type=" + settings.os_type + "&os_version_code=" + settings.version + "&os_type=" + settings.os_type + "&network_device_id=" + this.deviceId;
        if (idMovie) {
            str += "&video_id=" + idMovie;
        }
        var url = settings.api.baseUrl + str;
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function getTrailer(id) {
        var url = settings.api.baseUrl + "playlist/get-link-trailer?id=" + id  + "&device_id=" + this.deviceId + "&device_type=" + settings.os_type  ;
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function getSearch(key) {
        var url = settings.api.baseUrl + "default/search?query=" + key;
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function getSearchSuggestion(key) {
        var url = settings.api.baseUrl + "default/search-suggestion?query=" + key;
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function getStreaming(idMovie, idVideo, idProfile) {
        var url = settings.api.baseUrl + "playlist/get-playlist-stream?playlist_id=" + idMovie + "&id=" + idVideo + "&device_type=" + settings.os_type + "&os_version_code=" + settings.version + "&os_type=" + settings.os_type + "&network_device_id=" + this.deviceId;
        if (idProfile != 0 && idProfile != undefined)
            url += "&profile_id=" + idProfile;
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function getSetting() {
        var url = settings.api.baseUrl + "default/get-setting";
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function getListMovies(id) {
        var url = settings.api.baseUrl + "default/get-more-content?id=" + id;
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function getListSeriMovies(id) {
        var url = settings.api.baseUrl + "default/get-more-content?id=film_info_" + id;
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function getListPackage() {
        var url = settings.api.baseUrl + "default/list-package";
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function getDetailUser() {
        var url = settings.api.baseUrl + "account/get-user-profile";
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function getMyList(id, limit, offset) {
        var url = settings.api.baseUrl + "default/get-more-content?id=" + id + "&limit=" + limit + "&offset=" + offset;
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function saveTime(data) {
        var header = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};
        var url = settings.api.baseUrl + 'account/watch-time';
        return utilities.transformRequest(url, 'POST', null, data, header, angular.noop, angular.noop);
    }

    function likeUnlike(id) {
        var data = {'id': id};
        var header = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};
        var url = settings.api.baseUrl + 'playlist/toggle-like-playlist';
        return utilities.transformRequest(url, 'POST', null, data, header, angular.noop, angular.noop);
    }

    function registerPackage(id) {
        var data = {'package_id': id};
        var header = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};
        var url = settings.api.baseUrl + 'account/register-service';
        return utilities.transformRequest(url, 'POST', null, data, header, angular.noop, angular.noop);
    }

    function unregisterPackage(id) {
        var data = {'package_id': id};
        var header = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};
        var url = settings.api.baseUrl + 'account/unregister-service';
        return utilities.transformRequest(url, 'POST', null, data, header, angular.noop, angular.noop);
    }

    function getCode(token) {
        var url = settings.api.baseUrl + "tv/get-code?token=" + token;
        return utilities.resolve(url, 'GET', angular.noop, angular.noop);
    }

    function buy(id, type) {
        var data = {'item_id': id, 'type': type};
        var header = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};
        var url = settings.api.baseUrl + "account/buy";
        return utilities.transformRequest(url, 'POST', null, data, header, angular.noop, angular.noop);
    }




    /*========================== authenticate ===============================*/
    function authenticate(request) {
        // console.log(request);
        var url = settings.api.baseUrl + 'auth/authorize';
        return utilities.transformRequest(url, 'POST', null, request.data, request.header, angular.noop, angular.noop);
    }

    function freeMonth(anthorize) {
        var url = settings.api.baseUrl + 'account/register-promotion-app';
        return utilities.resolveAlt(url, 'GET', null, null, anthorize.header, angular.noop, angular.noop);
    }

    function getCaptcha(header) {
        var url = settings.api.baseUrl + 'auth/get-captcha';
        return utilities.resolveAlt(url, 'GET', null, null, header, angular.noop, angular.noop);
    }

    function isObject(item) {
        return (typeof item === "object" && !Array.isArray(item) && item !== null);
    }

    function refreshToken() {
        var deferred = $q.defer();
        var token;
        var _data = "";
        if (localStorage.auth)
            token = JSON.parse(localStorage.auth);
        if (token) {
            var tokenRefresh = token.refressToken;
            _data = "grant_type=refresh_token&refresh_token=" + tokenRefresh + "&os_type=" + settings.os_type + "&versionCode=" + settings.version;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: settings.api.baseUrl + 'auth/authorize',
            data: _data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            cache: false
        }).then(function (response) {
            deferred.resolve(response.data);
            var res = response.data;
            console.log(res);
            if (res.responseCode == "200") {
                var data = res.data;
                token.accessToken = data.accessToken;
                token.refressToken = data.refressToken;
                token.expire = Date.now() + parseInt(data.expiredTime) * 1000;
                services.auth = token;
                localStorage.auth = JSON.stringify(token);
                $http.defaults.headers.common.Authorization = "Bearer " + data.accessToken;
            }

        }, function (response) {
            deferred.reject(response.statusText);
        });

        return deferred.promise;
    }

}

app.service('services', services);
services.$inject = ['$q', '$http', 'settings', 'utilities'];