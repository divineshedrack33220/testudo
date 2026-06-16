import { validationResult, body } from 'express-validator';

export const validate = (rules) => {
  return async (req, res, next) => {
    await Promise.all(rules.map(rule => rule.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
      });
    }
    next();
  };
};

export const pageRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('slug').optional().trim().notEmpty().withMessage('Slug cannot be empty'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
];

export const serviceRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('slug').optional().trim().notEmpty().withMessage('Slug cannot be empty'),
  body('status').optional().isIn(['draft', 'active', 'inactive']).withMessage('Invalid status')
];

export const teamRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
];

export const authRules = {
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  register: [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').optional().isIn(['admin', 'editor', 'viewer']).withMessage('Invalid role')
  ]
};

