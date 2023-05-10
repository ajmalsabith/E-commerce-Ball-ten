const express=require('express')
const admin_router=express()
const adminController=require('../Controllers/adminController')
const authadmin=require('../middilware/adminauth')
const path = require('path')
const multer=require('multer')

admin_router.set('view engine','ejs');
admin_router.set('views','./views/admin')

const bodyparser=require('body-parser')
const { original } = require('parseurl')
admin_router.use(bodyparser.json())
admin_router.use(bodyparser.urlencoded({extended:true}))
 
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/users/imgs'))
    },
    filename:function(req,file,cb){
        const name  = file.originalname
        cb(null,name)
    }
})
const upload = multer({storage:storage})



admin_router.get('/login',authadmin.is_logout,adminController.getlogin)
admin_router.get('/',authadmin.is_logout,adminController.getlogin)
admin_router.post('/login',adminController.verifylogin)
admin_router.post('/',adminController.verifylogin)
admin_router.get('/home',authadmin.is_login,adminController.gethome)
admin_router.get('/userManage',authadmin.is_login,adminController.userlist)
admin_router.get('/block',adminController.findidblock)
admin_router.get('/logoutadmin',adminController.adminlogout)
admin_router.get('/addCategory',authadmin.is_login,adminController.addCategoryget)
admin_router.post('/addCategory',adminController.insertCategory)
admin_router.get('/Category',authadmin.is_login,adminController.Categoryget)
admin_router.get('/editcategory',authadmin.is_login,adminController.editecategoryget)
admin_router.post('/editcategory',adminController.editecategory)
admin_router.get('/product',authadmin.is_login,adminController.getproduct)
admin_router.post('/addproduct',upload.array('image',4),adminController.insertproduct)
admin_router.get('/addproduct',authadmin.is_login,adminController.getaddproduct)
admin_router.get('/productedit',authadmin.is_login,adminController.geteditproduct)
admin_router.post('/productedit',upload.array('image',4),adminController.editeproduct)
admin_router.get('/productdelete',adminController.deletproduct)
admin_router.get('/deleteimage',adminController.deleteimage)
admin_router.get('/addcoupon',authadmin.is_login,adminController.getaddcoupon)
admin_router.post('/addcoupon',adminController.insertcoupon)
admin_router.get('/coupon',authadmin.is_login,adminController.getcoupons)
admin_router.get('/editcoupon',authadmin.is_login,adminController.geteditcoupon)
admin_router.post('/editcoupon',adminController.editcoupon)
admin_router.get('/deleteco',adminController.deletecoupon)
admin_router.get('/orderadmin',authadmin.is_login,adminController.ordermanageget)
admin_router.get('/orderdelete',adminController.orderdelete)

admin_router.post('/vieworder',adminController.editstatus)

admin_router.get('/vieworder',authadmin.is_login,adminController.vieworderget)

admin_router.get('/salesreport',authadmin.is_login,adminController.salesreport)

// admin_router.get('/download',adminController.exportTopdf)
admin_router.post('/salesreport',adminController.filterdate)


module.exports = admin_router;