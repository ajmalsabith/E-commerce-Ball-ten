
const mongoose = require('mongoose')
const cart = require('../models/CartModel')
const Users = require('../models/userModel')
const product = require('../models/product Model')
const whishlist = require('../models/wishlistmodel')
const { log } = require('npmlog')
const session = require('express-session')
const status = require('statuses')


const addwhishlist = async (req, res) => {


    const proid = new mongoose.Types.ObjectId(req.query.id)
   
    const userid = req.session.user_id
    const userdata = await Users.findOne({ _id: userid })
    const prodata = await product.findOne({ _id: proid })
    if (userid) {
        const wishdata = await whishlist.findOne({ userId: userid })
        if (wishdata) {

            const productexit = wishdata.product.findIndex((product) => product.productId == proid)
            if (productexit != -1) {
                setTimeout(() => {
                    res.redirect('/women')
                }, 1200);
            } else {
                await whishlist.updateOne({ userId: userid }, { $push: { product: { productId: proid, name: prodata.name, price: prodata.price } } })
                setTimeout(() => {
                    res.redirect('/women')
                }, 1200);
            }

        } else {
            const wishlistnew = new whishlist({

                userId: userid,
                user: userdata.name,
                product: [{
                    productId: proid,
                    name: prodata.name,
                    price: prodata.price
                }]

            })
            const newwish = await wishlistnew.save()
            if (newwish) {
                setTimeout(() => {
                    res.redirect('/women')
                }, 1200);
            } else {
                res.redirect('/register')
            }
        }
    } else {
        setTimeout(() => {
            res.redirect('/login')
        }, 1200);
    }


}
const getwishlist = async (req, res) => {



    const session = req.session.user_id

    const prodata = await whishlist.findOne({ userId: session }).populate('product.productId')
    const userdata = await Users.findOne({ _id: session })
    


    if (session) {

        if (prodata) {
            if(prodata.product.length>0){
             
                res.render('add-to-wishlist', { prodata: prodata})
            }else{
                res.render('emtywishlist', { error: 'no one product added whishlist' })
            }
           
        } else {
            res.render('emtywishlist', { error: 'no one product added whishlist' })
        }
    } else {
        res.redirect('/login')
    }


}
const deletewish = async (req, res) => {

    try {

        const id = req.query.id
        const session = req.session.user_id

        const data = await whishlist.updateOne({ userId: session }, { $pull: { product: { productId: id } } })
        res.redirect('/getwish')


    } catch (error) {
        console.log(error.message)
    }
}


const addtocartwish = async (req, res) => {

    const productid = req.query.id
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
                    res.redirect('/getwish')
                }, 1200);
            } else {
                await cart.findOneAndUpdate({ userId: userid }, { $push: { product: { productId: productid, price: productdata.price } } })

                setTimeout(() => {
                    res.redirect('/getwish')
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
                    res.redirect('/getwish')
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




module.exports = {
    addwhishlist,
    getwishlist,
    deletewish,
    addtocartwish,
}