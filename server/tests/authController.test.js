const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCustomerRegistrationData } = require('../src/controller/authController');

test('buildCustomerRegistrationData omits phone when it is not provided', () => {
    const data = buildCustomerRegistrationData({
        name: 'Test User',
        email: 'test@example.com',
        password: 'secret123',
        role: 'customer'
    });

    assert.equal(data.name, 'Test User');
    assert.equal(data.role, 'customer');
    assert.equal(data.phone, undefined);
    assert.equal(data.address, null);
});
