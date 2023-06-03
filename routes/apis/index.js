const express = require('express')
const router = express.Router()
// const { authenticated } = require('../../middleware/auth')
const restController = require('../../controllers/apis/restaurant-controller')
const admin = require('./modules/admin')
const { apiErrorHandler } = require('../../middleware/error-handler')
const passport = require('../../config/passport')
const userController = require('../../controllers/apis/user-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')
const commentController = require('../../controllers/apis/comment-controller')

// admin
router.use('/admin', authenticated, authenticatedAdmin, admin)

// User
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn) // 新增這行，設定 session: false
router.post('/signup', userController.signUp)

// Restaurant
router.get('/restaurants', authenticated, restController.getRestaurants)

// Comment
router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticated, commentController.deleteComment)

// admin Error Handler
router.use('/', apiErrorHandler)

module.exports = router
