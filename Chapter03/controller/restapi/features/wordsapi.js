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
var unirest = require('unirest');

exports.synonyms = function(req, res)
{
    // console.log(req.body.word);
    var word = req.body.word;
    unirest.get("https://wordsapiv1.p.mashape.com/words/"+word+"/synonyms")
    .header("X-Mashape-Key", "zeLVKqhBtNmshMfyiRmWyJHi5327p1bdj0njsnwLYjZj8K5Yic")
    .header("Accept", "application/json")
    .end(function (result) {
        if(result.status == 200) {
            // console.log('succesful', result.status, result.headers, result.body);
            return res.json(result.body);
        }
        else {
                // console.log('error', result.status, result.headers, result.body);
                return res.status(result.status || 500).json(result);
        }
        return result.body;

    });
}
