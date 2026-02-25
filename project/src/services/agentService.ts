import axios from 'axios';
import {
    matchSymptom, formatSymptomResponse,
    matchClinicalQA, formatClinicalQAResponse,
    matchResearchQA, formatResearchQAResponse
} from './symptomKnowledgeBase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Simulates thinking time: random delay between 5 and 6 seconds
const thinkingDelay = () =>
    new Promise<void>(resolve => setTimeout(resolve, 5000 + Math.random() * 1000))

export const agentService = {
    async query(query: string, mode: 'patient' | 'doctor' | 'researcher' = 'patient'): Promise<string> {

        // ── RESEARCHER MODE ─────────────────────────────────────────────────────
        // Only checks research KB — does NOT fall through to patient symptom KB
        if (mode === 'researcher') {
            const researchMatch = matchResearchQA(query)
            if (researchMatch) {
                await thinkingDelay()
                return formatResearchQAResponse(researchMatch)
            }
            // No local match — go straight to AI backend (skip patient symptom KB)
            try {
                const response = await axios.post(`${API_URL}/agents/query`, { query });
                return response.data.response;
            } catch {
                return `🔬 **No local match found**\n\nI couldn't find a matching research answer for **"${query}"**.\n\nTry a more specific keyword, for example:\n• "fever prevalence" — research variables in febrile illness\n• "urti study" — URTI outcome measures\n• "study design" — cohort vs case-control\n• "bias research" — common research biases\n• "missing data research" — handling missing data\n\n*The AI backend is currently unavailable. Using local knowledge base only.*`
            }
        }

        // ── DOCTOR MODE ─────────────────────────────────────────────────────────
        // Checks clinical KB first, then symptom KB, then AI backend
        if (mode === 'doctor') {
            const clinicalMatch = matchClinicalQA(query)
            if (clinicalMatch) {
                await thinkingDelay()
                return formatClinicalQAResponse(clinicalMatch)
            }
        }

        // ── PATIENT MODE (and doctor fallback) ──────────────────────────────────
        const matched = matchSymptom(query)
        if (matched) {
            await thinkingDelay()
            return formatSymptomResponse(matched)
        }

        // ── AI BACKEND FALLBACK ─────────────────────────────────────────────────
        try {
            const response = await axios.post(`${API_URL}/agents/query`, { query });
            return response.data.response;
        } catch {
            return `💬 **No Answer Found**\n\nI couldn't find information about **"${query}"** in my knowledge base, and the AI backend is currently unavailable.\n\nPlease try a more specific medical term or consult a healthcare professional.`
        }
    }
};
