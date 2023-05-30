const express = require('express')
const router = express.Router()
// const { authenticated } = require('../../middleware/auth')
const restController = require('../../controllers/apis/restaurant-controller')
const admin = require('./modules/admin')

router.use('/admin', admin)

router.get('/restaurants', restController.getRestaurants)

module.exports = router
