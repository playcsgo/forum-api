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
    return Comment.findByPk(req.params.id)
      .then(comment => {
        if (!comment) throw new Error('不用刪了')
        return comment.destroy()
      })
      .then(deletedComment => res.redirect(`/restaurants/${deletedComment.restaurantId}`))
      .catch(err => next(err))
  }
}

module.exports = commentController
