
const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const { updateOne } = require('../models/userModel')
const session = require('express-session')
const product = require('../models/product Model')
const { log } = require('npmlog')
const wishlist = require('../models/wishlistmodel')
const mongoose = require('mongoose')
const address = require('../models/addressModel')
const cart = require('../models/CartModel')
const coupon = require('../models/couponModel')
const order = require('../models/orderModel')
const review= require('../models/review.Model')
const dotenv=require('dotenv').config()

const { tryEach } = require('async')

var email1



const securePassword = async (password) => {

    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message)
    }
}



function sendmail(email) {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user:process.env.user,
            pass:process.env.pass
        }
    });
    const mailOptions = {
        from: process.env.user,
        to: email,
        subject: 'Your OTP code',
        text: `Your OTP code is ${otp}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {

            console.log(`Email sent: ${info.response}`);
        }
    });
}
var temp
const insertuser = async (req, res) => {

    try {

        const email = req.body.email;
        const data = await Users.findOne({ email: email })

        if (data) {
            res.render('register', { error: 'this email allreday used' })
        } else {




            console.log(email)
            const spassword = await securePassword(req.body.password)

            const user = new Users({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                password: spassword,
                wallet:0,
                is_admin: 0,
                is_varified: 0,
                is_block: 0

            })
            temp = req.body.email
            console.log(temp)
            const userdata = await user.save()




            if (userdata) {
                sendmail(req.body.email)
                if (userdata.name.trim() == '') {
                    res.render('register', { error: 'please enter name' })
                } else {

                    res.redirect('/otp?id=' + userdata.id)
                }

            } else {
                res.render('register', { error: 'this emaile allready registerd' })
            }
        }

    } catch (error) {
        console.log(error.message)
    }

}

const userRegister = async (req, res) => {

    try {

        res.render('register')
    } catch (error) {
        console.log(error.message)
    }


}


const userlogin = async (req, res) => {

    try {

        res.render('login')

    } catch (error) {
        console.log(error.message)
    }

}

const verifylogin = async (req, res) => {
    try {

        const email = req.body.email
        const password = req.body.password


        const userdata = await Users.findOne({ email: email })


        if (userdata) {
            if (userdata.is_block == 1) {
                if (userdata.is_varified == 0) {
                    const passwordmatch = await bcrypt.compare(password, userdata.password)
                    if (passwordmatch) {
                        req.session.user_id = userdata._id
                        req.session.hid='page-1-link'
                        req.session.limit=6

                        res.redirect('/home')


                    } else {
                        res.render('login', { error: 'incorrect password or email' })
                    }
                } else {
                    res.render('login', { error: 'your blocked' })
                }
            } else {
                res.render('login', { error: 'your account is not verifyed' })
            }
        } else {
            res.render('login', { error: 'your login has faild please check your password and email' })
        }




    } catch (error) {
        console.log(error.message)
    }
}



const userotp = async (req, res) => {
    try {
        res.render('otp')

    } catch (error) {
        console.log(error.message)
    }
}

function generateOTP() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}
let otp = generateOTP()

const compareotp = async (req, res) => {
    try {
        if (otp == req.body.otp) {
            const id = req.query.id
            console.log(id+'ajmal');
            const data = await Users.findByIdAndUpdate({ _id: id }, { $set: { is_block: 1} })
            res.redirect('/login')

        } else {
            res.render('otp', { message: 'otp is incorrect please check ' })
        }
    } catch (error) {
        console.log(error.message)
    }
}


const ResentOtp = async (req, res) => {

    try {
        otp = generateOTP()

         sendmail(temp)

        res.redirect('/otp')
    } catch (error) {
        console.log(error.message);
    }
}

const homee = async (req, res) => {

    try {

        const data = await product.find()
        res.render('home', { product: data })

    } catch (error) {
        console.log(error.message)
    }

}


const aboutee = (req, res) => {

    try {

        res.render('about')

    } catch (error) {
        console.log(error.message)
    }

}


const wishlistee = (req, res) => {

    try {

        res.render('add-to-wishlist')


    } catch (error) {
        console.log(error.message)
    }

}

const cartee = async (req, res) => {

    try {



        res.render('cart')
        

    } catch (error) {
        console.log(error.message)
    }

}

const checkoutee = async (req, res) => {

    try {
        const userdata= await Users.findOne({_id:req.session.user_id})
        const cartdata = await cart.findOne({ userId: req.session.user_id })

        const data = await address.findOne({ userId: req.session.user_id })
        const couponcode = await coupon.find()
        const total = req.session.total

        if (data) {
            res.render('checkout', { data, cartdata, total,userdata,couponcode })
        } else {

            res.render('checkoutemty', { cartdata, total, couponcode,userdata, error: 'no one address please add address' })

        }

    } catch (error) {
        console.log(error.message)
    }

}

const contactee = (req, res) => {

    try {

        res.render('contact')

    } catch (error) {
        console.log(error.message)
    }

}

const menee = (req, res) => {

    try {

        res.render('men')

    } catch (error) {
        console.log(error.message)
    }

}

const orderee = (req, res) => {

    try {

        res.render('order-complete')

    } catch (error) {
        console.log(error.message)
    }

}

const productee = async (req, res) => {

    try {
       const session= req.session.user_id
       const orders= await order.findOne({userId:session})
       
        const id = req.query.id
 
        const not = await review.find({ productId: id, userId: { $ne: session } });
        console.log(not);
        const userc= await review.find({userId:session,productId:id})
        // console.log(userc);
       
        const count= await review.find({productId:id}).count()    
        const data = await product.findOne({ _id: id })
        const productdata = await product.find()
        

        res.render('product-detail', { Data: data,count:count,product: productdata,orders:orders,session:userc,not:not})

    } catch (error) {
        console.log(error.message)
    }

}


//  filter !

  

const womenee = async (req, res) => {


    try {

        const value1 = parseInt(req.session.value1)
        const value2 = parseInt(req.session.value2)

        if (req.session.category) {
            console.log('100')
            if (req.session.sort && req.session.value1 && req.session.value2) {

                const data = await product.find({ category: req.session.category, price: { $gte: value1, $lte: value2 } }).sort({ price: req.session.sort }).skip(req.session.stx).limit(req.session.limit)
                const total = await product.find({ category: req.session.category, price: { $gte: value1, $lte: value2 } })
                const size= Math.ceil(total.length/req.session.limit)
                res.render('women', { dataa: data ,tagId:req.session.hid,size})

                console.log('200')
                req.session.sort = null
                req.session.value1 = null
                req.session.value2 = null
                req.session.category = null
                req.session.limit= null
                req.session.page= null


            }
            else if (req.session.sort == null && req.session.value1 && req.session.value2) {
                console.log('300')

                const data = await product.find({ category: req.session.category, price: { $gte: value1, $lte: value2 } }).skip(req.session.stx).limit(req.session.limit)
                const total = await product.find({ category: req.session.category, price: { $gte: value1, $lte: value2 } })

                const size= Math.ceil(total.length/req.session.limit)

                res.render('women', { dataa: data ,tagId:req.session.hid,size})
                req.session.value1 = null
                req.session.value2 = null
                req.session.category = null
                req.session.limit= null
                req.session.page= null

            }
            else if (req.session.sort && req.session.value1 == null && req.session.value2 == null) {
                console.log('400');
                const data = await product.find({ category: req.session.category }).sort({ price: req.session.sort }).skip(req.session.stx).limit(req.session.limit)
                const total = await product.find({ category: req.session.category })
                const size= Math.ceil(total.length/req.session.limit)
                res.render('women', { dataa: data,tagId:req.session.hid,size })

                req.session.sort = null
                req.session.category = null
                req.session.limit= null
                req.session.page= null



            }
            else if (req.session.sort == null && req.session.value1 == null && req.session.value2 == null) {
               
                const data = await product.find({ category: req.session.category }).skip(req.session.stx).limit(req.session.limit)
                const total = await product.find({ category: req.session.category })
                const size= Math.ceil(total.length/req.session.limit)
                res.render('women', { dataa: data,tagId:req.session.hid,size })
                req.session.category = null
                req.session.limit= null
                req.session.page= null


            }
        } else {
            if (req.session.sort && req.session.value1 && req.session.value2) {
               
                const data = await product.find({ price: { $gte: value1, $lte: value2 } }).sort({ price: req.session.sort }).skip(req.session.stx).limit(req.session.limit)
                const total = await product.find({ price: { $gte: value1, $lte: value2 } })
                const size= Math.ceil(total.length/req.session.limit)
                res.render('women', { dataa: data,tagId:req.session.hid,size })
                req.session.sort = null
                req.session.value1 = null
                req.session.value2 = null
                req.session.limit= null
                req.session.page= null

            }
            else if (req.session.sort == null && req.session.value1 && req.session.value2) {
               

                const data = await product.find({ price: { $gte: value1, $lte: value2 } }).skip(req.session.stx).limit(req.session.limit)
                const total = await product.find({ price: { $gte: value1, $lte: value2 } })
                const size= Math.ceil(total.length/req.session.limit)
                res.render('women', { dataa: data,tagId:req.session.hid,size })

                req.session.value1 = null
                req.session.value2 = null
                req.session.limit= null
                req.session.page= null


            }
            else if (req.session.sort && req.session.value1 == null && req.session.value2 == null) {
                
                const data = await product.find().sort({ price: req.session.sort }).skip(req.session.stx).limit(req.session.limit)
                const total = await product.find()
                const size= Math.ceil(total.length/req.session.limit)
                res.render('women', { dataa: data,tagId:req.session.hid,size})
                req.session.sort = null

                req.session.limit= null
                req.session.page= null



            }
            else if (req.session.sort == null && req.session.value1 == null && req.session.value2 == null) {
               
                const data = await product.find().skip(req.session.stx).limit(req.session.limit)
                const total = await product.find()
                const size= Math.ceil(total.length/req.session.limit)
                console.log(req.session.limit);
                res.render('women', { dataa: data,tagId:req.session.hid,size })
                req.session.limit= null
                req.session.page= null


            }
        }

    } catch (error) {
        console.log(error.message)
    }

}
const category = async (req, res) => {


    req.session.category = req.query.category
    res.redirect('/women')
}
const sort = async (req, res) => {


    req.session.sort = req.query.sort
    res.redirect('/women')
}
const filter = async (req, res) => {


    req.session.value1 = req.query.value1
    req.session.value2 = req.query.value2
    res.redirect('/women')
}

const pagination = async(req,res)=>{
    try {
       const page = req.query.page
       const id = req.query.id
       
       req.session.hid=id
       req.session.stx= (page-1)*req.session.limit
       console.log(req.session.limit);
       console.log( req.session.stx);
       res.redirect('/women')
    //    const products = await product.find().skip(stx).limit(limit) 
    //    res.render('women',{dataa:products})
    } catch (error) {
        console.log(error.message);
    }
  }





const passwordchange = async (req, res) => {
    try {


        res.render('forgetpassword')

    } catch (error) {
        console.log(error.message)
    }

}
const emailget = async (req, res) => {
    try {


        res.render('emailcheck')

    } catch (error) {
        console.log(error.message)
    }
}
const verifyemail = async (req, res) => {
    try {
        email1 = req.body.email;

        const email = req.body.email;
        const password = req.body.password;
        const userdata = await Users.findOne({ email: email })
        console.log(userdata)
        if (userdata) {

            // req.session.userid=userdata._id
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'ajmalsabith444@gmail.com',
                    pass: 'roapvammbmkxzlck'
                }
            });
            const mailOptions = {
                from: 'ajmalsabith444@gmail.com',
                to: req.body.email,
                subject: 'Your OTP code',
                text: `Your OTP code is ${otp}.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                } else {

                    console.log(`Email sent: ${info.response}`);
                }
            });
            res.redirect('/otp2')

        } else {
            res.render('emailcheck', { message: 'email or password is incorrect' })
        }





    } catch (error) {
        console.log(error.message)
    }
}
const otp2 = async (req, res) => {
    try {
        res.render('otp2')
    } catch (error) {
        console.log(error.message)
    }
}


const verifyotp = async (req, res) => {
    try {
        if (otp == req.body.otp) {
            res.redirect('/passwordchange')
        } else {
            res.render('otp2', { message: 'otp is incorrect please check ' })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const confirmchange = async (req, res) => {
    try {
        const password = req.body.password;
        const confirmpassword = req.body.password2;
        if (password == confirmpassword) {
            const Npass = await securePassword(password)
            const userdata = await Users.updateOne({ email: email1 }, { $set: { password: Npass } })
            res.redirect('/login')
        } else {
            res.render('forgetpassword', { message: 'please enter correct password' })
        }

    } catch (error) {
        console.log(error.message)
    }
}



const userlogout = async (req, res) => {
    try {
        req.session.user_id=false
        res.redirect('/login')


    } catch (error) {
        console.log(error.message)
    }
}

const searchpro = async (req, res) => {
    try {

        const searchValue = req.body.search

        const search = searchValue.trim()

        if (search != '') {
            const productdata = await product.find({ name: { $regex: `^${search}`, $options: 'i' } });
            const total = await product.find()
            const size= Math.ceil(total.length/req.session.limit)



            res.render('women', { dataa: productdata,size ,tagId:req.session.hid})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const getprofile = async (req, res) => {
    try {

        const coupondata = await coupon.find()
        const data = await Users.findOne({ _id: req.session.user_id })

        const userad = await address.findOne({ userId: req.session.user_id })

        if (userad) {
            res.render('profile', { data: data, address: userad, coupon: coupondata })
        } else {
            res.render('emtyprofile', { data: data, coupon: coupondata })
        }


    } catch (error) {
        console.log(error.message)
    }
}



  

module.exports = {
    homee,
    aboutee,
    wishlistee,
    cartee,
    checkoutee,
    contactee,
    menee,
    orderee,
    productee,
    womenee,
    userlogin,
    userRegister,
    insertuser,
    userotp,
    compareotp,
    verifylogin,
    verifyotp,
    passwordchange,
    emailget,
    verifyemail,
    emailget,
    otp2,
    confirmchange,
    userlogout,
    ResentOtp,
    searchpro,
    getprofile,
    filter,
    sort,
    category,
    
    pagination,
   
   
}


