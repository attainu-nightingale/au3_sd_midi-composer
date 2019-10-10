const express = require('express');
const router = express.Router();
const multer = require('multer');
let storage = multer.memoryStorage();
let multerUploads = multer({ storage }).single('image');
let Datauri = require('datauri');
let path = require('path')
let dUri = new Datauri();
let dataUri = req => dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
let md5 = require('md5');
let cloudinary = require('cloudinary').v2;

router.get('/', (req, res) => {
    if(req.session.loggedIn)
        res.redirect('/dashboard');
    else{
        res.render('signup.hbs',{
            layout:false
        });
    }
});

router.post('/',multerUploads, (req, res) => {
    var userUpload_avatarUrl
    var public_id;
    if(!req.file){
        userUpload_avatarUrl = "https://res.cloudinary.com/jayshah/image/upload/v1569052586/sih5nmepjl56xiwpw7vu.png";
        public_id = "sih5nmepjl56xiwpw7vu";
        db.collection('users').findOne({'username':req.body.username},function(error, result){
            if(error)
                throw error;
            else if(result==null){
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
                db.collection('users').insertOne(obj, function (err, data) {
                    if (err) 
                        throw err
                    res.redirect('/login')    
                });
            }
            else{
                res.render('signup.hbs',{
                    layout:false,
                    error:" '"+req.body.username+"' username exists"
                });
            }
        });
    }
    else {
        var file = dataUri(req).content;
        return cloudinary.uploader.upload(file).then((result) => {
            userUpload_avatarUrl = result.url
            public_id = result.public_id;
            db.collection('users').findOne({'username':req.body.username},function(error, result){
                if(error)
                    throw error;
                else if(result==null){
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
                    db.collection('users').insertOne(obj, function (err, data) {
                        if (err) 
                            throw err
                        res.redirect('/login')    
                    });
                }
                else{
                    cloudinary.uploader.destroy(public_id);
                    res.render('signup.hbs',{
                        layout:false,
                        error:" '"+req.body.username+"' username exists"
                    });
                }
            });
        });
    }
});

module.exports = router
