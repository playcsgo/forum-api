const jwt = require('jsonwebtoken')
require('dotenv').config()
const userServices = require('../../services/user-services')

const userController = {
  signUpPage: (req, res, next) => {
    userServices.signUpPage(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  signInPage: (req, res, next) => {
    userServices.signInPage(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password
      // JWT (A, B, C)
      // A: payload, 要打包的資訊; B: 密鑰, 使用.env來寫; C: 設定, 這邊設定有效天數
      // process.env.JWT_SECRET
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  logout: (req, res, next) => {
    userServices.logout(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  editUser: (req, res, next) => {
    userServices.editUser(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}
module.exports = userController
