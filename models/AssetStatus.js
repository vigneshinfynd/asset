module.exports = (sequelize, DataTypes) => {
  const AssetStatus = sequelize.define('AssetStatus', {
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
    tableName: 'asset_statuses',
    timestamps: true
  });

  AssetStatus.associate = (models) => {
    AssetStatus.hasMany(models.Asset, {
      foreignKey: 'statusId',
      as: 'assets'
    });
  };

  return AssetStatus;
};