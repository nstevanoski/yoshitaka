const jwt = require("jsonwebtoken");
const util = require("util");
const config = require("../config/config.js");
const db = require("../models");

const User = db.user;

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];

    if (!token) {
      return res.status(403).send({
        message: "No token provided!",
      });
    }

    const verifyAsync = util.promisify(jwt.verify);
    const decoded = await verifyAsync(token, config.auth.secret);

    req.userId = decoded.id;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({
        message: "Token expired!",
      });
    }

    return res.status(401).send({
      message: "Unauthorized!",
    });
  }
};

const checkUserRole = (allowedRoles) => async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(403).send({
        message: "Require role!",
      });
    }

    const user = await User.findByPk(req.userId);

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).send({
        message: "Require appropriate role!",
      });
    }

    next();
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.lenth; i++) {
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Admin Role!"
      });
      return;
    });
  });
};

isModerator = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Moderator Role!"
      });
    });
  });
};

isModeratorOrAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }

        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Moderator or Admin Role!"
      });
    });
  });
};

const authJwt = {
  verifyToken,
  isAdmin: checkUserRole(["admin"]),
  isModerator: checkUserRole(["moderator"]),
  isClient: checkUserRole(["admin", "client"]),
  isModeratorOrAdmin: checkUserRole(["moderator", "admin"])
};

module.exports = authJwt;
