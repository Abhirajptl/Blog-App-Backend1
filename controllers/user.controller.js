const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const auth = require('../middlewares/auth')
const checkAccess = require('../middlewares/checkAccess')
const roles = require('../constants/roles')

// only admin (get all the users)
router.get("/",auth, checkAccess(roles.admin), async(req,res)=>{
    try {
        const users = await User.find();
        res.status(200).json(users)
    } catch (error) {
        res.status(500).send(err)
    }
})

router.post('/register', async(req,res)=>{  // to use post method always check you initialise app.use(express.json()) this middleware or not
    try {
        const {username, password, role} = req.body;
        let newUser = await User.findOne({username})
        if(newUser){
            return res.status(400).send('User already exists!')
        }
        
        const hashpassword = await bcrypt.hash(password, 10);
        newUser = new User({username, password: hashpassword, role})
        const savedUser = await newUser.save()
        res.status(201).json({message: "Registered Successfully",savedUser})
    } catch (error) {
        return res.status(400).send(error)
    }
})

router.post("/login", async(req,res)=>{
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username})

        if(!user){
            return res.status(404).send('User not found!')
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if(!isValidPassword){
            return res.status(400).send('Password is wrong!')
        }

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.SECRET_KEY, {expiresIn: "1h"})
        res.json({token, message:"Logged in Successfully!",userId: user._id, role: user.role})
    } catch (error) {
        return res.status(400).send(error)
    }
})


module.exports = router;