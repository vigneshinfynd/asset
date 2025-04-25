module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define(
    'Asset',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      serialNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      assetTag: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      purchaseDate: {
        type: DataTypes.DATE,
      },
      purchasePrice: {
        type: DataTypes.DECIMAL(10, 2),
      },
      currentValue: {
        type: DataTypes.DECIMAL(10, 2),
      },
      manufacturer: {
        type: DataTypes.STRING,
      },
      model: {
        type: DataTypes.STRING,
      },
      warranty: {
        type: DataTypes.TEXT,
      },
      warrantyExpiration: {
        type: DataTypes.DATE,
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'assets',
      timestamps: true,
    }
  );

  Asset.associate = (models) => {
    Asset.belongsTo(models.AssetCategory, {
      foreignKey: 'categoryId',
      as: 'category',
    });

    Asset.belongsTo(models.AssetStatus, {
      foreignKey: 'statusId',
      as: 'status',
    });

    Asset.belongsTo(models.Branch, {
      foreignKey: 'branchId',
      as: 'branch',
    });

    Asset.belongsTo(models.Employee, {
      foreignKey: 'currentEmployeeId',
      as: 'currentEmployee',
    });

    Asset.hasMany(models.AssetTransaction, {
      foreignKey: 'assetId',
      as: 'transactions',
    });
  };

  return Asset;
};
