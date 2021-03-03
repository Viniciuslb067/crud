const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const {authenticated} = require('../config/auth')

const User = require('../models/User')

const admin = require('../config/admin')

router.get('/', (req, res) => {
  res.render("index")
})

router.get('/dashboard',authenticated, async (req, res) => {
  const docs = await User.find()
  res.render("dashboard", {
    name: req.user.name, email: req.user.email, docs, admin 
  })
}) 

module.exports = router 