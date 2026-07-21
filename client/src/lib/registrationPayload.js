export const buildRegistrationPayload = (formData = {}, files = {}) => {
    const normalizedRole = String(formData?.role || '').toUpperCase();
    const role = normalizedRole === 'FARMER' ? 'farmer' : normalizedRole === 'ADMIN' ? 'admin' : 'customer';

    const payload = {
        name: formData?.name?.trim?.() || '',
        email: formData?.email?.trim?.() || '',
        phone: formData?.phone?.trim?.() || '',
        password: formData?.password?.trim?.() || '',
        role,
    };

    if (formData?.city?.trim?.()) {
        payload.city = formData.city.trim();
    }

    if (formData?.address?.trim?.()) {
        payload.address = formData.address.trim();
    }

    if (files?.landMap?.name) {
        payload.landMapFile = files.landMap.name;
    }

    if (files?.nationalId?.name) {
        payload.nationalId = files.nationalId.name;
    }

    if (files?.businessLicense?.name) {
        payload.businessLicense = files.businessLicense.name;
    }

    return payload;
};
