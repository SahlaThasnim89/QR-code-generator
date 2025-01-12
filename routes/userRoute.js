const express = require("express");
const user = express.Router();

const userController=require("../controller/userController")
user.get('/register',userController.registerPage)
user.post('/register',userController.registerSubmit)

user.get('/login',userController.loginPage)

user.get('/',userController.home)
user.post('/generate',userController.generate)

module.exports=user