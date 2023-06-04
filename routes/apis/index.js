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
const upload = require('../../middleware/multer')

// admin
router.use('/admin', authenticated, authenticatedAdmin, admin)

// User
router.get('/users/top', authenticated, userController.getTopUsers)
router.get('/signup', userController.signUpPage) // 居然要放post前面  神奇
router.get('/signin', userController.signInPage)
router.get('/logout', userController.logout)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn) // 新增這行，設定 session: false
router.post('/signup', userController.signUp)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

// Favorites
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

// Restaurant
router.get('/restaurants/top', restController.getTopRestaurants)
router.get('/restaurants/feeds', restController.getFeeds)
router.get('/restaurants/:id/dashboard', restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)

// Comment
router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticated, commentController.deleteComment)

// Like
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

// admin Error Handler
router.use('/', apiErrorHandler)

module.exports = router
