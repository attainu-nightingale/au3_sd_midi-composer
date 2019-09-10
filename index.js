var express = require('express');
var app = express();

//multer Setup

var multer = require('multer');
var storage = multer.memoryStorage();
var multerUploads = multer({ storage }).single('image');

var Datauri = require('datauri');
var path = require('path')
var dUri = new Datauri();
/**
* @description This function converts the buffer to data url
* @param {Object} req containing the field object
* @returns {String} The data url from the string buffer
*/
var dataUri = req => dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);

// dotenv
require('dotenv').config()

//cloudinary setup
var cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


//view Engine
var hbs = require('hbs');
app.set('view engine', 'hbs');

//session object setup
var session = require('express-session');
app.use(session({
    secret: 'encryption',
    resave: true,
    saveUninitialized: true
}));

//Static Asset Declaration
app.use(express.static(__dirname + '/public'));

//bodyParser Setup
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

//Database
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_STRING;
var DbName = 'musify';
var db;

//connecting to DataBase
MongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, function (err, client) {
    if (err) throw err
    console.log('DB connected')
    db = client.db(DbName);
})

//importing ObjectId
ObjectId = require('mongodb').ObjectID

//port
var port = process.env.PORT || 3000;

//starting Server
app.listen(port);
console.log('play it on port : ' + port)

//static Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
})
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
})
app.get('/login?error=Invalid Username or Password', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
})
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
})
app.get('/credits', (req, res) => {
    res.sendFile(__dirname + '/public/credits.html');
})
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/')
})

////////////////////////////////////////////////////
//////////////////   Signup  ///////////////////////
////////////////////////////////////////////////////
app.post('/signup', multerUploads, (req, res) => {
    var userUpload_avatarUrl
    if (req.file) {
        var file = dataUri(req).content;
        return cloudinary.uploader.upload(file).then((result) => {
            userUpload_avatarUrl = result.url;
            var obj = {
                "firstname": req.body.firstname,
                "lastname": req.body.lastname,
                "gender": req.body.gender,
                "email": req.body.email,
                "avatar": userUpload_avatarUrl,
                "username": req.body.username,
                "password": req.body.password
            }
            db.collection('users').insertOne(obj),
                function (err, data) {
                    if (err) throw err
                }
            res.redirect('/login')
        })
    }
})

////////////////////////////////////////////////////
//////////////////   login  ////////////////////////
////////////////////////////////////////////////////

app.post('/login', (req, res) => {
    var flag = false;
    db.collection('users').find({ username: req.body.username }).toArray(function (err, data) {
        if (err) throw error

        if (req.body.username == data[0].username && req.body.password == data[0].password) {
            flag = true;
        }
        if (flag) {
            req.session.loggedIn = true;
            req.session.userid = data[0]._id;
            req.session.username = data[0].username;
            req.session.avatar = data[0].avatar;
            res.redirect("/dashboard");
        }
        else res.redirect("/login")
    })
})

////////////////////////////////////////////////////
//////////////  Dashboard Routes  //////////////////
////////////////////////////////////////////////////

//get route for creation
app.get('/dashboard', (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('creations').find({
            userid: req.session.userid
        }).toArray(function (err, data) {
            if (err) throw err;
            res.render('dashboard.hbs', {
                title: "MusiFy | Dashboard",
                style: '/css/dashboard.css',
                script: '/js/dashboard.js',
                data: data,
                username: req.session.username,
                avatar: req.session.avatar
            })
        })
    } else {
        res.redirect('/login')
    }
})

//get route to explore all creations set as public

app.get('/dashboard/explore', (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('creations').find({
            privacy: true
        }).toArray(function (err, data) {
            if (err) throw err;
            res.render('dashboard.hbs', {
                title: "MusiFy | Dashboard",
                style: '/css/dashboard.css',
                script: '/js/dashboard.js',
                data: data,
                username: req.session.username,
                avatar: req.session.avatar
            })
        })
    } else {
        res.redirect('/login')
    }
})

//get route to fetch album art

app.get('/dashboard/albumArt/', (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('creations').find({
            url: req.query.url
        }).toArray(function (err, data) {
            if (err) throw err;
            res.json(data)
        })

    } else {
        res.redirect('/login')
    }
})

////////////////////////////////////////////////
////////////////// Profile /////////////////////
////////////////////////////////////////////////

app.get('/profile', (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('users').find({
            _id: ObjectId(req.session.userid)
        }).toArray(function (err, data) {
            if (err) throw err;
            res.render('profile.hbs', {
                title: "MusiFy | " + req.session.username,
                style: '/css/profile.css',
                script: '/js/profile.js',
                data: data[0],
                username: req.session.username,
                avatar: req.session.avatar,
            })
        })
    } else {
        res.redirect('/login')
    }
})

app.put('/profile/update', (req, res) => {
    db.collection('users').find({ _id: ObjectId(req.session.userid) }).toArray(function (err, data) {
        db.collection('users').findOneAndUpdate(
            { _id: ObjectId(req.session.userid) },
            {
                $set: {
                    "firstname": req.body.firstname,
                    "lastname": req.body.lastname,
                    "gender": req.body.gender,
                    "email": req.body.email,
                    "username": req.body.username
                }
            }
        )
    })
})
////////////////////////////////////////////////
///////////// composer routes //////////////////
////////////////////////////////////////////////
//delete route
app.delete('/creations/delete/:id', (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('creations').deleteOne({
            _id: ObjectId(req.params.id)
        }, function (err, data) {
            if (err) throw err
        })
    } else {
        res.redirect('/login')
    }
})
