const { authJwt } = require("../middlewares");

module.exports = app => {
    const controller = require("../controllers/invoices.controller");
  
    const router = require("express").Router();
  
    router.post("/", controller.create);

    router.get("/:member_id", controller.getAll);
  
    router.get("/preview/:id", controller.findOne); 
  
    router.put("/preview/:id", controller.update);
  
    router.delete("/preview/:id", controller.delete); 

    // Service routes
    router.post("/:invoice_id/services", controller.createService); 
    router.put("/:invoice_id/services", controller.updateService); 
  
    app.use("/api/members/invoices", [authJwt.verifyToken], router);
  };
  