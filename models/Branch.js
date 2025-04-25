module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define('Branch', {
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
    location: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.TEXT
    },
    contactPerson: {
      type: DataTypes.STRING
    },
    contactEmail: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    contactPhone: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'branches',
    timestamps: true
  });

  Branch.associate = (models) => {
    Branch.hasMany(models.Employee, {
      foreignKey: 'branchId',
      as: 'employees'
    });
    
    Branch.hasMany(models.Asset, {
      foreignKey: 'branchId',
      as: 'assets'
    });
    
    Branch.hasMany(models.AssetTransaction, {
      foreignKey: 'branchId',
      as: 'transactions'
    });
  };

  return Branch;
};