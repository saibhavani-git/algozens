const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const ApproachSchema = new Schema({
    done: { type: Boolean, default: false },
    code: { type: String, default: '' },
    completedAt: { type: Date },
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    complexityExplanation: { type: String, default: '' },
    complexityCorrect: { type: Boolean, default: false },
    userTime: { type: String, default: '' },
    userSpace: { type: String, default: '' }
}, { _id: false });

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    total: {
        type: Number,
        default: 0
    },
    submissions: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
            storedCode: { type: String, default: '' },
            submittedAt: { type: Date, default: Date.now },
            count: { type: Number, default: 0 },
            approaches: {
                brute: { type: ApproachSchema, default: () => ({}) },
                better: { type: ApproachSchema, default: () => ({}) },
                optimized: { type: ApproachSchema, default: () => ({}) }
            }
        }
    ],
    catQ: [{
        type: String
    }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
