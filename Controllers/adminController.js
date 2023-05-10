const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const Category = require('../models/CategoryModel')
const product = require('../models/product Model')
const order = require('../models/orderModel')
const coupon = require('../models/couponModel')
const { log } = require('npmlog')
const { name } = require('ejs')
const mongoose = require('mongoose')
const sharp = require('sharp')


const { updateOne } = require('../models/CartModel')

///html to pdfgenerate require things
// const ejs = require('ejs')
// const pdf = require('html-pdf')
// const fs = require('fs')
// const path = require('path')
// const { forEach } = require('async')


const getlogin = async (req, res) => {
    try {
        res.render('login')

    } catch (error) {
        console.log(error.message)
    }
}
const verifylogin = async (req, res) => {
    try {
        const email = req.body.email;
        console.log(email);
        const password = req.body.password;
        console.log(password);

        

        const userdata = await Users.findOne({ is_admin: 1 })
        
        console.log(userdata);

        if (userdata.email == email) {
            const passwordmatch = await bcrypt.compare(password, userdata.password)
            if (passwordmatch) {
                req.session.admin_id = email
                res.redirect('/admin/home')
            } else {
                res.render('login', { message: 'your email or password is incorrect ok ' })
            }
        } else {
            res.render('login', { message: 'your email or password is incorrect' })
        }


    } catch (error) {
        console.log(error.message)
    }
}

const gethome = async (req, res) => {
    try {


        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const orderstoday = await order.find({ date: { $gte: startOfToday, $lt: endOfToday } }).count();
       

       


        const data = await Users.find().count()
        const block = await Users.find({ is_varified: 1 }).count()
        const orders = await order.find({status:{$ne:'cancelled'}}).count()
       
        const products = await product.find().count()
        const coupons = await coupon.find().count()
        const categorys = await Category.find().count()
        const productblock = await product.find({ is_block: false }).count()
        const cod = await order.find({ peymentMethod: 'cod' }).count()
        const wallet = await order.find({ peymentMethod: 'wallet' }).count()
        const online = await order.find({ peymentMethod: 'online' }).count()
        const total = await order.aggregate([
            {$match:{status:{$ne:'cancelled'}}},
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalamount" }
                }
            }
        ])

        const date = new Date()
        const year = date.getFullYear()
        const currentYear = new Date(year, 0, 1)

        const salesByYear = await order.aggregate([
            {
                $match: {
                    date: { $gte: currentYear }, status: { $ne: "cancelled" }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%m", date: "$date" } },
                    total: { $sum: "$totalamount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])


        let sales = []
        for (i = 1; i < 13; i++) {
            let result = true
            for (j = 0; j < salesByYear.length; j++) {
                result = false
                if (salesByYear[j]._id == i) {
                    sales.push(salesByYear[j])
                    break;
                } else {
                    result = true

                }
            }
            if (result) {
                sales.push({ _id: i, total: 0, count: 0 })
            }

        }

        let yearChart = []
        for (i = 0; i < sales.length; i++) {
            yearChart.push(sales[i].total)
        }




        res.render('index', { data, block,coupons, orders, productblock, products, categorys, total, orderstoday, online, cod, yearChart, wallet })

    } catch (error) {
        console.log(error.message)
    }
}

const userlist = async (req, res) => {
    try {

        const userdata = await Users.find()
        res.render('userManage', { userdata: userdata })

    } catch (error) {
        console.log(error.message)
    }

}


const findidblock = async (req, res) => {
    try {
        const Data = req.query.data


        const id = req.query.id
        if (Data) {
            const userdata = await Users.findByIdAndUpdate({ _id: id }, { $set: { is_varified: 0 } })
            res.redirect('/admin/userManage')
        } else {
            const data = await Users.findByIdAndUpdate({ _id: id }, { $set: { is_varified: 1 } })
            req.session.destroy()
            res.redirect('/admin/userManage')
        }





    } catch (error) {
        console.log(error.message)
    }

}

    
const adminlogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin/login')


    } catch (error) {
        console.log(error.message)
    }
}
const addCategoryget = (req, res) => {
    try {

        res.render('addCategory')


    } catch (error) {
        console.log(error.message)
    }
}
const insertCategory = async (req, res) => {
    try {

        const dataa = await Category.findOne({ name: req.body.category })

        if (dataa) {

            res.render('addCategory', { error: 'this Category allready added' })
        } else {

            const newcategory = new Category({

                name: req.body.category

            })
            const data = await newcategory.save()
            res.render('addCategory', { message: 'category added' })

        }

    } catch (error) {
        console.log(error.message)
    }
}

const Categoryget = async (req, res) => {
    try {

        const Categorydata = await Category.find()
        res.render('Category', { category: Categorydata })


    } catch (error) {
        console.log(error.message)
    }
}


const editecategory = async (req, res) => {
    try {
        const id = req.query.id

        const category = await Category.findOne({ _id: id })
        const dataa = await Category.findOne({ name: req.body.category })

        if (dataa) {
            res.render('editcategory', { error: 'this Category allready added', category })
        } else {


            const data = await Category.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.category } })
            res.redirect('/admin/Category')
        }
    } catch (error) {
        console.log(error.message)
    }
}
const editecategoryget = async (req, res) => {
    try {

        const id = req.query.id

        const data = await Category.findOne({ _id: id })


        res.render('editcategory', { category: data })


    } catch (error) {
        console.log(error.message)
    }
}

const getproduct = async (req, res) => {

    try {

        const data = await product.find()

        res.render('product', { product: data })
    } catch (error) {
        console.log(error.message)
    }

}
const insertproduct = async (req, res) => {
    try {

        const image = []
        for (let i = 0; i < req.files.length; i++) {
            image[i] = req.files[i].filename
            sharp('./public/users/imgs/' + req.files[i].filename)
                .resize(300, 300).toFile('./public/users/img/' + req.files[i].filename)
        }





        const newproduct = new product({

            name: req.body.name,
            price: req.body.price,
            category: req.body.categoryname,
            image: image,
            discription: req.body.discription,
            stock: req.body.stock,
            is_block: true
        })
        await newproduct.save()

        res.redirect('/admin/product')

    } catch (error) {
        console.log(error.message)
    }

}

const getaddproduct = async (req, res) => {

    try {
        const data = await Category.find()

        res.render('addproduct', { category: data })
    } catch (error) {
        console.log(error.message)
    }

}
const geteditproduct = async (req, res) => {
    try {
        const id = req.query.id

        const data = await product.findById({ _id: id })
        const category = await Category.find()



        res.render('editproduct', { product: data, category: category })
    } catch (error) {
        console.log(error.message)
    }
}

const editeproduct = async (req, res) => {
    try {
        const id = req.query.id

        const image = []
        for (let i = 0; i < req.files.length; i++) {
            image[i] = req.files[i].filename
            sharp('./public/users/imgs/' + req.files[i].filename)
                .resize(300, 300).toFile('./public/users/img/' + req.files[i].filename)
        }


        if (req.files.length != 0) {



            const update = await product.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.name, price: req.body.price, category: req.body.categoryname, discription: req.body.discription, stock: req.body.stock } })
            for (let i = 0; i < req.files.length; i++) {
                const dataa = await product.findByIdAndUpdate({ _id: id }, { $push: { image: image } })
            }
            res.redirect('/admin/product')
        }

        else {
            const update = await product.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.name, price: req.body.price, category: req.body.categoryname, discription: req.body.discription, stock: req.body.stock } })
            res.redirect('/admin/product')
        }

    }


    catch (error) {
        console.log(error.message)
    }
}

const deleteimage = async (req, res) => {

    try {

        const imageid = req.query.id
        let qid = req.query.idpp
        const id = new mongoose.Types.ObjectId(req.query.idpp)

        const data = await product.updateMany({ _id: id }, { $pull: { image: imageid } })



        res.redirect('/admin/productedit?id=' + qid)
    } catch (error) {
        console.log(error.message)
    }

}


const deletproduct = async (req, res) => {
    try {




        const id = req.query.id
        // const data= await product.findByIdAndDelete({_id:id})
        const deletep = await product.updateOne({ _id: id }, { $set: { is_block: false } })

        if (deletep) {

            res.redirect('/admin/product')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const getaddcoupon = async (req, res) => {
    try {

        res.render('addcoupon')

    } catch (error) {
        console.log(error.message)
    }
}


const insertcoupon = async (req, res) => {
    try {

        const newcoupons = new coupon({

            couponcode: req.body.name,
            discount: req.body.discount,
            expiredate: req.body.date,
            purchaceamount: req.body.cartamount,
            limit: req.body.limit,
            status: true,

        })
        const data = await newcoupons.save()

        if (data) {
            res.redirect('/admin/coupon')
        }


    } catch (error) {
        console.log(error.message)
    }
}
const getcoupons = async (req, res) => {
    try {

        const data = await coupon.find()
        res.render('coupon', { data })

    } catch (error) {
        console.log(error.message)
    }
}


const geteditcoupon = async (req, res) => {
    try {

        const id = req.query.id
        const data = await coupon.findOne({ _id: id })
        res.render('editcoupon', { data })

    } catch (error) {
        console.log(error.message)
    }
}

const editcoupon = async (req, res) => {
    try {

        const id = req.query.id

        const update = await coupon.updateOne({ _id: id }, { $set: { couponcode: req.body.name, discount: req.body.discount, expiredate: req.body.date, purchaceamount: req.body.cartamount, limit: req.body.limit } })
        if (update) {
            res.redirect('/admin/coupon')
        }


    } catch (error) {
        console.log(error.message)
    }
}

const deletecoupon = async (req, res) => {
    try {

        const id = req.query.id
        const data = await coupon.findByIdAndDelete({ _id: id })
        res.redirect('/admin/coupon')

    } catch (error) {
        console.log(error.message)
    }
}

const ordermanageget = async (req, res) => {

    try {


        const orders = await order.find().populate('product.productId')
        const orderdatas = await order.find()
        for(let i =0;i<orderdatas.length;i++){
            if(new Date()>orderdatas[i].exprdateplaced && new Date()<orderdatas[i].exprdatedeliverd){
                console.log('shipped');
                await order.updateOne({status:'placed'},{$set:{status:'shipped'}})
            }else if(new Date()>orderdatas[i].exprdatedeliverd){
                console.log('deliverd');
                await order.updateOne({status:'shipped'},{$set:{status:'deliverd'}})
            }else{
                console.log('placed');
                await order.updateOne({status:null},{$set:{status:'placed'}})
            }

            
        }


        console.log(orderdatas);


        if (orders) {

            res.render('ordersadmin', { orders })
        }

    }
    catch (error) {
        console.log(error.message);
    }
}
const orderdelete = async (req, res) => {
    try {

        const id = req.query.id

        await order.deleteOne({ _id: id })
        res.redirect('/admin/orderadmin')


    }
    catch (error) {
        console.log(error.message);
    }
}

const editstatus = async (req, res) => {
    try {
        const id = req.body.id
        const status = req.body.status
        console.log(status);
        console.log(id);
        const status1 = await order.findByIdAndUpdate({ _id: id }, { $set: { status: status } })
        if (status1) {
            res.redirect('/admin/vieworder?id=' + id)
        }
    } catch (error) {
        console.log(error.message);
    }
}



const vieworderget = async (req, res) => {
    try {
        const id = req.query.id
        const orders = await order.findOne({ _id: id }).populate('product.productId')




        res.render('vieworder', { orders: orders })
    }
    catch (error) {
        console.log(error.message);
    }
}


const salesreport = async (req, res) => {
    try {
        req.session.look = null
        const orders = await order.find().sort({ date: -1 }).populate('product.productId')
        req.session.look = 'm1'

        res.render('salesreport', { orders })
    } catch (error) {
        console.log(error);
    }
}



const filterdate = async (req, res) => {

    try {
        const date1 = req.body.date1
        const date2 = req.body.date2
        req.session.date1 = req.body.date1
        req.session.date2 = req.body.date2
        if (date2 >= date1) {
            req.session.look = null
            const data = await order.find({ date: { $gte: date1, $lte: date2 } }).sort({ date: -1 }).populate('product.productId');

            req.session.look = 'm2'
            if (data) {

                res.render('salesreport', { orders: data })
            }

        } else {
            req.session.look = null
            const orders = await order.find().sort({ date: -1 }).populate('product.productId')
            req.session.look = 'm3'
            res.render('salesreport', { orders, message: 'please correct date' })
        }


    } catch (error) {
        console.log(error);
    }

}

// const exportTopdf = async (req, res) => {
//     try {

//         if (req.session.look == 'm1') {
//             const orderdetails = await order.find().sort({ date: -1 }).populate('product.productId')
//             const data = {
//                 report: orderdetails
//             }

//             const filepath = path.resolve(__dirname, '../views/admin/salesreporttopdf.ejs')
//             const htmlstring = fs.readFileSync(filepath).toString()

//             let option = {
//                 format: "A3"
//             }
//             const ejsData = ejs.render(htmlstring, data)
//             pdf.create(ejsData, option).toFile('salesReport.pdf', (err, response) => {
//                 if (err) console.log(err);

//                 const filepath = path.resolve(__dirname, '../salesReport.pdf')
//                 fs.readFile(filepath, (err, file) => {
//                     if (err) {
//                         console.log(err);
//                         return res.status(500).send('could not download file')
//                     }
//                     res.setHeader('Content-Type', 'application/pdf')
//                     res.setHeader('Content-Disposition', 'attatchment;filename="Sales Report.pdf"')

//                     res.send(file)

//                 })
//             })
//         } else if (req.session.look == 'm2') {
//             const orderdetails = await order.find({ date: { $gte: req.session.date1, $lte: req.session.date2 } }).sort({ date: -1 }).populate('product.productId');
//             const data = {
//                 report: orderdetails
//             }

//             const filepath = path.resolve(__dirname, '../views/admin/salesreporttopdf.ejs')
//             const htmlstring = fs.readFileSync(filepath).toString()

//             let option = {
//                 format: "A3"
//             }
//             const ejsData = ejs.render(htmlstring, data)
//             pdf.create(ejsData, option).toFile('salesReport.pdf', (err, response) => {
//                 if (err) console.log(err);

//                 const filepath = path.resolve(__dirname, '../salesReport.pdf')
//                 fs.readFile(filepath, (err, file) => {
//                     if (err) {
//                         console.log(err);
//                         return res.status(500).send('could not download file')
//                     }
//                     res.setHeader('Content-Type', 'application/pdf')
//                     res.setHeader('Content-Disposition', 'attatchment;filename="Sales Report.pdf"')

//                     res.send(file)

//                 })
//             })
//         } else if (req.session.look == 'm3') {
//             const orderdetails = await order.find().sort({ date: -1 }).populate('product.productId')
//             const data = {
//                 report: orderdetails
//             }

//             const filepath = path.resolve(__dirname, '../views/admin/salesreporttopdf.ejs')
//             const htmlstring = fs.readFileSync(filepath).toString()

//             let option = {
//                 format: "A3"
//             }
//             const ejsData = ejs.render(htmlstring, data)
//             pdf.create(ejsData, option).toFile('salesReport.pdf', (err, response) => {
//                 if (err) console.log(err);

//                 const filepath = path.resolve(__dirname, '../salesReport.pdf')
//                 fs.readFile(filepath, (err, file) => {
//                     if (err) {
//                         console.log(err);
//                         return res.status(500).send('could not download file')
//                     }
//                     res.setHeader('Content-Type', 'application/pdf')
//                     res.setHeader('Content-Disposition', 'attatchment;filename="Sales Report.pdf"')

//                     res.send(file)

//                 })
//             })
//         }


//     } catch (error) {

//         console.log(error.message);

//     }
// }

module.exports = {
    getlogin,
    verifylogin,
    gethome,
    userlist,
    findidblock,
    adminlogout,
    addCategoryget,
    insertCategory,
    Categoryget,
    editecategoryget,
    editecategory,
    getproduct,
    insertproduct,
    getaddproduct,
    geteditproduct,
    editeproduct,
    deletproduct,
    deleteimage,
    getaddcoupon,
    insertcoupon,
    getcoupons,
    geteditcoupon,
    editcoupon,
    deletecoupon,
    ordermanageget,
    orderdelete,

    editstatus,


    vieworderget,
    salesreport,
    // exportTopdf,
    filterdate


}