import RedisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
    static getStatus(req, res) {
        const isRedis = RedisClient.isAlive();
        const isMongo = dbClient.isAlive();
        res.status(200).json({'redis': isRedis, 'db': isMongo});
    }

    static async getStats(req, res) {
        const users_ = await dbClient.nbUsers();
        const files_ = await dbClient.nbFiles();
        res.status(200).json({users: users_, files: files_});
    }

}

export default AppController;