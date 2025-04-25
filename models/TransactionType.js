module.exports = (sequelize, DataTypes) => {
  const TransactionType = sequelize.define('TransactionType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'transaction_types',
    timestamps: true
  });

  TransactionType.associate = (models) => {
    TransactionType.hasMany(models.AssetTransaction, {
      foreignKey: 'transactionTypeId',
      as: 'transactions'
    });
  };

  return TransactionType;
};