const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function ensureAuthenticated(req, res, next) {
  const token = req.session.token;

  console.log('Token from session:', token);
  console.log('Original URL before checking token:', req.originalUrl);

  if (!token) {
    if (req.originalUrl !== '/auth/login' && req.originalUrl !== '/auth/register' && !req.session.returnTo) {
      req.session.returnTo = req.originalUrl;
      console.log('Saving original URL:', req.session.returnTo);  
    }
    console.log('No token found in session. Redirecting to login...');
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, 'secret_key');
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.redirect('/auth/login'); 
    }

    req.user = user; 
    console.log('Token verified and user info decoded:', decoded);

    if (req.session.cart) {
      console.log('Cart from session:', req.session.cart);
    }

    next();
  } catch (error) {
    console.log('Invalid token. Redirecting to login...');
    return res.redirect('/auth/login');
  }
}

module.exports = ensureAuthenticated;