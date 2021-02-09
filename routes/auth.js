const express = require("express");
const { body } = require("express-validator/check");
const User = require("../models/user")
const authController = require("../controllers/auth")


const router = express.Router();

router.put("/signup",[
    body("email").isEmail().withMessage("Enter a vaild email address").custom(value => {
        return User.find({email:value}).then(user => {
            //console.log(user)
          if (user.length>0) {
            return Promise.reject('E-mail already in use');
          }
        });
      }),
    body("password").trim().isLength({min:8}),
    body("name").not().isEmpty()
],authController.signup)


router.post('/login',authController.login)

module.exports = router
