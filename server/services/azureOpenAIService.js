import dotenv from 'dotenv';
import { AzureOpenAI } from 'openai';

dotenv.config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
const modelName = deployment;

const client = new AzureOpenAI({ endpoint, apiKey, deployment, apiVersion });

/**
 * Mendapatkan respons dari chatbot Azure OpenAI (GPT 5.4 Mini).
 * @param {string} userPrompt - Pertanyaan atau input dari pengguna.
 * @param {Array<{role: string, content: string}>} history - Riwayat percakapan sebelumnya.
 * @param {string} context - Konteks data relevan dari DB (hasil RAG), opsional.
 * @returns {Promise<string>} - Jawaban dari chatbot.
 */
export const getChatbotResponseAzure = async (userPrompt, history = [], context = '') => {
    let systemContent = `Anda adalah "MateBot", asisten virtual dan Career Assistant AI yang cerdas untuk platform EkrafMate. EkrafMate adalah platform marketplace yang menghubungkan pelaku kreatif (desainer, penulis, videografer, dll) dengan klien. 
Tugas Anda:
1. Menjawab pertanyaan seputar cara kerja platform.
2. BERTINDAK SEBAGAI CAREER ASSISTANT: Jika pengguna bertanya "Job apa yang cocok buat saya?" atau "Skill apa yang harus saya pelajari?", tanyakan latar belakang/skill mereka jika belum tahu, lalu berikan saran karir, rekomendasi peran, atau roadmap belajar yang spesifik dan actionable.
3. Jawablah selalu dalam Bahasa Indonesia dengan gaya yang profesional, suportif, dan bersahabat.`;

    if (context) {
        systemContent += `\n\nBerikut adalah data relevan dari platform EkrafMate yang dapat Anda gunakan untuk menjawab pertanyaan pengguna secara akurat dan spesifik. Gunakan data ini jika relevan dengan pertanyaan yang diajukan, namun tetap jawab dengan bahasa yang natural dan bersahabat:\n\n${context}`;
    }

    try {
        // Build messages array: system + history + current user message
        const messages = [
            { role: 'system', content: systemContent },
        ];

        // Add conversation history
        for (const turn of history) {
            // Skip the current prompt if it's the last user message (we add it separately)
            messages.push({
                role: turn.role === 'user' ? 'user' : 'assistant',
                content: turn.content,
            });
        }

        // Add current user prompt
        messages.push({ role: 'user', content: userPrompt });

        const response = await client.chat.completions.create({
            messages,
            max_completion_tokens: 4096,
            model: modelName,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error calling Azure OpenAI for chatbot:', error);
        throw new Error('Failed to get chatbot response from Azure OpenAI.');
    }
};

/**
 * Menganalisis teks CV dengan Azure OpenAI untuk menghasilkan analisis terstruktur.
 * @param {string} cvText - Teks hasil OCR dari CV.
 * @returns {Promise<object>} - Hasil analisis CV terstruktur.
 */
export const analyzeCVWithAI = async (cvText) => {
    try {
        const systemPrompt = `Anda adalah analis CV profesional untuk platform EkrafMate, sebuah marketplace yang menghubungkan pelaku kreatif Indonesia dengan klien.

Tugas Anda: Analisis CV yang diberikan dan berikan evaluasi komprehensif dalam format JSON yang valid.

Berikan response dalam format JSON berikut (TANPA markdown code block, langsung JSON):
{
  "name": "Nama lengkap dari CV",
  "headline": "Ringkasan singkat profil profesional (1 kalimat)",
  "summary": "Ringkasan analisis CV secara keseluruhan (2-3 kalimat)",
  "overallScore": 85,
  "scores": {
    "skills": 80,
    "experience": 75,
    "education": 90,
    "presentation": 70
  },
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "2020-2023",
      "highlights": "Deskripsi singkat pencapaian"
    }
  ],
  "education": [
    {
      "degree": "Gelar",
      "institution": "Nama Institusi",
      "year": "Tahun lulus"
    }
  ],
  "strengths": ["Kekuatan 1", "Kekuatan 2", "Kekuatan 3"],
  "improvements": ["Saran perbaikan 1", "Saran perbaikan 2", "Saran perbaikan 3"],
  "freelanceReadiness": {
    "score": 80,
    "verdict": "Siap/Perlu Persiapan/Belum Siap",
    "tips": ["Tip 1", "Tip 2"]
  },
  "recommendedRoles": ["Role 1 di EkrafMate", "Role 2 di EkrafMate"]
}

Scoring guidelines:
- overallScore: 0-100, evaluasi keseluruhan kualitas CV
- skills: Relevansi dan kedalaman skills untuk ekonomi kreatif
- experience: Pengalaman kerja & proyek yang relevan
- education: Latar belakang pendidikan & sertifikasi
- presentation: Kerapihan, kelengkapan, dan profesionalitas CV
- freelanceReadiness: Kesiapan untuk menjadi freelancer di platform EkrafMate`;

        const response = await client.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Berikut adalah teks dari CV yang perlu dianalisis:\n\n${cvText}` },
            ],
            max_completion_tokens: 4096,
            model: modelName,
            temperature: 0.3,
        });

        const content = response.choices[0].message.content.trim();
        
        // Try to parse as JSON, handle potential markdown wrapping
        let jsonStr = content;
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }
        
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error analyzing CV with Azure OpenAI:', error);
        throw new Error('Failed to analyze CV with AI.');
    }
};

/**
 * Menganalisis kecocokan antara profil user (skills/CV) dengan requirement proyek.
 * @param {object} userProfile - Profil user (skills, experience, dll).
 * @param {object} projectDetails - Detail proyek (title, description, requiredSkills).
 * @returns {Promise<object>} - Hasil analisis (match score, skill gap, dll).
 */
export const analyzeJobMatch = async (userProfile, projectDetails) => {
    try {
        const systemPrompt = `Anda adalah analis karir AI untuk platform EkrafMate.
Tugas Anda: Bandingkan profil kreatif pengguna dengan kebutuhan suatu proyek/pekerjaan, lalu berikan analisis kecocokan dalam format JSON yang valid.

Berikan response dalam format JSON berikut (TANPA markdown code block):
{
  "matchScore": 85,
  "successScore": 70,
  "skillGap": ["Skill yang kurang 1", "Skill yang kurang 2"],
  "learningRecommendation": {
    "message": "Pesan singkat mengapa perlu belajar ini",
    "topics": ["Topik 1", "Topik 2"]
  },
  "reasoning": "Penjelasan singkat (1-2 kalimat) mengapa mendapat skor tersebut."
}

Scoring guidelines:
- matchScore (0-100): Seberapa cocok skill user dengan required skills proyek.
- successScore (0-100): Peluang diterima/sukses di proyek ini berdasarkan pengalaman dan skill match.
- skillGap: Array berisi skill yang dibutuhkan proyek tapi TIDAK dimiliki user.
- learningRecommendation: Rekomendasi belajar spesifik berdasarkan skillGap (buat actionable).`;

        const response = await client.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Profil Pengguna:\n${JSON.stringify(userProfile, null, 2)}\n\nKebutuhan Proyek:\n${JSON.stringify(projectDetails, null, 2)}` },
            ],
            max_completion_tokens: 2000,
            model: modelName,
            temperature: 0.3,
        });

        const content = response.choices[0].message.content.trim();
        let jsonStr = content;
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }
        
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error analyzing job match with Azure OpenAI:', error);
        throw new Error('Failed to analyze job match with AI.');
    }
};
