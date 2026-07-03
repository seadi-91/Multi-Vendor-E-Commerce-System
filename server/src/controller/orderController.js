const prisma = require('../db/prismaClient');

// Helper to build orderCode like ORD100, ORD101...
async function generateOrderCode(id) {
    // Start from 100: ORD100 corresponds to id 1
    const base = 99;
    return 'ORD' + String(base + id);
}

exports.createOrder = async (req, res) => {
    try {
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

        const created = await prisma.order.create({
            data: {
                customerId: customerId || null,
                items: items || {},
                total: total || 0,
                subtotal: subtotal || 0,
                deliveryFee,
                tax,
                status,
                paymentMethod,
                paymentStatus,
                fullName,
                email,
                phone,
                city,
                address,
                additionalInfo,
                vendor,
                restaurant,
                estimatedDelivery,
                specialInstructions,
                orderCode: `TEMP-${Date.now()}-${Math.floor(Math.random() * 10000)}`
            },
        });

        const orderCode = await generateOrderCode(created.id);

        const updated = await prisma.order.update({
            where: { id: created.id },
            data: { orderCode },
        });
        res.status(201).json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create order' });
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
