const { Restaurant, Category, User, Comment } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantColler = {
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 9
    const categoryId = Number(req.query.categoryId) || ''
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    Promise.all([
      Restaurant.findAndCountAll({
        include: Category,
        where: {
          ...categoryId ? { categoryId } : {}
        },
        limit,
        offset,
        raw: true,
        nest: true
      }),
      Category.findAll({ raw: true }) // 為了render category-Nav
    ])
      .then(([restaurants, categories]) => {
        const favoratedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : []
        const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoratedRestaurantsId.includes(r.id), // 這樣data裡面就有isFavorated這個boolean值
          isLiked: likedRestaurantsId.includes(r.id)
        }))
        return cb(null, {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.counts)
        })
      })
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
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
        cb(null, { restaurant: restaurant.toJSON(), isFavorited, isLiked })
      })
      .catch(err => cb(err))
  }
}

module.exports = restaurantColler
