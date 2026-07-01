const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validation
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  handleValidationErrors
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Product validation
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ min: 3, max: 100 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isFloat({ min: 0 }).withMessage('Stock must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('unit').trim().notEmpty().withMessage('Unit is required'),
  handleValidationErrors
];

// Order validation
const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').isInt().withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('customerEmail').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('customerPhone').optional().isMobilePhone(),
  handleValidationErrors
];

// User update validation
const userUpdateValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone(),
  handleValidationErrors
];

// ID parameter validation
const idValidation = [
  param('id').isInt().withMessage('Valid ID required'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  productValidation,
  orderValidation,
  userUpdateValidation,
  idValidation,
  handleValidationErrors
};
