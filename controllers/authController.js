    const jwt = require('jsonwebtoken')
    const config = require('../globals/config')
    
    // compare secret token from header and check if token is valid
    exports.verifyToken = function(req, res, next ) {
        const token = req.headers[config.token_header_name]

        console.log('token', token)

        if (token != null) {
            // verifies secret and checks exp
            jwt.verify(token, config.secret, function(err, decoded) {
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
    };