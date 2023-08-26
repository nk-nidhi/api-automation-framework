import 'dotenv/config';
import { StatusCodes } from 'http-status-codes';

export const keyAuthentication = (req, res, next) => {
    const apiKey = req.header('x-api-key');

    if (apiKey !== process.env.API_KEY) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    }

    next();
}
