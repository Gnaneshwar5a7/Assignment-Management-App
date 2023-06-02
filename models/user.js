const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema(
    {
        username: { type: String },
        name: {type:String},
        password: { type: String },
        email: { type: String },
        branch: { type: String },
        subject: { type: String },
        userType:{type: String}
    }
);

module.exports = mongoose.model("user", userSchema);