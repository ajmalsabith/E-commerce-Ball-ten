const mongoose= require('mongoose')

const dotenv= require('dotenv').config()
mongoose.connect(process.env.mongodbcode)

const express=require('express')
const app=express()
app.use(express.static('public/users'))
app.use(express.static('public/admin'))


app.use((req, res, next) => {
    res.header(
      "Cache-Control",
      "no-cache,  no-store, must-revalidate"
    );
    next();
})

const userRoute=require('./Routes/userRoutes')
app.use('/',userRoute)


const adminRoute=require('./Routes/adminRoutes')
app.use('/admin',adminRoute)


app.listen(3000)