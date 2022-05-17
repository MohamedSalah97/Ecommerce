const express = require('express');
const db = require('../util/database');
const {body} = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');
const requireAuth = require('../middlewares/requireAuth');
const checkSeller = require('../middlewares/checkSeller');
const checkAdmin = require('../middlewares/checkAdmin');
const validateProductNo = require('../middlewares/validateProductNo');

const router = express.Router();

//add order
router.post('/addorder', requireAuth , [
  body('totalPrice').isFloat({gt:0}).withMessage('Total price must be provided and greater than 0'),
  body('products').isArray({min : 1}).withMessage('Purchased products must be provided')
], validateRequest, validateProductNo,async(req,res) =>{
  const userId = req.currentUser.id ;
  const {products , totalPrice} = req.body ;
  
  await db.execute('INSERT INTO orders(total,userId) VALUES(?,?)',[totalPrice,userId]);
  const [rows,fields] =await db.execute('SELECT orderId FROM orders WHERE userId=? ORDER BY orderId DESC',[userId]);
  const {orderId} = rows[0];
  
  products.forEach(async (product) =>{
    
    const [rows,field] = await db.execute('SELECT quantity FROM product WHERE productId = ?',[product.productId]);
    const {quantity} = rows[0];
    await db.execute(`INSERT INTO orders_product(order_id,product_id,number) VALUES(${orderId},${product.productId},${product.number})`);
    const updatedQuantity = quantity - product.number ;
    await db.execute('UPDATE product SET quantity=? WHERE productId = ?',[updatedQuantity , product.productId])

  });
  

  res.status(201).send({success: true});
});

// cancel an order 
router.delete('/cancelorder/:orderId',requireAuth,async(req,res) =>{
  const userId = req.currentUser.id ;
  const {orderId} = req.params ;
  const {products} = req.body;

  const [orders,fiels] = await db.execute(`SELECT * FROM order WHERE orderId=${orderId}`);
  const foundOrder = orders[0];
  if(!foundOrder){
    return res.status(400).send({errors: [{msg: 'Order is not found'}]});
  }
  if(foundOrder.userId !== userId){
    return res.status(400).send({errors: [{msg: 'Not Authorized'}]});
  }

  products.forEach(async (product) =>{
    const {number} = product ;
    await db.execute(`UPDATE product SET quantity = quantity + ${number} where productId = ${product.productId}`);
  });
  await db.execute(`DELETE FROM orders_product WHERE order_id=${orderId}`);
  await db.execute(`DELETE FROM orders WHERE orderId=${orderId}`)

  res.status(200).send({success: true});
});

// get all orders specific to a seller
router.get('/sellerorders', requireAuth,checkSeller , async (req,res) => {
  const sellerId = req.currentUser.id ;

  const [orders,fields] = await db.execute(`SELECT * FROM orders_product WHERE product_id IN (SELECT productId FROM product WHERE sellerId = ${sellerId}) ORDER BY order_id DESC `);

  res.status(200).send(orders);
});

// get all orders 
router.get('/getorders', requireAuth,checkAdmin , async(req,res) =>{
  const [orders,fields] = await db.execute(`SELECT * FROM orders ORDER BY orderId DESC`);

  res.status(200).send(orders);
});

//get order by id
router.get('/getorder/:orderId', async (req,res) =>{
  const {orderId} = req.params ;

  const [orderDetails,fields] = await db.execute(`SELECT * FROM orders_product JOIN product ON orders_product.product_id = product.productId WHERE order_id=${orderId}`);
  const [order,field] = await db.execute(`SELECT total FROM orders WHERE orderId = ${orderId}`);

  res.status(200).send([...order, ...orderDetails]);
  
});


module.exports = router ;