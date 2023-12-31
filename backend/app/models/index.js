const config = require("../config/config.js");
const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize(
  config.db.DB_NAME,
  config.db.DB_USER,
  config.db.DB_PASS,
  {
    host: config.db.DB_HOST,
    dialect: config.db.dialect,
    operatorsAliases: false,

    poll: {
      max: config.db.pool.max,
      min: config.db.pool.min,
      acquire: config.db.pool.acquire,
      idle: config.db.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.Op = Op;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize, DataTypes);
db.role = require("./role.model.js")(sequelize, Sequelize, DataTypes);

db.expense = require("./expenses/expense.model.js")(sequelize, Sequelize, DataTypes);

db.member = require("./member/member.model.js")(sequelize, Sequelize, DataTypes);
db.memberInvoice = require("./member/invoices/member_invoice.model.js")(sequelize, Sequelize, DataTypes);
db.invoiceService = require("./member/invoices/iServices/invoice_service.model.js")(sequelize, Sequelize, DataTypes);

db.member.hasMany(db.memberInvoice, { as: "invoices" });
db.memberInvoice.belongsTo(db.member);

db.memberInvoice.hasMany(db.invoiceService, { as: "services" });
db.invoiceService.belongsTo(db.memberInvoice);

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "role_id",
  otherKey: "user_id"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "user_id",
  otherKey: "role_id"
});

db.ROLES = ["user", "admin", "moderator", "client"];

module.exports = db;
