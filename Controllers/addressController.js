const mongoose = require('mongoose')
const cart = require('../models/CartModel')
const Users = require('../models/userModel')
const product = require('../models/product Model')
const address = require('../models/addressModel')
const { log } = require('npmlog')
const session = require('express-session')


const getaddadress = async (req, res) => {

    try {

        res.render('addaddress')

    } catch (error) {
        console.log(error.message);
    }
}

const insertaddress = async (req, res) => {

    const user = req.session.user_id
    const userdata = await Users.findOne({ _id: user })
    const addressdata = await address.findOne({ userId: user })

    if (addressdata) {

        await address.updateOne({ userId: user }, {
            $push: {

                address: {
                    country: req.body.country,
                    fname: req.body.fname,
                    lname: req.body.lname,
                    address: req.body.address,
                    place: req.body.place,
                    state: req.body.state,
                    pincode: req.body.pincode,
                    email: req.body.email,
                    phone: req.body.phone,

                }
            }
        })
        res.redirect('/checkout')


    } else {

        if (user) {
            const addressnew = new address({

                userId: user,
                user: userdata.name,
                address: [{
                    country: req.body.country,
                    fname: req.body.fname,
                    lname: req.body.lname,
                    address: req.body.address,
                    place: req.body.place,
                    state: req.body.state,
                    pincode: req.body.pincode,
                    email: req.body.email,
                    phone: req.body.phone,

                }]
            })
            const data = await addressnew.save()
            if (data) {
                res.redirect('/checkout')
            } else {
                res.render('addaddress')
            }

        } else {

            res.redirect('/login')
        }
    }
}


const deleteaddresscheck = async (req, res) => {

    try {

        const id = req.query.id
        const user = req.session.user_id
        console.log(user);
        const data = await address.updateOne({ userId: user }, { $pull: { address: { _id: id } } })
        console.log(data);
        if (data) {
            res.redirect('/checkout')

        }

    } catch (error) {
        console.log(error.message);
    }
}


const deleteaddress = async (req, res) => {

    try {

        const id = req.query.id
        const user = req.session.user_id
        const data = await address.updateOne({ userId: user }, { $pull: { address: { _id: id } } })

        if (data) {
            res.redirect('/profile')
        }

    } catch (error) {
        console.log(error.message);
    }
}
const editaddget = async (req, res) => {
    try {

        const id = req.query.id
        const index = req.query.index

        console.log(id);
        const user = req.session.user_id
        const data = await address.findOne({ userId: user })
        console.log(data.address[index]);

        if (data) {
            res.render('editaddress', { data: data.address[index] })
        }

    } catch (error) {
        console.log(error.message);
    }
}


const editaddress = async (req, res) => {

    try {

        const index = req.query.index
        console.log(index);
        const data = await address.updateOne({ userId: req.session.user_id }, {
            $set: {
                [`address.${index}`]: {
                    fname: req.body.fname,
                    lname: req.body.lname,
                    country: req.body.country,
                    state: req.body.state,
                    address: req.body.address,
                    email: req.body.email,
                    pincode: req.body.pincode,
                    phone: req.body.phone,
                    place: req.body.place,
                    state: req.body.state

                }
            }
        })

        if (data) {
            res.redirect('/checkout')
        }

    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
   
    getaddadress,
    insertaddress,
    deleteaddress, 
    deleteaddresscheck,
    editaddress,
    editaddget,

}
