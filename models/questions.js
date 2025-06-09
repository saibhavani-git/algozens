const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User=require('./user')
const QuestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['arrays', 'linked-list', 'searching', 'sorting', 'dynamic-programming', 'graphs', 'other']
    },
    description: {
        type: String,
        required: true
    },
   
    inputFormat: {
        type: String,
        required: true
    },
    outputFormat: {
        type: String,
        required: true
    },
    testCases: [
        {
            input: {
                type: String,
                required: true
            },
            expectedOutput: {
                type: String,
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    // user: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    // },
});

const Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;
