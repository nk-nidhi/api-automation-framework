import jwt from 'jsonwebtoken';

export class TokenManager {
    static generateToken(userProfile) {
        return jwt.sign(userProfile, process.env.JWT_SECRET_KEY, { expiresIn: process.env.EXPIRES_IN });
    }

    static verifyToken(authenticationToken) {
        return jwt.verify(authenticationToken, process.env.JWT_SECRET_KEY);
    }
}
