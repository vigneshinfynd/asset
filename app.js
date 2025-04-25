// Main application file
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const { sequelize } = require('./models');

// Routes
const indexRoutes = require('./routes/index');
const employeeRoutes = require('./routes/employees');
const assetRoutes = require('./routes/assets');
const categoryRoutes = require('./routes/categories');
const operationsRoutes = require('./routes/operations');
const reportRoutes = require('./routes/reports');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(session({
  secret: 'asset-management-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Make flash messages available to all templates
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/employees', employeeRoutes);
app.use('/assets', assetRoutes);
app.use('/categories', categoryRoutes);
app.use('/operations', operationsRoutes);
app.use('/reports', reportRoutes);

// Error handling middleware
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

// Database connection and server start
sequelize.sync({ alter: false }).then(() => {
  console.log('Database connected!');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

module.exports = app;