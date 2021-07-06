const express = require('express');
const router = express.Router();

//moingodb user 
const User = require('./../models/User');

//bcrypt 
const bcrypt = require('bcrypt');


router.post('/signup', (req, res) => {
    let { username, email, password } = req.body;
    username = username.trim();
    email = email.trim();
    password = password.trim();



    if (username == "" || email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Alle Inputs müssen befüllt sein!"
        });
    } else if (password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Passwort muss mindestens 8 Zeichen lang sein"
        })
    } else {
        //checking if user exists
        User.find({ email }).then(result => {
            if (result.length) {
                res.json({
                    status: "FAILED",
                    message: "Diese EMail existiert bereits"
                })
            } else {
                User.find({ username }).then(result => {
                    if (result.length) {
                        res.json({
                            status: "FAILED",
                            message: "Dieser Name existiert bereits"
                        })
                    } else {
                        const saltRounds = 10;
                        bcrypt.hash(password, saltRounds).then(hashedPassword => {
                            const newUser = new User({
                                username,
                                email,
                                password: hashedPassword,
                                admin: '0',
                                verified: '0',
                                follower: 0,

                            });

                            newUser.save().then(result => {
                                res.json({
                                    status: "SUCCESS",
                                    message: "Account erfolgreich erstellt",
                                    data: result,
                                })
                            }).catch(err => {
                                console.log(err)
                            })

                        }).catch(err => {
                            res.json({
                                status: "FAILED",
                                message: "Ein Fehler beim Verschlüsseln der Daten ist aufgetreten"
                            })
                        })
                    }
                })
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "Ein Fehler beim erstellen des Accounts ist aufgetreten"
            })
        })
    }
})

router.post('/signin', (req, res) => {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();

    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Alle Inputs müssen befüllt sein!"
        })
    } else {
        User.find({ email }).then(data => {
            if (data.length) {
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if (result) {
                        res.json({
                            status: "SUCCESS",
                            message: "Login erfolgreich!",
                            data: data
                        })
                    } else {
                        res.json({
                            status: "FAILED",
                            message: "Falsches Passwort"
                        })
                    }
                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "Ein Fehler ist beim Vergleichen des Passworts aufgetreten"
                    })
                })
            } else {
                res.json({
                    status: "FAILED",
                    message: "Ungültige Email Addresse"
                })
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "Ein Fehler ist aufgetreten. Versuche es erneut"
            })
        })
    }
})

router.post('/followers', (req, res) => {

    let { username } = req.body;
    username = username.trim();
    console.log(username)

    User.find({ username }).then(data => {
        if (data.length) {
            res.json({
                data: data,
            })
        } else {
            res.json({
                status: 'FAILED',
                message: "Ein Fehler ist aufgetreten. Versuche es erneut 2"
            })
        }
    }).catch(err => {
        res.json({
            status: "FAILED",
            message: "Ein Fehler ist aufgetreten. Versuche es erneut"
        })
    })
})

router.get('/search', (req, res) => {
    User.find().then(data => {
        res.json({
            data: data,
        })
    }).catch(err => console.log(err))
})

router.post('/follow', (req, res) => {
    let { username, email } = req.body;
    username = username.trim();
    email = email.trim();


    if (username == '' || email == '') {
        res.json({
            status: 'FAILED',
            message: 'Username oder Email darf nicht leer sein'
        });
    } else {
        User.findOneAndUpdate({ email: email }, { $push: { following: username } }, { new: true }).then(data => {
            User.findOneAndUpdate({ username: username }, { $inc: { follower: 1 } }, { new: true }).then(data => {
                res.json({
                    data: data,
                })
            })
        })
    }

})

router.post('/post', (req, res) => {
    let { username, Tweet } = req.body;
    username = username.trim();
    Tweet = Tweet.trim();


    if (username == '') {
        res.json({
            status: 'FAILED',
            message: 'Username oder Email darf nicht leer sein'
        });
    } else {
        User.findOneAndUpdate({ username: username }, { $push: { posts: Tweet } }, { new: true }).then(data => {
            res.json({
                data: data,
                status: 'SUCCESS',
            })
        })
    }

})


router.post('/isFollower', (req, res) => {
    let { email, username } = req.body;
    email = email.trim();
    username = username.trim();


    User.findOne({ email }).then(data => {
        res.json({
            data: data.following.includes(username)
        })

    })

})

router.post('/isAdmin', (req, res) => {
    let { username } = req.body;
    username = username.trim();

    User.findOne({ username }).then(data => {

        res.json({
            data: data.admin
        })
    })

})

router.post('/isVerified', (req, res) => {
    let { username } = req.body;
    username = username.trim();

    User.findOne({ username }).then(data => {

        res.json({
            data: data.verified
        })
    })

})

router.post('/unfollow', (req, res) => {
    let { username, email } = req.body;
    username = username.trim();
    email = email.trim();

    if (username == '' || email == '') {
        res.json({
            status: 'FAILED'
        })
    } else {
        User.findOneAndUpdate({ email: email }, { $pull: { following: username } }, { new: true }).then(data => {
            User.findOneAndUpdate({ username: username }, { $inc: { follower: -1 } }, { new: true }).then(data => {
                res.json({
                    data: data,
                })
            })
        })
    }


})



module.exports = router;