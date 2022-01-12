const Router = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/AuthController');
const authMiddleware = require('../middlwares/authMiddleware');

const router = new Router();

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 3, max: 32 }),
  authController.registration
);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/activate/:link', authController.activate);
router.get('/refresh', authController.refresh);
router.get('/users', authMiddleware, authController.getUsers);

module.exports = router;
