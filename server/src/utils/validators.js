/**
 * Validation rules strictly implementing FullStack Intern Coding Challenge specs:
 * - Name: Min 20 characters, Max 60 characters.
 * - Address: Max 400 characters.
 * - Password: 8-16 characters, must include at least one uppercase letter and one special character.
 * - Email: Must follow standard email validation rules.
 */

function validateName(name) {
  if (!name || typeof name !== 'string') {
    return 'Name is required.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return 'Name must be between 20 and 60 characters in length.';
  }
  return null;
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email is required.';
  }
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please provide a valid email address.';
  }
  return null;
}

function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return 'Address is required.';
  }
  const trimmed = address.trim();
  if (trimmed.length > 400) {
    return 'Address must not exceed 400 characters.';
  }
  return null;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters in length.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter.';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return 'Password must include at least one special character.';
  }
  return null;
}

function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
}

module.exports = {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRating
};
