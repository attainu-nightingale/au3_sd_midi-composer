const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
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
                avatar: 'http://res.cloudinary.com/jayshah/image/upload/w_300,h_300,c_thumb,g_face/' + req.session.public_id + '.jpg'
            });
        });
    }
    else
        res.redirect('/login')
});

/*Add Composer*/
router.post('/add', function (req, res) {
    const title = req.body.title;
    const beats = req.body.beats;
    const bpm = req.body.bpm;
    const privacy = req.body.privacy;
    const userid = req.session.userid;
    const link = req.body.link;

    if (req.session.loggedIn) {
        db.collection('creations').insertOne({ title: title, beats: beats, bpm: bpm, privacy: privacy, base64data: link, userid: userid }, function (error, result) {
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
router.get('/search', function (req, res) {
    const cid = req.query.id;
    if (req.session.loggedIn) {
        db.collection('creations').find({ '_id': ObjectId(cid) }).toArray(function (err, result) {
            if (err)
                throw err;
            res.json(result);
        });
    }
    else
        res.redirect('/login');
});

/*Edit Composer */
router.put('/update', function (req, res) {
    const cid = req.query.id;
    const title = req.body.title;
    const beats = req.body.beats;
    const bpm = req.body.bpm;
    const privacy = req.body.privacy;
    const link = req.body.link;
    if (req.session.loggedIn) {

        db.collection('creations').updateOne({ '_id': ObjectId(cid) }, { $set: { 'title': title, 'beats': beats, 'bpm': bpm, 'privacy': privacy, 'base64data': link, } }, function (error, result) {
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
router.delete('/delete', function (req, res) {
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

module.exports = router;