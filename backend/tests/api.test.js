const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

describe('ZenTask Full-Stack REST API Integration Tests', () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;
  let taskId;

  beforeAll(async () => {
    // Clean database before testing
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect DB client
    await prisma.$disconnect();
  });

  describe('Authentication APIs', () => {
    it('should register a new regular user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'testuser@zentask.com',
          password: 'password123',
          name: 'Test User',
          role: 'USER'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('testuser@zentask.com');
      expect(response.body.user.role).toBe('USER');
      
      userToken = response.body.token;
      userId = response.body.user.id;
    });

    it('should register an admin user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'testadmin@zentask.com',
          password: 'adminpassword',
          name: 'Test Admin',
          role: 'ADMIN'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('ADMIN');

      adminToken = response.body.token;
      adminId = response.body.user.id;
    });

    it('should log in an existing user and return a JWT token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@zentask.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('testuser@zentask.com');
    });

    it('should fail registration for missing parameters', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fetch the profile details of an authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('testuser@zentask.com');
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should deny a regular user from fetching all users', async () => {
      const response = await request(app)
        .get('/api/v1/auth/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Forbidden');
    });

    it('should allow an admin user to fetch all registered users', async () => {
      const response = await request(app)
        .get('/api/v1/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Task Entity CRUD APIs', () => {
    it('should allow an authenticated user to create a task', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Implement Jest Tests',
          description: 'Ensure 100% test coverage for auth and tasks endpoints.',
          priority: 'HIGH',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('task');
      expect(response.body.task.title).toBe('Implement Jest Tests');
      
      taskId = response.body.task.id;
    });

    it('should fetch tasks belonging to the authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tasks.length).toBe(1);
      expect(response.body.tasks[0].title).toBe('Implement Jest Tests');
    });

    it('should deny regular user from accessing tasks of other users', async () => {
      // Admin creates a task
      const adminTaskRes = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Auditing Task',
          priority: 'LOW'
        });

      const adminTaskId = adminTaskRes.body.task.id;

      // Regular user tries to access admin task
      const getRes = await request(app)
        .get(`/api/v1/tasks/${adminTaskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.status).toBe(403);
    });

    it('should allow admin user to access and delete tasks of other users', async () => {
      // Admin fetches the regular user's task
      const getRes = await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.task.title).toBe('Implement Jest Tests');

      // Admin updates regular user's task status
      const putRes = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Implement Jest Tests (Updated)',
          status: 'COMPLETED'
        });

      expect(putRes.status).toBe(200);
      expect(putRes.body.task.status).toBe('COMPLETED');
    });

    it('should allow regular user to delete their own task', async () => {
      const response = await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
    });
  });
});
