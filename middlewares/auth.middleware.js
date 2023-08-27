import { StatusCodes } from 'http-status-codes';
import { TokenManager } from '../utils/token.manager.js';

export const tokenAuthentication = (req, res, next) => {
    const bearerToken = req.header('Authorization');

    if (!bearerToken) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide token !!' });
    }
    const token = bearerToken.split(' ')[1];

    try {
        const user = TokenManager.verifyToken(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Either token is invalid or it's expired !!" });
    }
};
