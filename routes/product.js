const express = require('express');
const db = require('../util/database');
const {body} = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');
const requireAuth = require('../middlewares/requireAuth');
const checkSeller = require('../middlewares/checkSeller');

const router = express.Router();

//post a product
router.post('/api/products/addproduct', requireAuth(), checkSeller(),[
  body('name').not().isEmpty().withMessage('Product name must be provided'),
  body('price').isFloat({gt :0}).not().isEmpty().withMessage('Product price must be provided and greater than zero'),
  body('category').not().isEmpty().withMessage('Product category must be provided'),
  body('quantity').isInt({gt: 0}).not().isEmpty().withMessage('Product quantity must be provided and greater than zero')
], validateRequest(), async(req,res) => {
  const {name,description,price,quantity,category} = req.body ;
  const sellerId = req.currentUser.id ;
  const image = req.file ;
  const imageUrl = image.path ;

  const product = await db.execute('INSERT INTO product (name,desc,price,imageUrl,quantity,category,sellerId) VALUES(?,?,?,?,?,?,?)',
  [name,description,price,imageUrl,quantity,category,sellerId]);

  res.status(201).send({product});

});

// edit product

module.exports = router ;