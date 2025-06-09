const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const Question=require('./questions')


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    total:{
        type:Number,
        default:0
    },
    submissions: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
            storedCode: { type: String, default: '' },
            // language: { type: String, required: true },
            submittedAt: { type: Date, default: Date.now },
            count:{type: Number,default: 0}
        }
    ]

});


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);

