    const mongoose = require('mongoose')
    const crypto = require('crypto')
    const bodyParser = require('body-parser')
    const jwt = require('jsonwebtoken')
    
    const Common = require('../globals/common');
    const User = require('../models/user')

    // Authenticate user 
    exports.authenticate = function(req, res) {
        User.findOne({email: req.body.email,password: req.body.password},function(err, user) {
            if (err != null) {
                res.status(402)
                res.json(Common.createJsonRespone(err, 402))
            } else {
                if (user != null) {
                    res.json(Common.createJsonRespone(getTokenJson(user), 200))
                } else {
                    res.status(401)
                    res.json(Common.createJsonRespone({error: 'User not found'}, 401))
                }
            }
        })
    };

    // Register user
    exports.register = function(req, res) { 
        User.findOne({email: req.body.email}, function(err, dbUser) {
            if (err != null) {
                res.status(402)
                res.json(Common.createJsonRespone(err, 402))
            } else {
                if (dbUser != null) {
                    res.status(401)
                    res.json(Common.createJsonRespone({error: 'User already exist'}, 401))
                } else {
                    var user = User({email:req.body.email, user_password:getEncryptPasword(req.body.password)})

                    user.save(function(error) {
                        console.log('user', user)

                        if (error != null) {
                            res.status(406)
                            res.json(Common.createJsonRespone(error, 406))
                        } else {
                            res.json(user)
                        }
                    })
                }
            }
        })
    };

    // User login
    exports.login = function(req, res) {
        User.findOne({email:req.body.email},function(err, user) { 
            if (err != null) {
                res.status(402)
                res.json(Common.createJsonRespone(err, 402))
            } else {
                if (user != null) {
                    if (user.user_password === getEncryptPasword(req.body.password)) {
                        res.json(getTokenJson(user))
                    } else {
                        res.status(401)
                        res.json(Common.createJsonRespone({error: 'Password incorrect'}, 401))
                    }
                } else {
                    res.status(401)
                    res.json(Common.createJsonRespone({error: 'Password incorrect'}, 401))
                }
            }
        })
    };

    // Update user
    exports.update =  function(req,res) { 
        User.findById(req.id).exec(function(err,user) {
            if (err) {
                res.status(400)
                res.send(Common.createJsonRespone(err, 400))
            } else {
                if (user != null) {
                    user.email = req.body.email

                    user.save(function(saveErr) {
                        if (saveErr != null) {
                            res.status(400)
                            res.json(Common.createJsonRespone(saveErr, 400))
                        } else {
                            res.json(Common.createJsonRespone(user, 200))
                        }
                    })
                } else {
                    res.json(Common.createJsonRespone('User not found', 400))
                }
            }
        })
    };

    // Find user by id
    exports.findById = function(req,res) {
        User.findById(req.params.id).exec(function(err, user) {
            if (err) {
                res.status(400)
                res.send(Common.createJsonRespone(err, 400))
            } else {
                res.json(Common.createJsonRespone(user, 200))
            }
        })
    };

    // Delete user by id
    exports.deleteById = function(req, res) {
        User.remove({_id:req.params.id}, function(err, user) {
            if (err) {
                res.status(400)
                res.send(Common.createJsonRespone(err, 400))
            } else {
                res.json(Common.createJsonRespone('User successfully deleted', 200))
            }
        })
    };

    function getTokenJson(user) {
        const expiresIn = 1400
        const token = jwt.sign(user, app.get('superSecret'), {'expiresIn': expiresIn})
        return {token: token, expiresIn: expiresIn}
    };

    function getEncryptPasword(password) {
        return crypto.createHmac(config.crypto_algorithm, config.password_secret_key).update(password).digest('hex')
    };