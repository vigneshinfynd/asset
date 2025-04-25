module.exports = (sequelize, DataTypes) => {
  const AssetCategory = sequelize.define('AssetCategory', {
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
    tableName: 'asset_categories',
    timestamps: true
  });

  AssetCategory.associate = (models) => {
    AssetCategory.hasMany(models.Asset, {
      foreignKey: 'categoryId',
      as: 'assets'
    });
  };

  return AssetCategory;
};