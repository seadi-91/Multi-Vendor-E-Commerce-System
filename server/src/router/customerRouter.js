const express = require('express');
const { protect, customerOnly } = require('../middleware/auth');
const {
    getCustomerProfile,
    updateCustomerProfile,
    updateCustomerPhone,
    changeCustomerPassword,
    getCustomerSettings,
    updateCustomerSettings,
    uploadCustomerProfileImage,
    getCustomerSessions,
    revokeCustomerSession,
    getCustomerAddresses,
    addCustomerAddress,
    updateCustomerAddress,
    deleteCustomerAddress,
    deactivateCustomerAccount,
    deleteCustomerAccount,
} = require('../controller/customerController');

const router = express.Router();

router.get('/profile', protect, customerOnly, getCustomerProfile);
router.put('/profile', protect, customerOnly, updateCustomerProfile);
router.put('/phone', protect, customerOnly, updateCustomerPhone);
router.put('/password', protect, customerOnly, changeCustomerPassword);
router.get('/settings', protect, customerOnly, getCustomerSettings);
router.put('/settings', protect, customerOnly, updateCustomerSettings);
router.post('/settings/profile-image', protect, customerOnly, uploadCustomerProfileImage);
router.get('/sessions', protect, customerOnly, getCustomerSessions);
router.delete('/sessions/:sessionId', protect, customerOnly, revokeCustomerSession);
router.get('/addresses', protect, customerOnly, getCustomerAddresses);
router.post('/addresses', protect, customerOnly, addCustomerAddress);
router.put('/addresses/:id', protect, customerOnly, updateCustomerAddress);
router.delete('/addresses/:id', protect, customerOnly, deleteCustomerAddress);
router.post('/deactivate', protect, customerOnly, deactivateCustomerAccount);
router.delete('/account', protect, customerOnly, deleteCustomerAccount);

module.exports = router;
