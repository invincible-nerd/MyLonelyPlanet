const mongoose = require("mongoose")
const Schema = mongoose.Schema
const passportLocalMongoose = require("passport-local-mongoose")

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
//add a username, hash and salt field 
//ensure that username is unique
//include static methods, like User.authenticate(), User.serializeUser(), User.deserializeUser()
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema)