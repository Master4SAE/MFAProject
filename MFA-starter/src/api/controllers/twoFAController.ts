import { Request, Response, NextFunction } from 'express';
import CustomError from '../../classes/CustomError';
import TwoFA from '../models/twoFAModel';
import OTPAuth from 'otpauth';
import fetchData from '../../utils/fetchData';
import jwt from 'jsonwebtoken';

const setupTwoFA = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const userResponse: any = await fetchData('Auth API URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const secret = new OTPAuth.Secret();

    const totp = new OTPAuth.TOTP({
      issuer: 'YourAppName',
      label: req.body.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });


    const twoFAData = {
      userId: userResponse.user.id,
      email: req.body.email,
      twoFactorSecret: secret.base32,
      twoFactorEnabled: true,
    };
    await TwoFA.create(twoFAData);


    const qrCodeURL = totp.toString();
    res.status(200).json({ qrCodeURL });

  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const verifyTwoFA = async (req: Request, res: Response, next: NextFunction) => {
  const { email, code } = req.body;

  try {

    const twoFAData = await TwoFA.findOne({ email });
    if (!twoFAData) {
      throw new CustomError('2FA data not found for this user', 404);
    }


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


    const userResponse: any = await fetchData('Auth API URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });


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
