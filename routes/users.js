const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')

const User = require('../models/User')
const { forwardAuthenticated } = require('../config/auth');

router.get('/login', (req, res) => {
  res.render("login")
})

router.get('/register', (req, res) => {
  res.render("register")
})

router.get('/edit/:id', async (req, res) => {
  const id = req.params.id
  const user = await User.findById(id).exec()
  res.render('edit', {user: user})
})

router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body
  let errors = [];

  if(!name || !email || !password || !password2) {
    errors.push({ msg: "Preencha todos os campos!" })
  }

  if(password !== password2) {
    errors.push({ msg: "As senhas não coincidem!" })
  }

  if(password.length < 6) {
    errors.push({ msg: "A senha tem que possuir 6+ caracteres" })
  }

  if(errors.length > 0) {
    res.render('register', { 
      errors,
      name,
      email,
      password,
      password2
     })
  } else {
    User.findOne({ email:email })
      .then(user => {
        if(user) {
          errors.push({ msg: "Email já cadastrado!" })
          res.render('register', { 
            errors,
            name,
            email,
            password,
            password2
           })
        } else {
          const newUser = new User({
            name,
            email,
            password
          })
           bcrypt.genSalt(10, (err, salt) =>  
             bcrypt.hash(newUser.password, salt, (err, hash) => {
               if(err) throw err
               newUser.password = hash;
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'Usuário cadastrado com sucesso!')
                  res.redirect('/users/login')
                })
                .catch(err => console.log(err))
           }))
        }
      })
    }
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

router.post('/edit/:id', async (req, res) => {
  const {error} = (req.body)
  if(error) return console.log(error)
  const id = req.params.id
  const {name, email, password, password2, level} = req.body

  let errors = [];
  
  if(!name || !email || !password || !password2 || !level) {
    errors.push({ msg: "Preencha todos os campos!" })
  }

  if(password !== password2) {
    errors.push({ msg: "As senhas não coincidem!" })
  }

  if(password.length < 6) {
    errors.push({ msg: "A senha tem que possuir 6+ caracteres" })
  }

  const user = await User.findById(id).exec()
  if(errors.length > 0) {
   res.render('edit', { 
      errors,
      name,
      email,
      password,
      password2,
      user:user
    })
  } else {
    const salt = await bcrypt.genSaltSync(10);
    const password = await req.body.password;
    await User.findByIdAndUpdate(id, {
       name: name,
       level: level,
       password: bcrypt.hashSync(password, salt)
     }, {new:true})
          req.flash('success_msg', 'Usuário atualizado com sucesso!')
          res.redirect('/dashboard')
  }
})

router.get('/delete/:id', async (req, res) => {
  const id = req.params.id
  const user = await User.findByIdAndRemove(id)
  req.flash('success_msg', 'Usuário deletado com sucesso!')
  res.redirect('/dashboard')
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'Desconectado!')
  res.redirect('/users/login')
})  

module.exports = router