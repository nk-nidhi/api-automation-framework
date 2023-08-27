import 'dotenv/config';
import bcrypt from 'bcrypt';

export class CypherManager {
    static async encrypt(data) {
        const saltRounds = parseInt(process.env.HASH_SALT_ROUNDS);
        return await bcrypt.hash(data, saltRounds);
    }

    static async decrypt(data, encryptedData) {
        return await bcrypt.compare(data, encryptedData);
    }
}
