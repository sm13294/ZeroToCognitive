var express = require('express');
var router = express.Router();
var speech_to_text = require('./features/speech_to_text');
var conversations = require('./features/conversations');
var nlu = require('./features/nlu');
var wordsapi = require('./features/wordsapi');

module.exports = router;
// speech-to-text
router.get('/api/speech-to-text/token*',speech_to_text.token);
router.get('/api/text-to-speech/synthesize*',speech_to_text.tts_synthesize);

router.post( '/api/conversations/response', conversations.response);
router.post( '/api/conversations/createentity', conversations.createentity);
router.post( '/api/conversations/createdialognode', conversations.createdialognode);
router.post( '/api/nlu/response', nlu.response);

router.post( '/api/words/synonyms', wordsapi.synonyms);
