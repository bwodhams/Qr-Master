const express = require('express');
const router = express.Router();

router.get('/home.html', (req, res) => {
    if (req.cookies['accName'] == undefined) {
        if (req.cookies['autoLogout'] == undefined) {
            res.redirect('/');
        } else {
            res.redirect('/autoLogout.html');
        }
    } else {
        res.sendFile(__dirname + '/public/home.html');
    }
});

router.get('/user/account.html', (req, res) => {
    if (req.cookies['accName'] == undefined) {
        if (req.cookies['autoLogout'] == undefined) {
            res.redirect('/');
        } else {
            res.redirect('/autoLogout.html');
        }
    } else {
        res.sendFile(__dirname + '/public/user/account.html');
    }
});

router.get('/', (req, res) => {
    if (req.cookies['accName'] != undefined) {
        res.redirect('/home.html');
    } else {
        if (req.cookies['autoLogout'] == undefined) {
            res.sendFile(__dirname + '/public/' + req.path);
        } else {
            res.redirect('/autoLogout.html');
        }
    }
});

router.get('/user/login.html', (req, res) => {
    if (req.cookies['accName'] == undefined) {
        res.sendFile(__dirname + '/public/user/login.html');
    } else {
        res.redirect('/home.html');
    }
});

router.get('/user/register.html', (req, res) => {
    if (req.cookies['accName'] == undefined) {
        res.sendFile(__dirname + '/public/user/register.html');
    } else {
        res.redirect('/home.html');
    }
});

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

router.get('/user/qrcode/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

router.get('/transaction/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

router.get('/user/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

module.exports = router;