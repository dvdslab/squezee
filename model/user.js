const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserShcema = new Schema({
    userId: {
        type: Number,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    links: [{
        original_url: String,
        short_url: Number,
    }]
})

module.exports = mongoose.model('User', UserShcema)