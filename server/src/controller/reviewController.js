const prisma = require('../db/prismaClient');

const normalizeReview = (review, viewer) => {
    const isOwner = Boolean(viewer && review.userId && viewer.id && review.userId === viewer.id);
    const isAdmin = Boolean(viewer && viewer.role === 'ADMIN');
    const isPublic = Boolean(review.user?.privateAccount !== true);
    const canSeeIdentity = isOwner || isAdmin || isPublic;

    return {
        id: review.id,
        productId: review.productId,
        orderId: review.orderId || null,
        rating: Number(review.rating || 0),
        comment: review.comment || '',
        isApproved: review.isApproved,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        date: review.createdAt
            ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Recently added',
        user: canSeeIdentity
            ? {
                id: review.user?.id || null,
                name: review.user?.name || 'Private User',
                profileImage: review.user?.profileImage || null,
                privateAccount: review.user?.privateAccount || false,
            }
            : {
                id: review.user?.id || null,
                name: 'Private User',
                profileImage: null,
                privateAccount: true,
            },
        product: review.product
            ? {
                id: review.product.id,
                name: review.product.name,
                image: review.product.image || null,
            }
            : null,
    };
};

exports.createReview = async (req, res) => {
    try {
        const customerId = req.user?.id;
        const { productId, orderId, rating, comment } = req.body;

        if (!customerId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!productId) {
            return res.status(400).json({ message: 'Product is required' });
        }

        const parsedRating = Number(rating);
        if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // If orderId is provided, verify user owns it and order is delivered
        if (orderId) {
            const order = await prisma.order.findFirst({
                where: { id: Number(orderId), customerId: customerId }
            });
            if (!order) {
                return res.status(403).json({ message: 'You do not own this order' });
            }
            // Optional: Check if order is delivered before allowing review?
            // if (order.status !== 'delivered') { ... }
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: customerId,
                productId: Number(productId)
            }
        });

        if (existingReview) {
            const updated = await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    rating: parsedRating,
                    comment: comment?.trim() || '',
                    updatedAt: new Date()
                },
                include: { product: true, user: true }
            });

            return res.status(200).json({ success: true, data: normalizeReview(updated, req.user) });
        }

        const created = await prisma.review.create({
            data: {
                productId: Number(productId),
                userId: customerId,
                orderId: orderId ? Number(orderId) : null,
                rating: parsedRating,
                comment: comment?.trim() || '',
                updatedAt: new Date()
            },
            include: { product: true, user: true }
        });

        return res.status(201).json({ success: true, data: normalizeReview(created, req.user) });
    } catch (error) {
        console.error('Create review error:', error);
        return res.status(500).json({ message: 'Failed to save review', error: error.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const customerId = req.user?.id;
        const reviewId = Number(req.params.id);
        const { rating, comment } = req.body;

        if (!customerId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!reviewId) {
            return res.status(400).json({ message: 'Review ID is required' });
        }

        const parsedRating = Number(rating);
        if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const review = await prisma.review.findFirst({
            where: { id: reviewId, userId: customerId }
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const updated = await prisma.review.update({
            where: { id: reviewId },
            data: {
                rating: parsedRating,
                comment: comment?.trim() || '',
                updatedAt: new Date()
            }
        });

        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('Update review error:', error);
        return res.status(500).json({ message: 'Failed to update review', error: error.message });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        const viewer = req.user || null;

        const reviews = await prisma.review.findMany({
            where: {
                productId
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                productId: true,
                userId: true,
                rating: true,
                comment: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        privateAccount: true
                    }
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });

        return res.json({ success: true, data: reviews.map((review) => normalizeReview(review, viewer)) });
    } catch (error) {
        console.error('Get product reviews error:', error);
        return res.status(500).json({ message: 'Failed to load reviews', error: error.message });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const customerId = req.user?.id;
        if (!customerId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const reviews = await prisma.review.findMany({
            where: { userId: customerId },
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });

        return res.json({
            success: true, data: reviews.map((review) => ({
                id: review.id,
                productId: review.productId,
                orderId: review.orderId || null,
                rating: Number(review.rating || 0),
                comment: review.comment || '',
                createdAt: review.createdAt,
                updatedAt: review.updatedAt,
                product: review.product
            }))
        });
    } catch (error) {
        console.error('Get my reviews error:', error);
        return res.status(500).json({ message: 'Failed to load your reviews', error: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const customerId = req.user?.id;
        const reviewId = Number(req.params.id);

        if (!customerId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const review = await prisma.review.findFirst({
            where: { id: reviewId, userId: customerId }
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await prisma.review.delete({ where: { id: reviewId } });
        return res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('Delete review error:', error);
        return res.status(500).json({ message: 'Failed to delete review', error: error.message });
    }
};
