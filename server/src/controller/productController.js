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
    vendorVerified: Boolean(product.farmer?.isVerified),
    rating: averageRating,
    reviewsCount: reviewCount,
    stock: Number(product.stock || 0),
    price: Number(product.price || 0),
    discountPercent: product.discountPrice && Number(product.price)
      ? Math.round((1 - Number(product.discountPrice) / Number(product.price)) * 100)
      : 0
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
      orderBy,
      include: {
        farmer: {
          select: { id: true, name: true, farmName: true, isVerified: true }
        }
      }
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
    const productId = parseInt(req.params.id, 10);

    // 1. Increment views and fetch product along with farmer profile
    let product;
    try {
      product = await prisma.product.update({
        where: { id: productId },
        data: { views: { increment: 1 } },
        include: {
          farmer: true
        }
      });
    } catch (err) {
      // If product doesn't exist or other error
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only show approved products to public
    if (product.status !== 'approved') {
      return res.status(404).json({ message: 'Product not available' });
    }

    // 2. Fetch favorites count
    const favoritesCount = await prisma.favorite.count({
      where: { productId }
    });

    // 3. Fetch approved reviews for rating statistics breakdown
    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            privateAccount: true
          }
        }
      }
    });

    const reviewsCount = reviews.length;
    const averageRating = reviewsCount
      ? Number((reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewsCount).toFixed(1))
      : Number(product.rating || 4.5);

    // 4. Fetch farmer statistics
    // Average farmer rating & total reviews received
    const farmerProducts = await prisma.product.findMany({
      where: { farmerId: product.farmerId },
      select: { id: true }
    });
    const farmerProductIds = farmerProducts.map(p => p.id);

    const totalFarmerReviews = await prisma.review.count({
      where: { productId: { in: farmerProductIds }, isApproved: true }
    });

    const farmerReviewsAggregate = await prisma.review.aggregate({
      where: { productId: { in: farmerProductIds }, isApproved: true },
      _avg: { rating: true }
    });
    const averageFarmerRating = farmerReviewsAggregate._avg.rating
      ? Number(farmerReviewsAggregate._avg.rating.toFixed(1))
      : 0;

    // Total products listed
    const totalFarmerProducts = await prisma.product.count({
      where: { farmerId: product.farmerId, status: 'approved' }
    });

    // Total completed sales
    const completedSales = await prisma.orderItem.count({
      where: {
        farmerId: product.farmerId,
        order: { status: 'completed' }
      }
    });

    // Build public farmer info object (respecting privacy settings)
    const farmerInfo = {
      id: product.farmer.id,
      name: product.farmer.name,
      farmName: product.farmer.farmName || 'Fresh Farm',
      farmSize: product.farmer.farmSize,
      bio: product.farmer.bio,
      profileImage: product.farmer.profileImage,
      location: product.farmer.location || product.farmer.address,
      createdAt: product.farmer.createdAt,
      isVerified: Boolean(product.farmer.isVerified),
      averageRating: averageFarmerRating,
      totalReviews: totalFarmerReviews,
      totalProducts: totalFarmerProducts,
      completedSales: completedSales,
      // Expose contact details if allowed
      email: product.farmer.showEmailOnProfile ? product.farmer.email : null,
      phone: product.farmer.showPhoneOnProfile ? product.farmer.phone : null,
      address: product.farmer.showAddressOnProfile ? product.farmer.address : null,
    };

    // 5. Fetch More Products from this farmer
    const rawMoreProducts = await prisma.product.findMany({
      where: {
        farmerId: product.farmerId,
        status: 'approved',
        id: { not: productId }
      },
      take: 4,
      include: {
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      }
    });

    const moreProducts = rawMoreProducts.map(p => {
      const pReviewsCount = p.reviews.length;
      const pAvgRating = pReviewsCount
        ? Number((p.reviews.reduce((sum, r) => sum + r.rating, 0) / pReviewsCount).toFixed(1))
        : 4.5;
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice,
        image: p.image,
        stock: p.stock,
        unit: p.unit,
        rating: pAvgRating,
        reviewsCount: pReviewsCount
      };
    });

    // 6. Fetch Related Products (same category or similar tags)
    const orConditions = [{ category: product.category }];
    if (product.tags && product.tags.length > 0) {
      orConditions.push({ tags: { hasSome: product.tags } });
    }
    const rawRelatedProducts = await prisma.product.findMany({
      where: {
        status: 'approved',
        id: { not: productId },
        OR: orConditions
      },
      take: 4,
      include: {
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      }
    });

    const relatedProducts = rawRelatedProducts.map(p => {
      const pReviewsCount = p.reviews.length;
      const pAvgRating = pReviewsCount
        ? Number((p.reviews.reduce((sum, r) => sum + r.rating, 0) / pReviewsCount).toFixed(1))
        : 4.5;
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice,
        image: p.image,
        stock: p.stock,
        unit: p.unit,
        rating: pAvgRating,
        reviewsCount: pReviewsCount
      };
    });

    // Map base product payload
    const basePayload = buildProductPayload({
      ...product,
      reviews // pass the approved reviews so they get normalized
    });

    res.json({
      success: true,
      data: {
        ...basePayload,
        views: product.views,
        favoritesCount,
        rating: averageRating,
        reviewsCount,
        farmer: farmerInfo,
        moreProducts,
        relatedProducts
      }
    });

  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Failed to fetch product details', error: error.message });
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

// Get all distinct categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('Fetched categories:', categories.map(c => ({ id: c.id, name: c.name, categoryKey: c.categoryKey })));

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

// Get first 4 categories with 4 products each (for homepage)
exports.getCategoriesWithProducts = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      take: 4,
      orderBy: { name: 'asc' },
      include: {
        products: {
          where: { status: 'approved' },
          take: 4,
          select: {
            id: true,
            name: true,
            image: true,
            categoryId: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Transform to include mosaicImages array
    const transformedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      categoryKey: cat.categoryKey,
      description: cat.description,
      mosaicImages: cat.products.map(p => p.image).filter(Boolean)
    }));

    console.log('Fetched first 4 categories with products:', transformedCategories.map(c => ({ id: c.id, name: c.name, productCount: c.mosaicImages.length })));

    res.json({ success: true, data: transformedCategories });
  } catch (error) {
    console.error('Error fetching categories with products:', error);
    res.status(500).json({ message: 'Failed to fetch categories with products', error: error.message });
  }
};

// Get products by category ID
exports.getProductsByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 4 } = req.query;

    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    const products = await prisma.product.findMany({
      where: {
        status: 'approved',
        categoryId: parseInt(categoryId, 10)
      },
      take: parseInt(limit, 10),
      include: {
        farmer: {
          select: { id: true, name: true, farmName: true, isVerified: true }
        },
        categoryRel: {
          select: { id: true, name: true, categoryKey: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Fetched ${products.length} products for category ID ${categoryId}:`, products.map(p => ({ id: p.id, name: p.name, categoryId: p.categoryId })));

    res.json({ success: true, data: products.map(buildProductPayload) });
  } catch (error) {
    console.error('Error fetching products by category ID:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};
