import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

//Configuracion de la api
const configuration = new Configuration({
  organization: "org-nKdxUN7gOLVd0QHrU3S53xle",
  apiKey: process.env.OPENAI_API_KEY,
});

//Usando la api
const openai = new OpenAIApi(configuration);

// Historial de mensajes
let chatHistory = [];

async function ChatCompletion(content) {
  // Agregar el mensaje del usuario al historial 
  chatHistory.push({ role: 'user', content: content });

  const chatCompletion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: chatHistory, // Enviar todo el historial de la conversación
  });

  // Agregar la respuesta del bot al historial
  const botResponse = chatCompletion.data.choices[0].message.content;
  chatHistory.push({ role: 'assistant', content: botResponse });

  return botResponse;
}

export { openai, ChatCompletion};

