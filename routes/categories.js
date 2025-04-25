const express = require('express');
const router = express.Router();
const { AssetCategory, Asset } = require('../models');

// List all asset categories
router.get('/', async (req, res) => {
  try {
    const categories = await AssetCategory.findAll({
      order: [['name', 'ASC']]
    });

    // Get counts of assets in each category
    for (const category of categories) {
      category.assetCount = await Asset.count({ where: { categoryId: category.id } });
    }

    res.render('categories/index', {
      title: 'Asset Categories',
      categories,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    req.flash('error', 'An error occurred while fetching categories');
    res.redirect('/');
  }
});

// Show form to create a new category
router.get('/new', (req, res) => {
  res.render('categories/new', {
    title: 'Add New Category',
    category: {},
    messages: req.flash() 
  });
});

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, hardwareType } = req.body;
    
    // Create the new category with the selected hardware type
    const newCategory = await AssetCategory.create({
      name,
      hardwareType
    });

    req.flash('success', `Category ${newCategory.name} was added successfully`);
    res.redirect('/categories');
  } catch (error) {
    console.error('Error creating category:', error);
    req.flash('error', 'An error occurred while creating the category');
    res.redirect('/categories/new');
  }
});

// Show form to edit a category
router.get('/:id/edit', async (req, res) => {
  try {
    const category = await AssetCategory.findByPk(req.params.id);

    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/categories');
    }

    const hardwareTypes = [
      'Laptop',
      'Mobile Phone',
      'Screw Driver',
      'Drill Machine',
      'Other'
    ];  // Predefined list of hardware types

    res.render('categories/edit', {
      title: `Edit Category: ${category.name}`,
      category,
      hardwareTypes,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error loading edit category form:', error);
    req.flash('error', 'An error occurred while loading the form');
    res.redirect('/categories');
  }
});

// Update a category
router.put('/:id', async (req, res) => {
  try {
    const category = await AssetCategory.findByPk(req.params.id);

    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/categories');
    }

    await category.update(req.body);
    req.flash('success', `Category ${category.name} was updated successfully`);
    res.redirect('/categories');
  } catch (error) {
    console.error('Error updating category:', error);
    req.flash('error', 'An error occurred while updating the category');
    res.redirect(`/categories/${req.params.id}/edit`);
  }
});

// Show delete confirmation page
router.get('/:id/delete', async (req, res) => {
  try {
    const category = await AssetCategory.findByPk(req.params.id);

    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/categories');
    }

    res.render('categories/delete', {
      title: `Delete Category: ${category.name}`,
      category,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error loading delete category form:', error);
    req.flash('error', 'An error occurred while loading the delete form');
    res.redirect('/categories');
  }
});

// Handle the deletion of the category
router.post('/:id/delete', async (req, res) => {
  try {
    const category = await AssetCategory.findByPk(req.params.id);

    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/categories');
    }

    // Check if there are assets in this category
    const assetCount = await Asset.count({ where: { categoryId: category.id } });

    if (assetCount > 0) {
      req.flash('error', `Cannot delete category ${category.name} because it has ${assetCount} asset(s) assigned to it`);
      return res.redirect('/categories');
    }

    // Perform the deletion
    await category.destroy();
    req.flash('success', `Category ${category.name} was deleted successfully`);
    res.redirect('/categories');
  } catch (error) {
    console.error('Error deleting category:', error);
    req.flash('error', 'An error occurred while deleting the category');
    res.redirect('/categories');
  }
});


module.exports = router;
