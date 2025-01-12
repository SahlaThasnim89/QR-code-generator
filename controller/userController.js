 
 const QRCode=require('qrcode')
 const bcrypt = require('bcrypt');
 const client = require('../model/db'); 


 const registerPage=async(req,res)=>{
    try {
        res.render('register')
    } catch (error) {
        console.log(error.message)
    }
 }

 const registerSubmit=async(req,res)=>{
    try {
        console.log(req.body)
        const {fname,lname,email,password}=req.body
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!fname || !lname || !email || !password) {
            console.log('all fields are required')
        }
        const query = `
        INSERT INTO users (fname, lname, email, password)
        VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [fname, lname, email, hashedPassword];
    const result = await client.query(query, values);
    
    } catch (error) {
        console.log(error.message)
    }
 }


 const loginPage = async (req, res) => {
    try {
        // const msg = req.flash('err')
        // res.render('user/login', { msg })
        // res.send('sfjsf')
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const home=async(req,res)=>{
    try {   
        res.render('home')
    } catch (error) {
        console.log(error.message);
    }
}

const generate=async(req,res)=>{
    
    const {text,color,size}= req.body 
    try {
        const qrCode=await QRCode.toDataURL(text,{
            color:{
                dark:color
            },
            width:size
        })

        res.render('home',{qrCode,text,color,size})
    } catch (error) {
        res.render('home',{error:'Error in generating qr code'})
    }
}


module.exports= {registerPage,
    registerSubmit, 
    loginPage,
    home,
    generate}
