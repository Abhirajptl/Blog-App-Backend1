const express = require('express');
const Blog = require('../models/blog.model');
const auth = require('../middlewares/auth');
const checkAccess = require('../middlewares/checkAccess');
const roles = require('../constants/roles');
// const upload = require("../middlewares/multerConfig");
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    },
  });
  
  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  });
  

  router.post('/create', auth, upload.single('image'), async (req, res) => {
    const { title, content } = req.body;
  
    try {
      // Log the incoming request for debugging
      console.log('Request Body:', req.body);
      console.log('Uploaded File:', req.file);
  
      const newBlog = new Blog({
        title,
        content,
        image: req.file ? `/uploads/${req.file.filename}` : null, // Save image path if uploaded
        author: req.user._id,
      });
  
      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
    } catch (error) {
      console.error('Error creating blog:', error);
      res.status(500).json({ message: 'Error creating blog' });
    }
  });



// Blog route ->
// 1. get all blogs (everyone) -> no need to Authentication/login
// router.get('/', async(req,res)=>{
//     try {
//         const blogs = await Blog.find().populate("author", "username")     // .populate required here b/c we not need id of author instead we want all data of user to show on frontend (.populate populate user info by userId)
//         res.json(blogs)
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 5; // Default to 5 blogs per page
        const skip = (page - 1) * limit;

        const blogs = await Blog.find()
            .populate("author", "username") // Populate author details
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by newest first

        const totalBlogs = await Blog.countDocuments();

        res.status(200).json({
            blogs,
            totalBlogs,
            totalPages: Math.ceil(totalBlogs / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).send(error);
    }
});



// 2. create a new blog (author) -> yes Authentication is required & role = author
// router.post('/create', auth, checkAccess([roles.author]), async(req,res)=>{
//     const {title, content} = req.body;
//     try {
//         const blog = new Blog({title, content, author: req.user._id})
//         const savedBlog = await blog.save();
//         res.json(savedBlog)
//     } catch (error) {
//         res.status(400).send(err)
//     }
// })


// 3. edit a blog (author their own blog/admin) -> yes Authentication is required
router.put('/update/:id', auth, checkAccess([roles.author]), async(req,res)=>{
    try {
        const blogId = req.params.id;
        const blog = await Blog.findById(blogId)

        // when blog id is not valid
        if(!blog){
            return res.status(404).json({message:"Not Found"})
        }

        // when user is trying to update someone's blog . here the comparison is b/w author who create blog with whom whick is loggedin same or not
        if(blog.author.toString() !== req.user._id.toString()){
            return res.status(403).json({message:"Access Denied!, Not Your Blog!"})
        }

        const updatedBlog = await Blog.findByIdAndUpdate(blogId, req.body, {new:true})
        res.json(updatedBlog)
    } catch (error) {
        res.status(400).send(error)
    }
})

// 4. delete a blog (author their own blog/admin) -> yes Authentication is required , if you want to pass both checkAccess([roles.author,roles.admin]) 
router.delete('/delete/:id', auth, checkAccess([roles.author,roles.admin]), async(req,res)=>{
    try {
        const blogId = req.params.id;
        const blog = await Blog.findById(blogId)

        // when blog id is not valid
        if(!blog){
            return res.status(404).json({message:"Not Found"})
        }

        // when user is trying to delete someone's blog . here the comparison is b/w author who create blog with whom whick is loggedin same or not
        if(blog.author.toString() !== req.user._id.toString() && req.user.role !== roles.admin){
            return res.status(403).json({message:"Access Denied!"})
        }

        await Blog.findByIdAndDelete(blogId)
        res.json({ message: "Blog deleted successfully!" });
    } catch (error) {
        res.status(400).send(err)
    }
})


module.exports = router;