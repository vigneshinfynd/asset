const express = require('express');
const router = express.Router();
const { Asset, Employee, AssetTransaction, TransactionType, AssetStatus } = require('../models');
const { Op } = require('sequelize');

// Stock View - Show available assets
router.get('/stock', async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: {
        statusId: 1, // Available
        currentEmployeeId: null
      },
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Branch, as: 'branch' }
      ],
      order: [['branchId', 'ASC'], ['categoryId', 'ASC']]
    });
    
    // Group by branch
    const branchAssets = {};
    let totalValue = 0;
    
    for (const asset of assets) {
      const branchName = asset.branch ? asset.branch.name : 'Unassigned';
      
      if (!branchAssets[branchName]) {
        branchAssets[branchName] = {
          assets: [],
          count: 0,
          value: 0
        };
      }
      
      branchAssets[branchName].assets.push(asset);
      branchAssets[branchName].count++;
      branchAssets[branchName].value += parseFloat(asset.currentValue || 0);
      totalValue += parseFloat(asset.currentValue || 0);
    }
    
    res.render('operations/stock', { 
      title: 'Stock View',
      branchAssets,
      totalValue,
      totalCount: assets.length
    });
  } catch (error) {
    console.error('Error fetching stock view:', error);
    req.flash('error', 'An error occurred while fetching stock view');
    res.redirect('/');
  }
});

// Issue Asset - Form
router.get('/issue', async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: {
        statusId: 1, // Available
        currentEmployeeId: null
      },
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Branch, as: 'branch' }
      ],
      order: [['name', 'ASC']]
    });
    
    const employees = await Employee.findAll({
      where: { isActive: true },
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });
    
    res.render('operations/issue', { 
      title: 'Issue Asset',
      assets,
      employees,
      preselectedAsset: req.query.assetId,
      preselectedEmployee: req.query.employeeId
    });
  } catch (error) {
    console.error('Error loading issue asset form:', error);
    req.flash('error', 'An error occurred while loading the form');
    res.redirect('/');
  }
});

// Issue Asset - Process
router.post('/issue', async (req, res) => {
  const { assetId, employeeId, notes } = req.body;
  
  try {
    const asset = await Asset.findByPk(assetId);
    const employee = await Employee.findByPk(employeeId);
    
    if (!asset || !employee) {
      req.flash('error', 'Asset or employee not found');
      return res.redirect('/operations/issue');
    }
    
    // Check if asset is available
    if (asset.statusId !== 1 || asset.currentEmployeeId !== null) {
      req.flash('error', 'Asset is not available for issuance');
      return res.redirect('/operations/issue');
    }
    
    // Update asset
    await asset.update({
      statusId: 2, // Assigned
      currentEmployeeId: employeeId
    });
    
    // Create transaction
    await AssetTransaction.create({
      assetId,
      employeeId,
      transactionTypeId: 2, // Issue
      branchId: employee.branchId,
      notes,
      date: new Date()
    });
    
    req.flash('success', `Asset ${asset.name} (${asset.assetTag}) was issued to ${employee.fullName} successfully`);
    res.redirect('/assets');
  } catch (error) {
    console.error('Error issuing asset:', error);
    req.flash('error', 'An error occurred while issuing the asset');
    res.redirect('/operations/issue');
  }
});

// Return Asset - Form
router.get('/return', async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: {
        statusId: 2, // Assigned
        currentEmployeeId: { [Op.ne]: null }
      },
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Employee, as: 'currentEmployee' }
      ],
      order: [['name', 'ASC']]
    });
    
    const returnReasons = [
      'Employee resignation',
      'Equipment upgrade',
      'Equipment repair',
      'Project completed',
      'Department transfer',
      'Asset reallocation',
      'Other'
    ];
    
    res.render('operations/return', { 
      title: 'Return Asset',
      assets,
      returnReasons,
      preselectedAsset: req.query.assetId
    });
  } catch (error) {
    console.error('Error loading return asset form:', error);
    req.flash('error', 'An error occurred while loading the form');
    res.redirect('/');
  }
});

// Return Asset - Process
router.post('/return', async (req, res) => {
  const { assetId, returnReason, notes } = req.body;
  
  try {
    const asset = await Asset.findByPk(assetId, {
      include: [{ model: Employee, as: 'currentEmployee' }]
    });
    
    if (!asset) {
      req.flash('error', 'Asset not found');
      return res.redirect('/operations/return');
    }
    
    // Check if asset is assigned
    if (asset.statusId !== 2 || !asset.currentEmployeeId) {
      req.flash('error', 'Asset is not currently assigned to any employee');
      return res.redirect('/operations/return');
    }
    
    const employeeId = asset.currentEmployeeId;
    const employeeName = asset.currentEmployee ? asset.currentEmployee.fullName : 'Unknown';
    
    // Update asset
    await asset.update({
      statusId: 1, // Available
      currentEmployeeId: null
    });
    
    // Create transaction
    await AssetTransaction.create({
      assetId,
      employeeId,
      transactionTypeId: 3, // Return
      branchId: asset.branchId,
      notes,
      returnReason,
      date: new Date()
    });
    
    req.flash('success', `Asset ${asset.name} (${asset.assetTag}) was returned from ${employeeName} successfully`);
    res.redirect('/assets');
  } catch (error) {
    console.error('Error returning asset:', error);
    req.flash('error', 'An error occurred while returning the asset');
    res.redirect('/operations/return');
  }
});

// Scrap Asset - Form
router.get('/scrap', async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: {
        statusId: { [Op.ne]: 4 } // Not already scrapped
      },
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Employee, as: 'currentEmployee' },
        { model: Branch, as: 'branch' }
      ],
      order: [['name', 'ASC']]
    });
    
    const scrapReasons = [
      'Obsolete technology',
      'Damaged beyond repair',
      'End of life cycle',
      'Uneconomical to repair',
      'Replaced by new technology',
      'Security vulnerability',
      'Other'
    ];
    
    res.render('operations/scrap', { 
      title: 'Scrap Asset',
      assets,
      scrapReasons,
      preselectedAsset: req.query.assetId
    });
  } catch (error) {
    console.error('Error loading scrap asset form:', error);
    req.flash('error', 'An error occurred while loading the form');
    res.redirect('/');
  }
});

// Scrap Asset - Process
router.post('/scrap', async (req, res) => {
  const { assetId, scrapReason, notes } = req.body;
  
  try {
    const asset = await Asset.findByPk(assetId);
    
    if (!asset) {
      req.flash('error', 'Asset not found');
      return res.redirect('/operations/scrap');
    }
    
    // Check if asset is already scrapped
    if (asset.statusId === 4) {
      req.flash('error', 'Asset is already scrapped');
      return res.redirect('/operations/scrap');
    }
    
    // If asset is assigned, first return it
    let employeeId = null;
    if (asset.statusId === 2 && asset.currentEmployeeId) {
      employeeId = asset.currentEmployeeId;
    }
    
    // Update asset
    await asset.update({
      statusId: 4, // Scrapped
      currentEmployeeId: null,
      currentValue: 0
    });
    
    // Create transaction
    await AssetTransaction.create({
      assetId,
      employeeId,
      transactionTypeId: 5, // Scrap
      branchId: asset.branchId,
      notes,
      scrapReason,
      date: new Date()
    });
    
    req.flash('success', `Asset ${asset.name} (${asset.assetTag}) was marked as scrapped successfully`);
    res.redirect('/assets');
  } catch (error) {
    console.error('Error scrapping asset:', error);
    req.flash('error', 'An error occurred while scrapping the asset');
    res.redirect('/operations/scrap');
  }
});

// Asset History
router.get('/history/:id', async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: AssetCategory, as: 'category' },
        { model: AssetStatus, as: 'status' },
        { model: Branch, as: 'branch' },
        { model: Employee, as: 'currentEmployee' }
      ]
    });
    
    if (!asset) {
      req.flash('error', 'Asset not found');
      return res.redirect('/assets');
    }
    
    // Get all transactions for this asset
    const transactions = await AssetTransaction.findAll({
      where: { assetId: asset.id },
      include: [
        { model: Employee, as: 'employee' },
        { model: TransactionType, as: 'transactionType' },
        { model: Branch, as: 'branch' }
      ],
      order: [['date', 'ASC']]
    });
    
    res.render('operations/history', { 
      title: `Asset History: ${asset.name} (${asset.assetTag})`,
      asset,
      transactions
    });
  } catch (error) {
    console.error('Error fetching asset history:', error);
    req.flash('error', 'An error occurred while fetching asset history');
    res.redirect('/assets');
  }
});

module.exports = router;