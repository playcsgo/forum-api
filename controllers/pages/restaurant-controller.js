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
    restaurantServices.getFeeds(req, (err, data) => err ? next(err) : res.render('feeds', { restaurants: data.restaurants, comments: data.comments }))
  },
  getTopRestaurants: (req, res, next) => {
    restaurantServices.getTopRestaurants(req, (err, data) => err ? next(err) : res.render('top-restaurants', data))
  }
}

module.exports = restaurantColler
