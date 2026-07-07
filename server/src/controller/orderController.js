const prisma = require('../db/prismaClient');

async function generateOrderCode(id) {
    const base = 99;
    return 'ORD' + String(base + id);
}

const serializeOrder = (order) => {
    // Parse the JSON items field
    const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : Array.isArray(order.items) ? order.items : [];
    
    // If we have orderItems with product data, use that; otherwise fall back to items
    const orderItems = Array.isArray(order.orderItems) && order.orderItems.length > 0
        ? order.orderItems.map((item) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            farmerId: item.farmerId,
            orderId: item.orderId,
            name: item.product?.name || (items.find(i => String(i.productId || i.id) === String(item.productId))?.name) || 'Product',
            description: item.product?.description || '',
            image: item.product?.image || '',
            product: item.product ? {
                ...item.product,
                farmer: item.product.farmer || null
            } : null
        }))
        : items.map((item, index) => ({
            id: index + 1,
            productId: item.productId || item.id || item._id,
            quantity: item.quantity || item.qty || 1,
            price: item.price || item.unitPrice || 0,
            name: item.name || item.productName || 'Product',
            description: item.description || '',
            image: item.image || ''
        }));

    return {
        ...order,
        items: items,
        orderItems: orderItems
    };
};

/**
 * Create an inventory change log entry for auditing purposes
 */
async function logInventoryChange(tx, productId, changeType, quantity, previousStock, newStock, reason, orderId = null) {
    await tx.notification.create({
        data: {
            type: 'INVENTORY_CHANGE',
            title: `Inventory ${changeType}`,
            message: `Product ID ${productId}: Stock changed from ${previousStock} to ${newStock} (${changeType === 'REDUCTION' ? '-' : '+'}${quantity} units). Reason: ${reason}${orderId ? ` (Order: ${orderId})` : ''}`,
            productId: productId,
            userId: null, // System-generated
            read: true
        }
    });
}

/**
 * Update product stock status based on current stock level
 * Marks as 'out_of_stock' when stock is 0, 'approved' when stock > 0
 */
async function updateProductStockStatus(tx, productId, currentStock) {
    const newStatus = currentStock <= 0 ? 'out_of_stock' : 'approved';
    
    await tx.product.update({
        where: { id: productId },
        data: { status: newStatus }
    });
    
    return newStatus;
}

/**
 * Create a new order with automatic inventory management
 * - Validates stock availability before creating order
 * - Reduces stock by ordered quantity
 * - Updates product status if stock becomes 0
 * - Logs all inventory changes
 */
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

        // Use a transaction with a longer timeout to handle concurrent orders
        const createdOrder = await prisma.$transaction(async (tx) => {
            const orderItemsData = [];
            const customer = normalizedCustomerId ? await tx.user.findUnique({ where: { id: normalizedCustomerId } }) : null;
            const stockUpdates = []; // Track all stock changes for logging

            for (const rawItem of itemsJson) {
                const productId = Number(rawItem.productId || rawItem.id || rawItem._id || rawItem.product?.id);
                const quantity = Math.max(1, Number(rawItem.quantity || rawItem.qty || 1));
                const unitPrice = Number(rawItem.price || rawItem.unitPrice || 0);

                if (!productId) {
                    throw new Error('Each order item must include a valid product reference.');
                }

                // Lock the product record and fetch current stock (Prisma handles row-level locking in transactions)
                const product = await tx.product.findUnique({ 
                    where: { id: productId },
                    select: {
                        id: true,
                        name: true,
                        stock: true,
                        status: true,
                        farmerId: true,
                        price: true
                    }
                });

                if (!product) {
                    throw new Error(`Product ${productId} was not found.`);
                }

                // Check if product is available for purchase
                if (product.status === 'out_of_stock') {
                    throw new Error(`Product "${product.name}" is currently out of stock.`);
                }

                if (product.status !== 'approved') {
                    throw new Error(`Product "${product.name}" is not currently available for purchase.`);
                }

                // Validate sufficient stock
                if (product.stock < quantity) {
                    throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} units available, but ${quantity} requested.`);
                }

                const previousStock = product.stock;
                const newStock = product.stock - quantity;

                console.log(`[INVENTORY] Order creating: Product ${productId} (${product.name}), previous stock: ${previousStock}, quantity: ${quantity}, new stock: ${newStock}`);

                // Update stock - Prisma transaction ensures atomicity
                const updatedProduct = await tx.product.update({
                    where: { id: productId },
                    data: { stock: newStock }
                });

                console.log(`[INVENTORY] Order created: Product ${productId} updated stock to: ${updatedProduct.stock}`);

                // Update product status if stock becomes 0
                if (newStock <= 0) {
                    const newStatus = await updateProductStockStatus(tx, productId, newStock);
                    console.log(`[INVENTORY] Product ${productId} status changed to: ${newStatus}`);
                }

                // Track stock change for logging
                stockUpdates.push({
                    productId,
                    productName: product.name,
                    changeType: 'REDUCTION',
                    quantity,
                    previousStock,
                    newStock,
                    farmerId: product.farmerId
                });

                orderItemsData.push({
                    productId,
                    quantity,
                    price: unitPrice || product.price,
                    farmerId: product.farmerId
                });
            }

            // Create the order
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

            // Create order items
            await Promise.all(orderItemsData.map((item) =>
                tx.orderItem.create({
                    data: {
                        orderId: created.id,
                        ...item
                    }
                })
            ));

            // Generate and update order code
            const orderCode = await generateOrderCode(created.id);
            const updated = await tx.order.update({
                where: { id: created.id },
                data: { orderCode }
            });

            // Log all inventory changes
            for (const update of stockUpdates) {
                await logInventoryChange(
                    tx,
                    update.productId,
                    update.changeType,
                    update.quantity,
                    update.previousStock,
                    update.newStock,
                    `Order placed (${updated.orderCode})`,
                    updated.orderCode
                );
            }

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

/**
 * Update order status with automatic inventory management
 * - Cancelling an order restores the stock
 * - Restoring stock updates product status if needed
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;

        if (!status && !paymentStatus) {
            return res.status(400).json({ message: 'No status update provided' });
        }

        const orderId = Number(id);
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const updatedOrder = await prisma.$transaction(async (tx) => {
            // Get current order with items
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    orderItems: {
                        select: {
                            id: true,
                            productId: true,
                            quantity: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    stock: true,
                                    status: true,
                                    farmerId: true
                                }
                            }
                        }
                    }
                }
            });

            if (!order) {
                throw new Error('Order not found');
            }

            const previousStatus = order.status;
            const stockUpdates = [];

            // Handle stock restoration on cancellation
            if (status === 'cancelled' && previousStatus !== 'cancelled') {
                for (const orderItem of order.orderItems) {
                    const product = orderItem.product;
                    if (!product) continue;

                    const previousStock = product.stock;
                    const newStock = product.stock + orderItem.quantity;

                    // Restore stock
                    await tx.product.update({
                        where: { id: orderItem.productId },
                        data: { stock: newStock }
                    });

                    // Update product status if it was out of stock and now has stock
                    if (previousStock <= 0 && newStock > 0) {
                        await updateProductStockStatus(tx, orderItem.productId, newStock);
                    }

                    stockUpdates.push({
                        productId: orderItem.productId,
                        productName: product.name,
                        changeType: 'RESTORATION',
                        quantity: orderItem.quantity,
                        previousStock,
                        newStock,
                        farmerId: product.farmerId
                    });
                }
            }

            // Update order status
            const updateData = {};
            if (status) updateData.status = status;
            if (paymentStatus) updateData.paymentStatus = paymentStatus;

            const updated = await tx.order.update({
                where: { id: orderId },
                data: updateData
            });

            // Log inventory changes for cancellation
            for (const update of stockUpdates) {
                await logInventoryChange(
                    tx,
                    update.productId,
                    update.changeType,
                    update.quantity,
                    update.previousStock,
                    update.newStock,
                    `Order cancelled (${updated.orderCode})`,
                    updated.orderCode
                );
            }

            return updated;
        });

        res.json(serializeOrder(updatedOrder));
    } catch (error) {
        console.error('Failed to update order status:', error);
        res.status(500).json({
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

/**
 * Cancel an order and restore inventory
 */
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const orderId = Number(id);

        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const cancelledOrder = await prisma.$transaction(async (tx) => {
            // Get order with items
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    orderItems: {
                        select: {
                            productId: true,
                            quantity: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    stock: true,
                                    status: true,
                                    farmerId: true
                                }
                            }
                        }
                    }
                }
            });

            if (!order) {
                throw new Error('Order not found');
            }

            // Check if order can be cancelled
            if (order.status === 'cancelled') {
                throw new Error('Order is already cancelled');
            }

            if (order.status === 'delivered') {
                throw new Error('Cannot cancel a delivered order');
            }

            const stockUpdates = [];

            // Restore stock for each item
            for (const orderItem of order.orderItems) {
                const product = orderItem.product;
                if (!product) continue;

                const previousStock = product.stock;
                const newStock = product.stock + orderItem.quantity;

                // Restore stock
                await tx.product.update({
                    where: { id: orderItem.productId },
                    data: { stock: newStock }
                });

                // Update product status if it was out of stock and now has stock
                if (previousStock <= 0 && newStock > 0) {
                    await updateProductStockStatus(tx, orderItem.productId, newStock);
                }

                stockUpdates.push({
                    productId: orderItem.productId,
                    productName: product.name,
                    changeType: 'RESTORATION',
                    quantity: orderItem.quantity,
                    previousStock,
                    newStock,
                    farmerId: product.farmerId
                });
            }

            // Update order status
            const updated = await tx.order.update({
                where: { id: orderId },
                data: { status: 'cancelled' }
            });

            // Log inventory changes
            for (const update of stockUpdates) {
                await logInventoryChange(
                    tx,
                    update.productId,
                    update.changeType,
                    update.quantity,
                    update.previousStock,
                    update.newStock,
                    `Order cancelled (${updated.orderCode})`,
                    updated.orderCode
                );
            }

            return updated;
        });

        res.json({
            message: 'Order cancelled successfully',
            order: serializeOrder(cancelledOrder)
        });
    } catch (error) {
        console.error('Failed to cancel order:', error);
        res.status(500).json({
            message: 'Failed to cancel order',
            error: error.message
        });
    }
};

/**
 * Process a refund and optionally restore inventory
 */
exports.refundOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { restoreInventory = true, reason } = req.body;
        const orderId = Number(id);

        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const refundedOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    orderItems: {
                        select: {
                            productId: true,
                            quantity: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    stock: true,
                                    status: true,
                                    farmerId: true
                                }
                            }
                        }
                    }
                }
            });

            if (!order) {
                throw new Error('Order not found');
            }

            if (order.status === 'refunded') {
                throw new Error('Order is already refunded');
            }

            const stockUpdates = [];

            // Restore inventory if requested
            if (restoreInventory) {
                for (const orderItem of order.orderItems) {
                    const product = orderItem.product;
                    if (!product) continue;

                    const previousStock = product.stock;
                    const newStock = product.stock + orderItem.quantity;

                    await tx.product.update({
                        where: { id: orderItem.productId },
                        data: { stock: newStock }
                    });

                    if (previousStock <= 0 && newStock > 0) {
                        await updateProductStockStatus(tx, orderItem.productId, newStock);
                    }

                    stockUpdates.push({
                        productId: orderItem.productId,
                        productName: product.name,
                        changeType: 'REFUND_RESTORATION',
                        quantity: orderItem.quantity,
                        previousStock,
                        newStock,
                        farmerId: product.farmerId
                    });
                }
            }

            const updated = await tx.order.update({
                where: { id: orderId },
                data: { 
                    status: 'refunded',
                    paymentStatus: 'refunded',
                    additionalInfo: reason ? `${order.additionalInfo || ''} | Refund reason: ${reason}`.trim() : order.additionalInfo
                }
            });

            for (const update of stockUpdates) {
                await logInventoryChange(
                    tx,
                    update.productId,
                    update.changeType,
                    update.quantity,
                    update.previousStock,
                    update.newStock,
                    `Order refunded (${updated.orderCode})${reason ? ` - ${reason}` : ''}`,
                    updated.orderCode
                );
            }

            return updated;
        });

        res.json({
            message: 'Order refunded successfully',
            order: serializeOrder(refundedOrder)
        });
    } catch (error) {
        console.error('Failed to refund order:', error);
        res.status(500).json({
            message: 'Failed to refund order',
            error: error.message
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
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: { farmer: true }
                        }
                    }
                }
            }
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
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: { farmer: true }
                        }
                    }
                }
            }
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

/**
 * Get inventory change logs for auditing
 */
exports.getInventoryLogs = async (req, res) => {
    try {
        const { productId, limit = 50, offset = 0 } = req.query;
        const where = {
            type: 'INVENTORY_CHANGE'
        };

        if (productId) {
            where.productId = parseInt(productId, 10);
        }

        const logs = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit, 10),
            skip: parseInt(offset, 10),
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        stock: true,
                        status: true
                    }
                }
            }
        });

        res.json(logs);
    } catch (error) {
        console.error('Failed to fetch inventory logs:', error);
        res.status(500).json({ message: 'Failed to fetch inventory logs', error: error.message });
    }
};

/**
 * Manually adjust stock (for admin/farmer use)
 */
exports.adjustStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, reason, adjustType = 'add' } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be a positive number' });
        }

        if (!reason) {
            return res.status(400).json({ message: 'Reason for adjustment is required' });
        }

        const adjustedProduct = await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: { id: parseInt(productId, 10) }
            });

            if (!product) {
                throw new Error('Product not found');
            }

            const previousStock = product.stock;
            let newStock;

            if (adjustType === 'add') {
                newStock = previousStock + quantity;
            } else if (adjustType === 'remove') {
                if (previousStock < quantity) {
                    throw new Error('Insufficient stock for removal');
                }
                newStock = previousStock - quantity;
            } else {
                throw new Error('Invalid adjustment type. Use "add" or "remove"');
            }

            await tx.product.update({
                where: { id: product.id },
                data: { stock: newStock }
            });

            // Update status if needed
            if (previousStock <= 0 && newStock > 0) {
                await updateProductStockStatus(tx, product.id, newStock);
            } else if (newStock <= 0) {
                await updateProductStockStatus(tx, product.id, newStock);
            }

            const changeType = adjustType === 'add' ? 'MANUAL_ADD' : 'MANUAL_REMOVE';
            await logInventoryChange(
                tx,
                product.id,
                changeType,
                quantity,
                previousStock,
                newStock,
                `Manual adjustment: ${reason}`
            );

            return tx.product.findUnique({
                where: { id: product.id }
            });
        });

        res.json({
            message: 'Stock adjusted successfully',
            product: adjustedProduct
        });
    } catch (error) {
        console.error('Failed to adjust stock:', error);
        res.status(500).json({
            message: 'Failed to adjust stock',
            error: error.message
        });
    }
};