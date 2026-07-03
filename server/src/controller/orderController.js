const prisma = require('../db/prismaClient');

// Helper to build orderCode like ORD100, ORD101...
async function generateOrderCode(id) {
    // Start from 100: ORD100 corresponds to id 1
    const base = 99;
    return 'ORD' + String(base + id);
}

exports.createOrder = async (req, res) => {
    try {
        console.log('=== ORDER REQUEST START ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const {
            customerId,
            items,
            total,
            subtotal,
            deliveryFee = 0,
            tax = 0,
            status = 'processing',
            paymentMethod = 'cash',
            paymentStatus = 'unpaid',
            fullName,
            email,
            phone,
            city,
            address,
            additionalInfo,
            vendor,
            restaurant,
            estimatedDelivery = '30-45 minutes',
            specialInstructions
        } = req.body;

        // Convert items to proper JSON format
        let itemsJson;
        if (Array.isArray(items)) {
            itemsJson = items;
        } else if (typeof items === 'string') {
            try {
                itemsJson = JSON.parse(items);
            } catch (e) {
                itemsJson = [];
            }
        } else {
            itemsJson = items || [];
        }

        console.log('Parsed items:', itemsJson);
        console.log('Creating order with data:', {
            customerId,
            itemsCount: itemsJson.length,
            total,
            subtotal,
            deliveryFee,
            fullName,
            phone
        });

        const created = await prisma.order.create({
            data: {
                customerId: customerId ? parseInt(customerId) : null,
                items: itemsJson,
                total: parseFloat(total) || 0,
                subtotal: parseFloat(subtotal) || 0,
                deliveryFee: parseFloat(deliveryFee) || 0,
                tax: parseFloat(tax) || 0,
                status: status || 'processing',
                paymentMethod: paymentMethod || 'cash',
                paymentStatus: paymentStatus || 'unpaid',
                fullName: fullName || '',
                email: email || '',
                phone: phone || '',
                city: city || '',
                address: address || '',
                additionalInfo: additionalInfo || '',
                vendor: vendor || null,
                restaurant: restaurant || null,
                estimatedDelivery: estimatedDelivery || '30-45 minutes',
                specialInstructions: specialInstructions || null,
                orderCode: `TEMP-${Date.now()}`
            },
        });

        console.log('Order created successfully, ID:', created.id);

        const orderCode = await generateOrderCode(created.id);

        const updated = await prisma.order.update({
            where: { id: created.id },
            data: { orderCode },
        });
        
        console.log('Order updated with code:', orderCode);
        console.log('=== ORDER REQUEST SUCCESS ===');
        
        res.status(201).json(updated);
    } catch (err) {
        console.error('=== ORDER REQUEST FAILED ===');
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        console.error('===========================');
        
        res.status(500).json({ 
            message: 'Failed to create order', 
            error: err.message,
            details: err.toString()
        });
    }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};
