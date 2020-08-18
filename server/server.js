const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
mongoose.connect("mongodb://localhost:27017/Authapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);
const app = express();

///Middleware
app.use(bodyParser.json());
app.use(cookieParser());
const {authenticate}=require('./middleware/authenticate')
//Model
const { User } = require("./models/user");

//Routes
app.post("/api/user", (req, res) => {
  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  user.save((err, doc) => {
    if (err) res.status(400).send(err);
    res.status(200).send(doc);
  });
});

app.post("/api/user/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) return res.json({ message: "User not Found " });
    user.comparePassword(req.body.password, function (err, isMatch) {
      if (err) throw err;
      if (!isMatch) {
        return res.status(400).json({
          message: "Wrong Password",
        });
      }
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie('auth', user.token).send("ok");
      });
    });
  });
});

//  let authenticate=(req,res,next)=>{
//    let token =req.cookies.auth;
//    User.findByToken(token,(err,user)=>{
//     if(err) return res.status(400).json({
//       message: "Bad Token"
//     })
//     if(!user) return res.status(401).send('bad')
//     req.user=user;
//     req.token=token;
//     next();
//   })
//  }
app.get("/api/books",authenticate, (req, res) => {

  // let token=req.cookies.auth;
  // User.findByToken(token,(err,user)=>{
  //   if(err) return res.status(400).json({
  //     message: "Bad Token"
  //   })
  //   if(!user) return res.status(401).send('bad')
  //   res.status(200).send('ok');
  // })
  res.send(req.user);
});
const port = process.env.port || 3001;
app.listen(port, () => {
  console.log(`Started at port ${port}`);
});
