const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true,
    },
    image: {
        type: String,
        require: false
    }
})

const UserModel = mongoose.model("users", schema)

const msgSchema = new mongoose.Schema({
    sender : {
        type: String,
        require: true
    },
    receiver: {
        type: String,
        require: true
    },
    message: {
        type: String
    },
    time : {
        type: Date,
        default: Date.now
    }
})

const MsgModel = mongoose.model('Messages', msgSchema)

module.exports = {UserModel, MsgModel}