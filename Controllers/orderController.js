
const mongoose = require('mongoose')
const cart = require('../models/CartModel')
const Users = require('../models/userModel')
const order = require('../models/orderModel')
const { log } = require('npmlog')
const coupon = require('../models/couponModel')
const session = require('express-session')
const Razorpay = require('razorpay')
const status = require('statuses')



var instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});

const ordercomplete = async (req, res) => {

    try {

        const user = await Users.findOne({ _id: req.session.user_id })
        const walletuser= user.wallet
        const seconde= req.body.seconde

        const address = req.body.address
        const total =parseInt(req.body.amount)
 
        let totalorder=req.body.totalamount
        let peyment = req.body.peyment
        const cartdata = await cart.findOne({ userId: req.session.user_id })
        const product = cartdata.product


        if (peyment != 'online') {
            var status = 'placed'
        } else {
            var status = 'pending'
        }

        if (peyment === undefined) {
            peyment = 'wallet'
        }
       
      
       

       let walletamount;
       let paidamount;
       let totalamount
        if(req.session.total>user.wallet){

            paidamount=total
        }else {
            paidamount=0
           
        }
        if(req.session.total>user.wallet){
            walletamount=walletuser 
            const wallet= walletuser-walletuser
            await Users.updateOne({_id:req.session.user_id},{$set:{wallet:wallet}})
        }else{
            walletamount= total
            const wallet = walletuser-seconde
            await Users.updateOne({_id:req.session.user_id},{$set:{wallet:wallet}})
        }

        if(req.session.total>user.wallet){
            totalamount= parseInt(paidamount+walletuser)
        }else{
            totalamount=total
        }

        const exprdatereturn = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
        const exprdateplaced = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
        const exprdatedeliverd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        


        const neworder = new order({

            deliveryaddress: address,
            userId: req.session.user_id,
            user: user.name,
            peymentMethod:peyment,
            product: product,
            paidamount:paidamount,
            date: new Date(),
            status: status,
            wallet:walletamount,
            totalamount:totalamount,
            exprdatereturn:exprdatereturn,
            exprdateplaced:exprdateplaced,
            exprdatedeliverd:exprdatedeliverd




            


        })
        const orderData = await neworder.save()

        if (status === 'placed') {

            const code = req.session.code

            const couponData = await coupon.findOne({ couponcode: code });

            if (couponData) {
                req.session.couponId = couponData._id

                await order.findByIdAndUpdate({ _id: orderData._id }, { $set: { couponId: req.session.couponId } });
                await cart.deleteOne({ userId: req.session.user_id })
                await coupon.findByIdAndUpdate({ _id: couponData._id }, { $push: { user: req.session.user_id } });
                await coupon.findByIdAndUpdate({ _id: couponData._id }, { $inc: { limit: -1 } });
                res.json({ codesuccess: true });
            } else {
                await cart.deleteOne({ userId: req.session.user_id })
                res.json({ codesuccess: true });
            }


        } else {
            const orderid = orderData._id
            const totalamount = orderData.paidamount
            var options = {
                amount: totalamount * 100,
                currency: "INR",
                receipt: "" + orderid
            }
            instance.orders.create(options, function (err, order) {
                res.json({ order });
            })
        }


    } catch (error) {
        console.log(error.message);
    }
}

const verifyOnlinePayment = async (req, res) => {
    try {

        const details = (req.body)
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', 'EbxvveBkpnXF4xiIb1TJz3Ip');

        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)

        hmac = hmac.digest('hex');

        if (hmac == details.payment.razorpay_signature) {

         


            const code = req.session.code

            const couponData = await coupon.findOne({ couponcode: code });


            if (couponData) {

                req.session.couponId = couponData._id

                await cart.deleteOne({ userId: req.session.user_id })
                await order.findByIdAndUpdate({ _id: details.order.receipt }, { $set: { couponId: req.session.couponId } });
                await order.findByIdAndUpdate({ _id: details.order.receipt }, { $set: { status: "placed" } });
                await order.findByIdAndUpdate({ _id: details.order.receipt }, { $set: { paymentid: details.payment.razorpay_payment_id } });
                await coupon.findByIdAndUpdate({ _id: couponData._id }, { $push: { user: req.session.user_id } });
                await coupon.findByIdAndUpdate({ _id: couponData._id }, { $inc: { limit: -1 } });
                res.json({ peymentsuccess: true });
            } else {

                await cart.deleteOne({ userId: req.session.user_id })
                await order.findByIdAndUpdate({ _id: details.order.receipt }, { $set: { status: "placed" } });
                await order.findByIdAndUpdate({ _id: details.order.receipt }, { $set: { paymentid: details.payment.razorpay_payment_id } });
                res.json({ peymentsuccess: true });
            }
        } else {
            await order.findByIdAndRemove({ _id: details.order.receipt });
            res.json({ success: false });
        }


    } catch (error) {
        console.log(error.message);

    }
}



const cancelorder= async(req,res)=>{
    try {

       const id= req.body.id
       const userdata= await Users.findOne({_id:req.session.user_id})
       await order.updateOne({_id:id},{$set:{status:'cancelled'}})
       const orderdata= await order.findOne({_id:id})
       const wallet=userdata.wallet
      
       const returnonlineamo= wallet+orderdata.totalamount
       const returnamo= wallet+orderdata.wallet
       const orderwalletamo= wallet+orderdata.totalamount

       if(orderdata.peymentMethod=='cod'){
        await Users.updateOne({_id:req.session.user_id},{$set:{wallet:returnamo}})
       }else if(orderdata.peymentMethod=='online'){
        await Users.updateOne({_id:req.session.user_id},{$set:{wallet:returnonlineamo}})
       }else{
        await Users.updateOne({_id:req.session.user_id},{$set:{wallet:orderwalletamo}})
       }

       
        
      
       res.json({success:true})


    }
    catch(error){
    console.log(error.message);
   }
}

const vieworder= async(req,res)=>{
    try {

    
        const id= req.query.id
        const orders = await order.findOne({_id:id}).populate('product.productId')
        res.render('vieworderuser',{orders:orders})
       
    } catch (error) {
        console.log(error)
    }
}

const returnorder= async (req,res)=>{
    try {

        const id= req.body.id
        const userdata= await Users.findOne({_id:req.session.user_id})
        await order.updateOne({_id:id},{$set:{status:'returned'}})
        const orderdata= await order.findOne({_id:id})
        const wallet=userdata.wallet
       
        const returnonlineamo= wallet+orderdata.totalamount
        const returnamo= wallet+orderdata.totalamount
        const orderwalletamo= wallet+orderdata.totalamount
 
        if(orderdata.peymentMethod=='cod'){
         await Users.updateOne({_id:req.session.user_id},{$set:{wallet:returnamo}})
        }else if(orderdata.peymentMethod=='online'){
         await Users.updateOne({_id:req.session.user_id},{$set:{wallet:returnonlineamo}})
        }else{
         await Users.updateOne({_id:req.session.user_id},{$set:{wallet:orderwalletamo}})
        }

        res.json({success:true})
        
    } catch (error) {
        console.log(error);
    }
}


const orderhistory= async(req,res)=>{
    try{
      const id=  req.session.user_id
     
         const orderdata= await order.find({userId:id}).populate('product.productId')
         
         const orderdatas = await order.find()
        for(let i =0;i<orderdatas.length;i++){
            if(new Date()>orderdatas[i].exprdateplaced && new Date()<orderdatas[i].exprdatedeliverd){
               
                await order.updateOne({status:'placed'},{$set:{status:'shipped'}})
            }else if(new Date()>orderdatas[i].exprdatedeliverd){
                
                await order.updateOne({status:'shipped'},{$set:{status:'deliverd'}})
            }else{
               
                await order.updateOne({status:null},{$set:{status:'placed'}})
            }

            
        }

         if(orderdata){
            
           res.render('orderhistory',{orderdata:orderdata})
        }

         
    }catch(error){
        console.log(error.message);
    }
}


module.exports = {
    ordercomplete,
    verifyOnlinePayment,
    vieworder,
    returnorder,
    cancelorder,
    orderhistory
    

}