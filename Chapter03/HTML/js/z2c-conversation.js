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

var _input;
var _conversation;
var _context = {};

// initialize the page
function initiateConversation()
{
    _input                  = $("#speech");
    _target_speech          = $(".mySpeech");
    _autoplay               = $(".autoplay");
    _conversation           = $(".chat-ul");
    _conversation.empty();
    // getResponse("Hi There!");
}

function getMessage()
{
    // _conversation.append('<div class="shape bubble1"><p>'+_input.val()+"</p></div>");
    _conversation.append('<li><div class="message-data"><span class="message-data-name"><i class="fa fa-circle you"></i> You</span></div><div class="message you-message">'+_input.val()+'</div></li>');
    getResponse(_target_speech.text());
    _input[0].value = "";
    clear();
}

function getResponse(_text)
{
    console.log(_text);
    var options = {};
    options.input = _text;
    options.context = _context;
    var response = "null";
    $.when($.post("/api/conversations/response", options)).then(
        function(res, _type, _jqXHR)
        {
            console.log("z2c-conversations.js getMessage Success res",res);

            _conversation.append('<li class="clearfix"><div class="message-data align-right"><span class="message-data-name">PPA, your Parallel Programming Assistant</span> <i class="fa fa-circle me"></i></div><div class="message me-message float-right">'+res.output.text+'</div></li>');
            if(_autoplay.prop("checked"))
                speak(res.output.text, _target_audio_player, false);
        },
        function(res, _type, _jqXHR)
        {
            console.log("z2c-conversations.js getMessage Failure res.responseText"+res.responseText);

            _conversation.append('<li class="clearfix"><div class="message-data align-right"><span class="message-data-name">PPA, your Parallel Programming Assistant</span> <i class="fa fa-circle me"></i></div><div class="message me-message float-right">'+res.responseText+'</div></li>');
            response = false;
        });
        return response;
    }

    function clear(){
        _input.val("");
        _target_speech.text("");
    }
