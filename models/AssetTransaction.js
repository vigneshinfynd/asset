module.exports = (sequelize, DataTypes) => {
  const AssetTransaction = sequelize.define('AssetTransaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT
    },
    returnReason: {
      type: DataTypes.STRING
    },
    scrapReason: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'asset_transactions',
    timestamps: true
  });

  AssetTransaction.associate = (models) => {
    AssetTransaction.belongsTo(models.Asset, {
      foreignKey: 'assetId',
      as: 'asset'
    });
    
    AssetTransaction.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
    
    AssetTransaction.belongsTo(models.TransactionType, {
      foreignKey: 'transactionTypeId',
      as: 'transactionType'
    });
    
    AssetTransaction.belongsTo(models.Branch, {
      foreignKey: 'branchId',
      as: 'branch'
    });
  };

  return AssetTransaction;
};