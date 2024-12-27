const express = require('express');
const router = express.Router();
const siteController = require('../controllers/SiteController');
const ensureAuthenticated = require('../middleware/auth');

router.post('/profile', ensureAuthenticated, siteController.editProfile);
router.get('/profile', ensureAuthenticated, siteController.profile);
router.use('/about', siteController.about);
router.use('/', siteController.index);

module.exports = router;