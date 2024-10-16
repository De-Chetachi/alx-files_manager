// Description: This file contains the logic to handle the user's requests.

import dbClient from '../utils/db';
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
}

export default UsersController;