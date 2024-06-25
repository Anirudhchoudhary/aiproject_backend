var express = require('express');
var router = express.Router();
var z = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/users");
const verifyToken = require('../middleware');
const SECRET_KEY = "pC5dGgrcYD5wjckJDa4yAVuBFYptWKFU";

const loginForm = z.object({
  email: z.string().email({}),
  password: z.string(),
  keeploggedin: z.boolean(({
    description: "Check this option to keep your self login"
  }))
})


const SignUpForm = z.object({
  "email": z.string().email({}),
  "password": z.string(),
  "passwordcheck": z.string(),
  "username": z.string()
})


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async function (req, res, next) {
  const userData = req.body;
  const isValidForm = SignUpForm.safeParse(userData);

  if(isValidForm.success) {

    const { email, password , passwordcheck, username } = userData;
    const isUserExist = await User.findOne({email: email}).exec();

    if (isUserExist) {
      res.status(401).json({message: "User already exists"})
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);

    const userObject = User({
      email: email,
      password: hashedPassword,
      username: username,
      isactive: true
    })

    userObject.save();

    res.status(201).json({
      "message": "Success user",
      "status": 200
    })
  } else {
    res.status(400).json(isValidForm.error);
  }
})


router.post('/login', async function(req, res, next) {
  const userData = req.body
  const isValid = loginForm.safeParse(userData)

  if(isValid.success) {

    try {
      const { email, password } = userData;

      const user = await User.findOne({ email: email }).exec();

      if (!user) {
        return res.status(401).json({ message: `User not found with email ${email}` });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ "password": "Please check password." });
      }

      const token = jwt.sign({ id: user._id, email: user.email },
                               SECRET_KEY, { expiresIn: "1h" });

      res.cookie("token", token);
      res.json({
        email: email,
        id: user.id
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(401).json(isValid.error)
  }
})

router.get("/logout", verifyToken, async function (req, res, next) {
  res.cookie("token", token);
  res.status(200).json({
    message: "success"
  })
})

router.get('/dashboard', verifyToken, async function ( req, res , next) {
  res.status(200).send({
    email: req.user['email'],
  });
})

module.exports = router;
