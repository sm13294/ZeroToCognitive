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
var Watson = require( 'watson-developer-cloud/natural-language-understanding/v1.js' );
var config = require("../../env.json");

var nlu = new Watson({
    username: config.natural_language_understanding.username,
    password: config.natural_language_understanding.password,
    url: config.natural_language_understanding.url,
    version_date: Watson.VERSION_DATE_2017_02_27,
    version: 'v1'
});

exports.response = function(req, res)
{
        nlu.analyze({
            'text': req.body.input, // Buffer or String
            'features': {
                'concepts': {
                    "limit": 5
                },
                // 'keywords': {
                //     "limit": 5
                // },
            }
        }, function(err, response) {
            if (err) {
                console.log('error:', err);
                return res.status(err.code || 500).json(err);
            }
            else {
                // console.log(JSON.stringify(response, null, 2));
                return res.json(response);
            }
        });
    }
