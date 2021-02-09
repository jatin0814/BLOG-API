const jwt = require("jsonwebtoken");


module.exports = (req,res,next) => {
    const token = req.get("Authorization").split(" ")[1];
    //console.log(token)
    let decodedToken;
    try{
        decodedToken = jwt.verify(token,"secret")
        //console.log(decodedToken)
    }catch(err){
        err.statusCode=500;
        throw err
    }
    if(!decodedToken){
        const error = new error("User unauthenticated");
        error.statusCode=401;
        throw error
    }
    req.userID=decodedToken._id;
    next()
}