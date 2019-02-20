const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = require('../utils/db');
const autoIncrement = require('mongoose-auto-increment');

var userSessionSchema = new Schema({
    usID: {
        type: Number, 
        required: true, 
        unique: true
    },
    userID: {
        type: String, 
    },
    sessionID: {
        type: String, 
    },
    isActive: {
        type: String, 
        default: "1"
    },
	created_at : { type: Date, default: Date.now },
})

const UserSession = mongoose.model('UserSession', userSessionSchema);
autoIncrement.initialize(mongoose.connection);
userSessionSchema.plugin(autoIncrement.plugin, { model: 'UserSession', field: 'usID' });

module.exports = {
    UserSession
};