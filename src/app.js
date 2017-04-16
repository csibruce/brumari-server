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
  console.log('a user connected');

  socket.on('disconnect', function(){
   console.log('user disconnected');
 });
});

app.use(express.static('public'));

AWS.config.update({
  accessKeyId: AWS_KEY.accessKeyId,
  secretAccessKey: AWS_KEY.secretAccessKey,
  region: AWS_KEY.rengion,
});

var s3 = new AWS.S3();
var param = {
  'Bucket': 'brumari',
  'Key': 'wedding-main.png',
  'ACL': 'public-read',
  'Body': fs.createReadStream('./src/test.jpg'),
  'ContentType': 'image/jpg'
}

const getParamsForS3Upload = (name, file, type) => ({
  'Bucket': 'brumari',
  'Key': name,
  'ACL': 'public-read',
  'Body': file,
  'ContentType': type,
})

app.use('/', express.static('public'));

app.use('/auth', auth, express.static('public'));

app.post('/upload', Multer.single('upload'), function(req, res){
  // console.log(req.file);
  const { originalname, mimetype, buffer } = req.file
  s3.upload(getParamsForS3Upload(originalname, buffer, mimetype), function(err, data){
    console.log(err);
    console.log(data);
    if (data) return res.json(data);
    res.send(err);
  })
});

http.listen(8088, function(){
  console.log('Connect 8088 port');
});
