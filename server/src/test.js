const assert = require('assert');
const {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRating
} = require('./utils/validators');

console.log('--- Running Validation & Business Logic Unit Tests ---');

// Test 1: Name validation (20-60 chars)
assert.strictEqual(validateName('Short Name'), 'Name must be between 20 and 60 characters in length.');
assert.strictEqual(validateName('A'.repeat(61)), 'Name must be between 20 and 60 characters in length.');
assert.strictEqual(validateName('Administrator Account User'), null); // 26 chars -> valid
console.log('✓ Name validation tests passed (20-60 chars)');

// Test 2: Address validation (<= 400 chars)
assert.strictEqual(validateAddress(''), 'Address is required.');
assert.strictEqual(validateAddress('A'.repeat(401)), 'Address must not exceed 400 characters.');
assert.strictEqual(validateAddress('100 Market St, Suite 500, San Francisco, CA'), null);
console.log('✓ Address validation tests passed (<= 400 chars)');

// Test 3: Password validation (8-16 chars, >=1 uppercase, >=1 special char)
assert.strictEqual(validatePassword('short'), 'Password must be between 8 and 16 characters in length.');
assert.strictEqual(validatePassword('verylongpasswordexceeding16chars!'), 'Password must be between 8 and 16 characters in length.');
assert.strictEqual(validatePassword('lowercase@123'), 'Password must include at least one uppercase letter.');
assert.strictEqual(validatePassword('UPPERCASE123'), 'Password must include at least one special character.');
assert.strictEqual(validatePassword('Admin@123'), null); // 9 chars, uppercase, special char -> valid
assert.strictEqual(validatePassword('Valid#Pass2026'), null);
console.log('✓ Password validation tests passed (8-16 chars, uppercase, special char)');

// Test 4: Email validation
assert.strictEqual(validateEmail('invalid-email'), 'Please provide a valid email address.');
assert.strictEqual(validateEmail('admin@storehub.com'), null);
console.log('✓ Email validation tests passed');

// Test 5: Rating validation (1 to 5)
assert.strictEqual(validateRating(0), 'Rating must be an integer between 1 and 5.');
assert.strictEqual(validateRating(6), 'Rating must be an integer between 1 and 5.');
assert.strictEqual(validateRating(3.5), 'Rating must be an integer between 1 and 5.');
assert.strictEqual(validateRating(5), null);
assert.strictEqual(validateRating('4'), null);
console.log('✓ Rating validation tests passed (1 to 5)');

console.log('\n--- All Unit Tests Passed Successfully! ---');
