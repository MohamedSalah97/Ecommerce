const db = require('../util/database');

const checkAdmin =async  (req,res,next)=>{
  const adminId = req.currentUser.id;

  const [rows,field] = await db.execute('SELECT * FROM seller WHERE adminId = ?', [adminId]);
  const foundAdmin = rows[0];
  if(!foundAdmin){
    return res.status(400).send({errors: [{msg: 'Not Authorized'}]});
  }

  next();
};

module.exports = checkAdmin;