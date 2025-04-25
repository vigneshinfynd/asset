const express = require('express');
const router = express.Router();
const { Asset, AssetCategory, AssetStatus, Branch, Employee, AssetTransaction, TransactionType } = require('../models');
const { Op } = require('sequelize');

// List all assets
router.get('/', async (req, res) => {
  try {
    const filters = {};
    const includes = [
      { model: AssetCategory, as: 'category' },
      { model: AssetStatus, as: 'status' },
      { model: Branch, as: 'branch' },
      { model: Employee, as: 'currentEmployee' }
    ];
    
    // Add category filter if provided
    if (req.query.category) {
      filters.categoryId = req.query.category;
    }
    
    // Add status filter if provided
    if (req.query.status) {
      filters.statusId = req.query.status;
    }
    
    // Add branch filter if provided
    if (req.query.branch) {
      filters.branchId = req.query.branch;
    }
    
    // Add search filter if provided
    if (req.query.search) {
      filters[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { serialNumber: { [Op.iLike]: `%${req.query.search}%` } },
        { assetTag: { [Op.iLike]: `%${req.query.search}%` } },
        { manufacturer: { [Op.iLike]: `%${req.query.search}%` } },
        { model: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    const assets = await Asset.findAll({
      where: filters,
      include: includes,
      order: [['createdAt', 'DESC']]
    });
    
    // Get categories, statuses, and branches for filters
    const categories = await AssetCategory.findAll({ order: [['name', 'ASC']] });
    const statuses = await AssetStatus.findAll({ order: [['name', 'ASC']] });
    const branches = await Branch.findAll({ order: [['name', 'ASC']] });
    
    res.render('assets/index', { 
      title: 'Asset Management',
      assets,
      categories,
      statuses,
      branches,
      filters: req.query
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    req.flash('error', 'An error occurred while fetching assets');
    res.redirect('/');
  }
});

// Show form to create a new asset
router.get('/new', async (req, res) => {
  try {
    const categories = await AssetCategory.findAll({ order: [['name', 'ASC']] });
    const statuses = await AssetStatus.findAll({ order: [['name', 'ASC']] });
    const branches = await Branch.findAll({ order: [['name', 'ASC']] });
    
    res.render('assets/new', { 
      title: 'Add New Asset',
      categories,
      statuses,
      branches,
      asset: {}
    });
  } catch (error) {
    console.error('Error loading new asset form:', error);
    req.flash('error', 'An error occurred while loading the form');
    res.redirect('/assets');
  }
});

// Create a new asset
router.post('/', async (req, res) => {
  try {
    const newAsset = await Asset.create(req.body);
    
    // Create a "Purchase" transaction
    await AssetTransaction.create({
      assetId: newAsset.id,
      transactionTypeId: 1, // Purchase
      date: newAsset.purchaseDate || new Date(),
      branchId: newAsset.branchId,
      notes: 'Initial asset registration'
    });
    
    req.flash('success', `Asset ${newAsset.name} (${newAsset.assetTag}) was added successfully`);
    res.redirect('/assets');
  } catch (error) {
    console.error('Error creating asset:', error);
    req.flash('error', 'An error occurred while creating the asset');
    res.redirect('/assets');
  }
});

// Show asset details
router.get('/:id', async (req, res) => {
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
    
    // Get transaction history
    const transactions = await AssetTransaction.findAll({
      where: { assetId: asset.id },
      include: [
        { model: Employee, as: 'employee' },
        { model: TransactionType, as: 'transactionType' },
        { model: Branch, as: 'branch' }
      ],
      order: [['date', 'DESC']]
    });
    
    res.render('assets/show', { 
      title: `Asset: ${asset.name} (${asset.assetTag})`,
      asset,
      transactions
    });
  } catch (error) {
    console.error('Error fetching asset details:', error);
    req.flash('error', 'An error occurred while fetching asset details');
    res.redirect('/assets');
  }
});

// Show form to edit an asset
router.get('/:id/edit', async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    
    if (!asset) {
      req.flash('error', 'Asset not found');
      return res.redirect('/assets');
    }
    
    const categories = await AssetCategory.findAll({ order: [['name', 'ASC']] });
    const statuses = await AssetStatus.findAll({ order: [['name', 'ASC']] });
    const branches = await Branch.findAll({ order: [['name', 'ASC']] });
    
    res.render('assets/edit', { 
      title: `Edit Asset: ${asset.name}`,
      asset,
      categories,
      statuses,
      branches
    });
  } catch (error) {
    console.error('Error loading edit asset form:', error);
    req.flash('error', 'An error occurred while loading the form');
    res.redirect('/assets');
  }
});



router.get('/assets/:id', async (req, res) => {
  try {
    const assetId = parseInt(req.params.id, 10); // Parse id to integer
    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    console.error('Error fetching asset details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Delete an asset
router.post('/:id/delete', async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    
    if (!asset) {
      req.flash('error', 'Asset not found');
      return res.redirect('/assets');
    }

    await asset.destroy();
    req.flash('success', `Asset ${asset.name} (${asset.assetTag}) was deleted successfully`);
    res.redirect('/assets');
  } catch (error) {
    console.error('Error deleting asset:', error);
    req.flash('error', 'An error occurred while deleting the asset');
    res.redirect('/assets');
  }
});


// Update an asset
router.put('/:id', async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    
    if (!asset) {
      req.flash('error', 'Asset not found');
      return res.redirect('/assets');
    }
    
    await asset.update(req.body);
    req.flash('success', `Asset ${asset.name} (${asset.assetTag}) was updated successfully`);
    res.redirect(`/assets/${asset.id}`);
  } catch (error) {
    console.error('Error updating asset:', error);
    req.flash('error', 'An error occurred while updating the asset');
    res.redirect(`/assets/${req.params.id}/edit`);
  }
});

module.exports = router;