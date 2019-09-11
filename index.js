var express = require('express');
var app = express();

//port
var port = 3000;

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
var url = 'mongodb://localhost:27017';
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
app.post('/signup', (req, res) => {
    var obj = {
        "firstname": req.body.firstname,
        "lastname": req.body.lastname,
        "gender": req.body.gender,
        "email": req.body.email,
        "username": req.body.username,
        "password": req.body.password
    }
    db.collection('users').insertOne(obj),
        function (err, data) {
            if (err) throw err
        }
    res.redirect('/login')
})

////////////////////////////////////////////////////
//////////////////   login  ////////////////////////
////////////////////////////////////////////////////

app.post('/login', (req, res) => {
    var flag = false;
    db.collection('users').find({username: req.body.username}).toArray(function (err, data) {
        if (err) 
            throw err;
        if (req.body.username == data[0].username && req.body.password == data[0].password) {
            flag = true;
            req.session.userid = data[0]._id;
        }
        if (flag) {
            req.session.loggedIn = true;
            req.session.username = req.body.username;
            res.redirect("/dashboard");
        } else
            res.redirect("/login");
    })
})

////////////////////////////////////////////////////
//////////////  Secured Routes  ////////////////////
////////////////////////////////////////////////////

//get route for creation
app.get('/dashboard', (req, res) => {
    if (req.session.loggedIn == true) {
        console.log(req.session.userid);
        console.log(req.session.username)
        db.collection('creations').find({
            username: req.session.username
        }).toArray(function (err, data) {
            if (err) throw err;
            res.render('dashboard.hbs', {
                title: "MusiFy | Dashboard",
                style: '/css/dashboard.css',
                script: '/js/dashboard.js',
                data: data,
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
            })
        })
    } else {
        res.redirect('/login')
    }
})

////////////////////////////////////////////////
///////////// composer routes //////////////////
////////////////////////////////////////////////
var ObjectID = require('mongodb').ObjectID;

/*Composer Route*/
app.get('/composer', (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('creations').find({userid: req.session.userid}).toArray(function (err, data) {
            if (err) 
                throw err;
            res.render('composer.hbs', {
                title: "MusiFy | Composer",
                style: '/css/composer.css',
                script: '/js/composer.js',
                creation: data,
            });
        });
    }
    else
        res.redirect('/login')
});

/*Add Composer*/
app.post('/composer/add', function(req, res){
    const title = req.body.title;
    const beats = req.body.beats;
    const bpm = req.body.bpm;
    const privacy = req.body.privacy;
    const userid = req.session.userid;
    const link = req.body.link;

    if(req.session.loggedIn)
    {
        db.collection('creations').insertOne({title:title, beats:beats, bpm:bpm, privacy:privacy, base64data:link, userid:userid}, function(error, result){
            if(error)
                throw error;
            else       
                res.send("Composer Added");
        });
    }
    else    
        res.redirect('/login');
});

/* Search Composer for edit */
app.get('/composer/search', function(req, res){
    const cid = req.query.id;
    if(req.session.loggedIn){
        db.collection('creations').find({'_id':ObjectID(cid)}).toArray(function (err, result){
            if(err)
                throw err;
            res.json(result);
        });
    }
    else
        res.redirect('/login');
});

/*Edit Composer */
app.put('/composer/update', function(req, res){
    const cid = req.query.id;
    const title = req.body.title;
    const beats = req.body.beats;
    const bpm = req.body.bpm;
    const privacy = req.body.privacy;
    const link = req.body.link;

    db.collection('creations').updateOne({'_id':ObjectID(cid)}, {$set: {'title': title, 'beats':beats, 'bpm':bpm, 'privacy':privacy, 'base64data':link,} }, function(error, result){
        if(error)
            throw error;
        else
            res.send("Composer Updated");
    });
});

/* Delete Composer */
app.delete('/composer/delete', function(req,res) {
    if (req.session.loggedIn == true) {
        const cid = req.query.id;
        db.collection('creations').deleteOne({_id: ObjectId(cid)}, function (err, data) {
            if (err) 
                throw err;
            res.send("Deleted");
        });
    } 
    else
        res.redirect('/login')
});
