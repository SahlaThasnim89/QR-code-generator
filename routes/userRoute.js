const express = require("express");
const user = express.Router();

const userController=require("../controller/userController")
user.get('/register',userController.registerPage)
user.post('/register',userController.registerSubmit)

user.get('/login',userController.loginPage)
user.post('/login',userController.loginUser)

user.get('/',userController.dashboard)

user.get('/generate',userController.generatePage)
user.post('/generate',userController.generate)

module.exports=user