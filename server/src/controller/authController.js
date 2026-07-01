const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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
  landMapFile
}) {
  const normalizedRole = String(role || 'customer').toLowerCase();
  const userData = {
    name,
    email,
    password,
    role: normalizedRole === 'farmer' ? 'farmer' : 'customer',
    address: normalizedRole === 'farmer' ? (address || null) : null
  };

  if (phone && typeof phone === 'string' && phone.trim()) userData.phone = phone.trim();
  if (tinNumber && typeof tinNumber === 'string' && tinNumber.trim()) userData.tinNumber = tinNumber.trim();
  if (profileImage && typeof profileImage === 'string' && profileImage.trim()) userData.profileImage = profileImage.trim();
  if (nationalId && typeof nationalId === 'string' && nationalId.trim()) userData.nationalId = nationalId.trim();
  if (landMapFile && typeof landMapFile === 'string' && landMapFile.trim()) userData.landMapFile = landMapFile.trim();

  return userData;
}

exports.buildCustomerRegistrationData = buildCustomerRegistrationData;

exports.register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);

    // Extract all fields that exist in Prisma schema
    const { name, email, password, role, address, phone, profileImage, nationalId, tinNumber, landMapFile } = req.body;
    const normalizedRole = String(role || 'customer').toLowerCase();

    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (normalizedRole === 'farmer' && !address) {
      console.log('Missing address for farmer');
      return res.status(400).json({ message: 'Address is required for farmers' });
    }

    console.log('Register attempt:', { name, email, role: normalizedRole });

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const existingUser = await prisma.customer.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if phone number already exists
    if (phone) {
      const existingPhone = await prisma.customer.findUnique({
        where: { phone }
      });

      if (existingPhone) {
        console.log('Phone number already exists:', phone);
        return res.status(400).json({ message: 'Phone number already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = buildCustomerRegistrationData({
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
      address,
      phone,
      profileImage,
      nationalId,
      tinNumber,
      landMapFile
    });

    console.log('Creating user with data:', userData);

    const user = await prisma.customer.create({
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

    // Prisma findUnique ተጠቀምን
    const user = await prisma.customer.findUnique({
      where: { email }
    });

    console.log('Login attempt:', { email, password });
    console.log('User found:', user);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // በ Prisma መታወቂያው id ስለሆነ user.id ተጠቀምን (user._id አይደለም)
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.customer.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour (Prisma DateTime ይጠብቃል)

    // Prisma update ተጠቀምን
    await prisma.customer.update({
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

    // Prisma findFirst ተጠቀምን
    const user = await prisma.customer.findFirst({
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

    // Prisma update ተጠቀምን
    await prisma.customer.update({
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