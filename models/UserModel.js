const mongoose = require("mongoose")
const userModel = new mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pin: {
        type: String,
        required: false
    },
    publicKey: {
        type: String,
        required: false
    },
    wallet: {
        type: String,
        required: false,

    },
    stepsCount: {
        type: String,
        required: false,
    },
})

module.exports = mongoose.model("User", userModel)