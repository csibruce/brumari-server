const express = require('express');
const auth = require('./auth');
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const Multer = multer();
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http)

const { AWS_KEY } = require('../config/keys')

io.on('connection', function(socket){
  console.log('user connected');

  socket.on('disconnect', function(){
   console.log('user disconnected');
 });
});

AWS.config.update({
  signatureVersion: 'v4',
  accessKeyId: AWS_KEY.accessKeyId,
  secretAccessKey: AWS_KEY.secretAccessKey,
  region: AWS_KEY.rengion,
});

var s3 = new AWS.S3();

const getParamsForS3Upload = (name, file, type) => ({
  'Bucket': 'brumari',
  'Key': name, // FIXME 파일명 중복방지처리해야함.
  'ACL': 'public-read',
  'Body': file,
  'ContentType': type,
})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', express.static('public'));

app.use('/auth', auth, express.static('public'));

app.post('/upload', Multer.single('upload'), function(req, res){
  const { originalname, mimetype, buffer } = req.file
  s3.upload(getParamsForS3Upload(originalname, buffer, mimetype), function(err, data){
    if (data) {
      io.emit('photo_added', JSON.stringify(data));
      return res.json(data)
    };
    res.send(err);
  })
});

// app.use(auth); //리스트불러올때 인증받아야 불러오게함.
app.get('/list', function(req, res){
  var params = {
    Bucket: 'brumari', /* required */
    // Delimiter: 'STRING_VALUE',
    // EncodingType: 'url',
    // Marker: 'STRING_VALUE',
    // MaxKeys: 0,
    // Prefix: 'STRING_VALUE',
    // RequestPayer: requester
  };

  s3.listObjects(params, function(err, data) {
    if (err) return console.log(err, err.stack); // an error occurred
    console.log(data);
    return res.json(data); // successful response
  });
});

http.listen(8088, function(){
  console.log('Connect 8088 port');
});
