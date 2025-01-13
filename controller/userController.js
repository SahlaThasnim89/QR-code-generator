 
 const QRCode=require('qrcode')
 const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client'); 

const prisma = new PrismaClient();


 const registerPage=async(req,res)=>{
    try {
        res.render('register')
    } catch (error) {
        console.log(error.message)
    }
 }

 const registerSubmit=async(req,res)=>{
    try {
        const {fname,lname,email,password}=req.body
        if (!fname || !lname || !email || !password) {
            console.log('all fields are required')
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.users.create({
            data: {
              fname,
              lname,
              email,
              password: hashedPassword,
            },
          });
          req.session.userData=newUser
          
          res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
 }


 const loginPage = async (req, res) => {
    try {
        // const msg = req.flash('err')
        // res.render('user/login', { msg })
        // res.send('sfjsf')
        if (req.session.user) {
            console.log('ghgfg')
            return res.redirect('/'); 
        }
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}



const loginUser = async (req, res) => {
    try {
        const {email,password}=req.body
        const checkUser = await prisma.users.findUnique({
            where: { email },
        });
        if (checkUser) {
            const passwordCheck = await bcrypt.compare(password, checkUser.password);
            if (passwordCheck) {
                req.session.userId = checkUser.id; 
                res.redirect('/');

                } else {
                    // const errorMsg = "Password is invalid";
                    // req.flash("err", errorMsg);
                    res.redirect('/login');
                }
        } else {
            const errorMsg = "Email is not found";
            req.flash("err", errorMsg);
            res.redirect('/login');
        }
    } catch (error) {
        console.log("Error during login:", error.message);
        res.status(500).send("Server Error");
    }
};

const dashboard=async(req,res)=>{
    try {
        res.render('Dashboard')
    } catch (error) {
        console.log(error.message);
    }
}


const generatePage=async(req,res)=>{
    try {   
        res.render('generate')
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

        res.render('generate',{qrCode,text,color,size})
    } catch (error) {
        res.render('generate',{error:'Error in generating qr code'})
    }
}


module.exports= {registerPage,
    registerSubmit, 
    loginPage,
    loginUser,
    dashboard,
    generatePage,
    generate}
