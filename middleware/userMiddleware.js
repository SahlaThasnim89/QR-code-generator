

const isLogged=(req,res,next)=>{
    try {
        if(!req.session.userData){
            res.redirect('/login')
        }else{
            next()
        } 
    } catch (error) {
        console.log(error.message);
    }
   
}



const isLogout=(req,res,next)=>{
    try {
        if(req.session.userData){
            res.redirect('/')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
    
}

module.exports = {
    isLogged,isLogout
};