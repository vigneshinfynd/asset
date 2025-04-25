const { sequelize } = require('../models');
const { Employee, Asset, AssetCategory, Branch, AssetStatus, AssetTransaction, TransactionType } = require('../models');

async function initDatabase() {
  try {
    // Force sync all models (CAUTION: This will drop all tables)
    await sequelize.sync({ force: true });
    console.log('Database synchronized!');

    // Create default branches
    const branches = await Branch.bulkCreate([
      { name: 'Headquarters', location: 'New York' },
      { name: 'West Branch', location: 'San Francisco' },
      { name: 'East Branch', location: 'Boston' }
    ]);

    // Create default asset categories
    const categories = await AssetCategory.bulkCreate([
      { name: 'Laptop', description: 'Portable computers' },
      { name: 'Mobile Phone', description: 'Smartphones and mobile devices' },
      { name: 'Monitor', description: 'Computer displays' },
      { name: 'Tablet', description: 'Tablet devices' },
      { name: 'Tools', description: 'Physical tools for work' }
    ]);

    // Create default asset statuses
    await AssetStatus.bulkCreate([
      { name: 'Available', description: 'Asset is available for issuance' },
      { name: 'Assigned', description: 'Asset is assigned to an employee' },
      { name: 'Under Repair', description: 'Asset is being repaired' },
      { name: 'Scrapped', description: 'Asset is obsolete and scrapped' }
    ]);

    // Create transaction types
    await TransactionType.bulkCreate([
      { name: 'Purchase', description: 'Asset was purchased' },
      { name: 'Issue', description: 'Asset was issued to an employee' },
      { name: 'Return', description: 'Asset was returned by an employee' },
      { name: 'Repair', description: 'Asset was sent for repair' },
      { name: 'Scrap', description: 'Asset was scrapped' }
    ]);

    // Create sample employees
    const employees = await Employee.bulkCreate([
      { 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john.doe@example.com', 
        employeeId: 'EMP001', 
        department: 'IT', 
        position: 'Developer',
        branchId: branches[0].id,
        isActive: true
      },
      { 
        firstName: 'Jane', 
        lastName: 'Smith', 
        email: 'jane.smith@example.com', 
        employeeId: 'EMP002', 
        department: 'Marketing', 
        position: 'Manager',
        branchId: branches[1].id,
        isActive: true
      },
      { 
        firstName: 'Robert', 
        lastName: 'Johnson', 
        email: 'robert.johnson@example.com', 
        employeeId: 'EMP003', 
        department: 'Finance', 
        position: 'Accountant',
        branchId: branches[2].id,
        isActive: true
      }
    ]);

    // Create sample assets
    const assets = await Asset.bulkCreate([
      {
        name: 'MacBook Pro 16"',
        description: 'Apple MacBook Pro 16-inch',
        serialNumber: 'MBP2023001',
        assetTag: 'AST001',
        purchaseDate: new Date(2023, 0, 15),
        purchasePrice: 2499.99,
        categoryId: categories[0].id,
        statusId: 1,
        branchId: branches[0].id,
        currentValue: 2000.00,
        manufacturer: 'Apple',
        model: 'MacBook Pro 16" 2023'
      },
      {
        name: 'iPhone 14 Pro',
        description: 'Apple iPhone 14 Pro',
        serialNumber: 'IPH2023001',
        assetTag: 'AST002',
        purchaseDate: new Date(2023, 1, 20),
        purchasePrice: 999.99,
        categoryId: categories[1].id,
        statusId: 1,
        branchId: branches[0].id,
        currentValue: 850.00,
        manufacturer: 'Apple',
        model: 'iPhone 14 Pro'
      },
      {
        name: 'Dell XPS 15',
        description: 'Dell XPS 15 Laptop',
        serialNumber: 'DXP2023001',
        assetTag: 'AST003',
        purchaseDate: new Date(2023, 2, 10),
        purchasePrice: 1899.99,
        categoryId: categories[0].id,
        statusId: 1,
        branchId: branches[1].id,
        currentValue: 1600.00,
        manufacturer: 'Dell',
        model: 'XPS 15 9570'
      }
    ]);

    // Create sample transactions
    await AssetTransaction.bulkCreate([
      {
        assetId: assets[0].id,
        transactionTypeId: 1, // Purchase
        date: new Date(2023, 0, 15),
        notes: 'Initial purchase',
        branchId: branches[0].id
      },
      {
        assetId: assets[1].id,
        transactionTypeId: 1, // Purchase
        date: new Date(2023, 1, 20),
        notes: 'Initial purchase',
        branchId: branches[0].id
      },
      {
        assetId: assets[2].id,
        transactionTypeId: 1, // Purchase
        date: new Date(2023, 2, 10),
        notes: 'Initial purchase',
        branchId: branches[1].id
      }
    ]);

    console.log('Sample data created successfully!');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    process.exit();
  }
}

initDatabase();