const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const questionSchema = new Schema(
    {
        subject: {type:String},
        question: {type:String},
    }
);

module.exports = mongoose.model("question", questionSchema,'questions');