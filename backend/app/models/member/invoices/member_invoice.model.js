module.exports = (sequelize, Sequelize, DataTypes) => {
    const MemberInvoice = sequelize.define(
      "member_invoice",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        memberId: {
          allowNull: false,
          type: DataTypes.INTEGER,
        },
        paid: {
            allowNull: true,
            type: DataTypes.INTEGER,
        },
        amount: {
          allowNull: false,
          type: DataTypes.INTEGER,
        },
        paymentStatus: {
          allowNull: false,
          type: DataTypes.STRING,
          defaultValue: "unpaid",
        },
        paymentDate: {
          allowNull: true,
          type: DataTypes.DATE,
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
  
    return MemberInvoice;
  };
  