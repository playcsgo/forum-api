const express = require('express')
const router = express.Router()
const upload = require('../../../middleware/multer')
const adminController = require('../../../controllers/apis/admin-controller')
const categoryController = require('../../../controllers/apis/category-controller')

// Restaurant

router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant)

// API Users
router.patch('/users/:id', adminController.patchUser)
router.get('/users', adminController.getUsers)

// API Categories
router.get('/categories/:id', categoryController.getCategories)
router.get('/categories', categoryController.getCategories)
router.post('/categories', categoryController.postCategory)
router.put('/categories/:id', categoryController.putCategory)

module.exports = router
