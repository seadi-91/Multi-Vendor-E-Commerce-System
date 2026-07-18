const prisma = require('../db/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

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
    const normalizedEmail = normalizeEmail(email);

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

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
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
      email: normalizedEmail,
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
    const normalizedEmail = normalizeEmail(email);

    console.log('Login attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
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

    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
    });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate random 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP code and expiry to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: otpCode,
        resetPasswordExpires: expiresAt
      }
    });

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content with modern design
    const mailOptions = {
      from: `"FarmConnect" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: '🔐 Your Password Reset Code - FarmConnect',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 0;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              🌾 FarmConnect
            </h1>
            <p style="color: #e0f2f1; font-size: 14px; margin: 8px 0 0 0; font-weight: 500;">
              Direct from Soil
            </p>
          </div>
          
          <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">
              Password Reset Request
            </h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Hello <strong>${user.name}</strong>,
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              We received a request to reset your password. Use the verification code below to proceed with resetting your password:
            </p>
            
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #059669; border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
              <p style="color: #059669; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">
                Verification Code
              </p>
              <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 2px 8px rgba(5,150,105,0.2);">
                <h1 style="color: #047857; font-size: 42px; font-weight: 800; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                  ${otpCode}
                </h1>
              </div>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 0 0 30px 0;">
              <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
                ⚠️ <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>. Keep it confidential and do not share it with anyone.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;">
                Need help? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #059669; text-decoration: none; font-weight: 600;">${process.env.EMAIL_USER}</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} FarmConnect. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset code sent to ${normalizedEmail}: ${otpCode}`);
      res.status(200).json({ 
        message: 'Verification code sent successfully to your email',
        // Don't send the code in response in production, this is for testing only
        // code: otpCode 
      });
    } catch (mailError) {
      console.error('Email sending error:', mailError);
      res.status(500).json({ message: 'Failed to send verification code. Please try again.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process password reset request' });
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
      return res.status(400).json({ message: 'Invalid or expired verification code' });
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
