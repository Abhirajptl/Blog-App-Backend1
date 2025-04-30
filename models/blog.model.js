const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    image: { type: String },
  createdAt: { type: Date, default: Date.now },
},{
    timestamps: true, versionKey: false
})

module.exports = mongoose.model("blog",blogSchema);