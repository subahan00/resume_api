const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { postScore, postScoreFile } = require('../controller/atsController');

// JSON endpoint: /api/ats/score
router.post('/score', postScore);

// File upload endpoint: multipart/form-data with field 'resume'
router.post('/score/file', upload.single('resume'), postScoreFile);

module.exports = router;
