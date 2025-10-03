const mongoose = require("mongoose");
const {mongo_key} = require("./config")

mongoose.connect(mongo_key);

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
})

export const User = mongoose.model("User", userSchema);