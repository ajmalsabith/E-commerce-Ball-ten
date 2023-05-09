const mongoose=require('mongoose')

const newreview= new mongoose.Schema({

    userId:{
        type:String,
        required:true
    },
    user:{
        type:String,
        required:true
    },
    productId:{
        type:String,
        required:true

    },
    comment:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        required:true
    }

})
module.exports= mongoose.model('reviews',newreview)