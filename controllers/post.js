const {validationResult} = require("express-validator/check");
const mongoose = require("mongoose")
const Post = require('../models/post');
const User=require('../models/user');
const fs=require("fs");

exports.getPosts = (req,res,next) => {
    const CurrentPage = req.query.page || 1;
    const postPerPage = 2
    let totalPosts;
    Post.find().countDocuments().then(num=>{
        totalPosts=num;
        return Post.find().skip((CurrentPage-1)*postPerPage).limit(postPerPage)
    }).then(posts=>{
        res.status(200).json({message:"Posts",posts:posts,totalItems:totalPosts})
    }).catch(err=>{

    })
    Post.find().catch(err=>{
        {
            if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);}
    })
};

exports.createPost = (req,res,next) => {
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace("\\" ,"/");
    const errors = validationResult(req);
    const userId=req.userID;
    let creator;
    console.log(errors);
    if(!errors.isEmpty()){
        const error = new Error("Please enter correct data");
        error.statusCode = 422;
        throw error; 
    }
    if(!req.file){
        const error=new Error("Image not found");
        error.statusCode = 422;
        throw error
    }

    //push into database
    const post = new Post({
        title:title,
        content:content,
        creator:userId,
        imageUrl:imageUrl
    });
    post.save()
    .then(post=>{
        return User.findById(userId)
        }).then(user=>{
            creator=user;
            user.posts.push(post._id);
            return user.save()
    })
    .then(user=>{
        res.status(201).json({
            message:"Post Created success fully",
            post:post,
            creator:{_id:user._id,name:user.name}
        })
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.getPost = (req,res,next) => {
    const id = req.params.id;
    Post.findById(id).then(post=>{
        if(!post){
            const error=new Error("Post fot found");
            error.statusCode=500;
            throw error;
        }
        res.status(200).json({message:"Post fetched",post:post})
    }).catch(err=>
        {
            if(!err.statusCode){
            err.statusCode = 500;
        }
            next(err);
    }
    )
}

exports.editPost = (req,res,next) => {
    const postId = req.params.id;
    //console.log(postId)
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    // console.log(imageUrl)
    // console.log(req.file)
    if(req.file){
        imageUrl=req.file.path.replace("\\","/")
    }
    if(!imageUrl){
        const error=new Error("Image not found");
        error.statusCode=422;
        throw error;
    }
    const errors = validationResult(req);
    console.log(errors);
    if(!errors.isEmpty()){
        const error = new Error("Please enter correct data");
        error.statusCode = 422;
        throw error; 
    }
    Post.findById(postId).then(post=>{
        //console.log(post)
        if(!post){
            const error=new Error("Post fot found");
            error.statusCode=500;
            throw error;
        }
        if(post.imageUrl!==imageUrl){
            deleteFile(post.imageUrl)
        }
        if(post.creator.toString() !== req.userID){
            const error = new Error("Unauthorized User!!!")
            error.statusCode=403;
            throw error
        }
        post.title=title
        post.content=content
        post.imageUrl=imageUrl
        return post.save()
        }).then(result=>{
            res.json({message:"Post Updated",post:result})
        })
        .catch(error=>{
         if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    })
}

exports.deletePost = (req,res,next)=>{
    const postId = req.params.id;
    Post.findById(postId).then(post=>{
        if(!post){
            const error=new Error("Post fot found");
            error.statusCode=500;
            throw error;
        }
        if(post.creator.toString() !== req.userID){
            const error = new Error("Unauthorized User!!!")
            error.statusCode=403;
            throw error
        }
        deleteFile(post.imageUrl)
        return Post.deleteOne({_id:post._id})
    }).then(result=>{
        //console.log(result)
        return User.findById(mongoose.Types.ObjectId(req.userID))
    }).then(user=>{
        user.posts.pull(postId)
        return user.save()
    }).then(result=>{
        res.status(200).json({message:"Post deleted"})
    })
    .catch(err=>{
        next(err)
    })
}

exports.updateStatus = (req,res,next) =>{
    const status = req.body.status;
    User.findById(mongoose.Types.ObjectId(req.userID)).then(user=>{
        user.status=status;
        return user.save()
    }).then(result=>{
        res.status(200).json({message:"Status Update Successfully"})
    })
    .catch(err=>{
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    })
}

exports.getStatus = (req,res,next) => {
    User.findById(mongoose.Types.ObjectId(req.userID)).then(user=>{
        res.status(200).json({status:user.status})
    }).catch(err=>{
        if(!error.statusCode){
            error.statusCode = 500;
        }
        next(error);
    })
}

const deleteFile=(filepath)=>{
    fs.unlink(filepath,err=>{
        if(err){
            throw err;
        }
    })
}