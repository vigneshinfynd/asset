const express = require('express');
const router = express.Router();
const { Employee, Branch, Asset } = require('../models');
const { Op } = require('sequelize');

// List all employees
router.get('/', async (req, res) => {
  try {
    const filters = {};
    
    // Add filter for active/inactive employees if provided
    if (req.query.status) {
      filters.isActive = req.query.status === 'active';
    }
    
    // Add search filter if provided
    if (req.query.search) {
      filters[Op.or] = [
        { firstName: { [Op.iLike]: `%${req.query.search}%` } },
        { lastName: { [Op.iLike]: `%${req.query.search}%` } },
        { email: { [Op.iLike]: `%${req.query.search}%` } },
        { employeeId: { [Op.iLike]: `%${req.query.search}%` } },
        { department: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    const employees = await Employee.findAll({
      where: filters,
      include: [{ model: Branch, as: 'branch' }],
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });
    
    const branches = await Branch.findAll({
      order: [['name', 'ASC']]
    });

    res.render('employees/index', { 
      title: 'Employee Management',
      employees,
      branches,
      filters: req.query
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    req.flash('error', 'An error occurred while fetching employees');
    res.redirect('/');
  }
});

// Show form to create a new employee
router.get('/new', async (req, res) => {
  try {
    const branches = await Branch.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('employees/new', { 
      title: 'Add New Employee',
      branches,
      employee: {}
    });
  } catch (error) {
    console.error('Error loading new employee form:', error);
    req.flash('error', 'An error occurred while loading the form');
    res.redirect('/employees');
  }
});

// Create a new employee
router.post('/', async (req, res) => {
  try {
    const newEmployee = await Employee.create(req.body);
    req.flash('success', `Employee ${newEmployee.fullName} was added successfully`);
    res.redirect('/employees');
  } catch (error) {
    console.error('Error creating employee:', error);
    req.flash('error', 'An error occurred while creating the employee');
    res.redirect('/employees/new');
  }
});

// Show employee details
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{ model: Branch, as: 'branch' }]
    });
    
    if (!employee) {
      req.flash('error', 'Employee not found');
      return res.redirect('/employees');
    }
    
    // Get assigned assets
    const assignedAssets = await Asset.findAll({
      where: { currentEmployeeId: employee.id },
      include: [
        { model: AssetCategory, as: 'category' },
        { model: AssetStatus, as: 'status' }
      ]
    });
    
    // Get transaction history
    const transactions = await AssetTransaction.findAll({
      where: { employeeId: employee.id },
      include: [
        { model: Asset, as: 'asset' },
        { model: TransactionType, as: 'transactionType' }
      ],
      order: [['date', 'DESC']]
    });
    
    res.render('employees/show', { 
      title: `Employee: ${employee.fullName}`,
      employee,
      assignedAssets,
      transactions
    });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    req.flash('error', 'An error occurred while fetching employee details');
    res.redirect('/employees');
  }
});

// Show form to edit an employee
router.get('/:id/edit', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      req.flash('error', 'Employee not found');
      return res.redirect('/employees');
    }
    
    const branches = await Branch.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('employees/edit', { 
      title: `Edit Employee: ${employee.fullName}`,
      employee,
      branches
    });
  } catch (error) {
    console.error('Error loading edit employee form:', error);
    req.flash('error', 'An error occurred while loading the form');
    res.redirect('/employees');
  }
});

// Update an employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      req.flash('error', 'Employee not found');
      return res.redirect('/employees');
    }
    
    await employee.update(req.body);
    req.flash('success', `Employee ${employee.fullName} was updated successfully`);
    res.redirect(`/employees/${employee.id}`);
  } catch (error) {
    console.error('Error updating employee:', error);
    req.flash('error', 'An error occurred while updating the employee');
    res.redirect(`/employees/${req.params.id}/edit`);
  }
});

// Deactivate/Activate an employee
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      req.flash('error', 'Employee not found');
      return res.redirect('/employees');
    }
    
    // Toggle active status
    await employee.update({ isActive: !employee.isActive });
    
    const statusMessage = employee.isActive ? 'activated' : 'deactivated';
    req.flash('success', `Employee ${employee.fullName} was ${statusMessage} successfully`);
    res.redirect('/employees');
  } catch (error) {
    console.error('Error toggling employee status:', error);
    req.flash('error', 'An error occurred while updating employee status');
    res.redirect('/employees');
  }
});

module.exports = router;