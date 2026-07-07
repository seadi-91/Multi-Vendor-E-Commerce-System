const prisma = require('../db/prismaClient');

const buildProductPayload = (product) => {
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewCount = reviews.length || Number(product.reviewsCount || 0);
  const averageRating = reviewCount
    ? Number((reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount).toFixed(1))
    : Number(product.rating || 4.5);

  const normalizedReviews = reviews.map((review) => ({
    ...review,
    user: review.user?.name || review.userName || 'Anonymous',
    userName: review.user?.name || review.userName || 'Anonymous',
    profileImage: review.user?.profileImage || null,
    privateAccount: review.user?.privateAccount || false,
    date: review.createdAt
      ? new Date(review.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      : 'Recently added',
  }));

  return {
    ...product,
    reviews: normalizedReviews,
    vendor: product.farmer?.farmName || product.farmer?.name || 'Fresh Vendor',
    vendorVerified: product.farmer?.isVerified || false,
    rating: averageRating,
    reviewsCount: reviewCount,
    discountPercent: product.discountPrice ? Math.round((1 - product.discountPrice / product.price) * 100) : 0
  };
};

// Get all approved products (public endpoint)
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      brand,
      minPrice,
      maxPrice,
      rating,
      sortBy = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    const where = { status: 'approved' };
    const filters = [];

    if (category) {
      filters.push({ category: { contains: category, mode: 'insensitive' } });
    }

    if (brand) {
      filters.push({ brand: { contains: brand, mode: 'insensitive' } });
    }

    if (search) {
      filters.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      filters.push({ price: priceFilter });
    }

    if (filters.length) {
      where.AND = filters;
    }

    let orderBy = { createdAt: 'desc' };
    switch (sortBy) {
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      skip,
      take: parsedLimit,
      include: {
        farmer: {
          select: { id: true, name: true, farmName: true, isVerified: true }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy
    });

    let mappedProducts = products.map(buildProductPayload);
    if (rating) {
      mappedProducts = mappedProducts.filter((product) => Number(product.rating || 0) >= Number(rating));
    }

    const total = await prisma.product.count({ where });

    res.json({
      success: true,
      data: mappedProducts,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.json({
      success: true,
      data: [],
      total: 0,
      page: 1,
      pages: 0,
      error: error.message
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        farmer: {
          select: { id: true, name: true, farmName: true, isVerified: true }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only show approved products to public
    if (product.status !== 'approved') {
      return res.status(404).json({ message: 'Product not available' });
    }

    res.json({ success: true, data: buildProductPayload(product) });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const products = await prisma.product.findMany({
      where: {
        status: 'approved',
        category: { contains: category, mode: 'insensitive' }
      },
      take: parseInt(limit, 10),
      include: {
        farmer: {
          select: { id: true, name: true, farmName: true, isVerified: true }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: products.map(buildProductPayload) });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};
