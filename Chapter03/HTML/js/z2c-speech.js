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

var _mic_start          = $('.mic_start'),
_mic_stop               = $('.mic_stop'),
_read_text              = $('.watson_play'),
_create_entity          = $('.watson_create_entity')
_input                  = $("#speech"),
_target_speech          = $(".mySpeech"),
_target_read            = $("#read"),
_target_analyze         = $("#paper-abstract"),
_target_audio_player    = "#a_player",
_autoplay               = $(".autoplay"),
stream                  = null;

function initPage ()
{

    _mic_start.on("click", function () {
        console.log("Starting text-to-speech service...");

        toggle_mic(_mic_start, _mic_stop, true);
    });

    _mic_stop.on("click",  function() {
        console.log("Stopping text-to-speech service...");

        toggle_mic(_mic_start, _mic_stop, false);
    });

    _read_text.on("click", function() {
        console.log("Initiating the speech-to-text service ...");

        toggle_mic(_mic_start, _mic_stop, false);
        speak(_target_read, _target_audio_player, false);
    });

    _analyze_text.on("click", function() {
        console.log("Initiating the nlu service ...");

        analyze();
    });

    _target_speech.on("change", function() {
        console.log("Text changed", _target_speech.text());
        _input.val(_target_speech.text());
    });

    _input.on("keyup", function(e) {
        if(e.keyCode === 13 && _target_speech.text() != '') {
            e.preventDefault();
            getMessage();
        }
        _target_speech.text(_input.val());
    })

    // enable and disable microphone
    function toggle_mic(_microphone, _stopButton, b_on) {
        if(b_on) { //microphone button clicked, enable stop button
            _microphone.hide();
            _stopButton.show();
            listen(_target_speech.get(0));
        }
        else {
            if (stream != undefined) {
                stream.stop();
                if(_target_speech.text() != '') {
                    getMessage();
                }
            }
            _microphone.show();
            _stopButton.hide();

        }
    }
    //this function handles the speech to text in general
    //pass in the name of the HTML object which will display the received text
    function listen(_target) {
        $.when($.get('/api/speech-to-text/token')).done(
            function (token) {
                stream = WatsonSpeech.SpeechToText.recognizeMicrophone({
                    token: token,
                    objectMode: true, // send objects instead of text
                    extractResults: true, // convert {results: [{alternatives:[...]}], result_index: 0} to {alternatives: [...], index: 0}
                    format: false, // optional - performs basic formatting on the results such as capitals an periods
                    outputElement: _target // CSS selector or DOM Element
                });
                stream.on('error', function(err) {
                    console.log("Error happened with the stream",err);
                });
                stream.on('data', function(data) {
                //   console.log(data);
                  _target_speech.trigger("change");
                });
            }
        );
    }

    initiateConversation();
}

function speak(_chat, _a_player, b_display) {
    var sessionPermissions = JSON.parse(localStorage.getItem('sessionPermissions')) ? 0 : 1;
    var textString = _chat;
    var voice = 'en-US_AllisonVoice';
    var audioFrame = $(_a_player);
    var audio = audioFrame.get(0);
    var synthesizeURL = '/api/text-to-speech/synthesize' +
      '?voice=' + voice +
      '&text=' + encodeURIComponent(textString) +
      '&X-WDC-PL-OPT-OUT=' +  sessionPermissions;
    audio.src = synthesizeURL
    audio.pause();
    audio.addEventListener('canplaythrough', onCanPlayThrough);
    audio.muted = true;
    audio.play();
    (b_display) ? audioFrame.show() : audioFrame.hide();
}

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
