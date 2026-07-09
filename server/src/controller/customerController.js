const bcrypt = require('bcrypt');
const prisma = require('../db/prismaClient');

const normalizeSettingsPayload = (payload = {}) => {
    const settings = {};

    if (payload.theme) settings.theme = payload.theme;
    if (payload.language) settings.language = payload.language;
    if (payload.timezone) settings.timezone = payload.timezone;
    if (typeof payload.twoFactor === 'boolean') settings.twoFactor = payload.twoFactor;
    if (typeof payload.loginAlerts === 'boolean') settings.loginAlerts = payload.loginAlerts;
    if (typeof payload.emailNotifications === 'boolean') settings.emailNotifications = payload.emailNotifications;
    if (typeof payload.pushNotifications === 'boolean') settings.pushNotifications = payload.pushNotifications;
    if (typeof payload.smsNotifications === 'boolean') settings.smsNotifications = payload.smsNotifications;
    if (typeof payload.privateAccount === 'boolean') settings.privateAccount = payload.privateAccount;
    if (typeof payload.profileVisibility === 'string') settings.profileVisibility = payload.profileVisibility;
    if (typeof payload.showEmailOnProfile === 'boolean') settings.showEmailOnProfile = payload.showEmailOnProfile;
    if (typeof payload.showPhoneOnProfile === 'boolean') settings.showPhoneOnProfile = payload.showPhoneOnProfile;
    if (typeof payload.showOrderActivity === 'boolean') settings.showOrderActivity = payload.showOrderActivity;
    if (typeof payload.showAddressOnProfile === 'boolean') settings.showAddressOnProfile = payload.showAddressOnProfile;
    if (typeof payload.autoWithdrawal === 'boolean') settings.autoWithdrawal = payload.autoWithdrawal;
    if (typeof payload.sessionTimeout === 'number') settings.sessionTimeout = payload.sessionTimeout;
    if (typeof payload.loginAlerts === 'boolean') settings.loginAlerts = payload.loginAlerts;

    return settings;
};

const buildCustomerSettingsResponse = (user) => ({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    profileImage: user.profileImage || '',
    address: user.address || '',
    location: user.location || '',
    bio: user.bio || '',
    profileVisibility: user.profileVisibility || 'public',
    privateAccount: user.privateAccount ?? false,
    showEmailOnProfile: user.showEmailOnProfile ?? false,
    showPhoneOnProfile: user.showPhoneOnProfile ?? false,
    showAddressOnProfile: user.showAddressOnProfile ?? false,
    showOrderActivity: user.showOrderActivity ?? true,
    theme: user.theme || 'system',
    language: user.language || 'English',
    timezone: user.timezone || 'Africa/Addis_Ababa',
    twoFactor: user.twoFactor ?? false,
    loginAlerts: user.loginAlerts ?? true,
    emailNotifications: user.emailNotifications ?? true,
    pushNotifications: user.pushNotifications ?? true,
    smsNotifications: user.smsNotifications ?? false,
    sessionTimeout: user.sessionTimeout ?? 30,
    connectedAccounts: [],
});

const buildCustomerProfileResponse = (user) => {
    const addressParts = typeof user.address === 'string' ? user.address.split('|').map((part) => part.trim()) : [];
    const subcity = addressParts[0] || '';
    const fullAddress = addressParts[1] || '';

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        city: user.location || '',
        subcity,
        fullAddress,
        address: fullAddress || user.address || '',
        role: user.role,
        profileImage: user.profileImage || '',
        isActive: user.isActive,
        accountStatus: user.isActive === false ? 'Inactive' : user.isActive === true ? 'Active' : 'Not provided',
        bio: user.bio || '',
        createdAt: user.createdAt,
        isVerified: user.isVerified ?? false,
        language: user.language || null,
        timezone: user.timezone || null,
    };
};

const parseStoredAddresses = (raw) => {
    if (!raw) return [];
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }
    return Array.isArray(raw) ? raw : [];
};

const serializeStoredAddresses = (addresses) => JSON.stringify(Array.isArray(addresses) ? addresses : []);

const buildCustomerProfileUpdateData = (payload) => {
    const data = {};

    if (payload.name) data.name = payload.name;
    if (payload.email) data.email = payload.email;
    if (payload.phone) data.phone = payload.phone;
    if (payload.location || payload.city) data.location = payload.location || payload.city;
    if (payload.bio !== undefined) data.bio = payload.bio;
    if (payload.profileImage !== undefined) data.profileImage = payload.profileImage;
    if (payload.subcity || payload.fullAddress) {
        const addressParts = [payload.subcity || '', payload.fullAddress || ''].filter(Boolean);
        data.address = addressParts.join(' | ');
    } else if (payload.address !== undefined) {
        data.address = payload.address;
    }

    return data;
};

const getCustomerProfile = async (req, res) => {
    try {
        const userId = Number(req.user.id);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                location: true,
                address: true,
                profileImage: true,
                isActive: true,
                bio: true,
                createdAt: true,
                isVerified: true,
                language: true,
                timezone: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        res.json(buildCustomerProfileResponse(user));
    } catch (error) {
        console.error('getCustomerProfile error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateCustomerProfile = async (req, res) => {
    try {
        const data = buildCustomerProfileUpdateData(req.body);
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'No valid profile fields were provided' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(req.user.id) },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                location: true,
                address: true,
                profileImage: true,
                isActive: true,
                bio: true,
                createdAt: true,
                isVerified: true,
                language: true,
                timezone: true,
            },
        });

        res.json(buildCustomerProfileResponse(updatedUser));
    } catch (error) {
        console.error('updateCustomerProfile error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateCustomerPhone = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(req.user.id) },
            data: { phone },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                location: true,
                address: true,
                profileImage: true,
                isActive: true,
                bio: true,
                createdAt: true,
                isVerified: true,
                language: true,
                timezone: true,
            },
        });

        res.json(buildCustomerProfileResponse(updatedUser));
    } catch (error) {
        console.error('updateCustomerPhone error:', error);
        res.status(500).json({ message: error.message });
    }
};

const changeCustomerPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(req.user.id) },
            select: { password: true },
        });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: Number(req.user.id) },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('changeCustomerPassword error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getCustomerSettings = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(req.user.id) },
            select: {
                id: true,
                profileVisibility: true,
                privateAccount: true,
                showEmailOnProfile: true,
                showPhoneOnProfile: true,
                showAddressOnProfile: true,
                showOrderActivity: true,
                theme: true,
                language: true,
                timezone: true,
                twoFactor: true,
                loginAlerts: true,
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: true,
                sessionTimeout: true,
                email: true,
                phone: true,
                name: true,
                profileImage: true,
                address: true,
                location: true,
                bio: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        res.json(buildCustomerSettingsResponse(user));
    } catch (error) {
        console.error('getCustomerSettings error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateCustomerSettings = async (req, res) => {
    try {
        const payload = req.body || {};
        const data = normalizeSettingsPayload(payload);

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'No valid settings were provided' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(req.user.id) },
            data,
            select: {
                id: true,
                profileVisibility: true,
                privateAccount: true,
                showEmailOnProfile: true,
                showPhoneOnProfile: true,
                showAddressOnProfile: true,
                showOrderActivity: true,
                theme: true,
                language: true,
                timezone: true,
                twoFactor: true,
                loginAlerts: true,
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: true,
                sessionTimeout: true,
                email: true,
                phone: true,
                name: true,
                profileImage: true,
                address: true,
                location: true,
                bio: true,
            },
        });

        res.json(buildCustomerSettingsResponse(updatedUser));
    } catch (error) {
        console.error('updateCustomerSettings error:', error);
        res.status(500).json({ message: error.message });
    }
};

const uploadCustomerProfileImage = async (req, res) => {
    try {
        const { imageUrl } = req.body || {};
        if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(req.user.id) },
            data: { profileImage: imageUrl.trim() },
            select: { profileImage: true },
        });

        res.json({ profileImage: updatedUser.profileImage });
    } catch (error) {
        console.error('uploadCustomerProfileImage error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getCustomerSessions = async (req, res) => {
    res.json({ sessions: [] });
};

const revokeCustomerSession = async (req, res) => {
    res.json({ message: 'Session revoked successfully' });
};

const getCustomerAddresses = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(req.user.id) },
            select: { address: true },
        });

        res.json({ addresses: parseStoredAddresses(user?.address) });
    } catch (error) {
        console.error('getCustomerAddresses error:', error);
        res.status(500).json({ message: error.message });
    }
};

const addCustomerAddress = async (req, res) => {
    try {
        const address = req.body || {};
        if (!address.label || !address.fullName || !address.phone || !address.city || !address.subcity || !address.street) {
            return res.status(400).json({ message: 'Please complete all address fields' });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: Number(req.user.id) },
            select: { address: true },
        });

        const addresses = parseStoredAddresses(currentUser?.address);
        const createdAddress = {
            id: `${Date.now()}`,
            ...address,
            isDefault: addresses.length === 0 ? true : !!address.isDefault,
        };

        const nextAddresses = [...addresses, createdAddress];
        if (createdAddress.isDefault) {
            nextAddresses.forEach((item) => {
                if (item.id !== createdAddress.id) item.isDefault = false;
            });
        }

        await prisma.user.update({
            where: { id: Number(req.user.id) },
            data: { address: serializeStoredAddresses(nextAddresses) },
        });

        res.status(201).json({ address: createdAddress });
    } catch (error) {
        console.error('addCustomerAddress error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateCustomerAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};
        const currentUser = await prisma.user.findUnique({
            where: { id: Number(req.user.id) },
            select: { address: true },
        });

        const addresses = parseStoredAddresses(currentUser?.address);
        const currentIndex = addresses.findIndex((item) => item.id === id || item._id === id);
        if (currentIndex < 0) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const nextAddress = { ...addresses[currentIndex], ...updates, id: addresses[currentIndex].id || id, _id: addresses[currentIndex]._id || id };
        if (nextAddress.isDefault) {
            addresses.forEach((item) => {
                if (item.id !== nextAddress.id && item._id !== nextAddress._id) item.isDefault = false;
            });
        }

        addresses[currentIndex] = nextAddress;
        await prisma.user.update({
            where: { id: Number(req.user.id) },
            data: { address: serializeStoredAddresses(addresses) },
        });

        res.json({ address: nextAddress });
    } catch (error) {
        console.error('updateCustomerAddress error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteCustomerAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = await prisma.user.findUnique({
            where: { id: Number(req.user.id) },
            select: { address: true },
        });

        const addresses = parseStoredAddresses(currentUser?.address).filter((item) => item.id !== id && item._id !== id);
        await prisma.user.update({
            where: { id: Number(req.user.id) },
            data: { address: serializeStoredAddresses(addresses) },
        });

        res.json({ message: 'Address removed successfully' });
    } catch (error) {
        console.error('deleteCustomerAddress error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deactivateCustomerAccount = async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: Number(req.user.id) },
            data: { isActive: false },
        });

        res.json({ message: 'Account deactivated successfully' });
    } catch (error) {
        console.error('deactivateCustomerAccount error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteCustomerAccount = async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: Number(req.user.id) } });
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('deleteCustomerAccount error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    buildCustomerProfileResponse,
    buildCustomerProfileUpdateData,
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
};
