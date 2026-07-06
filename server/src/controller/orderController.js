const prisma = require('../db/prismaClient');

async function generateOrderCode(id) {
    const base = 99;
    return 'ORD' + String(base + id);
}

const serializeOrder = (order) => ({
    ...order,
    items: typeof order.items === 'string' ? JSON.parse(order.items || '[]') : Array.isArray(order.items) ? order.items : [],
    orderItems: order.orderItems || []
});

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

        let itemsJson = [];
        if (Array.isArray(items)) {
            itemsJson = items;
        } else if (typeof items === 'string') {
            try {
                itemsJson = JSON.parse(items);
            } catch (error) {
                itemsJson = [];
            }
        } else {
            itemsJson = items || [];
        }

        if (!itemsJson.length) {
            return res.status(400).json({ message: 'At least one item is required to place an order.' });
        }

        const normalizedCustomerId = req.user?.id || (customerId ? parseInt(customerId, 10) : null);

        const createdOrder = await prisma.$transaction(async (tx) => {
            const orderItemsData = [];
            const customer = normalizedCustomerId ? await tx.user.findUnique({ where: { id: normalizedCustomerId } }) : null;

            for (const rawItem of itemsJson) {
                const productId = Number(rawItem.productId || rawItem.id || rawItem._id || rawItem.product?.id);
                const quantity = Math.max(1, Number(rawItem.quantity || rawItem.qty || 1));
                const unitPrice = Number(rawItem.price || rawItem.unitPrice || 0);

                if (!productId) {
                    throw new Error('Each order item must include a valid product reference.');
                }

                const product = await tx.product.findUnique({ where: { id: productId } });
                if (!product) {
                    throw new Error(`Product ${productId} was not found.`);
                }
                if (product.status !== 'approved') {
                    throw new Error(`Product ${product.name} is not currently available.`);
                }
                if (product.stock < quantity) {
                    throw new Error(`Only ${product.stock} units of ${product.name} are available.`);
                }

                await tx.product.update({
                    where: { id: productId },
                    data: {
                        stock: product.stock - quantity
                    }
                });

                orderItemsData.push({
                    productId,
                    quantity,
                    price: unitPrice || product.price,
                    farmerId: product.farmerId
                });
            }

            const created = await tx.order.create({
                data: {
                    customerId: customer ? normalizedCustomerId : null,
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
                }
            });

            await Promise.all(orderItemsData.map((item) =>
                tx.orderItem.create({
                    data: {
                        orderId: created.id,
                        ...item
                    }
                })
            ));

            const orderCode = await generateOrderCode(created.id);
            const updated = await tx.order.update({
                where: { id: created.id },
                data: { orderCode }
            });

            return {
                ...updated,
                orderItems: orderItemsData.map((item) => ({ ...item, orderId: updated.id }))
            };
        });

        res.status(201).json(serializeOrder(createdOrder));
    } catch (error) {
        console.error('Failed to create order:', error);
        res.status(500).json({
            message: 'Failed to create order',
            error: error.message,
            details: error.toString()
        });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const requestedCustomerId = req.query.customerId ? parseInt(req.query.customerId, 10) : null;
        const where = req.user?.id ? { customerId: req.user.id } : requestedCustomerId ? { customerId: requestedCustomerId } : {};

        const orders = await prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { orderItems: { include: { product: true } } }
        });

        res.json(orders.map(serializeOrder));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: Number.isNaN(Number(orderId)) ? undefined : Number(orderId) },
                    { orderCode: orderId }
                ].filter(Boolean)
            },
            include: { orderItems: { include: { product: true } } }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(serializeOrder(order));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch order' });
    }
};
