import { Request, Response, NextFunction } from 'express';
import CustomError from '../../classes/CustomError';
import TwoFA from '../models/twoFAModel';
import OTPAuth from 'otpauth';
import fetchData from '../../utils/fetchData';
import jwt from 'jsonwebtoken';

const setupTwoFA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Step 1: Register the user with the Auth API
    const userResponse: any = await fetchData('Auth API URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    // Step 2: Generate a new 2FA secret
    const secret = new OTPAuth.Secret();

    // Step 3: Create a TOTP instance using the user's email and the generated secret
    const totp = new OTPAuth.TOTP({
      issuer: 'YourAppName', // Customize as needed
      label: req.body.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });

    // Step 4: Store or update the 2FA data in the database
    const twoFAData = {
      userId: userResponse.user.id, // Use actual user ID from response
      email: req.body.email,
      twoFactorSecret: secret.base32,
      twoFactorEnabled: true,
    };
    await TwoFA.create(twoFAData);

    // Step 5: Generate a QR code URL and send it in the response
    const qrCodeURL = totp.toString();
    res.status(200).json({ qrCodeURL });

  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const verifyTwoFA = async (req: Request, res: Response, next: NextFunction) => {
  const { email, code } = req.body;

  try {
    // Step 1: Retrieve 2FA data from the database
    const twoFAData = await TwoFA.findOne({ email });
    if (!twoFAData) {
      throw new CustomError('2FA data not found for this user', 404);
    }

    // Step 2: Validate the 2FA code
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(twoFAData.twoFactorSecret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    const isValid = totp.validate({ token: code });
    if (!isValid) {
      throw new CustomError('Invalid 2FA code', 401);
    }

    // Step 3: Authenticate with the Auth API
    const userResponse: any = await fetchData('Auth API URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    // Step 4: Generate a JWT token and send it back
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new CustomError('JWT_SECRET is not defined', 500);

    const token = jwt.sign(
      { id: userResponse.user.id, email: userResponse.user.email },
      jwtSecret,
      { expiresIn: '1h' }
    );
    res.status(200).json({ message: 'Login successful', token });

  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export { setupTwoFA, verifyTwoFA };
