import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const generateToken = (userId, displayName, role) => {
  return jwt.sign({ userId, displayName, role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
}

const generateRefreshToken = (userId) => {
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { token: refreshToken, userId };
};

const generatePassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

const checkUserExist = async (email) => {
  const user = await User.findOne({ email });
  return user;
}

async function register(req, res, next) {
    try {
        const { displayName, email, password, phone } = req.body;
        const userExists = await checkUserExist(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await generatePassword(password);
        const newUser = new User({
            displayName,
            email,
            password: hashedPassword,
            phone,
            role: 'customer'
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }   
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const userExists = await checkUserExist(email);
    if (!userExists) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, userExists.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(
      userExists._id,
      userExists.displayName,
      userExists.role
    );

    const refreshToken = generateRefreshToken(userExists._id);

    // 🔐 eliminar password antes de enviar
    const { password: _, ...userData } = userExists._doc;

    res.status(200).json({
      token,
      refreshToken: refreshToken.token,
      user: userData
    });

  } catch (error) {
    next(error);
  }
}


const checkEmailAlreadyRegistered = async (req, res, next) => {
  try {
    const { email } = req.query;
    console.log(email);
    const user = await User.findOne({email});
    res.status(200).json({ exists: !!user });
  } catch (error) {
    next(error)
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (user) {
      const newToken = generateToken(user._id, user.displayName, user.role);

      res.status(200).json({ token: newToken });
    } else {
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  checkEmailAlreadyRegistered,
  refreshToken
};