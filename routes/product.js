const express = require('express');
const db = require('../util/database');
const {body} = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');
const requireAuth = require('../middlewares/requireAuth');
const checkSeller = require('../middlewares/checkSeller');

const router = express.Router();

//post a product
router.post('/addproduct', requireAuth, checkSeller,[
  body('name').not().isEmpty().withMessage('Product title must be provided'),
  body('price').isFloat({gt :0}).not().isEmpty().withMessage('Product price must be provided and greater than zero'),
  body('category').not().isEmpty().withMessage('Product category must be provided'),
  body('quantity').isInt({gt: 0}).not().isEmpty().withMessage('Product quantity must be provided and greater than zero')
], validateRequest, async(req,res) => {
  const {title,description,price,quantity,category} = JSON.parse(JSON.stringify(req.body)) ;
  const sellerId = req.currentUser.id ;
  const image = JSON.parse(JSON.stringify(req.file)) ;
  const imageUrl = image.path ;
  const product = await db.execute('INSERT INTO product(title,description,price,imageUrl,quantity,category,sellerId) VALUES(?,?,?,?,?,?,?)',
  [title,description,price,imageUrl,quantity,category,sellerId]);

  res.status(201).send({product});

}); 

// edit product
router.put('/editproduct/:productId', requireAuth, checkSeller,[
  body('title').not().isEmpty().withMessage('Product title must be provided'),
  body('price').isFloat({gt :0}).not().isEmpty().withMessage('Product price must be provided and greater than zero'),
  body('category').not().isEmpty().withMessage('Product category must be provided'),
  body('quantity').isInt({gt: 0}).not().isEmpty().withMessage('Product quantity must be provided and greater than zero')
], validateRequest, async(req,res) => {
  const {title,description,price,quantity,category} = JSON.parse(JSON.stringify(req.body)) ;
  const {productId} = req.params;
  const sellerId = req.currentUser.id ;
  const image = JSON.parse(JSON.stringify(req.file)) ;

  //authorization a seller
  const [rows,field] = await db.execute('SELECT * FROM seller WHERE id= ?',[sellerId]);
  const foundSeller = rows[0];
  if(!foundSeller){
    return res.status(400).send({errors: [{msg: 'Not Authorized'}]});
  }

  const imageUrl = image.path;
  const updatedProduct = await db.execute('UPDATE product SET title=?, description=?, price=?, imageUrl=?, quantity=?, category=? WHERE productId=?',
  [title,description,price,imageUrl,quantity,category,productId]);
  res.status(201).send({updatedProduct});
  
});

//delete product
router.delete('/deleteProduct/:productId',requireAuth ,checkSeller , async (req,res) =>{
  const sellerId = req.currentUser.id ;
  const {productId} = req.params;
  //authorize a seller
  const [rows,field] = await db.execute('SELECT * FROM seller WHERE productId= ?',[sellerId]);
  const foundSeller = rows[0];
  if(!foundSeller){
    return res.status(400).send({errors: [{msg: 'Not Authorized'}]});
  }

  await db.execute('DELETE FROM product WHERE id=?',[productId]);

  res.status(200).send({success: true});
});

//get products by category
router.get('/:category', async (req,res) =>{
  const {category} = req.params ;
  const {page} = req.query ;
  // pagination to retrieve 2 products per page
  const items = parseInt(page) * 2 ;
  const [rows,fields] = await db.execute(
    'SELECT * FROM product JOIN seller ON product.sellerId = seller.id WHERE category=? ORDER BY product.productId DESC LIMIT ?,2'
    ,[category,items.toString()]);

  res.status(200).send(rows);
});

// get a specific product
router.get('/getproduct/:productId', async (req,res) =>{
  const {productId} = req.params;
  const [rows,fields] = await db.execute(
    'SELECT * FROM product JOIN seller ON product.sellerId = seller.id WHERE product.productId= ?',[productId]
  );
  res.status(200).send(rows);
})

module.exports = router ;