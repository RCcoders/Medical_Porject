// symptomKnowledgeBase.ts
// Local symptom knowledge base — no backend needed for basic queries.

export interface SymptomEntry {
    name: string
    keywords: string[]
    cause: string
    homeCare: string[]
    medication: { name: string; dosage: string; notes?: string }[]
    whenToSeeDoctor: string[]
}

// ─── Clinical Q&A Entry (Doctor-facing) ────────────────────────────────────────
export interface ClinicalQAItem {
    question: string
    keywords: string[]
    answer: string[]
    category: string
}

export const symptomKnowledgeBase: SymptomEntry[] = [
    {
        name: 'Fever (Mild)',
        keywords: ['fever', 'high temperature', 'feeling hot', 'chills', 'body heat', 'hot', 'temperature', 'shivering'],
        cause: 'Viral infection, mild flu, or weather change.',
        homeCare: [
            'Rest properly',
            'Drink plenty of fluids (water, ORS, coconut water)',
            'Avoid cold exposure and drafts',
            'Use a damp cloth on the forehead to cool down',
        ],
        medication: [
            { name: 'Paracetamol 500 mg', dosage: '1 tablet every 6–8 hours (max 3/day)', notes: 'Take for up to 2 days only' },
        ],
        whenToSeeDoctor: [
            'Fever lasts more than 2 days',
            'Temperature exceeds 102°F (39°C)',
            'Severe headache, vomiting, or rash appears',
            'Fever in children under 5, elderly, or pregnant women',
        ],
    },
    {
        name: 'Common Cold',
        keywords: ['cold', 'runny nose', 'sneezing', 'blocked nose', 'nasal congestion', 'stuffy nose', 'runny', 'sneeze'],
        cause: 'Viral upper respiratory infection.',
        homeCare: [
            'Steam inhalation 2–3 times daily',
            'Drink warm fluids — honey-ginger tea, soups',
            'Adequate rest',
            'Saline nasal drops to relieve congestion',
        ],
        medication: [
            { name: 'Cetirizine 10 mg', dosage: '1 tablet at night', notes: 'Take for 1–2 days only' },
        ],
        whenToSeeDoctor: [
            'Symptoms last more than 5 days',
            'Thick yellow/green nasal discharge with fever',
            'Ear pain or difficulty breathing',
        ],
    },
    {
        name: 'Headache (Mild)',
        keywords: ['headache', 'head pain', 'migraine', 'stress headache', 'head ache', 'head hurts', 'throbbing head'],
        cause: 'Stress, dehydration, or lack of sleep.',
        homeCare: [
            'Drink water — dehydration is the most common cause',
            'Take adequate sleep (7–8 hours)',
            'Reduce screen time and bright light exposure',
            'Apply gentle pressure on temples',
        ],
        medication: [
            { name: 'Paracetamol 500 mg', dosage: '1 tablet if needed (max 2/day)' },
        ],
        whenToSeeDoctor: [
            'Severe or recurring headaches (more than 3 times/week)',
            'Vision problems, vomiting, or confusion along with headache',
            'Sudden very severe headache (thunderclap headache)',
        ],
    },
    {
        name: 'Acidity / Indigestion',
        keywords: ['acidity', 'heartburn', 'gas', 'indigestion', 'stomach burning', 'burning', 'acid reflux', 'bloating', 'belching'],
        cause: 'Spicy food, irregular meals, caffeine, or stress.',
        homeCare: [
            'Avoid oily, spicy, or fried food',
            'Eat small, frequent meals',
            'Do not lie down immediately after eating (wait 30 min)',
            'Drink cold milk or eat a banana for quick relief',
        ],
        medication: [
            { name: 'Antacid syrup or tablet (e.g., Gelusil, Digene)', dosage: 'After meals or as needed' },
        ],
        whenToSeeDoctor: [
            'Pain is severe or persistent',
            'Symptoms occur daily for more than a week',
            'Difficulty swallowing or blood in vomit',
        ],
    },
    {
        name: 'Mild Diarrhea',
        keywords: ['diarrhea', 'loose motion', 'frequent stools', 'loose stool', 'watery stool', 'stomach upset', 'stomach pain'],
        cause: 'Food contamination, mild infection, or stress.',
        homeCare: [
            'Drink ORS solution immediately to prevent dehydration',
            'Eat light food — banana, rice, white toast, boiled potatoes',
            'Avoid dairy, oily, or spicy food until recovery',
            'Wash hands frequently',
        ],
        medication: [
            { name: 'ORS (Oral Rehydration Solution)', dosage: 'Mandatory — after every loose stool', notes: 'Easiest to prepare at home: 1L water + 6 tsp sugar + 1/2 tsp salt' },
            { name: 'Zinc tablets', dosage: 'As advised by pharmacist (usually 1/day for 14 days for children)' },
        ],
        whenToSeeDoctor: [
            'Diarrhea lasts more than 24 hours',
            'Blood or mucus in stool',
            'Signs of severe dehydration: very dry mouth, no urination, dizziness',
        ],
    },
    {
        name: 'Cough (Dry or Mild)',
        keywords: ['cough', 'dry cough', 'throat irritation', 'coughing', 'throat itch', 'tickling throat', 'sore throat', 'scratchy throat'],
        cause: 'Allergy, air pollution, dust, or mild infection.',
        homeCare: [
            'Drink warm water frequently',
            'Take honey with warm water or ginger tea',
            'Avoid cold drinks, ice cream, and cold air',
            'Gargle with warm salt water twice daily',
        ],
        medication: [
            { name: 'Cough syrup (non-codeine, e.g., Benadryl DR, Honitus)', dosage: 'As mentioned on label', notes: 'Avoid cough suppressants in productive cough' },
        ],
        whenToSeeDoctor: [
            'Cough lasts more than 7 days',
            'Chest pain or breathing difficulty',
            'Coughing up blood or greenish mucus',
            'Fever along with cough',
        ],
    },
]

// ─── Clinical Q&A Knowledge Base (Doctor-facing) — flat list for exact matching ─
export const clinicalQAKnowledgeBase: ClinicalQAItem[] = [
    // ── Fever ──
    {
        category: 'Fever (Adult – Uncomplicated)',
        keywords: ['fever differential', 'fever 48', 'fever differentials', 'fever no sign', 'pyrexia differential', 'febrile differential'],
        question: 'Fever for 48 hours – differentials to consider?',
        answer: [
            'Viral infection (most common)',
            'Early bacterial infection',
            'Dengue / malaria (endemic regions)',
            'Drug-induced fever',
            'Inflammatory or autoimmune causes',
            'Approach should be guided by vitals, duration, exposure history, and systemic symptoms.',
        ]
    },
    {
        category: 'Fever (Adult – Uncomplicated)',
        keywords: ['cbc fever', 'crp fever', 'when order cbc', 'blood test fever', 'fever investigation', 'investigate fever'],
        question: 'When should CBC and CRP be ordered in fever?',
        answer: [
            'Fever lasting >48–72 hours',
            'High-grade fever (>39°C)',
            'Presence of comorbidities',
            'Suspicion of bacterial infection',
            'CBC helps identify leukocyte trends; CRP supports inflammation but is not diagnostic.',
        ]
    },
    {
        category: 'Fever (Adult – Uncomplicated)',
        keywords: ['fever red flag', 'fever escalation', 'fever danger', 'fever urgent', 'fever referral', 'pyrexia red flag', 'febrile red flag'],
        question: 'Red flags in fever requiring escalation?',
        answer: [
            'Altered sensorium',
            'Hypotension',
            'Neck stiffness',
            'Petechial or hemorrhagic rash',
            'Thrombocytopenia',
            'Persistent vomiting',
            'Any of these warrant urgent referral or admission.',
        ]
    },
    // ── URTI ──
    {
        category: 'Upper Respiratory Tract Infection (URTI)',
        keywords: ['viral urti', 'bacterial pharyngitis', 'urti differentiate', 'sore throat differentiate', 'pharyngitis viral bacterial', 'centor'],
        question: 'How to differentiate viral URTI from bacterial pharyngitis?',
        answer: [
            'Viral: cough, runny nose, hoarseness, mild fever',
            'Bacterial: sudden sore throat, high fever, tonsillar exudates, tender cervical nodes, absence of cough',
            'Centor criteria can guide further decisions.',
        ]
    },
    {
        category: 'Upper Respiratory Tract Infection (URTI)',
        keywords: ['antibiotic urti', 'urti antibiotic', 'antibiotic sore throat', 'antibiotic pharyngitis', 'when antibiotic urti'],
        question: 'When are antibiotics justified in URTI?',
        answer: [
            'High Centor score with bacterial features',
            'Confirmed bacterial sinusitis',
            'Persistent or worsening symptoms >7–10 days',
            'Routine antibiotic use in viral URTI is contraindicated.',
        ]
    },
    // ── Headache ──
    {
        category: 'Headache (Non-Neurological)',
        keywords: ['headache neuroimaging', 'headache mri', 'headache ct', 'headache red flag', 'headache scan', 'thunderclap', 'imaging headache'],
        question: 'Red flags mandating neuroimaging in headache?',
        answer: [
            'Thunderclap onset',
            'New headache after age 50',
            'Focal neurological deficit',
            'Papilledema',
            'Fever with neck stiffness',
            'Progressive worsening pattern',
        ]
    },
    {
        category: 'Headache (Non-Neurological)',
        keywords: ['tension headache migraine', 'migraine tension', 'headache differentiate', 'headache type', 'migraine vs tension', 'cephalgia type'],
        question: 'How to differentiate tension headache from migraine?',
        answer: [
            'Tension Headache – Bilateral, dull pain; nausea rare; mild photophobia; improves with activity',
            'Migraine – Unilateral, throbbing pain; nausea common; prominent photophobia; worsens with activity',
        ]
    },
    // ── Gastritis / Dyspepsia ──
    {
        category: 'Gastritis / Dyspepsia',
        keywords: ['endoscopy dyspepsia', 'endoscopy gastritis', 'when endoscopy', 'dyspepsia endoscopy', 'scope dyspepsia'],
        question: 'When should dyspepsia be evaluated with endoscopy?',
        answer: [
            'Age >45–50 years',
            'Alarm symptoms: weight loss, anemia, GI bleeding',
            'Failure of empirical therapy',
        ]
    },
    {
        category: 'Gastritis / Dyspepsia',
        keywords: ['nsaid gastritis', 'nsaid stomach', 'ppi nsaid', 'nsaid management', 'nsaid induced', 'nsaid treatment'],
        question: 'First-line management of NSAID-induced gastritis?',
        answer: [
            'Discontinue NSAID if possible',
            'Short-term PPI therapy',
            'Assess bleeding risk',
            'Educate on NSAID misuse',
        ]
    },
    // ── Diarrhea ──
    {
        category: 'Acute Diarrhea (Adult)',
        keywords: ['stool examination', 'stool test', 'stool culture diarrhea', 'when stool test', 'investigate diarrhea'],
        question: 'When is stool examination indicated in acute diarrhea?',
        answer: [
            'Duration >48 hours',
            'Blood or mucus in stool',
            'Fever with diarrhea',
            'Immunocompromised patients',
            'Routine testing is unnecessary in mild cases.',
        ]
    },
    {
        category: 'Acute Diarrhea (Adult)',
        keywords: ['antibiotic diarrhea', 'diarrhea antibiotic', 'dysentery antibiotic', 'empirical antibiotic diarrhea', 'cholera antibiotic'],
        question: 'When is empirical antibiotic therapy justified in diarrhea?',
        answer: [
            'Severe dehydration',
            'Dysentery with high fever',
            'Suspected cholera',
            'Immunocompromised patients',
            'Supportive management remains first-line in most cases.',
        ]
    },
    // ── Cough ──
    {
        category: 'Cough (Acute)',
        keywords: ['cough xray', 'chest xray cough', 'when xray cough', 'chest x-ray cough', 'xray cough'],
        question: 'When should chest X-ray be ordered for cough?',
        answer: [
            'Cough >3 weeks',
            'Hemoptysis',
            'Weight loss',
            'Night sweats',
            'Abnormal chest findings',
        ]
    },
    {
        category: 'Cough (Acute)',
        keywords: ['tb cough', 'tuberculosis cough', 'cough malignancy', 'cough cancer', 'cough tb flag', 'hemoptysis flag'],
        question: 'Red flags suggesting TB or malignancy in cough?',
        answer: [
            'Chronic cough',
            'Hemoptysis',
            'Weight loss',
            'Night sweats',
            'Smoking history',
            'Any combination warrants further evaluation.',
        ]
    },
    // ── Medication Safety ──
    {
        category: 'Medication Safety',
        keywords: ['paracetamol dose', 'paracetamol maximum', 'paracetamol daily dose', 'max paracetamol', 'paracetamol limit', 'paracetamol overdose'],
        question: 'Maximum safe daily dose of paracetamol in adults?',
        answer: [
            '3–4 g/day maximum',
            'Lower threshold in liver disease or chronic alcohol use',
            'Exceeding this risks hepatotoxicity.',
        ]
    },
    {
        category: 'Medication Safety',
        keywords: ['nsaid contraindication', 'nsaids contraindicated', 'nsaid safety', 'avoid nsaid', 'nsaid kidney', 'nsaid pregnancy', 'nsaid heart'],
        question: 'Major NSAID contraindications?',
        answer: [
            'Peptic ulcer disease',
            'Chronic kidney disease',
            'Heart failure',
            'Pregnancy (third trimester)',
            'Elderly with polypharmacy',
        ]
    },
    // ── OPD Triage ──
    {
        category: 'OPD Triage & Escalation',
        keywords: ['emergency referral', 'opd red flags', 'emergency opd', 'urgent referral', 'opd emergency', 'refer emergency'],
        question: 'OPD symptoms requiring emergency referral?',
        answer: [
            'Chest pain',
            'Breathlessness',
            'Altered consciousness',
            'Severe hypotension',
            'Active bleeding',
        ]
    },
    {
        category: 'OPD Triage & Escalation',
        keywords: ['sepsis', 'sepsis signs', 'sepsis opd', 'early sepsis', 'sepsis indicator', 'sepsis flag', 'suspect sepsis'],
        question: 'Early indicators of sepsis in OPD?',
        answer: [
            'Fever or hypothermia',
            'Tachycardia',
            'Hypotension',
            'Altered mental status',
            'Early identification is critical for survival.',
        ]
    },
]

// ─── Disclaimer shown at the bottom of every response ────────────────────────
export const DISCLAIMER = `\n\n⚠️ *This is general guidance only for minor symptoms. It does not replace a doctor's advice. If symptoms worsen, persist, or involve children, elderly, pregnant women, or chronic illness — consult a doctor immediately.*`

// ─── Keyword matcher for patient-facing symptom knowledge ─────────────────────
export function matchSymptom(query: string): SymptomEntry | null {
    const q = query.toLowerCase()
    for (const entry of symptomKnowledgeBase) {
        if (entry.keywords.some(kw => q.includes(kw))) {
            return entry
        }
    }
    return null
}

// ─── Keyword matcher for doctor-facing clinical Q&A ───────────────────────────
export function matchClinicalQA(query: string): ClinicalQAItem | null {
    const q = query.toLowerCase()
    for (const entry of clinicalQAKnowledgeBase) {
        if (entry.keywords.some(kw => q.includes(kw))) {
            return entry
        }
    }
    return null
}

// ─── Response formatter for patient symptom ───────────────────────────────────
export function formatSymptomResponse(entry: SymptomEntry): string {
    const homeCare = entry.homeCare.map(h => `• ${h}`).join('\n')
    const meds = entry.medication
        .map(m => `• ${m.name} — ${m.dosage}${m.notes ? `\n  (${m.notes})` : ''}`)
        .join('\n')
    const warnings = entry.whenToSeeDoctor.map(w => `🔴 ${w}`).join('\n')

    return (
        `🩺 **${entry.name}**\n\n` +
        `**Possible Cause:** ${entry.cause}\n\n` +
        `**🏠 Home Care:**\n${homeCare}\n\n` +
        `**💊 OTC Medication:**\n${meds}\n\n` +
        `**⚠️ See a Doctor If:**\n${warnings}` +
        DISCLAIMER
    )
}

// ─── Response formatter for clinical Q&A — returns only the answer ────────────
export function formatClinicalQAResponse(entry: ClinicalQAItem): string {
    const answerLines = entry.answer
        .filter(line => line.trim() !== '')
        .map(line => `• ${line}`)
        .join('\n')

    return (
        `🏥 **${entry.category}**\n\n` +
        `**${entry.question}**\n\n` +
        answerLines +
        `\n\n*📋 Apply clinical judgment to individual cases.*`
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH Q&A KNOWLEDGE BASE (Researcher-facing)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ResearchQAItem {
    question: string
    keywords: string[]
    answer: string[]
    category: string
}

export const researchQAKnowledgeBase: ResearchQAItem[] = [
    // ── Fever – Research Perspective ──
    {
        category: 'Fever – Research Perspective',
        keywords: ['fever', 'pyrexia', 'febrile', 'fever prevalence', 'fever research variables', 'febrile illness study', 'febrile research', 'fever variables', 'pyrexia epidemiology', 'infection trends', 'fever epidemiology', 'febrile illness', 'fever study'],
        question: 'What are common research variables studied in febrile illness?',
        answer: [
            'Duration and pattern of fever',
            'Etiology (viral, bacterial, parasitic)',
            'Age and demographic distribution',
            'Seasonal variation',
            'Laboratory markers (CBC, CRP, platelets)',
            'These variables help differentiate disease patterns and outcomes.',
        ]
    },
    {
        category: 'Fever – Research Perspective',
        keywords: ['fever classification research', 'fever categorized study', 'pyrexia classify', 'fever acute subacute chronic', 'infection trends', 'fever classify', 'fever duration classify'],
        question: 'How is fever commonly classified in clinical research?',
        answer: [
            'Acute (<7 days)',
            'Subacute (7–21 days)',
            'Chronic (>21 days)',
            'Classification aids in narrowing etiological hypotheses and study stratification.',
        ]
    },
    // ── URTI – Research Perspective ──
    {
        category: 'Upper Respiratory Tract Infection (URTI)',
        keywords: ['urti', 'respiratory infection', 'urti outcomes', 'urti study outcomes', 'urti epidemiology', 'respiratory infection study', 'urti research', 'urti study', 'respiratory infection research'],
        question: 'What outcomes are commonly measured in URTI studies?',
        answer: [
            'Symptom duration',
            'Recurrence rate',
            'Antibiotic usage patterns',
            'Hospital visits',
            'Complication rates',
            'These outcomes assess disease burden and healthcare impact.',
        ]
    },
    {
        category: 'Upper Respiratory Tract Infection (URTI)',
        keywords: ['viral bacterial urti study', 'urti differentiate study', 'urti biomarker', 'urti pcr research', 'viral vs bacterial urti', 'viral vs bacterial urti research', 'urti differentiate'],
        question: 'How do studies differentiate viral and bacterial URTI?',
        answer: [
            'Clinical scoring systems (e.g., symptom-based indices)',
            'Biomarkers (CRP, procalcitonin)',
            'Microbiological confirmation (culture, PCR)',
            'Combination methods improve diagnostic accuracy.',
        ]
    },
    // ── Headache – Research Focus ──
    {
        category: 'Headache – Research Focus',
        keywords: ['headache', 'migraine', 'cephalgia', 'headache research variables', 'migraine research', 'headache epidemiology', 'tension headache study', 'headache variables', 'headache study', 'headache research', 'migraine study'],
        question: 'What are key variables in headache research?',
        answer: [
            'Frequency and duration',
            'Severity scoring (VAS, MIDAS)',
            'Trigger factors',
            'Impact on daily functioning',
            'Treatment response',
            'These help quantify disease burden and therapeutic efficacy.',
        ]
    },
    {
        category: 'Headache – Research Focus',
        keywords: ['headache classify research', 'headache classification study', 'migraine classification', 'primary secondary headache', 'headache type research', 'migraine tension type'],
        question: 'How are headaches classified in research studies?',
        answer: [
            'Primary headaches: migraine, tension-type',
            'Secondary headaches: infection, trauma, vascular',
            'Accurate classification prevents confounding.',
        ]
    },
    // ── Gastritis / Dyspepsia – Research ──
    {
        category: 'Gastritis / Dyspepsia',
        keywords: ['gastritis', 'dyspepsia', 'epigastric', 'dyspepsia confounders', 'gastritis confounding', 'dyspepsia study confounders', 'gi study confounders', 'dyspepsia study', 'gastritis study', 'gi symptom research', 'dyspepsia prevalence', 'gastritis prevalence'],
        question: 'What confounding factors must be controlled in dyspepsia studies?',
        answer: [
            'NSAID usage',
            'Alcohol intake',
            'Helicobacter pylori status',
            'Dietary habits',
            'Stress and anxiety',
            'Failure to control these weakens study validity.',
        ]
    },
    {
        category: 'Gastritis / Dyspepsia',
        keywords: ['dyspepsia outcomes', 'gastritis outcome measures', 'dyspepsia research outcomes', 'gi symptom research', 'gastritis prevalence', 'dyspepsia research', 'gastritis research'],
        question: 'Common outcome measures in dyspepsia research?',
        answer: [
            'Symptom score improvement',
            'Quality of life indices',
            'Recurrence rate',
            'Endoscopic findings (if applicable)',
        ]
    },
    // ── Acute Diarrhea – Research ──
    {
        category: 'Acute Diarrhea',
        keywords: ['diarrhea', 'loose stool', 'gastroenteritis', 'diarrhea endpoints', 'acute diarrhea endpoints', 'gastroenteritis study', 'diarrhea research endpoints', 'enteric infection research', 'diarrhea epidemiology', 'diarrhea research', 'diarrhea study'],
        question: 'What are standard endpoints in acute diarrhea research?',
        answer: [
            'Duration of illness',
            'Degree of dehydration',
            'Hospitalization rate',
            'Complication occurrence',
            'Mortality (in severe cases)',
        ]
    },
    {
        category: 'Acute Diarrhea',
        keywords: ['diarrhea bias', 'diarrhea study bias', 'diarrhea epidemiology bias', 'diarrhea recall bias', 'diarrhea underreporting', 'gastroenteritis bias', 'diarrhea confounding'],
        question: 'What biases commonly affect diarrhea studies?',
        answer: [
            'Recall bias',
            'Underreporting of mild cases',
            'Seasonal bias',
            'Selection bias in hospital-based studies',
            'Bias mitigation is essential for valid conclusions.',
        ]
    },
    // ── Cough & Respiratory – Research ──
    {
        category: 'Cough & Respiratory Research',
        keywords: ['cough', 'chronic cough', 'acute cough', 'cough duration research', 'cough category study', 'chronic cough study', 'respiratory symptoms research', 'cough classify', 'cough epidemiology', 'cough research', 'cough study', 'pulmonary research'],
        question: 'How is cough duration categorized in research?',
        answer: [
            'Acute (<3 weeks)',
            'Subacute (3–8 weeks)',
            'Chronic (>8 weeks)',
            'This classification standardizes study comparisons.',
        ]
    },
    {
        category: 'Cough & Respiratory Research',
        keywords: ['chronic cough variables', 'cough research variables', 'pulmonary epidemiology', 'cough study variables', 'cough variables', 'respiratory research variables'],
        question: 'Key variables in chronic cough research?',
        answer: [
            'Smoking history',
            'Environmental exposure',
            'Associated symptoms',
            'Radiological findings',
            'Response to therapy',
        ]
    },
    // ── Medication & Drug Safety – Research ──
    {
        category: 'Medication & Drug Safety Research',
        keywords: ['drug safety', 'medication safety', 'drug safety outcomes', 'drug safety study', 'adverse event outcome', 'paracetamol toxicity research', 'nsaid adverse effects', 'drug safety research', 'medication safety research', 'adverse drug research'],
        question: 'What outcomes are assessed in drug safety research?',
        answer: [
            'Adverse event frequency',
            'Dose–response relationship',
            'Organ-specific toxicity',
            'Drug–drug interactions',
            'Long-term safety signals',
        ]
    },
    {
        category: 'Medication & Drug Safety Research',
        keywords: ['causality adverse drug', 'adr causality', 'adverse drug reaction causality', 'rechallenge dechallenge', 'drug reaction assessment', 'causality assessment drug', 'adverse reaction causality'],
        question: 'How is causality assessed in adverse drug reactions?',
        answer: [
            'Temporal association',
            'Dechallenge and rechallenge',
            'Exclusion of alternative causes',
            'Standard causality scales',
            'Robust causality assessment prevents false attribution.',
        ]
    },
    // ── Study Design & Methodology ──
    {
        category: 'Study Design & Methodology',
        keywords: ['study design', 'research design', 'cohort vs case control', 'cohort case control', 'study design prefer', 'when cohort study', 'clinical research methods', 'cohort study', 'case control study', 'research methodology'],
        question: 'When is a cohort study preferred over a case-control study?',
        answer: [
            'When exposure is rare',
            'When incidence rates are needed',
            'When temporal relationship must be established',
        ]
    },
    {
        category: 'Study Design & Methodology',
        keywords: ['bias research', 'research bias types', 'bias control study', 'study design bias', 'common research bias', 'bias control', 'bias mitigation', 'research bias', 'bias types'],
        question: 'Common sources of bias in medical research?',
        answer: [
            'Selection bias',
            'Information bias',
            'Confounding',
            'Publication bias',
            'Explicit bias control strengthens evidence quality.',
        ]
    },
    // ── Data Analysis & Interpretation ──
    {
        category: 'Data Analysis & Interpretation',
        keywords: ['missing data research', 'missing data handle', 'imputation research', 'data missingness', 'medical statistics missing'],
        question: 'How should missing data be handled in medical research?',
        answer: [
            'Analyze pattern of missingness',
            'Use imputation methods if appropriate',
            'Avoid complete-case analysis unless justified',
        ]
    },
    {
        category: 'Data Analysis & Interpretation',
        keywords: ['statistical significance clinical', 'clinical significance', 'statistical vs clinical', 'p value clinical', 'research data interpretation'],
        question: 'Difference between statistical significance and clinical significance?',
        answer: [
            'Statistical significance reflects probability (p-value)',
            'Clinical significance reflects real-world impact',
            'Both must be considered before drawing conclusions.',
        ]
    },
]

// ─── Keyword matcher for researcher-facing Q&A ────────────────────────────────
export function matchResearchQA(query: string): ResearchQAItem | null {
    const q = query.toLowerCase()
    for (const entry of researchQAKnowledgeBase) {
        if (entry.keywords.some(kw => q.includes(kw))) {
            return entry
        }
    }
    return null
}

// ─── Response formatter for research Q&A ─────────────────────────────────────
export function formatResearchQAResponse(entry: ResearchQAItem): string {
    const answerLines = entry.answer
        .filter(line => line.trim() !== '')
        .map(line => `• ${line}`)
        .join('\n')

    return (
        `🔬 **${entry.category}**\n\n` +
        `**${entry.question}**\n\n` +
        answerLines +
        `\n\n*📊 For research reference only — validate against current literature.*`
    )
}

