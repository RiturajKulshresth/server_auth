const { User } = require("../models/user");


let authenticate=(req,res,next)=>{
    let token =req.cookies.auth;
    User.findByToken(token,(err,user)=>{
     if(err) return res.status(400).json({
       message: "Bad Token"
     })
     if(!user) return res.status(401).send('bad')
     req.user=user;
     req.token=token;
     next();
   })
  }
  module.exports = { authenticate };