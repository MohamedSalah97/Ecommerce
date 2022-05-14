const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const multer = require('multer');
const auth = require('./routes/auth');
const product = require('./routes/product');
const currentUser = require('./middlewares/currentUser');
const cors = require('cors')

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req,file,cb) =>{
    cb(null , 'images');
  } ,
  filename: (req,file,cb) =>{
    cb(null, new Date().toISOString + '-' + file.originalname)
  }
});

const fileFilter = (req,file,cb)=>{
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null,true);
  }else{
    cb(null,false);
  }
}

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieSession({
  signed: false,
  secure: false
}));

app.use(multer({storage: fileStorage, fileFilter}).single('image'));

app.use(auth); 
app.use(currentUser);
app.use(product);

app.listen(4444,()=>{
  console.log('Ecommerce sql version is running on 4444')
});