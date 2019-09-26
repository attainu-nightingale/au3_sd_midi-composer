const express = require('express');
const router = express.Router();
const multer = require('multer');
let storage = multer.memoryStorage();
let multerUploads = multer({ storage }).single('image');
let Datauri = require('datauri');
let path = require('path')
let dUri = new Datauri();
let dataUri = req => dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
let cloudinary = require('cloudinary').v2;

router.get('/', (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('users').find({_id: ObjectId(req.session.userid)}).toArray(function (err, data) {
            if (err) 
                throw err;
            if(data[0].gender=="Female"){
                res.render('profile.hbs', {
                    title: "MusiFy | " + req.session.username,
                    style: '/css/profile.css',
                    script: '/js/profile.js',
                    data: data[0],
                    female:"Female",
                    username: req.session.username,
                    avatar: 'http://res.cloudinary.com/jayshah/image/upload/w_300,h_300,c_thumb,g_face/' + req.session.public_id + '.jpg',
                });
            }
            else{
                res.render('profile.hbs', {
                    title: "MusiFy | " + req.session.username,
                    style: '/css/profile.css',
                    script: '/js/profile.js',
                    data: data[0],
                    username: req.session.username,
                    avatar: 'http://res.cloudinary.com/jayshah/image/upload/w_300,h_300,c_thumb,g_face/' + req.session.public_id + '.jpg',
                });
            }
        });
    } 
    else 
        res.redirect('/login')
});

//profile update
router.put('/update', (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('users').findOneAndUpdate({ _id: ObjectId(req.session.userid)},{$set: {"firstname": req.body.firstname,"lastname": req.body.lastname,"gender": req.body.gender,"email": req.body.email}},function(error,result){
            if(error)
                throw error;
            res.redirect('/profile');
 
        });
    }
    else {
        res.redirect('/login')
    }
})

//avatar update
router.post('/update/avatar', multerUploads, (req, res) => {
    if (req.session.loggedIn == true) {
        if(!req.file)
            res.redirect('/profile');
        else{
            db.collection('users').find({ _id: ObjectId(req.session.userid) }).toArray(function (error, data) {
                if (error) 
                    throw error
                var userUpload_avatarUrl
                var public_id
                if(data[0].public_id=="sih5nmepjl56xiwpw7vu"){
                    var file = dataUri(req).content;
                    return cloudinary.uploader.upload(file).then((result) => {
                        userUpload_avatarUrl = result.url;
                        public_id = result.public_id
                        db.collection('users').findOneAndUpdate({ _id: ObjectId(req.session.userid) },{$set: {"avatar": userUpload_avatarUrl,"public_id": public_id}},function(error, result){
                            res.redirect('/');
                        });
                    });                    
                }
                else{
                    cloudinary.uploader.destroy(data[0].public_id, function (result) {
                        var file = dataUri(req).content;
                        return cloudinary.uploader.upload(file).then((result) => {
                            userUpload_avatarUrl = result.url;
                            public_id = result.public_id
                            db.collection('users').findOneAndUpdate({ _id: ObjectId(req.session.userid) },{$set: {"avatar": userUpload_avatarUrl,"public_id": public_id}},function(error, result){
                                req.session.public_id = public_id;
                                res.redirect('/');
                            });
                        });
                    });
                }
            });
        }
    }
    else
        res.redirect('/login')
})

module.exports = router;