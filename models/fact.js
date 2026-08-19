const mongoose = require('mongoose');

const FactSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true }
});

module.exports = mongoose.model('Fact', FactSchema);
