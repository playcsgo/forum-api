const { Restaurant, Category, Comment, User } = require('../../models')

const restaurantServices = require('../../services/restaurant-services')

const restaurantColler = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('restaurant', { restaurant: data.restaurant, isFavorited: data.isFavorited, isLiked: data.isLiked }))
  },
  getDashboard: (req, res, next) => {
    restaurantServices.getDashboard(req, (err, data) => {
      if (err) return next(err)
      res.render('dashboard', {
        restaurant: data.restaurant,
        comment: data.restaurant.Comments.length,
        favoritedUsers: data.restaurant.FavoritedUsers.length
      })
    })
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']], // DESC ASC
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', { restaurants, comments })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }],
      // raw: true,
      // nest: true, 格式會不樣. FavoritedUsers 這個會是 { } 而不是 [ ]
      limit: 10
    })
      .then(restaurants => {
        restaurants = restaurants.map(r => ({
          ...r.toJSON(),
          favoritedCount: r.FavoritedUsers.length,
          isFavorited: req.user && req.user.FavoritedRestaurants.some(f => f.id === r.id)
          // description: r.description.substring(0, 40)
        }))
        restaurants.sort((a, b) => b.favoritedCount - a.favoritedCount)
        return res.render('top-restaurants', { restaurants })
      })
      .catch(err => next(err))
  }
}

module.exports = restaurantColler
