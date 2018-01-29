'use strict';

const fs = require('fs');
const child_process= require('child_process');

function execCommand(cmd) {
    if (Array.isArray(cmd)) {
        cmd= cmd.join(' ');
    }
    return new Promise((resolve, reject) => {
        console.log('executing command:', cmd);
        child_process.exec(cmd, (error, stdout, stderr)=>{
            if(error) reject(error);
            resolve(stderr);
        });
    });
}

function measureLoudness(mp3File) {
    const cmd = [`./ffmpeg -i /tmp/${mp3File} -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null -`];

    return execCommand(cmd).then((response) => {
        //grab JSON str and make it into object
        let lines= response.split('\n');
        let start= -1;
        let end= -1;
        lines.forEach(function(line, index) {
            if (line==='{') {
                start= index;
            }else if (line==='}') {
                end= index;
            }
        });
        if (start === -1 || end === -1) {
          throw 'Unable to find JSON response in: '+response;
        }
        console.log(lines.slice(start, end+1).join(''));
        return JSON.parse(lines.slice(start, end+1).join(''));
    }).catch((error)=>{
        throw `Error interpreting ${mp3File}. Make sure ffmpeg is in your path.`;
    });
}

    function adjustForAlexa(mp3File, i, tp, lra, thresh, offset){
        const cmd=[`./ffmpeg -i /tmp/${mp3File}`];
        cmd.push(`-af loudnorm=I=-14:TP=-2:LRA=11:measured_I=${i}:measured_TP=${tp}:measured_LRA=${lra}:measured_thresh=${thresh}:offset=${offset}:linear=true`);
        cmd.push('-codec:a libmp3lame'); // Format
        cmd.push('-ac 2'); // not sure...
        cmd.push('-b:a 48k'); // Bitrate
        cmd.push('-ar 16000'); // Sample rate
        cmd.push(`-y /tmp/output-${mp3File}`);

        return execCommand(cmd).catch((err) => {
            throw `Error when adjusting output-${mp3File}. Make sure ffmpeg is your path.`;
        });
    }

    exports.processMp3File= function (mp3File) {
        return new Promise((resolve, reject)=>{
            measureLoudness(mp3File).then((data)=>{
                return adjustForAlexa(mp3File,data.input_i, data.input_tp, data.input_lra, data.input_thresh, data.target_offset);
            }).then((done) => {
                console.log(mp3File, 'was normalized succesfully');
                resolve(mp3File);
            }).catch((error) => {
                console.log(error, mp3File+ ' was not normalized');
                reject(error);
            });
        });
    }

    // fs.readdirSync('input').forEach(file => {
        //skip hidden files
    //     if(file[0] ==='.') return;
    //     processMp3File(file);
    // });
