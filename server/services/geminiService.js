import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate embedding vector dari teks menggunakan Gemini Embedding model.
 * @param {string} inputText - Teks yang akan di-embed.
 * @returns {Promise<number[]>} - Array embedding vector.
 */
export const generateEmbedding = async (inputText) => {
    try {
        const result = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: inputText,
            config: {
                outputDimensionality: 768,
            },
        });
        return result.embeddings[0].values;
    } catch (error) {
        console.error('Error calling Gemini Embedding model:', error);
        throw new Error('Failed to generate embedding.');
    }
};

/**
 * Generate deskripsi teks menggunakan Gemini generative model.
 * @param {string} prompt - Prompt/key points dari pengguna.
 * @returns {Promise<string>} - Teks hasil generate.
 */
export const generateDescription = async (prompt) => {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-preview',
            contents: prompt,
            config: {
                systemInstruction: `Anda adalah penulis deskripsi profesional untuk platform EkrafMate, sebuah marketplace yang menghubungkan pelaku kreatif Indonesia dengan klien. Tugas Anda adalah membuat deskripsi yang menarik, jelas, dan persuasif berdasarkan poin-poin yang diberikan pengguna. Gunakan Bahasa Indonesia yang profesional namun mudah dipahami. Langsung tulis deskripsinya tanpa pembuka atau penjelasan tambahan.`,
                temperature: 0.7,
                maxOutputTokens: 2048,
            },
        });
        return result.text;
    } catch (error) {
        console.error('Error calling Gemini Text model:', error);
        throw new Error('Failed to generate description.');
    }
};

/**
 * Mendapatkan respons dari chatbot berdasarkan prompt, riwayat percakapan, dan konteks RAG dari DB.
 * @param {string} userPrompt - Pertanyaan atau input dari pengguna.
 * @param {Array<{role: string, content: string}>} history - Riwayat percakapan sebelumnya.
 * @param {string} context - Konteks data relevan dari DB (hasil RAG), opsional.
 * @returns {Promise<string>} - Jawaban dari chatbot.
 */
export const getChatbotResponse = async (userPrompt, history = [], context = '') => {
    let systemInstruction = `Anda adalah "MateBot", asisten virtual dan Career Assistant AI yang cerdas untuk platform EkrafMate. EkrafMate adalah platform marketplace yang menghubungkan pelaku kreatif (desainer, penulis, videografer, dll) dengan klien. 
Tugas Anda:
1. Menjawab pertanyaan seputar cara kerja platform.
2. BERTINDAK SEBAGAI CAREER ASSISTANT: Jika pengguna bertanya "Job apa yang cocok buat saya?" atau "Skill apa yang harus saya pelajari?", tanyakan latar belakang/skill mereka jika belum tahu, lalu berikan saran karir, rekomendasi peran, atau roadmap belajar yang spesifik dan actionable.
3. Jawablah selalu dalam Bahasa Indonesia dengan gaya yang profesional, suportif, dan bersahabat.`;

    if (context) {
        systemInstruction += `\n\nBerikut adalah data relevan dari platform EkrafMate yang dapat Anda gunakan untuk menjawab pertanyaan pengguna secara akurat dan spesifik. Gunakan data ini jika relevan dengan pertanyaan yang diajukan, namun tetap jawab dengan bahasa yang natural dan bersahabat:\n\n${context}`;
    }

    try {
        let geminiHistory = history.map(turn => ({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.content }],
        }));

        while (geminiHistory.length > 0 && geminiHistory[0].role !== 'user') {
            geminiHistory.shift();
        }

        const chat = ai.chats.create({
            model: 'gemini-3.1-flash-lite-preview',
            config: {
                systemInstruction: systemInstruction,
            },
            history: geminiHistory,
        });

        const result = await chat.sendMessage({ message: userPrompt });
        return result.text.trim();
    } catch (error) {
        console.error('Error calling Gemini model for chatbot:', error);
        throw new Error('Failed to get chatbot response.');
    }
};
