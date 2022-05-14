const {validationResult} = require('express-validator');

const validateRequest = (req,res,next) =>{
  const errors = validationResult(JSON.parse(JSON.stringify(req.body)));
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

module.exports = validateRequest ;