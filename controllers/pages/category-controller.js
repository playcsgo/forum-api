const { Category } = require('../../models')
const categoryServices = require('../../services/category-services')

const categoryController = {
  getCategories: (req, res, next) => {
    categoryServices.getCategories(req, (err, data) => err ? next(err) : res.render('admin/categories', data))
  },
  postCategory: (req, res, next) => {
    categoryServices.postCategory(req, (err, data) => err ? next(err) : res.redirect('/admin/categories'))
  },
  putCategory: (req, res, next) => {
    categoryServices.putCategory(req, (err, data) => err ? next(err) : res.redirect('/admin/categories'))
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
