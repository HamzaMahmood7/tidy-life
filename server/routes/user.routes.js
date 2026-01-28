const router = require('express').Router()

const UserModel = require('../models/User.Model')
const { isAuthenticated } = require('../middlewares/jwt.middleware');

// route to get all users
router.get('/all-users', isAuthenticated, async(req, res) => {
    try {
        const users = await UserModel.find({}, "_id username");
        console.log('got the users', users)
        res.status(200).json(users)
    } catch (error) {
        console.error("Failed to get all users:", error);
    res.status(500).json({ errorMessage: "Failed to get all users" });
    }
})

// route to search for users in the DB
router.get('/search', isAuthenticated, async(req, res) => {
  try {
    const users = await UserModel.find({
        username: {$regex: req.query.username, $options: "i"},
        _id : { $ne: req.payload._id}
    }).select("username _id");
    console.log('searched users', users)
    res.status(200).json(users)
  } catch (error) {
    console.log(error);
      res.status(500).json({ errorMessage: "Could not find users" });
  }
})

module.exports = router