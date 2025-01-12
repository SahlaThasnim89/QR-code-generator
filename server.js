const express=require('express')
const app=express()
const path = require("path");
const flash = require('express-flash');


app.set('view engine','ejs')

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, "public")));




app.use((req,res,next)=>{
  res.locals.error=null
  res.locals.qrCode=null
  next()
})

userRoute=require('./routes/userRoute')
app.use('/',userRoute)


const port=process.env.PORT||7000
app.listen(port, () => {
    console.log(
      `Server is successfully running. Click here for more info: \x1b[34mhttp://localhost:7000`
    );
  });