const express = require('express');
const router = express.Router();
const { register, login, getProfile, getAllUsers, updateUserRole, deleteUser } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../utils/validators');
const { authenticate, authorize } = require('../middlewares/auth');

/**
 * @openapi
 * components:
 *   schemas:
 *     UserRegisterInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Unique email address
 *           example: newuser@zentask.com
 *         password:
 *           type: string
 *           format: password
 *           description: Password (minimum 6 characters)
 *           example: password123
 *         name:
 *           type: string
 *           description: User full name
 *           example: Alex Mercer
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           description: Account access tier
 *           default: USER
 *           example: USER
 *     UserLoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@zentask.com
 *         password:
 *           type: string
 *           format: password
 *           example: user123
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         role:
 *           type: string
 *     AuthSuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/UserResponse'
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterInput'
 *     responses:
 *       201:
 *         description: Registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       400:
 *         description: Invalid input or email already exists
 */
router.post('/register', validateRegister, register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateLogin, login);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, getProfile);

/**
 * @openapi
 * /auth/users:
 *   get:
 *     summary: Fetch all registered users (Admin Only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *                       role:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       _count:
 *                         type: object
 *                         properties:
 *                           tasks:
 *                             type: integer
 *       403:
 *         description: Forbidden (Admin role required)
 */
router.get('/users', authenticate, authorize(['ADMIN']), getAllUsers);

/**
 * @openapi
 * /auth/users/{id}/role:
 *   patch:
 *     summary: Modify a user's role (Admin Only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to modify
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: User not found
 */
router.patch('/users/:id/role', authenticate, authorize(['ADMIN']), updateUserRole);

/**
 * @openapi
 * /auth/users/{id}:
 *   delete:
 *     summary: Delete a user and their tasks (Admin Only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Attempted self-deletion
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', authenticate, authorize(['ADMIN']), deleteUser);

module.exports = router;
