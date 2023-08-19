const config = require("../config/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.user;

exports.signup = async (req, res) => {
  try {
    const { username, full_name, email, role, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    const user = await User.create({
      username,
      full_name,
      email,
      role,
      password: hashedPassword
    });

    res.send({ message: "User was registered successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username,
      },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Wrong password!",
      });
    }

    const token = jwt.sign({ id: user.id }, config.auth.secret, {
      expiresIn: 86400, // 24 hours
    });

    const { id, username, email, full_name, role } = user;

    res.status(200).send({
      id,
      username,
      email,
      full_name,
      role,
      accessToken: token,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};