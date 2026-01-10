const express = require('express');
const router = express.Router();
const { createUser, getUser, updateLifestyleData } = require('../controllers/userController');

router.post('/create', createUser);
router.get('/:userId', getUser);
router.put('/:userId/lifestyle', updateLifestyleData);

module.exports = router;
