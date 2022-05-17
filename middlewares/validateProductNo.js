const db = require('../util/database');

const validateProductNo = async (req,res,next) => {
  const {products} = req.body ;
  let bool = [];
  const result = new Promise((resolve,reject)=>{
    products.forEach(async (product) =>{
      const [rows,field] =await db.execute('SELECT quantity,title FROM product WHERE productId = ?',[product.productId]);
      const {quantity} = rows[0];
      if(quantity < product.number){
       bool.push({value: false, title: rows[0].title});
       reject(bool);
      }else{
        resolve();
      }
    });
  });

  result.then(data =>{
      next()
  }).catch(bool =>{
    const {value} = bool[0];
    if(value === false){
       return res.status(400).send({errors: [{msg: `Number of purchased item is larger than stocked for ${bool[0].title}`}]})
    }
  })
};

module.exports = validateProductNo ;