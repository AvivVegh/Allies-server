    'use strict'

    var express = require('express')
    var app = express()    
    var mongoose = require('mongoose')
    var crypto = require('crypto')
    var bodyParser = require('body-parser')
    var jwt = require('jsonwebtoken')

    var config = require('./config')
    var User = require('./models/user')

    var port = process.env.PORT || 3000;   

    console.log('db',config.database)
    mongoose.connect(config.database)

    mongoose.connection.on('connected', function () {  
     console.log('Mongoose default connection open to ')
    }); 

    // If the connection throws an error
    mongoose.connection.on('error',function (err) {  
        console.log('Mongoose default connection error: ' + err)
    }); 
 
    app.set('superSecret', config.secret)

    app.use(bodyParser.urlencoded({extended:true}))
    app.use(bodyParser.json())

    function getEncryptPasword(password) {
        return crypto.createHmac(config.crypto_algorithm, config.password_secret_key).update(password).digest('hex')
    }

    function getTokenJson(user) {
        var expiresIn = 1400
        var token = jwt.sign(user, app.get('superSecret'), {'expiresIn': expiresIn})
        return {token: token, expiresIn: expiresIn}
    }

    function getResponseJson(message, status) {
        return {data: message, resultCode: status}
    }

    var apiRoutes = express.Router()

    // route middleware to verify a token
    apiRoutes.use(function(req, res, next ) {
        var token = req.headers[config.token_header_name]

        console.log('token', token)

        if (token != null) {
            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'),function(err, decoded) {
                if (err) {
                    res.status(401).send('Authenticate failed')
                } else {
                    // if everything is good, save to request for use in other routes

                    console.log('user_json', decoded._doc)
                    req.user = decoded._doc
                    next()
                }
            })

        } else {
            console.log('req', req.body)
            next()
        }
    })

    apiRoutes.get('/',function(req, res) {
        res.send('Kotlin-node restful api')
    })

    apiRoutes.post('/auth',function(req, res) { 
    
        User.findOne({email: req.body.email,password: req.body.password},function(err, user) {
            if (err != null) {
                res.status(402)
                res.json(getResponseJson(err, 402))
            } else {
                if (user != null) {
                    res.json(getResponseJson(getTokenJson(user), 200))
                } else {
                    res.status(401)
                    res.json(getResponseJson({error: 'User not found'}, 401))
                }
            }
        })
    })

    apiRoutes.post('/user/register', function(req, res) { 
        User.findOne({email: req.body.email}, function(err, dbUser) {
            if (err != null) {
                res.status(402)
                res.json(getResponseJson(err, 402))
            } else {
                if (dbUser != null) {
                    res.status(401)
                    res.json(getResponseJson({error: 'User already exist'}, 401))
                } else {
                    var user = User({email:req.body.email, user_password:getEncryptPasword(req.body.password)})

                    user.save(function(error) {
                        console.log('user', user)

                        if (error != null) {
                            res.status(406)
                            res.json(getResponseJson(error, 406))
                        } else {
                            res.json(user)
                        }
                    })
                }
            }
        })
    })

    apiRoutes.post('/user/login',function(req, res) {
        User.findOne({email:req.body.email},function(err, user) { 
            if (err != null) {
                res.status(402)
                res.json(getResponseJson(err, 402))
            } else {
                if (user != null) {
                    if (user.user_password === getEncryptPasword(req.body.password)) {
                        res.json(getTokenJson(user))
                    } else {
                        res.status(401)
                        res.json(getResponseJson({error: 'Password incorrect'}, 401))
                    }
                } else {
                    res.status(401)
                    res.json(getResponseJson({error: 'Password incorrect'}, 401))
                }
            }
        })
    })

    apiRoutes.put('/user/update', function(req,res) { 
        User.findById(req.id).exec(function(err,user) {
            if (err) {
                res.status(400)
                res.send(getResponseJson(err, 400))
            } else {
                if (user != null) {
                    user.email = req.body.email

                    user.save(function(saveErr) {
                        if (saveErr != null) {
                            res.status(400)
                            res.json(getResponseJson(saveErr, 400))
                        } else {
                            res.json(getResponseJson(user, 200))
                        }
                    })
                } else {
                    res.json(getResponseJson('User not found', 400))
                }
            }
        })
    })

    apiRoutes.get('/user/find/:id', function(req,res) {
        User.findById(req.params.id).exec(function(err, user) {
            if (err) {
                res.status(400)
                res.send(getResponseJson(err, 400))
            } else {
                res.json(getResponseJson(user, 200))
            }
        })
    })

    apiRoutes.delete('/user/delete/:id',function(req, res) {
        User.remove({_id:req.params.id}, function(err, user) {
            if (err) {
                res.status(400)
                res.send(getResponseJson(err, 400))
            } else {
                res.json(getResponseJson('User successfully deleted', 200))
            }
        })
    })

    app.use('/api', apiRoutes)

    app.listen(port, function() {
        console.log('running on port', port)
    })