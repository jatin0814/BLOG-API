const express = require("express");
const { body } = require("express-validator/check");
const feedController = require("../controllers/post");
const isAuth = require('../middleware/is-auth')
const router = express.Router();

///GET /feed/post 
router.get('/posts',isAuth,feedController.getPosts);
///post /feed/post 
router.post('/post',isAuth,[body("title").trim().isLength({min:7}),body("content").trim().isLength({min:5})],feedController.createPost);

router.get('/status',isAuth,feedController.getStatus)

router.put('/status',isAuth,feedController.updateStatus)

router.get('/post/:id',isAuth,feedController.getPost)

router.put('/post/:id',[body("title").trim().isLength({min:7}),body("content").trim().isLength({min:5})],feedController.editPost)

router.delete('/post/:id',isAuth,feedController.deletePost)
module.exports = router;