const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema
const URL = new mongoose.Schema({
    original_url: {
    type: String,
    required: true,
    },
    short_url: Number,
});
// create model
module.exports = mongoose.model("URL", URL);