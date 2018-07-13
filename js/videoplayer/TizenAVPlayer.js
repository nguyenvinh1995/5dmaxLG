var TizenAVPlayer = {
    api: null,
    container: null,
    duration: 0,
    currentTime: 0,
    isLive: false,
    mediaUrl: '',
    name: '',
    description: '',
    alias: '',
    mediaList: [],
    currentTrack: 0,
    isDrm: false,
    UID: ''
};

// var UID = localStorage.get('deviceId');

/*
@ method: TizenAVPlayer.initialize
@ description: This function captures the object of av player
@ param: mediaConfig: {
				avPlayerDomElement: ,
				listener: {
					
				},
				drmInformation: {
					
				}
			}
@ return: none
*/
TizenAVPlayer.initialize = function (mediaConfig) {
    console.log('TizenAVPlayer.initialize  ........................');
    this.api = (typeof(webapis) != "undefined") ? webapis.avplay : null;
    if (mediaConfig.avPlayerDomElement && typeof(mediaConfig.avPlayerDomElement) == "object") {
        this.container = mediaConfig.avPlayerDomElement;
    } else {
        this.container = document.createElement("object");
        this.container.setAttribute("type", "application/avplayer");
        document.body.appendChild(this.container);
    }

    this.listener = mediaConfig.listener;
    this.dataInfor = {
        url: null
    };

    this.playCalback = null;
    this.playerKeyEventCallback = null;
    this.timeFlag = 0;

};

// TizenAVPlayer.setVerimarix = function () {
//     console.log(this.UID);
//     var drmParam = {
//         CompanyName: "Viettel",
//         IPTV: null,
//         Web: "27.67.49.248:80",
//         UID: this.UID
//     };
//
//     try {
//         webapis.avplay.setDrm("VERIMATRIX", "Initialize", JSON.stringify(drmParam));
//     } catch (e) {
//         console.log(e);
//     }
// };


TizenAVPlayer.stop = function () {
    try {
        this.api.stop();
    } catch (ex) {

    }
};

// TizenAVPlayer.playVideo = function (videoUrl, isDrm) {
//     console.log(videoUrl);
//     TizenAVPlayer.executeAction('stop');
//     if (isDrm) {
//         TizenAVPlayer.isDrm = true;
//         TizenAVPlayer.closeVerimatrix();
//         // TizenAVPlayer.setHlsAES128();
//     } else {
//         TizenAVPlayer.isDrm = false;
//     }
//     TizenAVPlayer.openVideo(videoUrl);
//     TizenAVPlayer.executeAction({
//         action: 'change-size',
//         arg: {
//             left: 0,
//             top: 0,
//             width: 1920,
//             height: 1080,
//             delay: 0
//         }
//     });
//     if (isDrm) {
//         TizenAVPlayer.setVerimarix();
//     }
//
//     var successCallBack = function () {
//         try {
//             console.log('play success');
//             webapis.avplay.play();
//         } catch (ex) {
//             console.log('play stop');
//             webapis.avplay.stop();
//         }
//     };
//
//     if (TizenAVPlayer.currentTime != 0) {
//         var newTime = TizenAVPlayer.currentTime * 1000;
//         webapis.avplay.seekTo(newTime);
//         TizenAVPlayer.currentTime = 0;
//     }
//     TizenAVPlayer.setStreamingProperty();
//     webapis.avplay.prepareAsync(successCallBack);
//     // this.prepareVideoSync();
//     TizenAVPlayer.set4K();
//     // this.executeAction({action: 'play'});
// };

// TizenAVPlayer.playTrailer = function (videoUrl) {
//     this.openVideo(videoUrl);
//     this.executeAction({
//         action: 'change-size',
//         arg: {
//             left: 515,
//             width: 1452,
//             height: 768,
//             delay: 0
//         }
//     });
//     this.prepareVideoSync();
//     if (!this.active4K()) {
//         console.log("Device not support play 4K video");
//     }
//     this.executeAction({action: 'play'});
// };

/*
@ method: TizenAVPlayer.addEvents
@ description: This function create base event and custom event
@ param: 
@ return: none
*/
TizenAVPlayer.addEvents = function (customEventCallback) {

};

TizenAVPlayer.closeVerimatrix = function () {
    this.api.close();
};

/*
@ method: TizenAVPlayer.openVideo
@ description: This function opens the target URL and sets the listener
@ param: url: video url
@ return: none
*/
TizenAVPlayer.openVideo = function (url) {
    try {
        // open API gets target URL. URL validation is done in prepare API.
        this.api.open(url);
        this.dataInfor.url = url;
        // setListener should be done before prepare API. Do setListener after open immediately.
        this.api.setListener(this.listener);
        this.api.setTimeoutForBuffering(3);
        this.setBuffering();
    } catch (e) {
        console.log("Exception: " + e);
    }
};

/*
@ method: TizenAVPlayer.initialize
@ description: This function prepares the video so that the source element is created
@ param: none
@ return: none
*/
TizenAVPlayer.prepareVideoSync = function () {
    try {
        this.api.prepare();
        this.api.setDisplayRect(this.container.parentElement.offsetLeft, this.container.parentElement.offsetTop, this.container.offsetWidth, this.container.offsetHeight);
    } catch (e) {
        console.log(e);
    }
};

TizenAVPlayer.prepareVideoAsync = function () {
    console.log(webapis.avplay.getState() + "prepareVideoAsync");
    try {
        this.api.prepareAsync(function () {
            console.log("success");
            this.api.setDisplayRect(this.container.offsetLeft, this.container.offsetTop, this.container.offsetWidth, this.container.offsetHeight);
            TizenAVPlayer.executeAction({action: 'play'});
            // this.api.setDisplayRect(this.container.offsetLeft, this.container.offsetTop, this.container.offsetWidth, this.container.offsetHeight);
        }.bind(this), function (e) {
            console.log(e);
        });
    } catch (e) {
        console.log(e);
    }
};

/*
@ method: TizenAVPlayer.formatTime
@ description: This function returns the time in the format of hh:mm:ss
@ param: seconds
@ return: time
*/
TizenAVPlayer.formatTime = function (seconds) {
    if (!seconds)
        return "0:00:00";

    var hh = Math.floor(seconds / 3600),
        mm = Math.floor(seconds / 60) % 60,
        ss = Math.floor(seconds) % 60;

    return (hh ? (hh < 10 ? "0" : "") + hh + ":" : "0" + ":") +
        ((mm < 10) ? "0" : "") + mm + ":" +
        ((ss < 10) ? "0" : "") + ss;
};

/**
 * Show streaming properties on the screen.
 */
TizenAVPlayer.getProperties = function () {
    var text = '';
    text += 'Network Bandwidth: ' + Math.round(this.api.getStreamingProperty("CURRENT_BANDWITH") / 1000, 2) + 'Kbps' + '<br />';

    var streamInfo = webapis.avplay.getCurrentStreamInfo();
    for (var i = 0; i < streamInfo.length; i++) {

        if (streamInfo[i].type === 'VIDEO') {
            // text += 'Bit Rate: ' + Math.round(JSON.parse(streamInfo[i].extra_info).Bit_rate / 1000, 2) + 'Kbps' + '<br />';;

            var trackInfo = this.api.getTotalTrackInfo();

            var videoIndex = 0;
            for (var j = 0; j < trackInfo.length; j++) {
                if (trackInfo[j].type === 'VIDEO') {
                    videoIndex = j;
                }
            }
            text += 'Current Resolution: ' + JSON.parse(streamInfo[i].extra_info).Width + 'x' + JSON.parse(streamInfo[i].extra_info).Height + '<br/>';
            return text;
        }

    }

    return text;

};

TizenAVPlayer.getCurrentStreamInfo = function () {
    var streamInfo = webapis.avplay.getCurrentStreamInfo();
    var text = '';
    for (var i = 0; i < streamInfo.length; i++) {
        text += 'index: ' + streamInfo[i].index + '';
        text += 'type: ' + streamInfo[i].type + '';
        text += 'extra_info: ' + streamInfo[i].extra_info + '';
        console.log(text);
    }
};


TizenAVPlayer.setBuffering = function () {
    this.api.setBufferingParam("PLAYER_BUFFER_FOR_PLAY", "PLAYER_BUFFER_SIZE_IN_BYTE", 120 * 1024 * 1024);
};

/*
@ method: TizenAVPlayer.initialize
@ description: This function performs the functions related to video such as play, pause, rewind, forward
@ param: action, arg
@ return: none
*/
TizenAVPlayer.executeAction = function (params) {
    var action = params.action;
    var arg = params.arg;
    try {
        switch (action) {
            case 'play':
                if (this.api.getState() === "IDLE") {
                    this.api.prepare();
                }
                this.api.play();
                break;
            case 'pause':
                this.api.pause();
                break;
            case 'stop':
                TizenAVPlayer.executeAction({
                    action: 'pause'
                });
                this.api.stop();
                break;
            case 'jump-forward':
                if (typeof arg.time !== 'undefined') this.api.jumpForward(arg.time);
                break;
            case 'jump-backward':

                if (typeof arg.time !== 'undefined') this.api.jumpBackward(arg.time);
                break;
            case 'change-size':
                if (typeof this.container == 'undefined') break;
                if (typeof arg.left !== 'undefined') this.container.parentElement.style.left = arg.left + "px";
                if (typeof arg.top !== 'undefined') this.container.parentElement.style.top = arg.top + "px";
                if (typeof arg.width !== 'undefined') this.container.style.width = arg.width + "px";
                if (typeof arg.height !== 'undefined') this.container.style.height = arg.height + "px";
                if (typeof arg.delay === 'undefined') arg.delay = 0;
                window.setTimeout(function () {
                    this.api.setDisplayRect(arg.left, arg.top, arg.width, arg.height);
                }.bind(this), arg.delay);
                break;
            case 'get-state':
                return this.api.getState();
            case 'get-duration':
                console.log("get-duration");
                return this.api.getDuration();
            case 'get-current-time':
                console.log("get-current-time");
                return this.api.getCurrentTime();
            case 'restore' :
                this.api.restore;
                break;
            case 'suspend' :
                this.api.suspend;
                break;
            default:
                break;
        }
    } catch (e) {
        console.log(e);
    }
};

TizenAVPlayer.playPause = function () {
    if (webapis.avplay.getState() === 'PLAYING') {
        this.executeAction({
            action: 'pause'
        });
        return false;
    } else {
        this.executeAction({
            action: 'play'
        });
        return true;
    }
};

TizenAVPlayer.setStreamingProperty = function () {
    // var bitRateString = 'BITRATES=5000~10000';

// var bitRateString = 'BITRATES=5000~10000|STARTBITRATE=HIGHEST|SKIPBITRATE=LOWEST';
    var bitRateString = 'STARTBITRATE=10000';
    this.api.setStreamingProperty('ADAPTIVE_INFO', bitRateString);
    //   this.api.setStreamingProperty('COOKIE', "Authorization: BASIC QWx0aWNhc3Q6RFJNU2VydmljZQ==");
};

/**
 * Set to TV to play UHD content.
 */
TizenAVPlayer.active4K = function () {
    try {
        webapis.avplay.setStreamingProperty("SET_MODE_4K", "true");
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

/**
 * Show information about all available stream tracks on the screen.
 */
TizenAVPlayer.getTracksInfor = function () {
    return webapis.avplay.getTotalTrackInfo();
};


TizenAVPlayer.ffAndRewData = {
    timeoutNum: -1,
    changeTime: 0
};

/**
 * Jump forward time mini second (time ms).
 */
// TizenAVPlayer.ff = function (time, callbackStep, callbackEnd) {
//     try {
//         // console.log(webapis.avplay.getState());
//         if (webapis.avplay.getState() === 'PLAYING')
//             webapis.avplay.pause();
//         this.ffAndRewData.changeTime += time;
//         clearTimeout(this.ffAndRewData.timeoutNum);
//         this.ffAndRewData.timeoutNum = setTimeout(function () {
//             console.log("1111");
//             try {
//                 if ($("video").length) $("video")[0].currentTime += TizenAVPlayer.ffAndRewData.changeTime / 1000;
//             } catch (e) {
//             }
//             // console.log("jump" + TizenAVPlayer.ffAndRewData.changeTime);
//             webapis.avplay.jumpForward(TizenAVPlayer.ffAndRewData.changeTime);
//             TizenAVPlayer.ffAndRewData.changeTime = 0;
//             setTimeout(function (params) {
//                 if (webapis.avplay.getState() === 'PAUSED')
//                     webapis.avplay.play();
//                 callbackEnd & callbackEnd();
//             }, 300);
//         }, 1000);
//
//         callbackStep & callbackStep(this.ffAndRewData.changeTime);
//     } catch (e) {
//         TizenAVPlayer.ffAndRewData.changeTime = 0;
//         console.log(e);
//     }
// };
/**
 * Rewind time mini seconds (time ms).
 */
// TizenAVPlayer.rew = function (time, callbackStep, callbackEnd) {
//     try {
//         if (webapis.avplay.getState() === 'PLAYING')
//             webapis.avplay.pause();
//         this.ffAndRewData.changeTime += time;
//         clearTimeout(this.ffAndRewData.timeoutNum);
//         this.ffAndRewData.timeoutNum = setTimeout(function () {
//             try {
//                 if ($("video").length) $("video")[0].currentTime -= TizenAVPlayer.ffAndRewData.changeTime / 1000;
//             } catch (e) {
//             }
//
//             webapis.avplay.jumpBackward("" + TizenAVPlayer.ffAndRewData.changeTime);
//             TizenAVPlayer.ffAndRewData.changeTime = 0;
//             setTimeout(function (params) {
//                 if (webapis.avplay.getState() === 'PAUSED')
//                     webapis.avplay.play();
//                 callbackEnd & callbackEnd();
//             }, 300);
//         }, 1000);
//         callbackStep & callbackStep(-this.ffAndRewData.changeTime);
//     } catch (e) {
//         TizenAVPlayer.ffAndRewData.changeTime = 0;
//         console.log(e);
//     }
// };

TizenAVPlayer.checkIsPlaying = function () {
    if (typeof(webapis) == "undefined") return false;
    return (webapis.avplay.getState() === 'PLAYING');
};

TizenAVPlayer.close = function () {
    try {
        if (this.api.getState() !== "NONE") {
            console.log(this.api.getState(), 'zzzz');
            webapis.avplay.close();
        }
    } catch (error) {
        console.log(error);
    }
};

// TizenAVPlayer.set4K = function () {
//     try {
//         webapis.avplay.setStreamingProperty("SET_MODE_4K", "true");
//     } catch (error) {
//         console.error(error);
//     }
//
// };


var WebOsPlayer = {
    player: {},
    timeJump: 0,
    timeOut: -1,
    timeSeek: 30,
    api: null,
    container: null,
    duration: 0,
    currentTime: 0,
    isLive: false,
    mediaUrl: '',
    name: '',
    description: '',
    alias: '',
    mediaList: [],
    currentTrack: 0
};

WebOsPlayer.initialize = function (id) {
    WebOsPlayer.player = videojs('av-player');
};

WebOsPlayer.playVideo = function (videoUrl, avPlayerListenerCallback) {
    console.log(this);
    $('#av-player_html5_api').addClass('display-block');
    WebOsPlayer.player.src(
        {
            src: videoUrl,
            type: 'application/x-mpegURL',
            withCredentials: true
        }
    );

    if (WebOsPlayer.currentTime !== 0) {
        console.log(WebOsPlayer.currentTime + 'qq');
        WebOsPlayer.player.currentTime(WebOsPlayer.currentTime);
        WebOsPlayer.currentTime = 0;

    } else {
        console.log(WebOsPlayer.currentTime + 'qqssss');
        WebOsPlayer.currentTime = 0;
    }

    WebOsPlayer.player.ready(avPlayerListenerCallback(WebOsPlayer.player));
    WebOsPlayer.player.play();
};

WebOsPlayer.pause = function () {
    try {
        WebOsPlayer.player.pause();
    } catch (ex) {
    }
};

WebOsPlayer.reset = function () {
    WebOsPlayer.player.reset();
};

// WebOsPlayer.currentTime = function () {
//     if (WebOsPlayer.currentTime !== 0) {
//         console.log(WebOsPlayer.currentTime + 'qq');
//         WebOsPlayer.player.currentTime();
//         // WebOsPlayer.currentTime = 0;
//     }
// };

WebOsPlayer.playPause = function () {
    if (WebOsPlayer.player.paused()) {
        WebOsPlayer.player.play();
        return true;
    } else {
        WebOsPlayer.player.pause();
        return false;
    }
};
WebOsPlayer.close = function () {
    WebOsPlayer.player.dispose();
};
/**
 * Jump forward time mini second (time ms).
 */
WebOsPlayer.jump = function (cb, callbackStep, isForward) {
    // console.log("isForward" + isForward);
    if (isForward) {
        WebOsPlayer.timeJump += WebOsPlayer.timeSeek;
    } else {
        WebOsPlayer.timeJump -= WebOsPlayer.timeSeek;
    }
    callbackStep & callbackStep(WebOsPlayer.timeJump);
    clearTimeout(WebOsPlayer.timeOut);
    WebOsPlayer.timeOut = setTimeout(function () {
        WebOsPlayer.player.currentTime(WebOsPlayer.player.currentTime() + WebOsPlayer.timeJump);
        WebOsPlayer.timeJump = 0;
        // cb & cb();
    }, 300);
};
/**
 * Rewind time mini seconds (time ms).
 */
WebOsPlayer.rewind = function (cb, callbackStep, isForward) {
    console.log("isForward" + isForward);
    if (isForward) {
        WebOsPlayer.timeJump += WebOsPlayer.timeSeek;
    } else {
        WebOsPlayer.timeJump -= WebOsPlayer.timeSeek;
    }
    callbackStep & callbackStep(-WebOsPlayer.timeJump);
    clearTimeout(WebOsPlayer.timeOut);
    WebOsPlayer.timeOut = setTimeout(function () {
        WebOsPlayer.player.currentTime(WebOsPlayer.player.currentTime() - WebOsPlayer.timeJump);
        WebOsPlayer.timeJump = 0;
    }, 300);
};

WebOsPlayer.formatTime = function (seconds) {
    if (!seconds)
        return "0:00:00";
    var hh = Math.floor(seconds / 3600),
        mm = Math.floor(seconds / 60) % 60,
        ss = Math.floor(seconds) % 60;

    return (hh ? (hh < 10 ? "0" : "") + hh + ":" : "") +
        ((mm < 10) ? "0" : "") + mm + ":" +
        ((ss < 10) ? "0" : "") + ss;

};

WebOsPlayer.checkIsPlaying = function () {
    WebOsPlayer.player.play();
};



