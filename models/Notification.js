const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = require('../utils/db');
const autoIncrement = require('mongoose-auto-increment');

var notificationSchema = new Schema({
    nID: {
        type: Number, 
        required: true, 
        unique: true
    },
    userID: {
        type: String, 
    },
    content: {
        type: String, 
    },
    url: {
        type: String, 
    },
    seen: {
        type: String,
        default: "0"
    },
	lastModifiedAt : { type: Date, default: Date.now },
})

const Notification = mongoose.model('Notification', notificationSchema);
autoIncrement.initialize(mongoose.connection);
notificationSchema.plugin(autoIncrement.plugin, {model: 'Notification', field: 'nID'});

module.exports = {
    Notification
};