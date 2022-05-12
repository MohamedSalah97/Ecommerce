const express = require('express');

const requireAuth = (req,res,next)=>{
  if(!req.currentUser){
    return res.status(401).send({msg:'Not Authorized'})
  }

  next();
}

module.exports = requireAuth ;