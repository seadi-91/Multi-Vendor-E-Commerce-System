const prisma = require('../db/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

function buildCustomerRegistrationData({
  name,
  email,
  password,
  role,
  address,
  phone,
  profileImage,
  nationalId,
  tinNumber,
  landMapFile,
  farmName,
  farmSize,
  bio
}) {
  const normalizedRole = String(role || 'CUSTOMER').toUpperCase();
  const userData = {
    name,
    email,
    password,
    role: normalizedRole === 'FARMER' ? 'FARMER' : (normalizedRole === 'ADMIN' ? 'ADMIN' : 'CUSTOMER'),
    address: normalizedRole === 'FARMER' ? (address || null) : null
  };

  if (phone && typeof phone === 'string' && phone.trim()) userData.phone = phone.trim();
  if (tinNumber && typeof tinNumber === 'string' && tinNumber.trim()) userData.tinNumber = tinNumber.trim();
  if (profileImage && typeof profileImage === 'string' && profileImage.trim()) userData.profileImage = profileImage.trim();
  if (nationalId && typeof nationalId === 'string' && nationalId.trim()) userData.nationalId = nationalId.trim();
  if (landMapFile && typeof landMapFile === 'string' && landMapFile.trim()) userData.landMapFile = landMapFile.trim();

  // Farmer-specific fields
  if (normalizedRole === 'farmer') {
    if (farmName && typeof farmName === 'string' && farmName.trim()) userData.farmName = farmName.trim();
    if (farmSize && typeof farmSize === 'string' && farmSize.trim()) userData.farmSize = farmSize.trim();
    if (bio && typeof bio === 'string' && bio.trim()) userData.bio = bio.trim();
  }

  return userData;
}

exports.buildCustomerRegistrationData = buildCustomerRegistrationData;

exports.register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);

    const body = req.body || {};
    const {
      name,
      email,
      password,
      role,
      address,
      phone,
      profileImage,
      nationalId,
      tinNumber,
      landMapFile,
      farmName,
      farmSize,
      bio,
      city,
    } = body;
    const normalizedRole = String(role || 'customer').toLowerCase();

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!password || !String(password).trim()) {
      return res.status(400).json({ message: 'Password is required' });
    }
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    if (normalizedRole === 'farmer' && (!address || !String(address).trim()) && (!city || !String(city).trim())) {
      return res.status(400).json({ message: 'Address or city is required for farmers' });
    }

    console.log('Register attempt:', { name, email, role: normalizedRole });

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if phone number already exists
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone }
      });

      if (existingPhone) {
        console.log('Phone number already exists:', phone);
        return res.status(400).json({ message: 'Phone number already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = buildCustomerRegistrationData({
      name: String(name).trim(),
      email: String(email).trim(),
      password: hashedPassword,
      role: normalizedRole,
      address: address || city || null,
      phone: String(phone).trim(),
      profileImage,
      nationalId,
      tinNumber,
      landMapFile,
      farmName,
      farmSize,
      bio
    });

    console.log('Creating user with data:', userData);

    const user = await prisma.user.create({
      data: userData
    });

    console.log('User created successfully:', user.id);

    // Generate token for auto-login after registration
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Register error details:', error);
    console.error('Error stack:', error.stack);

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target && target.includes('email')) {
        return res.status(400).json({ message: 'Email already registered' });
      } else if (target && target.includes('phone')) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }
      return res.status(400).json({ message: 'A user with this information already exists' });
    }

    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// 2. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found');

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log('Login successful for user:', user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role  // This will be CUSTOMER, FARMER, or ADMIN from the enum
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 3. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetPasswordExpires
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - FarmConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2e7d32;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your FarmConnect account.</p>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>FarmConnect Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
