const mongoose=require('mongoose')


const userSchema=new mongoose.Schema({


    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    wallet:{
        type:Number,
        default:0
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_varified:{
        type:Number,
        default:0
    },
    is_block:{
        type:Number,
        default:0
    }



})

module.exports= mongoose.model('User',userSchema)