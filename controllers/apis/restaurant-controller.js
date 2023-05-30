const restaurantServices = require('../../services/restaurant-services')

const restaurantColler = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = restaurantColler
