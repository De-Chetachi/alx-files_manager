import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
const router = require('express').Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);
router.post('/files', FilesController.postUpload);

export default router;