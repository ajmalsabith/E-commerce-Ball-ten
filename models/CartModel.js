const mongoose = require('mongoose')

const cartshema = new mongoose.Schema({

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
        count: {
            type: Number,
            default: 1
        },
        name:{
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            default: 0

        }
    }]
})
module.exports= mongoose.model('cart',cartshema)