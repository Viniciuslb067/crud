const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

mongoose.set('useFindAndModify', false);

const app = express();

require('./config/passport')(passport)

//DB
const db = require('./config/connection').MongoURI

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexão bem sucedida!'))
  .catch(err => console.log(err))

//EJS
app.use(expressLayouts)
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }))

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})

//Rotas
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

const PORT = process.env.PORT || 3000

app.listen(PORT, console.log("Servidor rodando!"))