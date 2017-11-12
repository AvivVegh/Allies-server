var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var userSchema = new Schema({
    email : String,
    user_password : String
});

module.exports = mongoose.model('User', userSchema);
