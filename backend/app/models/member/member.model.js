module.exports = (sequelize, Sequelize, DataTypes) => {
    const Member = sequelize.define(
      "member", // Model name
      {
        // Model attributes
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        first_name: {
          allowNull: false,
          type: DataTypes.STRING
        },
        last_name: {
          allowNull: false,
          type: DataTypes.STRING
        },
        email: {
          allowNull: false,
          type: DataTypes.STRING
        },
        has_paid: {
          allowNull: false,
          type: DataTypes.INTEGER
        },
        left_to_be_paid: {
          allowNull: false,
          type: DataTypes.INTEGER
        },
        total_sum: {
          allowNull: false,
          type: DataTypes.INTEGER
        },
        belt_color: {
          allowNull: false,
          type: DataTypes.STRING
        },
        created_at: {
          allowNull: false,
          type: DataTypes.DATE
        },
        updated_at: {
          allowNull: false,
          type: DataTypes.DATE
        }
      },
      {
        // Options
        timestamps: true,
        underscrored: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
      }
    );
  
    return Member;
  };
  