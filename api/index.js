'use strict';

const router = require('express').Router();

router.use('/locations', require('./locations.js'));
router.use('/groups', require('./groups.js'));
router.use('/users', require('./users.js'));
router.use('/terms', require('./terms.js'));
if(process.env.LOCAPOS_STAGING){
  router.use('/staging', require('./staging.js'));
}

module.exports = router;
