const mongoose = require('mongoose')

const neworderschema = new mongoose.Schema({

    deliveryaddress: {
        type:String,
        required:true
    },
    userId:{

        type:String,
        ref:'users',
        required:true
    },
    user:{
        type:String,
        required:true
    },
    peymentMethod:{
        type:String,
        required:true
    },
    product:[{
        productId:{
            type:String,
            ref:'products',
            required:true
        },
        count:{
            type:Number,
            required:true
        }

    }],
    paidamount:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    paymentid:{
        type:String
        
    },
    couponId:{
        type:String
    },
    wallet:{
        type:Number
    },
    totalamount:{
        type:Number
    },
    exprdatereturn:{
        type:Date,
        required:true
    },
    exprdateplaced:{
        type:Date,
        required:true
    },
    exprdatedeliverd:{
        type:Date,
        required:true
    },


})
module.exports= mongoose.model('orders',neworderschema)