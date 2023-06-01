const { Category } = require('../models')

const categoryServices = {
  getCategories: (req, cb) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
    ])
      .then(([categories, category]) => {
        cb(null, { categories, category })
      })
      .catch(err => cb(err))
  },
  postCategory: (req, cb) => {
    return Category.create({
      name: req.body.name
    })
      .then(createdCategory => cb(null, { createdCategory }))
      .catch(err => cb(err))
  }
}

module.exports = categoryServices
