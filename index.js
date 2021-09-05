const AWS = require('aws-sdk');
const fs = require('fs');
var express = require('express')
var multer = require('multer')
var multerS3 = require('multer-s3')
const bodyParser = require('body-parser');

const LIARA_ACCESS_KEY = process.env.LIARA_ACCESS_KEY;
const LIARA_SECRET_KEY = process.env.LIARA_SECRET_KEY;
const LIARA_ENDPOINT = process.env.LIARA_ENDPOINT;
const BUCKET_NAME = 'images';


const s3 = new AWS.S3({
    accessKeyId: LIARA_ACCESS_KEY,
    secretAccessKey: LIARA_SECRET_KEY,
    endpoint: LIARA_ENDPOINT,
    s3ForcePathStyle: true
});


var app = express()


app.use(bodyParser.json());
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: BUCKET_NAME,
        acl: 'public-read',
        contentDisposition: 'attachment',
        metadata: function (req, file, cb) {


            cb(null, { fieldName: file.fieldname })
        },
        key: function (req, file, cb) {
            console.log(file)
            cb(null, Date.now().toString())
        }
    })
})

app.get('/', (req, res) => {
    s3.listObjectsV2({ Bucket: BUCKET_NAME, }, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data.Contents[0]);
    });
    res.sendFile(__dirname + '/index.html')
})

app.get('/images', (req, res) => {
    res.sendFile(__dirname + '/images.html')
})
app.get('/api/images', async (req, res) => {


    let data = await Promise.all([getPhotos()])
    data = data[0]
    res.send(data)
})
app.post('/upload', upload.single('image'), (req, res, next) => {
    console.log(req.file)
    res.send(req.files)
})


const getPhotos = async () => {
    const keys = ['1630851487971', '1630851511369', '1630851451596', '1630851332100', '1630851332100', '1630851332100', '1630851332100', '1630851332100', '1630851332100', '1630851332100', '1630851332100', '1630851332100', '1630851332100'];

    const images = [];
    for (const key of keys) {
        const data = await s3.getObject({ Bucket: BUCKET_NAME, Key: key }).promise();
        const base = new Buffer.from(data.Body.buffer).toString("base64");
        images.push(base)
    }
    return images
}

app.listen(3000, a => {
    console.log('run')
})
