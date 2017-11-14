const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const config = require('./globals/config')
const api = require('./routes/api')
const index = require('./routes/index')

const port = process.env.PORT || 3000;   

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

app.use('/', index);
app.use('/api', api);

app.listen(port, function() {
    console.log('running on port', port)
})