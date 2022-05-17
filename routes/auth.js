const express = require('express');
const bcrypt = require('bcrypt');
const {body} = require('express-validator');
const db = require('../util/database');
const jwt = require('jsonwebtoken');
const validateRequest = require("../middlewares/validateRequest");
require('dotenv').config();

const router = express.Router();

//signup a seller
router.post('/api/seller/signup',[
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().isLength({min:6,max:20}).withMessage('Password must be between 6 and 20 characters')
],validateRequest,async (req,res)=>{

  const {email,password,name} = req.body;
  const [foundRows, foundFields] = await db.execute('SELECT * FROM seller WHERE email = ?',[email]);
  if(rows){
    return res.status(400).send({errors: [{msg: 'Email is in use try another one'}]})
  }
  const hashedPassword = await bcrypt.hash(password,10);

  await db.execute('INSERT INTO seller (name,email,password) VALUES (?,?,?)',[name,email,hashedPassword]);
  const [rows,fields] = await db.execute('SELECT * FROM seller WHERE email= ?', [email]);
  const user = rows[0]

  const jwtToken = jwt.sign({
    email: user.email,
    id: user.id
  },process.env.JWT_SECRET);

  req.session = {
    jwt: jwtToken
  };

  res.status(201).json({success: true});
});


//login a seller
router.post('/api/seller/signin',[
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().isLength({min:6,max:20}).withMessage('Password must be between 6 and 20 characters')
],validateRequest,async (req,res)=>{

  const {email,password} = req.body ;
  const [rows,fields] = await db.execute('SELECT * FROM seller WHERE email= ?', [email]);
  const user = rows[0]
  if(!user){
    return res.status(400).send({errors: [{msg: 'Email is not found'}]});
  }

  const hashedPassword = user.password ;
  const match = await bcrypt.compare(password,hashedPassword);
   
  if(!match){
    return res.status(400).send({errors: [{msg: 'Incorrect Password'}]});
  }

  const jwtToken = jwt.sign({
    email: user.email,
    id: user.id
  },process.env.JWT_SECRET);

  req.session = {
    jwt: jwtToken
  };

  res.status(201).json({success: true});


})

//signup a user
router.post('/api/user/signup',[
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().isLength({min:6,max:20}).withMessage('Password must be between 6 and 20 characters'),
  body('name').not().isEmpty().withMessage('Name is required'),
  body('address').not().isEmpty().withMessage('Address is required')
],validateRequest,async (req,res)=>{

  const {email,password,name,address} = req.body;
  const [foundRows,foundFields] = await db.execute('SELECT * FROM user WHERE email = ?',[email]);
  const foundUser =foundRows[0];
  if(foundUser){
    return res.status(400).send({errors: [{msg: 'Email is in use try another one'}]})
  }
  const hashedPassword = await bcrypt.hash(password,10);

  await db.execute('INSERT INTO user (email,password,name,address) VALUES (?,?,?,?)',[email,hashedPassword,name,address]);
  const [rows,fields] = await db.execute('SELECT * FROM user WHERE email= ?', [email]);
  const user = rows[0]

  const jwtToken = jwt.sign({
    email: user.email,
    id: user.id
  },process.env.JWT_SECRET);

  req.session = {
    jwt: jwtToken
  };

  res.status(201).json({success: true});
});

//login a seller
router.post('/api/user/signin',[
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().isLength({min:6,max:20}).withMessage('Password must be between 6 and 20 characters')
],validateRequest,async (req,res)=>{

  const {email,password} = req.body ;
  const [rows,fields] = await db.execute('SELECT * FROM user WHERE email= ?', [email]);
  const user = rows[0];
  if(!user){
    return res.status(400).send({errors: [{msg: 'Email is not found'}]})
  }

  const hashedPassword = user.password ;
  const match = await bcrypt.compare(password,hashedPassword);
   
  if(!match){
    return res.status(401).send({errors: [{msg: 'Incorrect password'}]});
  }

  const jwtToken = jwt.sign({
    email: user.email,
    id: user.id
  },process.env.JWT_SECRET);

  req.session = {
    jwt: jwtToken
  };

  res.status(201).json({success: true});


});

//signup an admin
router.post('/api/admin/signup',[
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().isLength({min:6,max:20}).withMessage('Password must be between 6 and 20 characters')
],validateRequest,async (req,res)=>{

  const {email,password,name} = req.body;
  const [foundRows, foundFields] = await db.execute('SELECT * FROM admins WHERE email = ?',[email]);
  if(rows){
    return res.status(401).send({errors: [{msg: 'Email is in use try another one'}]})
  }
  const hashedPassword = await bcrypt.hash(password,10);

  await db.execute('INSERT INTO admins (name,email,password) VALUES (?,?,?)',[name,email,hashedPassword]);
  const [rows,fields] = await db.execute('SELECT * FROM admins WHERE email= ?', [email]);
  const user = rows[0]

  const jwtToken = jwt.sign({
    email: user.email,
    id: user.id
  },process.env.JWT_SECRET);

  req.session = {
    jwt: jwtToken
  };

  res.status(201).json({success: true});
});

//login an admin
router.post('/api/admin/signin',[
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().isLength({min:6,max:20}).withMessage('Password must be between 6 and 20 characters')
],validateRequest,async (req,res)=>{

  const {email,password} = req.body ;
  const [rows,fields] = await db.execute('SELECT * FROM admins WHERE email= ?', [email]);
  const user = rows[0];
  if(!user){
    return res.status(401).send({errors: [{msg: 'Emai is not found'}]})
  }

  const hashedPassword = user.password ;
  const match = await bcrypt.compare(password,hashedPassword);
   
  if(!match){
    return res.status(401).send({errors: [{msg: 'Incorrect Password'}]});
  }

  const jwtToken = jwt.sign({
    email: user.email,
    id: user.id
  },process.env.JWT_SECRET);

  req.session = {
    jwt: jwtToken
  };

  res.status(201).json({success: true});


});

//signout
router.post('/api/signout', (req,res) =>{
  req.session = null ;

  res.send({})
});


module.exports = router ;