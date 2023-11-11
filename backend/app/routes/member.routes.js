const { authJwt } = require("../middlewares");

module.exports = app => {
    const controller = require("../controllers/member.controller");
  
    const router = require("express").Router();
  
    // Create a new Member
    router.post("/", controller.create);

    // Retrieve all Members
    router.get("/", controller.getAll);

    // Retrieve all Members with unpaid invoices
    router.get("/unpaid", controller.unpaidInvoicesReport);
  
    // Retrieve a single Member with id
    router.get("/:id", controller.findOne); 
  
    // Update a Member with id
    router.put("/:id", controller.update);

    // Send email to member
    router.post("/send-email", controller.sendEmail);
  
    // Delete a Member with id
    router.delete("/:id", controller.delete); 
  
    app.use("/api/members", [authJwt.verifyToken], router);
  };
  