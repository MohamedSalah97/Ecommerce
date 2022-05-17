const db = require('../util/database');

const checkSeller =async  (req,res,next)=>{
  const sellerId = req.currentUser.id;

  const [rows,field] = await db.execute('SELECT * FROM seller WHERE id = ?', [sellerId]);
  const foundSeller = rows[0];
  if(!foundSeller){
    return res.status(400).send({errors: [{msg: 'Not Authorized'}]});
  }

  next();
};

module.exports = checkSeller;