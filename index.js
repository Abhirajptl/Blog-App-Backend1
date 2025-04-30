require('dotenv').config()

const path = require('path');
const cors = require('cors')
const express = require("express");
const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    Credentials:true
}))

const connectDb = require("./Config/db")

const userController = require('./controllers/user.controller')
const blogController = require('./controllers/blog.controller')
app.use('/uploads', express.static('uploads'));

app.use(express.json()) //for parsing the body, if you use post method always check this middleware 

app.get('/', (req,res)=>{
    res.send("Connected")
})

app.use('/user', userController)
app.use('/blog', blogController)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const PORT = process.env.PORT
app.listen(PORT, async()=>{
    await connectDb()
    console.log(`listening to post: ${PORT}`);
})