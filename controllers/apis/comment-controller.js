// const { Comment, User, Restaurant } = require('../../models')
const commentService = require('../../services/comment-srvices')

const commentController = {
  postComment: (req, res, next) => {
    commentService.postComment(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = commentController
