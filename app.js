const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const feedsRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');


const app = express();

//app.use(bodyParser.urlencoded());   x-form-urlEncoded <form>

app.use(bodyParser.json()); //application/json
app.use('/image',express.static(path.join(__dirname,'image')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"image")
    },
    filename:(req,file,cb)=>{
        cb(null,uuidv4()+"-"+file.originalname)
    }
})

const fileFilter = (req,file,cb)=>{
    if(file.mimetype==='image/png' || file.mimetype==='image/jpeg' || file.mimetype==='image/jpg' )
    {
        cb(null,true)
    }else{
        cb(null,false)
    }
}

app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single("image"))

app.use('/feed',feedsRoutes);
app.use('/auth',authRoutes);

app.use((error,req,res,next)=>{
    console.log(error)
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message:message,data:data});
})
const port = 8080;

mongoose.connect("")
.then(()=>{
    app.listen(port,()=>{
        console.log(`listening on ${port}`);
    });
})
.catch(err=>{
    console.log(err);
});
