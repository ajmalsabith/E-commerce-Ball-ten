const mongoose=require('mongoose')

const addressSchema= new mongoose.Schema({

    userId:{
       type:String,
       required:true    
    },
    user:{
        type:String,
        required:true
    },
    address:[{
        country:{
            type:String,
            required:true
        },
        fname:{
            type:String,
            required:true
        },
        lname:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        place:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        phone:{
            type:Number,
            required:true
        }

    }]
})

module.exports= mongoose.model('address',addressSchema)