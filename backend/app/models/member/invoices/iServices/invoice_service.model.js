module.exports = (sequelize, Sequelize, DataTypes) => {
    const InoviceService = sequelize.define(
      "invoice_service",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        memberInvoiceId: {
          allowNull: false,
          type: DataTypes.INTEGER,
        },
        service_name: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        has_paid: {
            allowNull: true,
            type: DataTypes.INTEGER,
        },
        left_to_be_paid: {
            allowNull: true,
            type: DataTypes.INTEGER,
        },
        amount: {
            allowNull: true,
            type: DataTypes.INTEGER,
        },
        created_at: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updated_at: {
          allowNull: false,
          type: DataTypes.DATE,
        },
      },
      {
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  
    return InoviceService;
  };
  