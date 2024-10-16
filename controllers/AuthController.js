import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const sha1 = require('sha1');
const { uuid } = require('uuid');

class AuthController {
    static async getConnect(req, res) {
        const auth = req.header('Authorization');
        if (!auth) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const credentials = Buffer.from(auth.slice(6), 'base64').toString().split(':');
        if (credentials.length !== 2) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const email = credentials[0];
        const password = credentials[1];

        const user = await dbClient.db.collection('users').findOne({ email: email, password: sha1(password) });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = uuid();
        const key = `auth_${token}`;
        await redisClient.set(key, user._id.toString(), 86400);

        return res.status(200).json({ token: token });
    }

    static async getDisconnect(req, res) {
        const token = req.header('X-Token');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const key = `auth_${token}`;
        const userId = await redisClient.get(key);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await redisClient.del(key);
        return res.status(204).end();
    }
}

export default AuthController;