const { Restaurant, Category, Comment, User } = require('../../models')

const restaurantServices = require('../../services/restaurant-services')

const restaurantColler = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        { model: Category, required: true },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        {
          model: Comment,
          include: [
            { model: User, required: true }
          ],
          order: [['created_at', 'DESC']],
          required: false,
          separate: true
        }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('沒這間 from getRestaurant')
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUsers.some(l => l.id === req.user.id)
        restaurant.increment('viewCounts')
        res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Promise.all([
      Restaurant.findByPk(req.params.id, {
        include: Category,
        nest: true,
        raw: true
      }),
      Comment.findAndCountAll({
        where: { restaurantId: req.params.id }
      })
    ])
      .then(([restaurant, comments]) => {
        if (!restaurant) throw new Error('沒這間')
        return res.render('dashboard', { restaurant, comments })
      })
      .catch(err => next(err))
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
