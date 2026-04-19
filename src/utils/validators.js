const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validateLogin(body) {
  const errors = {};
  if (!body || typeof body !== 'object') {
    return { payload: null, errors: { body: 'Request body must be JSON' } };
  }

  if (!body.username || typeof body.username !== 'string') {
    errors.username = 'Username is required';
  }
  if (!body.password || typeof body.password !== 'string') {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    return { payload: null, errors };
  }

  return { payload: { username: body.username.trim(), password: body.password }, errors: null };
}

function validateRegister(body) {
  const errors = {};
  if (!body || typeof body !== 'object') {
    return { payload: null, errors: { body: 'Request body must be JSON' } };
  }

  if (!body.name || typeof body.name !== 'string') {
    errors.name = 'Name is required';
  }
  if (!body.username || typeof body.username !== 'string') {
    errors.username = 'Username is required';
  }
  if (!body.email || typeof body.email !== 'string' || !emailPattern.test(body.email)) {
    errors.email = 'A valid email address is required';
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  if (!body.confirmPassword || body.confirmPassword !== body.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    return { payload: null, errors };
  }

  return {
    payload: {
      name: body.name.trim(),
      username: body.username.trim(),
      email: body.email.trim(),
      password: body.password,
    },
    errors: null,
  };
}

module.exports = { validateLogin, validateRegister };
