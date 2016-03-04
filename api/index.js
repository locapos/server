'use strict';

const router = require('express').Router();

router.use('/locations', require('./locations.js'));
router.use('/groups', require('./groups.js'));
router.use('/users', require('./users.js'));

module.exports = router;
