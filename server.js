const express=require('express')
const app=express()
const nocache=require("nocache")
const path = require("path");
const session=require("express-session")
require('dotenv').config();



app.set('view engine','ejs')

app.use(nocache())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
    },
  })
);


app.use((req,res,next)=>{
  res.locals.error=null
  res.locals.qrCode=null
  next()
})



userRoute=require('./routes/userRoute')
app.use('/',userRoute)

app.get('*',(req,res)=>{
  res.redirect('/error')
})


const port=process.env.PORT||5000
app.listen(port, () => {
    console.log(
      `Server is successfully running. Click here for more info: \x1b[34mhttp://localhost:${port}`
    );
  });