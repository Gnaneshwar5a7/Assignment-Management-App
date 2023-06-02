const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const branchSchema = new Schema(
    {
        branch:{type:String},
        subjects: {type:Array},
    }
);

module.exports = mongoose.model("branch", branchSchema);