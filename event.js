var lambdaFunct= require('./index');
var handler='handler';
var event={videoUrl:"lRs72x7Lgtc", bucket:'democracy-live'};
var context={};
function callback(error, data) {
    console.log(error);
    console.log(null, data);
}

lambdaFunct[handler](event,context,callback);
