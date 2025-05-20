const express = require('express');
const router = express.Router();
const botController = require('../controllers/botController');

// Get bot response
router.post('/query', botController.getBotResponse);

// Get supported languages
router.get('/languages', botController.getSupportedLanguages);

// Text-to-speech conversion
router.post('/text-to-speech', botController.textToSpeech);

// Speech-to-text conversion
router.post('/speech-to-text', botController.speechToText);

module.exports = router;