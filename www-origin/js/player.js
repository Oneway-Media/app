angular.module('app.player', [])

.run(function ( $rootScope, playerService ) {
    
    /*var selectors = {
        play_btn: '#player_button_play',
        timer: '.player_timing_timer',
        duration: '.player_timing_duration',
        seek: '.player_seek_wrapper',
        played: '.player_seek_played',
        buffered: '.player_seek_buffered',
        //previous: '#player_play_previous',
        //next: '#player_play_next'
    };    
    $rootScope.datas = [
        {
            slug: 'audio-0',
            title: 'Audio 0 mp3',
            poster: 'https://cdn3.iconfinder.com/data/icons/photos-icons/128/macro-128.png',
            src: 'http://oneway.vn/temp/radio/test-3/audio-0.mp3'
        },
        {
            slug: 'audio-1',
            title: 'Audio 1 mp3',
            poster: 'https://cdn0.iconfinder.com/data/icons/kameleon-free-pack-rounded/110/Vector-128.png',
            src: 'http://oneway.vn/temp/radio/test-3/audio-1.mp3'
        },
        {
            slug: 'audio-2',
            title: 'Audio 2 mp3',
            poster: 'https://cdn2.iconfinder.com/data/icons/strategy-management/512/competition-128.png',
            src: 'http://oneway.vn/temp/radio/test-3/audio-2.mp3'
        }
    ];
    
    
    $rootScope.player = audioPlayerService.init( [ $rootScope.datas[0] ], false, false, selectors);
    
    
    // METHODS
    $rootScope.click = function ( i ) {
        $rootScope.player = audioPlayerService.play( [ $rootScope.datas[i] ] );
    };
    
    $rootScope.clickAll = function () {
        $rootScope.player = audioPlayerService.play( $rootScope.datas );
    };
    
    
    $rootScope.inner = function ( index ) {
        audioPlayerService.play_inner(index);
    };
    
    $rootScope.navigate = function ( next ) {
        audioPlayerService.navigate(next);
    };*/
        
    
    
    
    
})


.service('playerService', function ( $rootScope ) {
    
    function initi( input, autoplay, loop, selectors ) {
    
        if ( !buzz.isSupported() || !buzz.isMP3Supported() ) {
            alert("Your browser is too old or not support MP3, time to update!");
        } else {
            
            autoplay = autoplay || false; loop = loop || false;

            var audio = new buzz.sound( input[0].src, {
                preload: 'metadata',
                autoplayplay: autoplay,
                loop: loop,
                volume: 100
            });
            
            
            /*
            *   Binding Audio events
            */
            audio.bind('playing', function (e) {
                $(selectors.play_btn).removeClass('ion-ios-play').addClass('ion-ios-pause');
            })
            
            .bind('timeupdate', function(e) {
                $(selectors.timer).html( buzz.toTimer(this.getTime()) );
                $(selectors.played).css('width', this.getPercent() + '%');                
                $(selectors.duration).html( buzz.toTimer( this.getDuration() ) );                
            })
            
            .bind('progress', function(e) {                
                if( this.getBuffered()[0] ) {
                    var val = (this.getBuffered()[0].end / this.getDuration()) * 100;
                    $(selectors.buffered).css('width', Math.ceil(val) + '%');
                }
            })
                
            .bind('ended', function (e) {                
                $(selectors.play_btn).removeClass('ion-ios-pause').addClass('ion-ios-play');
                $(selectors.played).css('width', '0%');
            });
            
            
            
            /*
            *   Binding HTML elements events
            */
            
            $(selectors.play_btn).bind('click', function (e) {        
                if ( audio.isPaused() ) {
                    $(this).html('Pause');
                } else {
                    $(this).html('Play');
                }
                audio.togglePlay();
            });
            
            $(selectors.seek).bind('click', function (e) {
                var perc = e.offsetX / $(this).width() * 100;
                audio.setPercent( perc );
            });
            
            $(selectors.previous).bind('click', function (e) {
                navigate(false);
            });
            
            $(selectors.next).bind('click', function (e) {
                navigate(true);
            });
            
            return {
                audioObject: audio,
                dataList: input,
                indexed: 0
            };
        }
        
    };
    
    function playy( input ) {
        var audio = $rootScope.player.audioObject;        
        
        //
        audio.stop().setTime(0).set('src', input[0].src).play();
        
        /*
        * BIND ended
        */
        audio.bind('ended', function (e) {
            if( input.length === 1 ) {
                this.stop().setTime(0).play(); // LOOP
            } else {
                
                if( $rootScope.player.indexed + 1 < input.length ) {
                    $rootScope.player.indexed++; $rootScope.$digest();
                    this.stop().setTime(0).set('src', input[$rootScope.player.indexed].src).play();
                } else {
                    $rootScope.player.indexed = 0; $rootScope.$digest();
                    this.stop().setTime(0).set('src', input[0].src).play();
                }
                
            }
        });
        
        return {
            audioObject: audio,
            dataList: input,
            indexed: 0
        };
    }    
    
    function play_innerr( index ) {
        $rootScope.player.audioObject.stop().setTime(0).set('src', $rootScope.player.dataList[index].src).play();
        $rootScope.player.indexed = index;
    }
    
    function navigatee( next ) {
        if( next ) {
            // NEXT
            if( $rootScope.player.indexed + 1 < $rootScope.player.dataList.length ) { 
                $rootScope.player.indexed++;               
                $rootScope.player.audioObject.stop()
                    .setTime(0)
                    .set('src', $rootScope.player.dataList[$rootScope.player.indexed].src)
                    .play();
            } else {                
                $rootScope.player.indexed = 0;
                $rootScope.player.audioObject.stop()
                    .setTime(0)
                    .set('src', $rootScope.player.dataList[$rootScope.player.indexed].src)
                    .play();
            }
            
        } else {
            // PREVIOUS
            
            if( $rootScope.player.indexed > 0 ) {
                $rootScope.player.indexed--;
                $rootScope.player.audioObject.stop()
                    .setTime(0)
                    .set('src', $rootScope.player.dataList[$rootScope.player.indexed].src)
                    .play();                
            } else {
                $rootScope.player.indexed = $rootScope.player.dataList.length - 1;                
                $rootScope.player.audioObject.stop()
                    .setTime(0)
                    .set('src', $rootScope.player.dataList[$rootScope.player.indexed].src)
                    .play(); 
            }
        }
    }
    
    // ---------------------------------------------------------
    
    
    
    function init(options) {
        if ( !buzz.isSupported() || !buzz.isMP3Supported() ) {
            alert("Your browser is too old or not support MP3, time to update!");
        } else {
            
            var html = options.html || false,
                autoplay = options.autoplay || false,
                loop = options.loop || false,
                initAudio = options.initAudio || false;

            if(!html || !initAudio) {
                alert('Player (error): Not enough information!');
            }
            
            var audio = new buzz.sound( initAudio[0].src, {
                preload: 'metadata',
                autoplayplay: autoplay,
                loop: loop,
                volume: 100
            });
            
            // Audio events
            audio.bind('playing', function (e) {
                $(html.player_button_play).removeClass('ion-ios-play').addClass('ion-ios-pause');
            })
            
            .bind('timeupdate', function(e) {
                $(html.player_timing_timer).html( buzz.toTimer(this.getTime()) );
                $(html.player_seek_played).css('width', this.getPercent() + '%');
                
                var duration = buzz.toTimer(this.getDuration());
                if( this.getDuration() == 'Infinity' ) { duration = '∞'; }                
                $(html.player_timing_duration).html( duration );                
            })
            
            .bind('progress', function(e) {                
                if( this.getBuffered()[0] ) {
                    var val = (this.getBuffered()[0].end / this.getDuration()) * 100;
                    $(html.player_seek_buffered).css('width', Math.ceil(val) + '%');
                }
            })
                
            .bind('ended', function (e) {                
                $(html.player_button_play).removeClass('ion-ios-pause').addClass('ion-ios-play');
                $(html.player_seek_played).css('width', '0');
            });
            
            // Element events            
//            $(selectors.seek).bind('click', function (e) {
//                var perc = e.offsetX / $(this).width() * 100;
//                audio.setPercent( perc );
//            });
            
//            $(selectors.previous).bind('click', function (e) {
//                navigate(false);
//            });
            
//            $(selectors.next).bind('click', function (e) {
//                navigate(true);
//            });
            
            
            // Return
            return {
                
                
                indexing: 0,
                playlist: initAudio,
                audio: audio,
                
                playButton: function () {
                    if ( this.audio.isPaused() ) {
                        $(html.player_button_play).removeClass('ion-ios-play').addClass('ion-ios-pause');
                    } else {
                        $(html.player_button_play).removeClass('ion-ios-pause').addClass('ion-ios-play');
                    }
                    this.audio.togglePlay();
                },
                
                
                
                // Open Player Content
                openPlayerContent: function () {
                    $(html.player_content_wrapper).fadeIn(250);
                    $(html.player_open_content).addClass('ctn_opening');
                    $(html.player_button_play).addClass('ctn_opening');
                },
                // Close Player Content
                closePlayerContent: function () {
                    $(html.player_content_wrapper).fadeOut(250);
                    $(html.player_open_content).removeClass('ctn_opening');
                    $(html.player_button_play).removeClass('ctn_opening');
                },

                // Switch to Playlist
                showContentPlaylist: function () {
                    $(html.player_content_text).fadeOut(30);
                    $(html.player_content_playlist).fadeIn(250);

                    // Button
                    $(html.player_content_text_button).removeClass('active activated');
                    $(html.player_content_playlist_button).addClass('active');
                },
                // Switch to Text
                showContentText: function () {
                    $(html.player_content_playlist).fadeOut(30);
                    $(html.player_content_text).fadeIn(250);

                    // Button
                    $(html.player_content_playlist_button).removeClass('active activated');
                    $(html.player_content_text_button).addClass('active');
                }
            };

        }        
    }
    
    
    // RETURN
    return {
        init: init
    };
    
});



 // ----------------------------------------------------------------------------
 // Buzz, a Javascript HTML5 Audio library
 // v1.1.10 - Built 2015-04-20 13:05
 // Licensed under the MIT license.
 // http://buzz.jaysalvat.com/
 // ----------------------------------------------------------------------------
 // Copyright (C) 2010-2015 Jay Salvat
 // http://jaysalvat.com/
 // ----------------------------------------------------------------------------

(function(t,e){"use strict";"undefined"!=typeof module&&module.exports?module.exports=e():"function"==typeof define&&define.amd?define([],e):t.buzz=e()})(this,function(){"use strict";var t=window.AudioContext||window.webkitAudioContext,e={defaults:{autoplay:!1,duration:5e3,formats:[],loop:!1,placeholder:"--",preload:"metadata",volume:80,webAudioApi:!1,document:window.document},types:{mp3:"audio/mpeg",ogg:"audio/ogg",wav:"audio/wav",aac:"audio/aac",m4a:"audio/x-m4a"},sounds:[],el:document.createElement("audio"),getAudioContext:function(){if(void 0===this.audioCtx)try{this.audioCtx=t?new t:null}catch(e){this.audioCtx=null}return this.audioCtx},sound:function(t,n){function i(t){for(var e=[],n=t.length-1,i=0;n>=i;i++)e.push({start:t.start(i),end:t.end(i)});return e}function u(t){return t.split(".").pop()}n=n||{};var s=n.document||e.defaults.document,r=0,o=[],a={},h=e.isSupported();if(this.load=function(){return h?(this.sound.load(),this):this},this.play=function(){return h?(this.sound.play(),this):this},this.togglePlay=function(){return h?(this.sound.paused?this.sound.play():this.sound.pause(),this):this},this.pause=function(){return h?(this.sound.pause(),this):this},this.isPaused=function(){return h?this.sound.paused:null},this.stop=function(){return h?(this.setTime(0),this.sound.pause(),this):this},this.isEnded=function(){return h?this.sound.ended:null},this.loop=function(){return h?(this.sound.loop="loop",this.bind("ended.buzzloop",function(){this.currentTime=0,this.play()}),this):this},this.unloop=function(){return h?(this.sound.removeAttribute("loop"),this.unbind("ended.buzzloop"),this):this},this.mute=function(){return h?(this.sound.muted=!0,this):this},this.unmute=function(){return h?(this.sound.muted=!1,this):this},this.toggleMute=function(){return h?(this.sound.muted=!this.sound.muted,this):this},this.isMuted=function(){return h?this.sound.muted:null},this.setVolume=function(t){return h?(0>t&&(t=0),t>100&&(t=100),this.volume=t,this.sound.volume=t/100,this):this},this.getVolume=function(){return h?this.volume:this},this.increaseVolume=function(t){return this.setVolume(this.volume+(t||1))},this.decreaseVolume=function(t){return this.setVolume(this.volume-(t||1))},this.setTime=function(t){if(!h)return this;var e=!0;return this.whenReady(function(){e===!0&&(e=!1,this.sound.currentTime=t)}),this},this.getTime=function(){if(!h)return null;var t=Math.round(100*this.sound.currentTime)/100;return isNaN(t)?e.defaults.placeholder:t},this.setPercent=function(t){return h?this.setTime(e.fromPercent(t,this.sound.duration)):this},this.getPercent=function(){if(!h)return null;var t=Math.round(e.toPercent(this.sound.currentTime,this.sound.duration));return isNaN(t)?e.defaults.placeholder:t},this.setSpeed=function(t){return h?(this.sound.playbackRate=t,this):this},this.getSpeed=function(){return h?this.sound.playbackRate:null},this.getDuration=function(){if(!h)return null;var t=Math.round(100*this.sound.duration)/100;return isNaN(t)?e.defaults.placeholder:t},this.getPlayed=function(){return h?i(this.sound.played):null},this.getBuffered=function(){return h?i(this.sound.buffered):null},this.getSeekable=function(){return h?i(this.sound.seekable):null},this.getErrorCode=function(){return h&&this.sound.error?this.sound.error.code:0},this.getErrorMessage=function(){if(!h)return null;switch(this.getErrorCode()){case 1:return"MEDIA_ERR_ABORTED";case 2:return"MEDIA_ERR_NETWORK";case 3:return"MEDIA_ERR_DECODE";case 4:return"MEDIA_ERR_SRC_NOT_SUPPORTED";default:return null}},this.getStateCode=function(){return h?this.sound.readyState:null},this.getStateMessage=function(){if(!h)return null;switch(this.getStateCode()){case 0:return"HAVE_NOTHING";case 1:return"HAVE_METADATA";case 2:return"HAVE_CURRENT_DATA";case 3:return"HAVE_FUTURE_DATA";case 4:return"HAVE_ENOUGH_DATA";default:return null}},this.getNetworkStateCode=function(){return h?this.sound.networkState:null},this.getNetworkStateMessage=function(){if(!h)return null;switch(this.getNetworkStateCode()){case 0:return"NETWORK_EMPTY";case 1:return"NETWORK_IDLE";case 2:return"NETWORK_LOADING";case 3:return"NETWORK_NO_SOURCE";default:return null}},this.set=function(t,e){return h?(this.sound[t]=e,this):this},this.get=function(t){return h?t?this.sound[t]:this.sound:null},this.bind=function(t,e){if(!h)return this;t=t.split(" ");for(var n=this,i=function(t){e.call(n,t)},u=0;t.length>u;u++){var s=t[u],r=s;s=r.split(".")[0],o.push({idx:r,func:i}),this.sound.addEventListener(s,i,!0)}return this},this.unbind=function(t){if(!h)return this;t=t.split(" ");for(var e=0;t.length>e;e++)for(var n=t[e],i=n.split(".")[0],u=0;o.length>u;u++){var s=o[u].idx.split(".");(o[u].idx===n||s[1]&&s[1]===n.replace(".",""))&&(this.sound.removeEventListener(i,o[u].func,!0),o.splice(u,1))}return this},this.bindOnce=function(t,e){if(!h)return this;var n=this;return a[r++]=!1,this.bind(t+"."+r,function(){a[r]||(a[r]=!0,e.call(n)),n.unbind(t+"."+r)}),this},this.trigger=function(t,e){if(!h)return this;t=t.split(" ");for(var n=0;t.length>n;n++)for(var i=t[n],u=0;o.length>u;u++){var r=o[u].idx.split(".");if(o[u].idx===i||r[0]&&r[0]===i.replace(".","")){var a=s.createEvent("HTMLEvents");a.initEvent(r[0],!1,!0),a.originalEvent=e,this.sound.dispatchEvent(a)}}return this},this.fadeTo=function(t,n,i){function u(){setTimeout(function(){t>s&&t>o.volume?(o.setVolume(o.volume+=1),u()):s>t&&o.volume>t?(o.setVolume(o.volume-=1),u()):i instanceof Function&&i.apply(o)},r)}if(!h)return this;n instanceof Function?(i=n,n=e.defaults.duration):n=n||e.defaults.duration;var s=this.volume,r=n/Math.abs(s-t),o=this;return this.play(),this.whenReady(function(){u()}),this},this.fadeIn=function(t,e){return h?this.setVolume(0).fadeTo(100,t,e):this},this.fadeOut=function(t,e){return h?this.fadeTo(0,t,e):this},this.fadeWith=function(t,e){return h?(this.fadeOut(e,function(){this.stop()}),t.play().fadeIn(e),this):this},this.whenReady=function(t){if(!h)return null;var e=this;0===this.sound.readyState?this.bind("canplay.buzzwhenready",function(){t.call(e)}):t.call(e)},this.addSource=function(t){var n=this,i=s.createElement("source");return i.src=t,e.types[u(t)]&&(i.type=e.types[u(t)]),this.sound.appendChild(i),i.addEventListener("error",function(t){n.trigger("sourceerror",t)}),i},h&&t){for(var d in e.defaults)e.defaults.hasOwnProperty(d)&&void 0===n[d]&&(n[d]=e.defaults[d]);if(this.sound=s.createElement("audio"),n.webAudioApi){var l=e.getAudioContext();l&&(this.source=l.createMediaElementSource(this.sound),this.source.connect(l.destination))}if(t instanceof Array)for(var c in t)t.hasOwnProperty(c)&&this.addSource(t[c]);else if(n.formats.length)for(var f in n.formats)n.formats.hasOwnProperty(f)&&this.addSource(t+"."+n.formats[f]);else this.addSource(t);n.loop&&this.loop(),n.autoplay&&(this.sound.autoplay="autoplay"),this.sound.preload=n.preload===!0?"auto":n.preload===!1?"none":n.preload,this.setVolume(n.volume),e.sounds.push(this)}},group:function(t){function e(){for(var e=n(null,arguments),i=e.shift(),u=0;t.length>u;u++)t[u][i].apply(t[u],e)}function n(t,e){return t instanceof Array?t:Array.prototype.slice.call(e)}t=n(t,arguments),this.getSounds=function(){return t},this.add=function(e){e=n(e,arguments);for(var i=0;e.length>i;i++)t.push(e[i])},this.remove=function(e){e=n(e,arguments);for(var i=0;e.length>i;i++)for(var u=0;t.length>u;u++)if(t[u]===e[i]){t.splice(u,1);break}},this.load=function(){return e("load"),this},this.play=function(){return e("play"),this},this.togglePlay=function(){return e("togglePlay"),this},this.pause=function(t){return e("pause",t),this},this.stop=function(){return e("stop"),this},this.mute=function(){return e("mute"),this},this.unmute=function(){return e("unmute"),this},this.toggleMute=function(){return e("toggleMute"),this},this.setVolume=function(t){return e("setVolume",t),this},this.increaseVolume=function(t){return e("increaseVolume",t),this},this.decreaseVolume=function(t){return e("decreaseVolume",t),this},this.loop=function(){return e("loop"),this},this.unloop=function(){return e("unloop"),this},this.setSpeed=function(t){return e("setSpeed",t),this},this.setTime=function(t){return e("setTime",t),this},this.set=function(t,n){return e("set",t,n),this},this.bind=function(t,n){return e("bind",t,n),this},this.unbind=function(t){return e("unbind",t),this},this.bindOnce=function(t,n){return e("bindOnce",t,n),this},this.trigger=function(t){return e("trigger",t),this},this.fade=function(t,n,i,u){return e("fade",t,n,i,u),this},this.fadeIn=function(t,n){return e("fadeIn",t,n),this},this.fadeOut=function(t,n){return e("fadeOut",t,n),this}},all:function(){return new e.group(e.sounds)},isSupported:function(){return!!e.el.canPlayType},isOGGSupported:function(){return!!e.el.canPlayType&&e.el.canPlayType('audio/ogg; codecs="vorbis"')},isWAVSupported:function(){return!!e.el.canPlayType&&e.el.canPlayType('audio/wav; codecs="1"')},isMP3Supported:function(){return!!e.el.canPlayType&&e.el.canPlayType("audio/mpeg;")},isAACSupported:function(){return!!e.el.canPlayType&&(e.el.canPlayType("audio/x-m4a;")||e.el.canPlayType("audio/aac;"))},toTimer:function(t,e){var n,i,u;return n=Math.floor(t/3600),n=isNaN(n)?"--":n>=10?n:"0"+n,i=e?Math.floor(t/60%60):Math.floor(t/60),i=isNaN(i)?"--":i>=10?i:"0"+i,u=Math.floor(t%60),u=isNaN(u)?"--":u>=10?u:"0"+u,e?n+":"+i+":"+u:i+":"+u},fromTimer:function(t){var e=(""+t).split(":");return e&&3===e.length&&(t=3600*parseInt(e[0],10)+60*parseInt(e[1],10)+parseInt(e[2],10)),e&&2===e.length&&(t=60*parseInt(e[0],10)+parseInt(e[1],10)),t},toPercent:function(t,e,n){var i=Math.pow(10,n||0);return Math.round(100*t/e*i)/i},fromPercent:function(t,e,n){var i=Math.pow(10,n||0);return Math.round(e/100*t*i)/i}};return e});
