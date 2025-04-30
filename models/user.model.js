const mongoose = require('mongoose');
const roles = require('../constants/roles');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: [roles.admin, roles.author, roles.reader], default: roles.reader}
},{
    versionKey: false
})

module.exports = mongoose.model("user",userSchema);