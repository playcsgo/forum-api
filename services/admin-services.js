const { User, Restaurant, Category } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

const adminController = {
  getRestaurants: (req, cb) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => cb(null, { restaurants }))
      .catch(err => cb(err))
  },
  postRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req
    imgurFileHandler(file)
      .then(filePath => Restaurant.create({
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || null,
        categoryId
      }))
      .then(nesRestaurant => {
        // req.flash('success_message', '建立成功') 這個只放在pages
        cb(null, { restaurant: nesRestaurant })
      })
      .catch(err => cb(err))
  },
  deleteRestaurant: (req, cb) => {
    return Restaurant.destroy({ where: { id: req.params.id } })
      .then(deletedRestaurant => cb(null, { restaurant: deletedRestaurant }))
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        cb(null, { restaurant })
      })
      .catch(err => cb(err))
  },
  editRestaurant: (req, cb) => {
    Promise.all([
      Restaurant.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error('沒這間')
        cb(null, { restaurant, categories })
      })
      .catch(err => cb(err))
  },
  putRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('沒這間')
    const { file } = req
    return Promise.all([
      Restaurant.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image,
          categoryId
        })
      })
      .then(updatedRestaurant => {
        req.flash('success_messages', 'restaurant was successfully to update')
        cb(null, { updatedRestaurant })
      })
      .catch(err => cb(err))
  },
  getUsers: (req, cb) => {
    return User.findAll({
      raw: true
    })
      .then(users => {
        cb(null, { users })
      })
      .catch(err => cb(err))
  },
  patchUser: (req, cb) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (!user) throw new Error('沒這人')
        if (user.email === 'root@example.com') {
          req.flash('error_messages', '禁止變更 root 權限')
          return cb(null, 'back')
        }
        return user.update({ isAdmin: !user.isAdmin })
      })
      .then(updatedUser => {
        req.flash('success_messages', '使用者權限變更成功')
        return cb(null, { updatedUser })
      })
      .catch(err => cb(err))
  }
}

module.exports = adminController
