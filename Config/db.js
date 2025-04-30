const mongoose = require("mongoose");
const mongoUri = process.env.MONGO_URI;

module.exports = async() =>{
    return await mongoose.connect(mongoUri);
}