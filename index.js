var express = require('express');
var app = express();

//multer Setup

var multer = require('multer');
var storage = multer.memoryStorage();
var multerUploads = multer({ storage }).single('image');
var Datauri = require('datauri');
var path = require('path')
var dUri = new Datauri();
var md5 = require('md5');
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
var url = 'mongodb://127.0.0.1:27017';
// process.env.MONGODB_STRING || 
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
    var public_id;
    if (req.file) {
        var file = dataUri(req).content;
        return cloudinary.uploader.upload(file).then((result) => {
            userUpload_avatarUrl = result.url
            public_id = result.public_id
                ;
            var obj = {
                "firstname": req.body.firstname,
                "lastname": req.body.lastname,
                "gender": req.body.gender,
                "email": req.body.email,
                "avatar": userUpload_avatarUrl,
                "public_id": public_id,
                "username": req.body.username,
                "password": md5(`${req.body.password}`)
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
        if (err)
            throw err;
        if (req.body.username == data[0].username && md5(`${req.body.password}`) == data[0].password) {
            flag = true;
            req.session.userid = data[0]._id;
        }
        if (flag) {
            req.session.loggedIn = true;
            req.session.userid = data[0]._id;
            req.session.username = data[0].username;
            req.session.public_id = data[0].public_id;
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
                avatar: 'http://res.cloudinary.com/degnified/image/upload/w_300,h_300,c_thumb,g_face/' + req.session.public_id + '.jpg',
                avatar_thumb: 'http://res.cloudinary.com/degnified/image/upload/w_100,h_100,c_thumb,g_face/' + req.session.public_id + '.jpg'
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
                // style: '/css/dashboard.css',
                script: '/js/dashboard.js',
                data: data,
                username: req.session.username,
                avatar: 'http://res.cloudinary.com/degnified/image/upload/w_300,h_300,c_thumb,g_face/' + req.session.public_id + '.jpg',
                avatar_thumb: 'http://res.cloudinary.com/degnified/image/upload/w_100,h_100,c_thumb,g_face/' + req.session.public_id + '.jpg'
            })
        })
    } else {
        res.redirect('/login')
    }
})

//get route to fetch album art

// app.get('/dashboard/albumArt/', (req, res) => {
//     if (req.session.loggedIn == true) {
//         db.collection('creations').find({
//             url: req.query.url
//         }).toArray(function (err, data) {
//             if (err) throw err;
//             res.json(data)
//         })

//     } else {
//         res.redirect('/login')
//     }
// })

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
                avatar: 'http://res.cloudinary.com/degnified/image/upload/w_300,h_300,c_thumb,g_face/' + req.session.public_id + '.jpg',
                avatar_thumb: 'http://res.cloudinary.com/degnified/image/upload/w_100,h_100,c_thumb,g_face/' + req.session.public_id + '.jpg'
            })
        })
    } else {
        res.redirect('/login')
    }
})

//profile update

app.put('/profile/update', (req, res) => {
    if (req.session.loggedIn == true) {
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
    }
    else {
        res.redirect('/login')
    }
})

//avatar update

app.post('/profile/update/avatar', multerUploads, (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('users').find({ _id: ObjectId(req.session.userid) }).toArray(function (error, data) {
            if (error) throw error
            cloudinary.uploader.destroy(data[0].public_id, function (result) {
                var userUpload_avatarUrl
                var public_id
                if (req.file) {
                    var file = dataUri(req).content;
                    return cloudinary.uploader.upload(file).then((result) => {
                        userUpload_avatarUrl = result.url;
                        public_id = result.public_id
                        db.collection('users').findOneAndUpdate(
                            { _id: ObjectId(req.session.userid) },
                            {
                                $set: {
                                    "avatar": userUpload_avatarUrl,
                                    "public_id": public_id
                                }
                            }
                        )
                    })
                }
            });
        })
    }
    else {
        res.redirect('/login')
    }
})

////////////////////////////////////////////////
///////////// composer routes //////////////////
////////////////////////////////////////////////

/*Composer Route*/
app.get('/composer', (req, res) => {

    if (req.session.loggedIn == true) {
        db.collection('creations').find({ userid: req.session.userid }).toArray(function (err, data) {
            if (err)
                throw err;
            res.render('composer.hbs', {
                title: "MusiFy | Composer",
                style: '/css/composer.css',
                script: '/js/composer.js',
                creation: data,
                username: req.session.username,
                avatar: 'http://res.cloudinary.com/degnified/image/upload/w_300,h_300,c_thumb,g_face/' + req.session.public_id + '.jpg',
                avatar_thumb: 'http://res.cloudinary.com/degnified/image/upload/w_100,h_100,c_thumb,g_face/' + req.session.public_id + '.jpg'
            });
        })
    }
    else
        res.redirect('/login')
});

/*Add Composer*/
app.post('/composer/add', function (req, res) {
    const title = req.body.title;
    const beats = req.body.beats;
    const bpm = req.body.bpm;
    const privacy = req.body.privacy;
    const userid = req.session.userid;
    const link = req.body.link;
    const albumArt = 'https://res.cloudinary.com/degnified/image/upload/c_thumb,e_auto_saturation,g_face,h_400,q_96,w_400/v1568213002/Apple-Music-icon-002_hocxsz.jpg'

    if (req.session.loggedIn) {
        db.collection('creations').insertOne({ title: title, beats: beats, bpm: bpm, privacy: privacy, base64data: link, albumArt: albumArt, userid: userid }, function (error, result) {
            if (error)
                throw error;
            else
                res.send("Composer Added");
        });
    }
    else
        res.redirect('/login');

})

/* Search Composer for edit */
app.get('/composer/search', function (req, res) {
    const cid = req.query.id;
    if (req.session.loggedIn) {
        db.collection('creations').find({ '_id': ObjectID(cid) }).toArray(function (err, result) {
            if (err)
                throw err;
            res.json(result);
        });
    }
    else
        res.redirect('/login');
});

/*Edit Composer */
app.put('/composer/update', function (req, res) {
    const cid = req.query.id;
    const title = req.body.title;
    const beats = req.body.beats;
    const bpm = req.body.bpm;
    const privacy = req.body.privacy;
    const link = req.body.link;
    if (req.session.loggedIn) {

        db.collection('creations').updateOne({ '_id': ObjectID(cid) }, { $set: { 'title': title, 'beats': beats, 'bpm': bpm, 'privacy': privacy, 'base64data': link, } }, function (error, result) {
            if (error)
                throw error;
            else
                res.send("Composer Updated");
        });
    }
    else
        res.redirect('/login');
});

/* Delete Composer */
app.delete('/composer/delete', function (req, res) {
    if (req.session.loggedIn == true) {
        const cid = req.query.id;
        db.collection('creations').deleteOne({ _id: ObjectId(cid) }, function (err, data) {
            if (err)
                throw err;
            res.send("Deleted");
        });
    }
    else
        res.redirect('/login')
});
