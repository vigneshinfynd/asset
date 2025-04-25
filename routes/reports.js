const express = require('express');
const router = express.Router();
const { Asset, Employee, AssetCategory, Branch, AssetStatus, AssetTransaction, TransactionType } = require('../models');
const { Op, Sequelize } = require('sequelize');

// Reports Dashboard
router.get('/', (req, res) => {
  res.render('reports/index', { 
    title: 'Reports'
  });
});

// Assets by Category Report
router.get('/assets-by-category', async (req, res) => {
  try {
    const results = await AssetCategory.findAll({
      include: [{
        model: Asset,
        as: 'assets',
        include: [
          { model: AssetStatus, as: 'status' },
          { model: Branch, as: 'branch' }
        ]
      }],
      order: [['name', 'ASC']]
    });

    const categories = [];
    let totalCount = 0;
    let totalValue = 0;

    for (const category of results) {
      const assets = category.assets || [];
      const count = assets.length;
      const value = assets.reduce((sum, asset) => sum + parseFloat(asset.currentValue || 0), 0);

      categories.push({
        name: category.name,
        count,
        value,
      });

      totalCount += count;
      totalValue += value;
    }

    res.render('reports/assets-by-category', { 
      title: 'Assets by Category Report',
      categories,
      totalCount,
      totalValue,
      messages: req.flash() // Ensure flash messages are passed
    });
  } catch (error) {
    console.error('Error generating assets by category report:', error);
    req.flash('error', 'An error occurred while generating the report');
    res.redirect('/reports');
  }
});

// Assets by Status Report
router.get('/assets-by-status', async (req, res) => {
  try {
    const results = await AssetStatus.findAll({
      include: [{
        model: Asset,
        as: 'assets',
        include: [
          { model: AssetCategory, as: 'category' },
          { model: Branch, as: 'branch' },
          { model: Employee, as: 'currentEmployee' }
        ]
      }],
      order: [['name', 'ASC']]
    });
    
    // Process data for the report
    const statuses = [];
    let totalCount = 0;
    let totalValue = 0;
    
    for (const status of results) {
      const assets = status.assets || [];
      const count = assets.length;
      const value = assets.reduce((sum, asset) => sum + parseFloat(asset.currentValue || 0), 0);
      
      statuses.push({
        name: status.name,
        count,
        value,
        assets
      });
      
      totalCount += count;
      totalValue += value;
    }
    
    res.render('reports/assets-by-status', { 
      title: 'Assets by Status Report',
      statuses,
      totalCount,
      totalValue
    });
  } catch (error) {
    console.error('Error generating assets by status report:', error);
    req.flash('error', 'An error occurred while generating the report');
    res.redirect('/reports');
  }
});

// Employee Assets Report
router.get('/employee-assets', async (req, res) => {
  try {
    const employees = await Employee.findAll({
      where: { isActive: true },
      include: [{
        model: Asset,
        as: 'assets',
        where: { currentEmployeeId: { [Op.ne]: null } },
        required: false,
        include: [
          { model: AssetCategory, as: 'category' }
        ]
      }],
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });
    
    // Process data for the report
    const employeeData = [];
    let totalCount = 0;
    let totalValue = 0;
    
    for (const employee of employees) {
      const assets = employee.assets || [];
      const count = assets.length;
      const value = assets.reduce((sum, asset) => sum + parseFloat(asset.currentValue || 0), 0);
      
      if (count > 0) {
        employeeData.push({
          name: employee.fullName,
          employeeId: employee.employeeId,
          department: employee.department,
          count,
          value,
          assets
        });
        
        totalCount += count;
        totalValue += value;
      }
    }
    
    res.render('reports/employee-assets', { 
      title: 'Employee Assets Report',
      employees: employeeData,
      totalCount,
      totalValue
    });
  } catch (error) {
    console.error('Error generating employee assets report:', error);
    req.flash('error', 'An error occurred while generating the report');
    res.redirect('/reports');
  }
});

// Transactions Report
router.get('/transactions', async (req, res) => {
  try {
    // Get start and end dates from query parameters, default to current month
    const today = new Date();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : 
      new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : 
      new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);
    
    const transactions = await AssetTransaction.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        { model: Asset, as: 'asset', include: [{ model: AssetCategory, as: 'category' }] },
        { model: Employee, as: 'employee' },
        { model: TransactionType, as: 'transactionType' },
        { model: Branch, as: 'branch' }
      ],
      order: [['date', 'DESC']]
    });
    
    // Get transaction types for filtering
    const transactionTypes = await TransactionType.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('reports/transactions', { 
      title: 'Transactions Report',
      transactions,
      transactionTypes,
      startDate,
      endDate
    });
  } catch (error) {
    console.error('Error generating transactions report:', error);
    req.flash('error', 'An error occurred while generating the report');
    res.redirect('/reports');
  }
});

module.exports = router;