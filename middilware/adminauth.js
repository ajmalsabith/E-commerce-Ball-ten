const is_login= (req,res,next)=>{
    try{

        if(req.session.admin_id){}
        else{
            res.redirect('/admin/login')
        }
        next()

    }catch(error){
        console.log(error.message)
    }
}

const is_logout= (req,res,next)=>{
    try{

        if(req.session.admin_id){        
            res.redirect('/admin/home')
        }next()

    }catch(error){
        console.log(error.message)
    }
}

module.exports={
    is_login,
    is_logout
}