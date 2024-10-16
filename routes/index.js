import AppController from '../controllers/AppController';

const router = require('express').Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default router;