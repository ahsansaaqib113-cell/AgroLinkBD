require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('./src/models/User');
const Farmer = require('./src/models/Farmer');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Coupon = require('./src/models/Coupon');
const Order = require('./src/models/Order');
const Notification = require('./src/models/Notification');
const BulkRequest = require('./src/models/BulkRequest');
const Cart = require('./src/models/Cart');
const Wishlist = require('./src/models/Wishlist');
const Review = require('./src/models/Review');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agrolink');
    console.log('Database connected for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Farmer.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    await Notification.deleteMany({});
    await BulkRequest.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Create Categories
    const categoriesData = [
      { name: 'Vegetables', description: 'Fresh farm-picked greens, tubers, and gourds' },
      { name: 'Fruits', description: 'Organic seasonal mangoes, jackfruits, and berries' },
      { name: 'Rice', description: 'High-quality Miniket, Nazirshail, and Chinigura rice' },
      { name: 'Fish', description: 'River and pond fresh Hilsa, Rui, Katla, and Prawns' },
      { name: 'Dairy', description: 'Pure cow milk, ghee, paneer, and sweets' },
      { name: 'Poultry', description: 'Farm fresh chicken, duck eggs, and broiler meat' },
      { name: 'Organic Products', description: 'Chemical-free grains, honey, and mustard oil' },
    ];
    const categories = await Category.insertMany(categoriesData);
    console.log(`Seeded ${categories.length} categories.`);

    // Map categories by name for easy lookup
    const catMap = {};
    categories.forEach(c => {
      catMap[c.name] = c._id;
    });

    // 2. Create Users (We hash passwords manually here or let schema pre-save handle it)
    // Pre-save works only on .save() or .create(). It does NOT work on insertMany unless we loop, so let's loop or use User.create
    const usersInfo = [
      { name: 'AgroLink Admin', email: 'admin@agrolink.com', password: 'password123', phone: '01711111111', role: 'admin' },
      { name: 'Rahim Ali', email: 'rahim@agrolink.com', password: 'password123', phone: '01822222222', role: 'farmer' },
      { name: 'Karim Uddin', email: 'karim@agrolink.com', password: 'password123', phone: '01933333333', role: 'farmer' },
      { name: 'Sajid Ahmed', email: 'buyer@agrolink.com', password: 'password123', phone: '01544444444', role: 'customer' },
      { name: 'Dhaka Restaurant Group', email: 'restaurant@agrolink.com', password: 'password123', phone: '01655555555', role: 'business' },
    ];

    const seededUsers = [];
    for (const u of usersInfo) {
      const user = await User.create(u);
      seededUsers.push(user);
    }
    console.log(`Seeded ${seededUsers.length} users.`);

    const adminUser = seededUsers[0];
    const farmer1 = seededUsers[1];
    const farmer2 = seededUsers[2];
    const customer = seededUsers[3];
    const businessBuyer = seededUsers[4];

    // 3. Create Farmer Profiles
    const rahimProfile = await Farmer.create({
      user: farmer1._id,
      farmName: 'Golden Fields Agritech',
      farmSize: 3.5,
      categoryFocus: ['Vegetables', 'Organic Products', 'Rice'],
      description: 'Golden Fields is situated in Bogra, known for organic vegetables and long-grain premium paddy cultivation.',
      rating: 4.8,
      reviewsCount: 12,
      isVerified: true,
      earnings: 45000,
      completedOrders: 15,
    });

    const karimProfile = await Farmer.create({
      user: farmer2._id,
      farmName: 'Riverview Fishery & Poultry',
      farmSize: 2.2,
      categoryFocus: ['Fish', 'Poultry', 'Dairy'],
      description: 'Located in Mymensingh, specializing in freshwater cage culture aquaculture and free-range duck egg production.',
      rating: 4.9,
      reviewsCount: 8,
      isVerified: true,
      earnings: 68000,
      completedOrders: 19,
    });
    console.log('Seeded farmer profiles.');

    // 4. Seed Products
    const productsData = [
      // Vegetables
      {
        name: 'Fresh Red Tomato',
        description: 'Naturally ripened organic tomatoes directly harvested from Bogra. Excellent texture and rich flavor.',
        category: catMap['Vegetables'],
        farmer: farmer1._id,
        price: 45,
        wholesalePrice: 35,
        minWholesaleQty: 50,
        unit: 'kg',
        stock: 500,
        images: ['https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600'],
        rating: 4.6,
        reviewsCount: 5,
        status: 'approved',
      },
      {
        name: 'Organic Green Chili',
        description: 'Pungent local variety green chilies grown without chemical pesticides. High spice content.',
        category: catMap['Vegetables'],
        farmer: farmer1._id,
        price: 90,
        wholesalePrice: 75,
        minWholesaleQty: 25,
        unit: 'kg',
        stock: 200,
        images: ['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=600'],
        rating: 4.5,
        reviewsCount: 3,
        status: 'approved',
      },
      // Rice
      {
        name: 'Premium Miniket Rice',
        description: 'Double polished long-grain Miniket rice harvested from Naogaon fields. Cleaned and packaged hygienically.',
        category: catMap['Rice'],
        farmer: farmer1._id,
        price: 70,
        wholesalePrice: 62,
        minWholesaleQty: 10, // 10 maunds (actually sacks here)
        unit: 'sack', // Representing 50kg sack
        stock: 80,
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600'],
        rating: 4.7,
        reviewsCount: 7,
        status: 'approved',
      },
      // Fish
      {
        name: 'Freshwater Rui Fish',
        description: 'Medium-sized pond harvested Rui (Labeo rohita). Harvested on order day and shipped in cold-chain boxes.',
        category: catMap['Fish'],
        farmer: farmer2._id,
        price: 350,
        wholesalePrice: 290,
        minWholesaleQty: 20,
        unit: 'kg',
        stock: 150,
        images: ['https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80&w=600'],
        rating: 4.9,
        reviewsCount: 4,
        status: 'approved',
      },
      {
        name: 'Chandpur Padma Hilsa',
        description: 'Authentic silver Hilsa from Padma River, famous for its sweet flavor and fat content. Weight: 900g - 1kg.',
        category: catMap['Fish'],
        farmer: farmer2._id,
        price: 1300,
        wholesalePrice: 1150,
        minWholesaleQty: 10,
        unit: 'piece',
        stock: 40,
        images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600'],
        rating: 5.0,
        reviewsCount: 11,
        status: 'approved',
      },
      // Dairy
      {
        name: 'Pure Cow Milk',
        description: 'Untreated, raw, pasteurization-ready full-cream cow milk from dairy farms in Sirajganj.',
        category: catMap['Dairy'],
        farmer: farmer2._id,
        price: 85,
        wholesalePrice: 70,
        minWholesaleQty: 30,
        unit: 'kg',
        stock: 300,
        images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600'],
        rating: 4.8,
        reviewsCount: 8,
        status: 'approved',
      },
      // Organic
      {
        name: 'Organic Mustard Oil (Ghani-Bhanga)',
        description: 'Cold-pressed mustard oil extracted using traditional wooden ghani. 100% pure, strong aroma.',
        category: catMap['Organic Products'],
        farmer: farmer1._id,
        price: 260,
        wholesalePrice: 230,
        minWholesaleQty: 12,
        unit: 'piece', // 1L bottle
        stock: 120,
        images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600'],
        rating: 4.9,
        reviewsCount: 9,
        status: 'approved',
      },
    ];

    const seededProducts = await Product.insertMany(productsData);
    console.log(`Seeded ${seededProducts.length} products.`);

    // 5. Seed Coupons
    const couponsData = [
      {
        code: 'FRESH10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 500,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
        isActive: true,
      },
      {
        code: 'KALLYAN200',
        discountType: 'flat',
        discountValue: 200,
        minOrderAmount: 1500,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ];
    await Coupon.insertMany(couponsData);
    console.log('Seeded promotional coupons.');

    // 6. Seed Notifications (demo)
    await Notification.create({
      user: customer._id,
      title: 'Welcome to AgroLink BD',
      message: 'Explore fresh products from verified farmers of Bangladesh.',
      type: 'general',
    });

    console.log('Seeding completed successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
