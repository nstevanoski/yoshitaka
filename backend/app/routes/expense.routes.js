const { authJwt } = require("../middlewares");

module.exports = app => {
  const controller = require("../controllers/expenses.controller");

  const router = require("express").Router();

  router.post("/", controller.create);
  router.get("/", controller.getAll);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.delete);

  app.use("/api/expenses", [authJwt.verifyToken], router);
};
