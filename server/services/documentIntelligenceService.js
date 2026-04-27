import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.AZURE_DOC_INTELLIGENCE_API_VERSION || '2024-11-30';

/**
 * Menganalisis dokumen CV menggunakan Azure Document Intelligence.
 * Mencoba prebuilt-resume terlebih dahulu, fallback ke prebuilt-read jika gagal.
 * @param {Buffer} fileBuffer - Buffer file yang diupload (PDF atau gambar).
 * @param {string} contentType - MIME type file (e.g., 'application/pdf', 'image/jpeg').
 * @returns {Promise<string>} - Teks hasil ekstraksi dari dokumen.
 */
export const analyzeCV = async (fileBuffer, contentType) => {
    // Try prebuilt-resume first, fallback to prebuilt-read
    const models = ['prebuilt-resume', 'prebuilt-read'];
    
    for (const model of models) {
        try {
            const result = await analyzeWithModel(fileBuffer, contentType, model);
            console.log(`Document Intelligence: Successfully analyzed with model "${model}"`);
            return result;
        } catch (error) {
            console.warn(`Document Intelligence: Model "${model}" failed:`, error.message);
            if (model === models[models.length - 1]) {
                throw new Error('Failed to analyze document with all available models.');
            }
            // Continue to next model
        }
    }
};

/**
 * Internal: Mengirim dokumen ke Azure Document Intelligence dan menunggu hasilnya.
 * @param {Buffer} fileBuffer - Buffer file.
 * @param {string} contentType - MIME type.
 * @param {string} modelId - ID model (prebuilt-resume atau prebuilt-read).
 * @returns {Promise<string>} - Teks hasil ekstraksi.
 */
const analyzeWithModel = async (fileBuffer, contentType, modelId) => {
    const analyzeUrl = `${endpoint}documentintelligence/documentModels/${modelId}:analyze?api-version=${apiVersion}`;

    // Step 1: POST the document for analysis
    const postResponse = await axios.post(analyzeUrl, fileBuffer, {
        headers: {
            'Content-Type': contentType,
            'Ocp-Apim-Subscription-Key': apiKey,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    });

    // Step 2: Get the Operation-Location URL
    const operationLocation = postResponse.headers['operation-location'];
    if (!operationLocation) {
        throw new Error('No Operation-Location header received from Document Intelligence.');
    }

    // Step 3: Poll until operation completes
    let result = null;
    const maxAttempts = 30; // Max 60 seconds (30 * 2s)
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        const statusResponse = await axios.get(operationLocation, {
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
            },
        });

        const status = statusResponse.data.status;

        if (status === 'succeeded') {
            result = statusResponse.data;
            break;
        } else if (status === 'failed') {
            throw new Error(`Document analysis failed: ${JSON.stringify(statusResponse.data.error)}`);
        }
        // else 'running' — continue polling
    }

    if (!result) {
        throw new Error('Document analysis timed out.');
    }

    // Step 4: Extract text content from the result
    const analyzeResult = result.analyzeResult;
    
    if (!analyzeResult) {
        throw new Error('No analyze result returned.');
    }

    // For prebuilt-resume, extract structured content
    if (modelId === 'prebuilt-resume' && analyzeResult.documents && analyzeResult.documents.length > 0) {
        return extractResumeContent(analyzeResult);
    }

    // For prebuilt-read or fallback, extract raw text
    return extractRawText(analyzeResult);
};

/**
 * Extract structured text from prebuilt-resume result.
 */
const extractResumeContent = (analyzeResult) => {
    const parts = [];

    // Get full text content
    if (analyzeResult.content) {
        parts.push(analyzeResult.content);
    }

    // Also extract structured fields if available
    if (analyzeResult.documents && analyzeResult.documents.length > 0) {
        const doc = analyzeResult.documents[0];
        const fields = doc.fields || {};

        const structuredParts = [];

        if (fields.ContactNames?.values?.[0]?.content) {
            structuredParts.push(`[NAMA]: ${fields.ContactNames.values[0].content}`);
        }
        if (fields.ContactEmails?.values?.[0]?.content) {
            structuredParts.push(`[EMAIL]: ${fields.ContactEmails.values[0].content}`);
        }
        if (fields.ContactPhones?.values?.[0]?.content) {
            structuredParts.push(`[TELEPON]: ${fields.ContactPhones.values[0].content}`);
        }
        if (fields.Skills?.values) {
            const skills = fields.Skills.values.map(v => v.content).filter(Boolean);
            if (skills.length > 0) {
                structuredParts.push(`[SKILLS]: ${skills.join(', ')}`);
            }
        }

        if (structuredParts.length > 0) {
            parts.push('\n--- Extracted Structured Fields ---\n' + structuredParts.join('\n'));
        }
    }

    return parts.join('\n\n');
};

/**
 * Extract raw text from prebuilt-read result.
 */
const extractRawText = (analyzeResult) => {
    if (analyzeResult.content) {
        return analyzeResult.content;
    }

    // Fallback: concatenate page text
    if (analyzeResult.pages) {
        return analyzeResult.pages
            .map(page => 
                (page.lines || []).map(line => line.content).join('\n')
            )
            .join('\n\n');
    }

    return '';
};
