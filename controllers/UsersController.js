// Description: This file contains the logic to handle the user's requests.
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
const sha1 = require('sha1');

class UsersController {
    static async postNew(req, res) {
        const email = req.body.email;
        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }
        
        const pass = req.body.password;
        if (!pass) {
            return res.status(400).json({ error: 'Missing password' });
        }

        const userDeh = await dbClient.dbClient.collection('users').findOne({email: email});
        if (userDeh) {
            return res.status(400).json({error: 'Already exist'});
        }

        const password = sha1(pass);
        const newUser = await dbClient.dbClient.collection('users').insertOne({'email': email, 'password': password});
        return res.status(201).json({ id: newUser.insertedId, email: email });
    }

    static async getMe(req, res) {
        const token = req.header('X-Token');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user_id = await redisClient.get('auth_' + token);

        if (!user_id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const obj_id = new ObjectId(user_id);
        const users = await dbClient.dbClient.collection('users');
        const user = await users.findOne({ _id: obj_id });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        return res.status(200).json({ id: user_id, email: user.email });
    }
}

export default UsersController;