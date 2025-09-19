const express=require('express');
const register = require('../controller/Register-controller');
const login=require('../controller/login-controller');

const router=express.Router();

router.post('/register',register);
router.post('/login',login);


module.exports=router;