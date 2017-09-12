var extend = require('extend');
var watson = require('watson-developer-cloud');
var vcapServices = require('vcap_services');
var config = require('../../env.json');

exports.token = function(req, res) {
    //this will load the env.josn file configuration
    var sttConfig = extend(config.speech_to_text, vcapServices.getCredentials('speech_to_text'));

    //authenticate to the watson service
    var sttAuthService = watson.authorization(sttConfig);

    sttAuthService.getToken({
        url: sttConfig.url
    }, function(err, token) {
        if (err) {
            console.log('Error retrieving token: ', err);
            res.status(500).send('Error retrieving token');
            return;
        }
        res.send(token);
    });
}

exports.tts_synthesize = function(req, res) {
    console.log("tts_synthesize entered");
    var ttsConfig = watson.text_to_speech(config.text_to_speech);
    var transcript = ttsConfig.synthesize(req.query);

    transcript.on('response', function(response) {
      if (req.query.download) {
        response.headers['content-disposition'] = 'attachment; filename=transcript.ogg';
      }
    });

    transcript.on('error', function(error) { console.log("error encountered: "+error); next(error); });

    //sending the information back to the browser. Basically sending the audio back to the user
    transcript.pipe(res);
}
