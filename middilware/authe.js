const is_login= (req,res,next)=>{
    try{

        if(req.session.user_id){}
        else{
            res.redirect('/login')
        }
        next()

    }catch(error){
        console.log(error.message)
    }
}

const is_logout= (req,res,next)=>{
    try{

        if(req.session.user_id){        
            res.redirect('/home')
        }next()

    }catch(error){
        console.log(error.message)
    }
}

module.exports={
    is_login,
    is_logout
}