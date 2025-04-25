// seeders/demo-seed.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      // Insert Branches
     
  
      
  
      // Insert Employees
      await queryInterface.bulkInsert('employees', [
        
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane22.smith@example.com',
          employeeId: 'EMP003',
          department: 'HR',
          position: 'HR Manager',
          hireDate: new Date('2023-02-01'),
          isActive: true,
          phoneNumber: '9876543210',
          address: '456 Elm St, Townsville',
          branchId: 1, // Now, branchId 1 exists
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
  
      // Insert Assets
      await queryInterface.bulkInsert('assets', [
        {
          name: 'Laptop',
          description: 'Dell Inspiron 15',
          serialNumber: 'SN123456',
          assetTag: 'AT001',
          purchaseDate: new Date('2022-05-15'),
          purchasePrice: 800,
          currentValue: 700,
          manufacturer: 'Dell',
          model: 'Inspiron 15',
          warranty: '1 year warranty',
          warrantyExpiration: new Date('2023-05-15'),
          categoryId: 1,  // Make sure the categoryId corresponds to an existing record
          branchId: 1, // Assumed branchId is 1
          currentEmployeeId: 1, // John Doe
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
  
      // Insert Asset Transactions
      await queryInterface.bulkInsert('asset_transactions', [
        {
          date: new Date(),
          notes: 'Assigned to employee John Doe',
          assetId: 1,  // Corresponds to the laptop asset
          employeeId: 1, // John Doe
          transactionTypeId: 1, // Ensure transaction type exists
          branchId: 1, // Assumed branchId is 1
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
  
      // Insert Transaction Types
      await queryInterface.bulkInsert('transaction_types', [
        {
          name: 'Assignment',
          description: 'Asset assigned to an employee',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Return',
          description: 'Asset returned by an employee',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
    },
  
    down: async (queryInterface, Sequelize) => {
      // Delete seed data if necessary
      await queryInterface.bulkDelete('asset_transactions', null, {});
      await queryInterface.bulkDelete('assets', null, {});
      await queryInterface.bulkDelete('employees', null, {});
      await queryInterface.bulkDelete('transaction_types', null, {});
      await queryInterface.bulkDelete('branches', null, {});
    }
  };
  