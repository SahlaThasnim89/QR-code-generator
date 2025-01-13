 
 const QRCode=require('qrcode')
 const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const pdfDocument=require('pdfkit') 

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
        const newUser = await prisma.user.create({
            data: {
              fname,
              lname,
              email,
              password: hashedPassword,
            },
          });
          console.log(newUser,'newUser')
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
        const checkUser = await prisma.user.findUnique({
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
        console.log(qrCode)
        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        console.log(expiryDate)
        const qrCodeDetails = await prisma.QRCode.create({
            data: {
                number: qrCode,
                generatedDate: new Date(),
                expiryDate: expiryDate
            }
        });

        console.log(qrCodeDetails,'qrCodeDetails')
        res.render('generate',{qrCode,text,color,size})
    } catch (error) {
        res.render('generate',{error:'Error in generating qr code'})
    }
}

// function buildPDF(dataCallback,endCallback){
//     const doc=new pdfDocument();
//     doc.on('data',dataCallback)
//     doc.on('end',endCallback)
//     doc.fontSize(25).text('some heading')
//     doc.end()
// }

async function buildPDF(dataCallback,endCallback){
    const doc=new pdfDocument({
        size:'A4',
        margin:50,
    });
    doc.on('data',dataCallback)
    doc.on('end',endCallback)
    const { title, generatedDate, expiryDate, qrCodeData } = settings;
    doc
        .fontSize(25)
        .text(title, { align: 'center', underline: true })
        .moveDown();
    doc
        .fontSize(14)
        .text(`Generated Date: ${generatedDate}`, { align: 'left' })
        .text(`Expiry Date: ${expiryDate}`, { align: 'left' })
        .moveDown();

    try {
        const qrImage=await QRCode.toDataURL(qrCodeData,{errorCorrectionLevel:'H'})
        const qrBuffer=Buffer.from(qrImage.split(',')[1],'base64')
        doc.image(qrBuffer,{fit:[150,150],align: 'center', valign: 'center' })
    } catch (error) {
        console.error('Error generating QR code:', error);
    }
    doc.moveDown(2).fontSize(10).text('Thank you for using our service!', { align: 'center' });
    doc.end()
}

const settings = {
    title: 'My Custom PDF Title',
    generatedDate: '2025-01-13',
    expiryDate: '2025-02-13',
    qrCodeData: 'https://example.com',
};

// buildPDF(
//     (chunk) => process.stdout.write(chunk), // For testing: write to stdout
//     () => console.log('PDF generated successfully'),
//     settings
// );


const makePdf=async(req,res)=>{
    try {
        console.log('yggjh');
        
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="qrdata.pdf"', 
        });
        console.log(stream,'ghfhgg');
        
        buildPDF((chunk)=>stream.write(chunk),
    ()=>stream.end())
    console.log('jddg')
    } catch (error) {
        console.log(error.message)
    }
}


module.exports= {registerPage,
    registerSubmit, 
    loginPage,
    loginUser,
    dashboard,
    generatePage,
    generate,
    makePdf}
