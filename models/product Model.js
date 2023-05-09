 const mongoose=require('mongoose')
const { boolean } = require('webidl-conversions')

 const productschema= new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    discription:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    is_block:{

        type:Boolean,
        required:true
    }

    
 })

 module.exports=mongoose.model('products',productschema)