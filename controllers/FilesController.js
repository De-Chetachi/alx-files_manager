import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';

class FilesController {
    static async postUpload(req, res) {
        const token = req.header('X-Token');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = await redisClient.get('auth_' + token);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name, type, isPublic, data } = req.body;
        const types = [ 'folder', 'file', 'image' ];
        if (!name) {
            return res.status(400).json({ error: 'Missing name' });
        }
        if (!type || !types.includes(type)) {
            return res.status(400).json({ error: 'Missing type' });
        }

        if (!data && (type !== 'folder')) {
            return res.status(400).json({ error: 'Missing data' });
        }

        let parentId = req.body.parentId || '0';

        if (parentId !== '0') {
            const parent = await dbClient.dbClient.collection('files').findOne({ _id: ObjectId(parentId) });
            if (!parent) {
                return res.status(400).json({ error: 'Parent not found' });
            }
            if (parent.type != 'folder') {
                return res.status(400).json({ error: 'Parent is not a folder' });
            }
        }
        parentId = parentId !== '0' ? ObjectId(parentId) : '0';

        const fileData = {
            userId: ObjectId(userId),
            name,
            type,
            isPublic: isPublic || false,
            parentId,
        }
        if (type === 'folder') {
            const newFolder = await dbClient.dbClient.collection('files').insertOne({ name, type, parentId, isPublic: isPublic || false, userId });
            return res.status(201).json({  id: newFolder.insertedId, ...fileData });
        }

        const rootFolder = process.env.FOLDER_PATH || '/tmp/files_manager';
        const filename = uuidv4();
        const { mkdir } = require('node:fs/promises');
        const { join }  = require('node:path');
        const  { open } = require('node:fs/promises');
        await mkdir(rootFolder, {recursive: true});
        const filePath = join(rootFolder, filename);
        const file = await open(filePath);
        await file.writeFile(Buffer.from(data, 'base64'));
        file.close();
        const newFile = await dbClient.dbClient.collection('files').insertOne({ localPath: filePath, ...fileData });

        fileData.parentId = parentId === '0' ? '0' : ObjectId(parentId);  
        return res.status(201).json({ id: newFile.insertedId, userId: ObjectId(userId), name, type, isPublic, parentId: ObjectId(parentId), localPath: filePath });
    }

    static async getShow(req, res) {
        const token = req.header('X-Token');
        if (!token) {
            return res.status(200).json({ error: 'Unauthorized' });
        }
        const userId = await redisClient.get('auth_' + token);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const id = req.params.id;
        const file = await dbClient.dbClient.collection('files').findOne({ userId: ObjectId(userId), _id: ObjectId(id) });
        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }
        return res.json(file);
    }

    static async getIndex(req, res) {
        const token = req.header('X-Token');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const userId = await redisClient.get('auth_' + token);

        await dbClient.dbClient.collection('files').find()
    }
}

export default FilesController;