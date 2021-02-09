const User = require("../models/user")
const {validationResult, Result} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")


exports.signup = (req,res,next) =>{
    //console.log("in sign up")
    const error=validationResult(req);
    console.log(error)
    if(!error.isEmpty()){
        //console.log("In error")
        const error = new Error("Validation Failed");
        error.statusCode=422;
        //error.data = error.array()[0];
        throw error
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    // User.findOne({email:email}).then(user=>{
    //     if(user){
    //         const error=new Error("Email Already exist exist!!")
    //         error.statusCode=401
    //         throw error
    //     }
    // }).catch(error=>{
    //     console.log("in catch")
    //     next(error)
    // })

    bcrypt.hash(password,12).then(hashedPw=>{
        const user = new User({
            name:name,
            password:hashedPw,
            email:email
        })
        return user.save()
    }).then(result=>{
        res.status(201).json({message:"User created",userId:result._id})
    })
    .catch(err=>{
        {
            if(!err.statusCode){
            err.statusCode = 500;
        }
    next(err);
    }
    })
}


exports.login=(req,res,next)=>{
    const email=req.body.email;
    const password=req.body.password;
    //console.log(req.body)
    let lodedUser;
    User.findOne({email:email}).then(user=>{
        if(!user){
            const error=new Error("User not exist!!")
            error.statusCode=401
            throw error
        }
        lodedUser=user;
        //console.log(lodedUser)
        bcrypt.compare(password,user.password)
        .then(isEqual=>{
            console.log(isEqual)
            if(!isEqual){
                const error=new Error("Wrong Password")
                error.statusCode=401
                throw error
            }
            const token = jwt.sign({email:lodedUser.email,_id:lodedUser._id},
                "secret",{
                    expiresIn:"1h"
                }
            )
            //console.log(token)
            //console.log(lodedUser._id)
            res.status(200).json({token:token,userId:lodedUser._id.toString()})
        }).catch(err=>{
            next(err);
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
    next(err);
    })
} 