module.exports = {
  authenticated: function(req, res, next) {
    if(req.isAuthenticated()){
      return next()
    }
    req.flash('error_msg', 'Por favor, faço login primeiro!')
    res.redirect('/users/login')
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');      
  }
}