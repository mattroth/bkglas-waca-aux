const childProcess = require('child_process');

/**
 TODO: ABSTRACT THIS OUT TO HANDLE FFMPEG FAILURES

 LOCAL WEBSOCKET RELAY INIT
 - node websocket-relay pinball 8081 8082
 **/
/**
// spawn an node process
const wsRelay = childProcess.spawn('node', ['websocket-relay.js', 'pinball 8081 8082']);

wsRelay.on('error', () => {
    // catches execution error (bad file)
    console.log(`Error executing binary: websocket-relay.js`);
});

wsRelay.stdout.on('data', (data) => {
    // console.log(`stdout: ${data}`);
    console.log(data.toString());
});

wsRelay.stderr.on('data', (data) => {
    // console.error(`stderr: ${data}`);
    console.log(data.toString());
});

wsRelay.on('close', (code) => {
    console.log(`Process exited with code: ${code}`);
    if (code === 0) {
        console.log(`wsRelay finished successfully`);
    } else {
        console.log(`wsRelay encountered an error, check the console output`);
    }
});
**/

/********
 *
 * EXPRESS INIT
 *
 ********/

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const ffmpegPath = require("ffmpeg-static");

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;

var bgState = {
  version: 0.0
};

/********
 *
 * FFMPEG INIT
 *
 ********/


/**
TODO: ABSTRACT THIS OUT TO HANDLE FFMPEG FAILURES

 START THE VIDEO INPUT STREAM, OCR INPUT STREAM

 detect stream close- https://community.render.com/t/nodejs-spawning-child-process-for-ffmpeg/1015
 **/

//const ffmpegPath = require('ffmpeg-static');
console.log(`Starting FFMPEG...`);

const ffmpeg = childProcess.spawn(
    'ffmpeg',    [
        '-hide_banner', '-loglevel', 'fatal',
        '-f', 'v4l2',
        '-framerate', '60',
        '-video_size', '1920x1080',
        '-i', '/dev/video0',
        '-filter_complex', 'fps=1,boxblur=5:3,ocr=language=eng,metadata=print:key=lavfi.ocr.text',
        '-update', '1',
        '-y', './public/images/ocr-frame.png',
    ]
);

/**
// spawn an ffmpeg process
const ffmpeg = childProcess.spawn(
    'ffmpeg',
    // note, args must be an array when using spawn
    //'', ``,
    //'', '',
    [
        // get the hdmi in as a input
        '-loglevel', 'error',
        '-f', 'v4l2',
        '-framerate', '60',
        '-video_size', '1920x1080',
        '-i', '/dev/video0',
        // complex filtergraph: (1) split video input
        '-filter_complex', '[0:v]split=2[in1][in2];[in1]fps=20[out1];[in2]fps=1,format=gray,boxblur=5:3,ocr,mpdecimate,metadata=print:key=lavfi.ocr.text[out2]', // 10:2, ,mpdecimate
        // map out1 to mpeg relay server
        '-map', '[out1]',
        '-f', 'mpegts',
        '-codec:v', 'mpeg1video',
        '-s', '1920x1080',
        '-b:v', '1000k',
        '-bf', '0',
        'http://127.0.0.1:8081/pinball',
        // map out2 to '/public/frame.png'
        '-map', '[out2]',
        //'-q:v', '1',
        '-update', '1',
        '-y', './public/images/ocr-frame.png',
    ],
    //{stdio: [process.stdin, process.stdout, process.stderr]}
    //{detached: true}
);
**/

ffmpeg.on('error', () => {
    // catches execution error (bad file)
    console.log(`Error executing binary: 'ffmpeg'`);
});

ffmpeg.stdout.on('data', (data) => {
    // console.log(`stdout: ${data}`);
    console.log("ffmpeg.stdout.on: " + data.toString());
});

ffmpeg.stderr.on('data', (data) => {
    // console.error(`stderr: ${data}`);
    console.log("ffmpeg.stderr.on: " + data.toString());
});

ffmpeg.on('close', (code) => {
    console.log(`Process exited with code: ${code}`);
    if (code === 0) {
        console.log(`FFmpeg finished successfully`);
    } else {
        console.log(`FFmpeg encountered an error, check the console output`);
    }
});