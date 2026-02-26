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

// Sample questions per mode shown when no keyword match is found
const PATIENT_SAMPLES = [
    'What are the symptoms of diabetes?',
    'I have chest pain and shortness of breath',
    'What causes high blood pressure?',
    'I have a fever and sore throat',
    'What are the signs of anemia?',
    'I feel dizzy and nauseous',
    'What is asthma and how is it treated?',
    'I have joint pain and swelling',
]

const DOCTOR_SAMPLES = [
    'fever red flag signs in adults',
    'nsaid contraindication in renal failure',
    'sepsis management guidelines',
    'first-line therapy for hypertension',
    'drug interaction warfarin and amiodarone',
    'diabetes management in CKD',
    'atrial fibrillation anticoagulation',
    'statin choice secondary prevention',
]

const RESEARCHER_SAMPLES = [
    'cohort vs case control study design',
    'how to handle missing data in research',
    'urti study outcomes',
    'common research biases to avoid',
    'sample size calculation principles',
    'randomized controlled trial methodology',
    'prevalence vs incidence study',
    'systematic review vs meta-analysis',
]

function randomSample(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)]
}

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
                const sample = randomSample(RESEARCHER_SAMPLES)
                return `🔬 **Hello Sir/Madam!**\n\nI couldn't find a specific match for **"${query}"**.\n\nCould you try rephrasing with a more specific research keyword? Here's an example to get you started:\n\n💡 *Try asking:* **"${sample}"**\n\nOr explore topics like study design, bias, outcomes, data analysis, or drug safety research.`
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
            const samples = mode === 'doctor' ? DOCTOR_SAMPLES : PATIENT_SAMPLES
            const sample = randomSample(samples)
            return `👋 **Hello Sir/Madam!**\n\nI couldn't find a specific answer for **"${query}"** right now.\n\nCould you try asking with more specific keywords? Here's an example to help you get started:\n\n💡 *Try asking:* **"${sample}"**\n\nFeel free to describe your question differently and I'll do my best to help!`
        }
    }
};
