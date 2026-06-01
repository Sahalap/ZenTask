const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validateRegister = (req, res, next) => {
  const { email, password, name, role } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required.' });
  }

  if (role && !['USER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Role must be either USER or ADMIN.' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  next();
};

const validateTask = (req, res, next) => {
  const { title, status, priority, dueDate } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  if (status && !['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid task status. Must be PENDING, IN_PROGRESS, or COMPLETED.' });
  }

  if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
    return res.status(400).json({ error: 'Invalid task priority. Must be LOW, MEDIUM, or HIGH.' });
  }

  if (dueDate && isNaN(Date.parse(dueDate))) {
    return res.status(400).json({ error: 'Invalid due date format.' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTask
};
