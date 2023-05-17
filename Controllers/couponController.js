
const mongoose = require('mongoose')
const { log } = require('npmlog')
const coupon = require('../models/couponModel')







const couponaddinguser = async (req, res) => {
    try {
        const code = req.body.coupon;
        req.session.code = req.body.coupon
      

        const amount = req.body.amount
        const carttotal= req.body.carttotal
       
      
        const userExist = await coupon.findOne({ couponcode: code, user: { $in: [req.session.user_id] } });
      
        if (userExist) {
            res.json({ user: true });
        } else {
            const couponData = await coupon.findOne({ couponcode: code });

            if (couponData) {
                if (couponData.limit <= 0) {
                    res.json({ limit: true });
                } else {
                    if (couponData.status == false) {
                        res.json({ status: true })
                    } else {
                        if (couponData.expiredate <= new Date()) {
                            res.json({ date: true });
                        } else {
                            if (couponData.purchaceamount >=carttotal) {
                                res.json({ cartAmount: true });
                            } else {

                               
                                const disAmount = couponData.discount;
                                const totalorder=  Math.round(carttotal - disAmount);
                                const disTotal = Math.round(amount - disAmount);
                                

                                return res.json({ amountOkey: true, disAmount, disTotal,totalorder });

                            }
                        }
                    }
                }
            } else {
                res.json({ invalid: true });
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}

const returncoupon = async (req, res) => {
    try {

     

        const totalamount = req.body.totalamount
        const paidamount = req.body.paidamount
        return res.json({ success: true,totalamount,paidamount })
    } catch (error) {
        console.log(error);
    }
}




module.exports = {
    
    couponaddinguser,
    returncoupon

}