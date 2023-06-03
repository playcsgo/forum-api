const { Comment } = require('../../models')
const commentService = require('../../services/comment-srvices')

const commentController = {
  postComment: (req, res, next) => {
    commentService.postComment(req, (err, data) => {
      if (err) return next(err)
      res.redirect(`/restaurants/${data.createdcomment.restaurantId}`)
    })
  },
  deleteComment: (req, res, next) => {
    commentService.deleteComment(req, (err, data) => err ? next(err) : res.redirect(`/restaurants/${data.restaurantId}`))
  }
}

module.exports = commentController
