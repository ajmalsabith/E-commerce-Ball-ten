const mongoose = require('mongoose')
const cart = require('../models/CartModel')
const Users = require('../models/userModel')
const product = require('../models/product Model')
const address = require('../models/addressModel')
const order = require('../models/orderModel')
const { log } = require('npmlog')
const coupon = require('../models/couponModel')
const session = require('express-session')
const Razorpay = require('razorpay')
const status = require('statuses')
var CPRODUT
var TOTAL


const addtocart = async (req, res) => {

    const productid = await req.body.id
    const userid = req.session.user_id
    const productdata = await product.findOne({ _id: productid })

    const userdata = await Users.findOne({ _id: userid })

    if (userid) {
        const cartdata = await cart.findOne({ userId: userid })
        if (cartdata) {
            const prodectexit = cartdata.product.findIndex((product) => product.productId == productid)

            if (prodectexit != -1) {
                await cart.updateOne({ userId: userid, "product.productId": productid }, { $inc: { "product.$.count": 1 } })

                setTimeout(() => {
                    res.redirect('/women')
                }, 1200);
            } else {
                await cart.findOneAndUpdate({ userId: userid }, { $push: { product: { productId: productid, name: productdata.name, price: productdata.price } } })

                setTimeout(() => {
                    res.redirect('/women')
                }, 1200);
            }

        } else {
            const cartt = new cart({
                userId: userid,
                user: userdata.name,

                product: [{
                    productId: productid,
                    name: productdata.name,
                    price: productdata.price

                }]
            })
            const cartdata = await cartt.save()
            if (cartdata) {

                setTimeout(() => {
                    res.redirect('/women')
                }, 1200);
            } else {

                setTimeout(() => {
                    res.redirect('/product')
                }, 1200);
            }
        }
    } else {
        res.redirect('/login')
    }
}
const loadcart = async (req, res) => {
    try {

        const session = req.session.user_id;
        const userdata = await Users.findOne({ _id: session })
        const cartData = await cart.findOne({ userId: session }).populate('product.productId')
        const relproduct = await product.find()

        if (session) {
            if (cartData) {
                if (cartData.product.length > 0) {
                    const product = cartData.product
                    const total = await cart.aggregate([{ $match: { user: userdata.name } }, { $unwind: '$product' }, { $project: { price: '$product.price', cou: '$product.count' } }, { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$cou'] } } } }])
                    const Total = total[0].total;
                    req.session.total = Total
                    const userId = userdata._id
                    let customer = true
                    const STD = 45
                    CPRODUT = product
                    TOTAL = Total

                    res.render('cart', { customer, relproduct, userdata, product, Total, userId, session, userdata, STD })
                } else {
                    let customer = true;
                    res.render('emptycart', { customer, relproduct, userdata, session, msg: 'No product added to cart' })
                }
            } else {
                let customer = true
                res.render('emptycart', { customer, relproduct, userdata, session, msg: 'No product added to cart' })
            }
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}
const changeCount = async (req, res) => {
    try {

        const userid = req.session.user_id
        const count = req.body.count
        const tcount = req.body.tcount


        if(tcount>1  ){

        

        const cartData = await cart.updateOne({ userId: userid, "product._id": req.body.id }, { $inc: { "product.$.count":count } })
        if (cartData) {
            res.json({ success: true })
        }

        }

       
    } catch (error) {
        console.log(error.message)
    }
}

const deletecart = async (req, res) => {

    try {

        const id = req.query.id
        const user_id = req.query.userid



        const productdata = await cart.updateOne({ userId: user_id }, { $pull: { product: { productId: id } } })
        if (productdata) {
            res.redirect('/getcart')
        }


    } catch (error) {
        console.log(error.message)
    }

}



module.exports = {
    addtocart,
    loadcart,
    changeCount,
    deletecart

}