const express = require('express');
const router = express.Router();
const {
  Asset,
  Employee,
  AssetCategory,
  Branch,
  AssetTransaction,
  AssetStatus,
  TransactionType,
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

// Dashboard route
router.get('/', async (req, res) => {
  try {
    // Fetch asset counts grouped by status
    const assetCounts = await Asset.findAll({
      attributes: [
        'statusId',
        [sequelize.fn('COUNT', sequelize.col('Asset.id')), 'count'], // Specify table alias for "id"
      ],
      include: [
        { model: AssetStatus, as: 'status', attributes: ['name'] },
      ],
      group: ['Asset.statusId', 'status.id'], // Include table aliases in group by clause
      raw: true,
      nest: true,
    });
    

    // Fetch asset counts grouped by category
    const categoryCounts = await Asset.findAll({
      attributes: ['categoryId', [sequelize.fn('COUNT', sequelize.col('Asset.id')), 'count']], // Explicit table alias
      include: [
        { model: AssetCategory, as: 'category', attributes: ['name'] },
      ],
      group: ['Asset.categoryId', 'category.id'], // Explicit table aliases
      raw: true,
      nest: true,
    });
    

    // Fetch the most recent asset transactions
    const recentTransactions = await AssetTransaction.findAll({
      limit: 5,
      order: [['date', 'DESC']],
      include: [
        { model: Asset, as: 'asset', attributes: ['name', 'assetTag'] },
        { model: Employee, as: 'employee', attributes: ['fullName', 'employeeId'] },
        { model: TransactionType, as: 'transactionType', attributes: ['name'] },
      ],
    });

    // Fetch total employee count
    const employeeCount = await Employee.count();

    // Fetch total asset count
    const assetCount = await Asset.count();

    // Fetch total branch count
    const branchCount = await Branch.count();

    // Fetch total category count
    const categoryCount = await AssetCategory.count();

    // Render the dashboard view with the fetched data
    res.render('index', {
      title: 'Dashboard',
      assetCounts,
      categoryCounts,
      recentTransactions,
      counts: {
        employees: employeeCount,
        assets: assetCount,
        branches: branchCount,
        categories: categoryCount,
      },
    });
  } catch (error) {
    // Log the error to the console for debugging
    console.error('Dashboard error:', error);

    // Flash an error message and render the page with the error
    req.flash('error', 'An error occurred while loading the dashboard');
    res.render('index', {
      title: 'Dashboard',
      error: error.message,
    });
  }
});

module.exports = router;
