const jwt = require('jsonwebtoken');
require('dotenv').config();

const currentUser = (req,res,next) =>{
  if(!req.session.jwt){
    return next();
  }

  try {
    const payload = jwt.verify(req.session.jwt , process.env.JWT_SECRET);
    req.currentUser = payload;
  } catch (err) {
    console.log(err);
  }
  next()
};



module.exports = currentUser ;