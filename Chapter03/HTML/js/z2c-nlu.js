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

var
_analyze_paper_abstract         = $("#paper-abstract"),
_analyze_paper_keywords         = $("#paper-keywords"),
_analyze_paper_title            = $("#paper-title"),
_analyze_paper_authors          = $("#paper-authors"),
_analyze_paper_id               = $("#paper-id"),
_progress                       = $(".progress"),
_progress_bar                   = $('.progress-bar'),
_progress_text                  = $('.progress-text'),
_alert                          = $('.alert'),
_paper_title                    = ''
_paper_authors                  = ''
_paper_abstract                 = ''
_paper_concepts                 = [],
_paper_keywords                 = [],
_conditions_string              = '';

function initAdminPage ()
{
    _analyze_text.on("click", async function() {
        console.log("Initiating the nlu service ...");
        _paper_abstract = _analyze_paper_abstract.val();
        _paper_title = _analyze_paper_title.val();
        _paper_authors = _analyze_paper_authors.val();

        if(_analyze_paper_keywords.val() != '')
            _paper_keywords = (_analyze_paper_keywords.val()).split(',');

        if(_paper_abstract != '' && _paper_title != '' && _paper_authors != '') {
            _alert.removeClass('d-none');
            _alert.addClass('d-none');

            _progress.removeClass('d-none');
            _progress_text.text('Analyzing the abstract ...');
            await getNLUResponse(); //get the concepts from the abstract

            _progress_bar.css('width', '25%');
            _progress_text.text('Creating Entities ...');
            await createEntities(); //create entities for each concept and paper keyword

            _progress_bar.css('width', '75%');
            _progress_text.text('Creating Dialog Nodes ...');
            await createDialogNode(); //create a dialog node

            _progress_bar.css('width', '100%');
            _progress_bar.removeClass('progress-bar-animated');
            _progress_text.text('Done!');
        }
        else {
            _alert.removeClass('d-none');
        }
    });
}

function getNLUResponse()
{
    console.log("_paper_abstract", _paper_abstract);
    console.log("_paper_keywords", _paper_keywords);
    var options = {};
    options.method = 'post';
    options.headers = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        };
    options.body = JSON.stringify({
        input: _paper_abstract,
    });

    var response = "null";
    return fetch("/api/nlu/response", options)
    .then(res=>res.json())
    .then((res) => {
        _paper_concepts = res.concepts;
        return res;
    });
}

async function createEntities(){
    console.log('creating entities for each paper keyword');

    var increase_bar_by = 50 / (_paper_keywords.length + _paper_concepts.length);
    var current_width = 25;

    for (i = 0; i < _paper_keywords.length; i++) {
        current_width += increase_bar_by;
        _progress_bar.css('width', current_width+'%');
        _progress_text.text('Creating Entities ... ' + _paper_keywords[i].trim());

        var entity = _paper_keywords[i].trim().toLowerCase().replace(/ /g , "_");
        const values = await getSynonyms(entity);

        var _valuesobject = [{value:_paper_keywords[i].trim().toLowerCase()}];
        if(typeof values != 'undefined') {
            for (j = 0; j < values.length; j++) {
                _valuesobject.push({
                    value:values[j].toLowerCase()
                });
            }
            var result = await createEntity(entity, _valuesobject);
        }
        else
            var result = await createEntity(entity, _valuesobject);

    }
    console.log('for each paper keyword an entity has been added');

    console.log('creating entities for each concept returned from NLU');
    for (i = 0; i < _paper_concepts.length; i++) {
        current_width += increase_bar_by;
        _progress_bar.css('width', current_width+'%');
        _progress_text.text('Creating Entities ... ' + _paper_concepts[i].text);

        console.log('concept at '+i+' is:', _paper_concepts[i].text);
        var entity = _paper_concepts[i].text.toLowerCase().replace(/ /g , "_");
        const values = await getSynonyms(entity);

        var _valuesobject = [{value:_paper_concepts[i].text.toLowerCase()}];
        if(typeof values != 'undefined') {
            for (j = 0; j < values.length; j++) {
                _valuesobject.push({
                    value:values[j].toLowerCase()
                });
            }
            var result = await createEntity(entity, _valuesobject);
        }
        else
            var result = await createEntity(entity, _valuesobject);
    }
    console.log('for each concept returned from NLU an entity has been added');
}

function createEntity(_entity, _values)
{
    var options = {};
    options.method = 'post';
    options.headers = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        };
    options.body = JSON.stringify({
        entity: _entity,
        values: _values
    });
    return fetch("/api/conversations/createentity", options)
    .then(res=>res.json())
    .then((res) => {
        console.log(res);
        return res;
    });
}

function createDialogNode()
{
    for (i = 0; i < _paper_concepts.length; i++) {
        //if first element
        if(i == 0)
            _conditions_string += '(';

        _conditions_string += '@'+_paper_concepts[i].text.toLowerCase().replace(/ /g , "_");

        //if not last element element
        if(i < _paper_concepts.length-1)
            _conditions_string += '||';
        //if last element
        if(i == _paper_concepts.length-1)
            _conditions_string += ')';
    }
    if(_paper_keywords.length > 0 && _paper_concepts.length > 0)
        _conditions_string += ' && ';

    for (i = 0; i < _paper_keywords.length; i++) {
        //if first element
        if(i == 0)
            _conditions_string += '(';

        _conditions_string += '@'+_paper_keywords[i].trim().toLowerCase().replace(/ /g , "_");

        //if not last element element
        if(i < _paper_keywords.length-1)
            _conditions_string += ' || ';
        //if last element
        if(i == _paper_keywords.length-1)
            _conditions_string += ')';
    }

    console.log('conditions string is: ', _conditions_string);

    var options = {};
    options.method = 'post';
    options.headers = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        };
    options.body = JSON.stringify({
        dialog_node: _paper_title.toLowerCase().replace(/ /g, '_'),
        conditions: _conditions_string,
        title: _paper_title,
        output: {
            text: 'In order to answer this question, I recommend you read the paper: ' + _paper_title + ' by '+_paper_authors
        }
    });
    // options.input = _text;
    var response = "null";
    return fetch("/api/conversations/createdialognode", options)
    .then(res=>res.json())
    .then((res) => {
        console.log(res);
        return res;
    });
}

function getSynonyms(_word){
    console.log('Initiating wordsapi service');
    var options = {};

    options.method = 'post';
    options.headers = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        };
    options.body = JSON.stringify({
        word: _word
    });

    return fetch('/api/words/synonyms', options)
    .then(res=>res.json())
    .then((res) => {
        return res.synonyms;
    });
    return response;
}

function clear(){
    _analyze_paper_abstract.val("");
}
