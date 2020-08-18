const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Salt = 10;
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 8,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});
userSchema.pre("save", function (next) {
  var user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(Salt, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  var user = this;
  bcrypt.compare(candidatePassword, user.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;
  let token = jwt.sign(user._id.toHexString(), "supersecret");
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken  =  function(token,cb){
  var user=this;
  jwt.verify(token,'supersecret',(err,decode)=>{
    if(err) return cb(err);
    user.findOne({'_id': decode,'token':token},(err,user)=>{
      if(err) return cb(err);
      cb(null,user)
    })
  })
}
const User = mongoose.model("User", userSchema);
module.exports = { User };
