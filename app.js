var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

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

const childProcess = require('child_process');

/**
 TODO: ABSTRACT THIS OUT TO HANDLE FFMPEG FAILURES

 START THE LOCAL WEBSOCKET RELAY
 - node websocket-relay pinball 8081 8082
 **/

// spawn an node process
const wsRelay = childProcess.fork('node', ['websocket-relay.js', 'pinball 8081 8082']);

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

/**
TODO: ABSTRACT THIS OUT TO HANDLE FFMPEG FAILURES

 START THE VIDEO INPUT STREAM, OCR INPUT STREAM
 **/

const wait = (ms) => {
    const start = Date.now();
    let now = start;
    while (now - start < ms) {
        now = Date.now();
    }
}

wait(5000);

const ffmpegPath = require('ffmpeg-static');

// spawn an ffmpeg process
const ffmpeg = childProcess.fork(
    ffmpegPath,
    // note, args must be an array when using spawn
    //'', ``,
    //'', '',
    [
        // get the hdmi in as a input
        '-f', 'v4l2',
        '-framerate', '60',
        '-video_size', '640x480',
        '-i', '/dev/video0',
        // complex filtergraph: (1) split video input
        '-filter_complex', '[0:v]split=2[in1][in2];[in1]fps=20[out1];[in2]fps=1[out2]',
        // map out1 to mpeg relay server
        '-map', '[out1]',
        '-f', 'mpegts',
        '-codec:v', 'mpeg1video',
        '-s', '640x480',
        '-b:v', '1000k',
        '-bf', '0',
        'http://127.0.0.1:8081/pinball',
        // map out2 to '/public/frame.png'
        '-map', '[out2]',
        '-q:v', '1',
        '-update', '1',
        '-y', './public/ocr-frame.png',

    ]
);

ffmpeg.on('error', () => {
    // catches execution error (bad file)
    console.log(`Error executing binary: ${ffmpegPath}`);
});

ffmpeg.stdout.on('data', (data) => {
    // console.log(`stdout: ${data}`);
    console.log(data.toString());
});

ffmpeg.stderr.on('data', (data) => {
    // console.error(`stderr: ${data}`);
    console.log(data.toString());
});

ffmpeg.on('close', (code) => {
    console.log(`Process exited with code: ${code}`);
    if (code === 0) {
        console.log(`FFmpeg finished successfully`);
    } else {
        console.log(`FFmpeg encountered an error, check the console output`);
    }
});