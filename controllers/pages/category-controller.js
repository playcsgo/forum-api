const { Category } = require('../../models/category')
const categoryServices = require('../../services/category-services')

const categoryController = {
  getCategories: (req, res, next) => {
    categoryServices.getCategories(req, (err, data) => err ? next(err) : res.render('admin/categories', data))
  },
  postCategory: (req, res, next) => {
    return Category.create({
      name: req.body.name
    })
      .then(() => res.redirect('/admin/categories'))
      .catch(err => next(err))
  },
  putCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required')
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category doesn't exists!")
        return category.update({ name })
      })
      .then(() => res.redirect('/admin/categories'))
      .catch(err => next(err))
  },
  deletCategory: (req, res, next) => {
    return Category.destroy({ where: { id: req.params.id } })
      .then(category => {
        if (!category) throw new Error('沒這項')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  }
}

module.exports = categoryController
