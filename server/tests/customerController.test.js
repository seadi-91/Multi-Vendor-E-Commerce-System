const test = require('node:test');
const assert = require('node:assert/strict');
const {
    buildCustomerProfileResponse,
    buildCustomerProfileUpdateData
} = require('../src/controller/customerController');

test('buildCustomerProfileResponse maps user fields into the customer profile shape', () => {
    const profile = buildCustomerProfileResponse({
        id: 7,
        name: 'Alem Bekele',
        email: 'alem@example.com',
        phone: '0911223344',
        location: 'Addis Ababa',
        address: 'Bole | House 12, 3rd floor'
    });

    assert.equal(profile.id, 7);
    assert.equal(profile.name, 'Alem Bekele');
    assert.equal(profile.email, 'alem@example.com');
    assert.equal(profile.phone, '0911223344');
    assert.equal(profile.city, 'Addis Ababa');
    assert.equal(profile.subcity, 'Bole');
    assert.equal(profile.fullAddress, 'House 12, 3rd floor');
});

test('buildCustomerProfileUpdateData persists location, address, and email fields', () => {
    const payload = buildCustomerProfileUpdateData({
        name: 'Alem Bekele',
        phone: '0911223344',
        city: 'Addis Ababa',
        subcity: 'Bole',
        fullAddress: 'House 12, 3rd floor',
        email: 'alem@example.com'
    });

    assert.equal(payload.name, 'Alem Bekele');
    assert.equal(payload.phone, '0911223344');
    assert.equal(payload.location, 'Addis Ababa');
    assert.equal(payload.address, 'Bole | House 12, 3rd floor');
    assert.equal(payload.email, 'alem@example.com');
});
