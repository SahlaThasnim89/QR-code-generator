const express = require("express");
const user = express.Router();

const userController=require("../controller/userController")
const middleware=require('../middleware/userMiddleware')

user.get('/register',middleware.isLogout,userController.registerPage)
user.post('/register',userController.registerSubmit)

user.get('/login',middleware.isLogout, userController.loginPage)
user.post('/login',userController.loginUser)
user.get('/logout',middleware.isLogged,userController.Logout)

user.get('/',middleware.isLogged,userController.dashboard)

user.get('/generate',middleware.isLogged,userController.generatePage)
user.post('/generate',userController.generate)

user.post('/exportPDF',userController.exportPDF)


//download from dashboard
user.get('/export-pdf/:id',middleware.isLogged, userController.makePdf)

user.get('/settings',middleware.isLogged,userController.settingsPage)
user.post('/settings',userController.settupSettings)

user.get('/error',middleware.isLogged,userController.page404)

module.exports=user