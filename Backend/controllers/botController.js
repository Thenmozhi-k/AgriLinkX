const axios = require('axios');
require('dotenv').config();

// Languages supported by the bot
const supportedLanguages = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
  bn: 'Bengali',
  gu: 'Gujarati',
  mr: 'Marathi'
};

// Get Pollination AI response
const getBotResponse = async (req, res) => {
  try {
    const { query, language = 'en' } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }
    
    // Validate language
    if (!supportedLanguages[language]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Unsupported language',
        supportedLanguages
      });
    }
    
    // Prepare prompt with language context
    let prompt = query;
    if (language !== 'en') {
      prompt = `[Respond in ${supportedLanguages[language]}] ${query}`;
    }
    
    // Add agricultural context to the prompt
    const contextualPrompt = `As an agricultural expert assistant, please provide helpful information about the following question related to farming, crops, agricultural practices, or rural development: ${prompt}`;
    
    let botResponse;
    
    // Check if API key is set
    if (!process.env.POLLINATION_API_KEY || process.env.POLLINATION_API_KEY === 'your_pollination_ai_api_key_here') {
      console.log('Warning: Pollination API key not set, using fallback responses');
      // Use fallback responses for demo purposes
      botResponse = getFallbackResponse(query, language);
    } else {
      // Call Pollination AI API
      const response = await axios.post(
        'https://api.pollinations.ai/v1/inference',
        {
          model: 'gpt-4',
          prompt: contextualPrompt,
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.POLLINATION_API_KEY}`
          }
        }
      );
      
      // Extract the response text
      botResponse = response.data.choices[0].text.trim();
    }
    
    return res.status(200).json({
      success: true,
      response: botResponse,
      language
    });
    
  } catch (error) {
    console.error('Bot response error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get response from AI service',
      error: error.message
    });
  }
};

// Get supported languages
const getSupportedLanguages = (req, res) => {
  return res.status(200).json({
    success: true,
    supportedLanguages
  });
};

// Helper function to get fallback responses for demo purposes
const getFallbackResponse = (query, language) => {
  const lowerQuery = query.toLowerCase();
  let response = "I'm sorry, but I don't have enough information to answer that question. Could you provide more details about your agricultural needs?";
  
  if (lowerQuery.includes('crop') || lowerQuery.includes('plant')) {
    response = "Based on your query about crops, I recommend considering seasonal patterns, soil quality, and water availability in your region. For specific crop recommendations, a soil test would be beneficial to determine nutrient levels and pH balance.";
  } else if (lowerQuery.includes('pest') || lowerQuery.includes('disease')) {
    response = "For pest and disease management, integrated pest management (IPM) approaches are most effective. This includes regular monitoring, biological controls, and targeted treatments only when necessary. Proper crop rotation and diversity can also help prevent pest buildup.";
  } else if (lowerQuery.includes('fertilizer') || lowerQuery.includes('soil')) {
    response = "Good soil health is fundamental to successful farming. Consider using organic matter like compost to improve soil structure, using cover crops to prevent erosion, and applying balanced fertilizers based on soil test results rather than general recommendations.";
  } else if (lowerQuery.includes('water') || lowerQuery.includes('irrigation')) {
    response = "Water management is critical in agriculture. Drip irrigation systems can reduce water usage by up to 60% compared to conventional methods. Consider rainwater harvesting, mulching to reduce evaporation, and scheduling irrigation based on crop needs rather than fixed schedules.";
  } else if (lowerQuery.includes('market') || lowerQuery.includes('price')) {
    response = "Agricultural markets can be volatile. Consider diversifying your crops to spread risk, exploring direct-to-consumer sales channels, and staying informed about government support programs. Value-added products can also increase your profit margins.";
  }
  
  // For languages other than English, we'll just note that translation would happen here
  if (language !== 'en') {
    return `[This response would be translated to ${supportedLanguages[language]}]: ${response}`;
  }
  
  return response;
};

// Text-to-speech conversion
const textToSpeech = async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }
    
    // Validate language
    if (!supportedLanguages[language]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Unsupported language for text-to-speech',
        supportedLanguages
      });
    }
    
    // Check if API key is set
    if (!process.env.POLLINATION_API_KEY || process.env.POLLINATION_API_KEY === 'your_pollination_ai_api_key_here') {
      console.log('Warning: Pollination API key not set, using fallback audio');
      // Return a mock audio response
      return res.status(200).json({
        success: true,
        audioData: 'mock-audio-data-base64', // In a real implementation, this would be actual audio data
        contentType: 'audio/mp3'
      });
    }
    
    // Call Pollination AI API for text-to-speech
    const response = await axios.post(
      'https://api.pollinations.ai/v1/tts',
      {
        text,
        language,
        voice: language === 'en' ? 'en-US-Neural2-F' : null // Default to a neutral voice
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.POLLINATION_API_KEY}`
        },
        responseType: 'arraybuffer'
      }
    );
    
    // Convert audio buffer to base64
    const audioBase64 = Buffer.from(response.data).toString('base64');
    
    return res.status(200).json({
      success: true,
      audioData: audioBase64,
      contentType: 'audio/mp3'
    });
    
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to convert text to speech',
      error: error.message
    });
  }
};

// Speech-to-text conversion
const speechToText = async (req, res) => {
  try {
    const { audioData, language = 'en' } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ success: false, message: 'Audio data is required' });
    }
    
    // Validate language
    if (!supportedLanguages[language]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Unsupported language for speech-to-text',
        supportedLanguages
      });
    }
    
    // Check if API key is set
    if (!process.env.POLLINATION_API_KEY || process.env.POLLINATION_API_KEY === 'your_pollination_ai_api_key_here') {
      console.log('Warning: Pollination API key not set, using fallback text');
      // Return a mock text response
      return res.status(200).json({
        success: true,
        text: "This is a fallback response since the Pollination AI API key is not configured.",
        language
      });
    }
    
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    // Create form data for the API request
    // Note: Node.js doesn't have Blob or FormData built-in
    // We'll use FormData from form-data package
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('audio', audioBuffer, { filename: 'audio.webm' });
    formData.append('language', language);
    
    const response = await axios.post(
      'https://api.pollinations.ai/v1/stt',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${process.env.POLLINATION_API_KEY}`
        }
      }
    );
    
    return res.status(200).json({
      success: true,
      text: response.data.text,
      language
    });
    
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to convert speech to text',
      error: error.message
    });
  }
};

module.exports = {
  getBotResponse,
  getSupportedLanguages,
  textToSpeech,
  speechToText
};