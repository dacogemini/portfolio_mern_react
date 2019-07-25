const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User')

// @route GET api/users
// @desc Register user
// @access Public
router.post("/", 
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email address").isEmail(),
    check("password", "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],

  //* Async/Await
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    //* Destructure
    const { name, email, password } = req.body;

    try {
        // See if user exists
        let user = await User.findOne({ email });

        if (user) {
            res.status(400).json({ errors: [{ msg: 'User already exists!' }] });
        }
        // GET user Gravatar 
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })
        // Does not save user. have to do user.save
        user = new User({
            name,
            email,
            avatar,
            password
        });
        // Encrypt password
        const salt = await bcrypt.genSalt(10);

        // Hash password
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        
        // See if user exists

        res.send("User Registered!");
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
  }
);

module.exports = router;
