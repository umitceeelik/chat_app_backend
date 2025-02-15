import OpenAI from "openai";
import dotenv from "dotenv"; // dotenv'i import edin

dotenv.config(); // Çevresel değişkenleri yükleyin

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log("API Key:", process.env.OPENAI_API_KEY); // Değeri kontrol edin

export const generateDailyQuestion = async (): Promise<String> => {
    try {
        const response = await openai.chat.completions.create({
            model:'gpt-4',
            messages: [
                {role: 'user', content: 'Generate a fun and enaging daily question for a chat conversation.'}
            ],
            max_tokens: 50
        })
        console.log("generateDailyQuestion- openAi called :");
        console.log(response);
        return response.choices[0]?.message?.content || "What's your favorite hobby?";
    } catch (error) {
        console.error('Error generating daily question: ' + error);
        return 'Here is a daily question: What is your favorite book?';
    }
}
