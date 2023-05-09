const mongoose=require('mongoose')




const wishlistscema= new mongoose.Schema({

    userId: {
        type:String,
        ref: "users",
        required: true
    },
    user: {
        type: String,
        required: true
    },
    product: [{
        productId: {
            type: String,
            ref: "products",
            required: true
        },
        name: {
            type:String,
            required:true
        },
        price:{
            type:String,
            required:true
        }
    }]
})
module.exports=mongoose.model('wishlist',wishlistscema)