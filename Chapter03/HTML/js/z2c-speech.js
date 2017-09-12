/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 /*
** z2c-speech.js
*/

function initPage ()
{
    var _mic_start = $('.mic_start'),
    _mic_stop = $('.mic_stop'),
    _read_text = $('.watson_play'),
    stream = null;

    _mic_start.on("click", function () {
        _mic_stop.show();
        _mic_start.hide();

        $.when($.get('/api/speech-to-text/token')).done(
            function (token) {
                stream = WatsonSpeech.SpeechToText.recognizeMicrophone({
                    token: token,
                    outputElement: '#speech' // CSS selector or DOM Element
                });
                stream.on('error', function(err) {
                    console.log(err);
                });
            }
        );
    });

    _mic_stop.on("click",  function() {
        console.log("Stopping text-to-speech service...");
        if (stream != undefined) {
            stream.stop();
        }
        _mic_start.show();
        _mic_stop.hide();
    });

    _read_text.on("click", function() {
        console.log("Initiating the text-to-speech service ...");

        _mic_stop.trigger("click");

        var sessionPermissions = JSON.parse(localStorage.getItem('sessionPermissions')) ? 0 : 1;
        var textString = $("#read").val();
        var voice = 'en-US_AllisonVoice';
        var audio = $("#a_player").get(0);
        var synthesizeURL = '/api/text-to-speech/synthesize' +
          '?voice=' + voice +
          '&text=' + encodeURIComponent(textString) +
          '&X-WDC-PL-OPT-OUT=' +  sessionPermissions;
        audio.src = synthesizeURL
        audio.pause();
        audio.addEventListener('canplaythrough', onCanPlayThrough);
        audio.muted = true;
        audio.play();
        $('body').css('cursor', 'wait');
        $('.readText').css('cursor', 'wait');
        return true;
    })

    function onCanPlayThrough() {
        console.log("onCanPlayThrough");
        var audio = $('#a_player').get(0);
        audio.removeEventListener('canplaythrough', onCanPlayThrough);
        try { audio.currentTime = 0; }
        catch(ex) { // ignore. Firefox just freaks out here for no apparent reason.
                  }
        audio.controls = true;
        audio.muted = false;
        $('html, body').animate({scrollTop: $('#a_player').offset().top}, 500);
        $('body').css('cursor', 'default');
    }
}
