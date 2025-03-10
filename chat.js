// /api/chat.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// URL вашего Ollama API
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/';
// Модель, которую вы хотите использовать
const MODEL = process.env.OLLAMA_MODEL || 'mistral:7b-instruct';

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, subject, context } = req.body;

    // Подготовка контекста в зависимости от предмета
    let systemPrompt = "Ты опытный репетитор для подготовки к чешским экзаменам 'приймачки'. ";
    
    if (subject === 'math') {
      systemPrompt += "Ты специализируешься на математике. Объясняй решения задач пошагово, понятным для ученика 9 класса языком.";
    } else if (subject === 'czech') {
      systemPrompt += "Ты специализируешься на чешском языке. Объясняй правила грамматики понятно и приводи примеры.";
    }

    // Полный контекст с историей переписки, если есть
    const fullContext = context ? [...context, { role: "user", content: prompt }] : [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }];

    const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: MODEL,
      messages: fullContext,
      stream: false
    });

    res.json({
      answer: response.data.message.content,
      success: true
    });
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    res.status(500).json({
      error: 'Произошла ошибка при обращении к AI',
      details: error.message,
      success: false
    });
  }
});

// Эндпоинт для проверки статуса
app.get('/api/status', (req, res) => {
  res.json({ status: 'API работает' });
});

// Для локальной разработки
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Для Vercel
module.exports = app;
