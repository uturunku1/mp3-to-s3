/*jshint esversion: 6 */
'use strict';
const aws = require('aws-sdk');
// const execute = require('lambduh-execute');
const fs = require('fs');
var Downloader = require("./downloader");
const s3 = new aws.S3();
var dl = new Downloader();
const mp3Filename=`${(Date.now()).toString()}`+".mp3";

exports.handler=(event, context, callback)=>{
    console.log('mp3Filename is: '+ mp3Filename);
    var videoUrl= event.videoUrl;
    console.log("event videoUrl is: "+ videoUrl);
    if (videoUrl) {
        console.log('inside of if statement and...');
        var i= 0;
        dl.getMP3({videoId: videoUrl, name: mp3Filename},function(error,data){
            console.log("videoId is here!  "+videoUrl);
            i++;
            if(error) throw error;
            else{
                console.log("Song "+ i+" was downloaded: "+ data.file);
                var s3Path= saveToS3(data.file, event.bucket);
                // console.log(s3Path);
            }
        });
    }
    callback(null,'success uploading Alexa mp3 audio to S3');
};//end of exports.

function saveToS3(mp3TempFile, bucket) {
    fs.readFile(mp3TempFile, function (err, data) {
      if (err) throw err;
      var param = {Bucket: bucket, Key: mp3Filename, Body: data};
      var s3Path = 'http://'+bucket+'.s3.amazonaws.com/'+mp3Filename;
      s3.upload(param, function(err, data) {

          // Whether there is an error or not, delete the temp file
          fs.unlink(mp3TempFile, function (err) {
            if (err) console.error(err);
            console.log('Temp File Delete');
          });

          if (err) console.log(err, err.stack);
          else console.log('Successfully uploaded data to: '+ s3Path);
          return s3Path;
      });
    });
}
