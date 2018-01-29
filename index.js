/*jshint esversion: 6 */
'use strict';
const aws = require('aws-sdk');
const fs = require('fs');
var Downloader = require("./downloader");
const normalizer = require('./normalizer');
const child_process= require('child_process');
const mp3Filename=`${(Date.now()).toString()}`+".mp3";
const s3 = new aws.S3();
var dl = new Downloader();

exports.handler=(event, context, callback)=>{
    const {videoUrl, bucketDestination} = event;
    console.log(`The youtube videoId is ${videoUrl}`);
    var i= 0;
    dl.getMP3({videoId: videoUrl, name: mp3Filename},function(error,data){
        i++;
        if(error) throw error;
        else{
            console.log("Audio "+ i+" was downloaded: "+ data.file); // data.file is /tmp/mp3Filename
            normalizer.processMp3File(mp3Filename).then((val)=>{
                saveToS3('/tmp/output-'+mp3Filename, bucketDestination);
            });
        }
    });
    callback(null,'Uploading Alexa mp3 audio to S3...');
};//end of exports.

function saveToS3(mp3TempFile, bucket) {
    fs.readFile(mp3TempFile, function (err, data) {
      if (err) throw err;
      var param = {Bucket: bucket, Key: mp3Filename, Body: data};
      const s3Path = 'https://s3-us-west-2.amazonaws.com/'+bucket+'/'+mp3Filename;
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
