const express = require('express');
const router = express.Router();

router.get('/home.html', (req, res) => {
    if (req.cookies['accName'] == undefined) {
        res.redirect('/');
    } else {
        res.sendFile(__dirname + '/public/home.html');
    }
})
router.get('/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

router.get('/images/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

router.get('/javascripts/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

router.get('/styles/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

router.get('/qrcode/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

router.get('/transaction/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

router.get('/user/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});





module.exports = router;