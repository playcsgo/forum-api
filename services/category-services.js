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
  },
  putCategory: (req, cb) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required')
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category doesn't exists!")
        return category.update({ name })
      })
      .then(updatedCategory => cb(null, { updatedCategory }))
      .catch(err => cb(err))
  },
  deletCategory: (req, cb) => {
    return Category.findByPk(req.params.id)
      .then(deletedCategory => {
        if (!deletedCategory) throw new Error('沒這項')
        deletedCategory.destroy()
        cb(null, { deletedCategory })
      })
      .catch(err => cb(err))
  }
}

module.exports = categoryServices
