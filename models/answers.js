const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const answerSchema = new Schema(
    {
        username: {type:String},
        subject: {type:String},
        question: {type:String},
        answer: {type: String},
    }
);

module.exports = mongoose.model("answer", answerSchema);