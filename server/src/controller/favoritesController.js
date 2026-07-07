const prisma = require('../db/prismaClient');

const buildProductPayload = (product) => {
    if (!product) return null;

    const reviews = Array.isArray(product.reviews) ? product.reviews : [];
    const reviewCount = reviews.length || Number(product.reviewsCount || 0);
    const averageRating = reviewCount
        ? Number((reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount).toFixed(1))
        : Number(product.rating || 4.5);

    const price = Number(product.price || 0);
    const discountPrice = Number(product.discountPrice || 0);

    return {
        ...product,
        reviews,
        vendor: product.farmer?.farmName || product.farmer?.name || 'Fresh Vendor',
        vendorVerified: Boolean(product.farmer?.isVerified),
        rating: averageRating,
        reviewsCount: reviewCount,
        stock: Number(product.stock || 0),
        price,
        discountPrice: discountPrice || undefined,
        discountPercent: discountPrice && price
            ? Math.round((1 - discountPrice / price) * 100)
            : 0,
    };
};

exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    include: {
                        farmer: {
                            select: { id: true, name: true, farmName: true, isVerified: true }
                        },
                        reviews: {
                            select: { rating: true, createdAt: true, user: { select: { name: true, profileImage: true, privateAccount: true } } }
                        }
                    }
                }
            }
        });

        const items = favorites
            .map((entry) => entry.product)
            .filter(Boolean)
            .filter((product) => product.status !== 'deleted' && product.status !== 'rejected')
            .map(buildProductPayload)
            .filter(Boolean);

        res.json({ success: true, data: items });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Failed to fetch favorites', error: error.message });
    }
};

exports.addFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const favorite = await prisma.favorite.upsert({
            where: { userId_productId: { userId, productId: Number(productId) } },
            update: {},
            create: { userId, productId: Number(productId) },
        });

        res.status(201).json({ success: true, data: favorite });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ message: 'Failed to add favorite', error: error.message });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = Number(req.params.productId);

        if (!Number.isFinite(productId)) {
            return res.status(400).json({ message: 'Product ID is invalid' });
        }

        await prisma.favorite.deleteMany({
            where: { userId, productId }
        });

        res.json({ success: true, message: 'Favorite removed' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ message: 'Failed to remove favorite', error: error.message });
    }
};
