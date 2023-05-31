const express = require('express')
const router = express.Router()
// const { authenticated } = require('../../middleware/auth')
const restController = require('../../controllers/apis/restaurant-controller')
const admin = require('./modules/admin')
const { apiErrorHandler } = require('../../middleware/error-handler')
const passport = require('../../config/passport')
const userController = require('../../controllers/apis/user-controller')

// admin
router.use('/admin', admin)

// User
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn) // 新增這行，設定 session: false

// Restaurant
router.get('/restaurants', restController.getRestaurants)

// admin Error Handler
router.use('/', apiErrorHandler)

module.exports = router
