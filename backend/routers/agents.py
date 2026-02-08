from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import sys
import os
from pathlib import Path

# Add agents_ai to sys.path if not already there
# We assume agents_ai is at the same level as backend
# c:\Users\ROHAN\Medical\agents_ai
AGENTS_DIR = Path(__file__).resolve().parent.parent.parent / "agents_ai"
if str(AGENTS_DIR) not in sys.path:
    sys.path.append(str(AGENTS_DIR))

try:
    from orchestrator import DrugRepurposingOrchestrator
except ImportError as e:
    # Handle case where imports fail (e.g. missing dependencies in env)
    print(f"Failed to import Orchestrator: {e}")
    DrugRepurposingOrchestrator = None

router = APIRouter(
    prefix="/agents",
    tags=["agents"],
    responses={404: {"description": "Not found"}},
)

class QueryRequest(BaseModel):
    query: str

# Global instance (lazy loading could be better but this is simple)
orchestrator_instance = None

def get_orchestrator():
    global orchestrator_instance
    if orchestrator_instance is None:
        if DrugRepurposingOrchestrator is None:
             raise HTTPException(status_code=500, detail="Agents system could not be loaded. Check server logs.")
        try:
            orchestrator_instance = DrugRepurposingOrchestrator()
        except Exception as e:
             import traceback
             traceback.print_exc()
             raise HTTPException(status_code=500, detail=f"Failed to initialize agents: {str(e)}")
    return orchestrator_instance

# Mock responses for sample questions to bypass LLM
SAMPLE_RESPONSES = {
    "what are the current treatments for alzheimer's?": "Current treatments for Alzheimer's disease include cholinesterase inhibitors (Donepezil, Rivastigmine, Galantamine) and NMDA receptor antagonists (Memantine). Recently, anti-amyloid antibodies like Lecanemab and Donanemab have shown promise in slowing cognitive decline in early stages. Non-drug approaches include cognitive stimulation therapy and lifestyle modifications.",
    "find recent clinical trials for diabetes.": "Recent clinical trials for diabetes focus on: 1. Once-weekly insulin formulations (e.g., Insulin Icodec). 2. Dual and Triple agonists (GLP-1/GIP/Glucagon) like Retatrutide. 3. Stem cell-derived islet cell therapies for Type 1 Diabetes. 4. Novel SGLT2 inhibitors for kidney protection in diabetics.",
    "analyze the side effects of lisinopril.": "Common side effects of Lisinopril include: dry cough (very common), dizziness, headache, and fatigue. Serious but rare side effects include angioedema (swelling of face/lips), hyperkalemia (high potassium), and renal impairment. It is contraindicated in pregnancy due to fetal toxicity.",
    "what is the guideline-recommended first-line therapy for hfref in 2024?": "Foundational quadruple therapy: ARNI (or ACEi/ARB), beta-blocker, MRA, and SGLT2 inhibitor, initiated early at low doses and uptitrated as tolerated (ACC/AHA/ESC guidance).",
    "can i prescribe an sglt2 inhibitor in a non-diabetic heart failure patient?": "Yes. Dapagliflozin and empagliflozin reduce HF hospitalization and mortality in HFrEF and HFpEF independent of diabetes status.",
    "what antihypertensive is preferred in a patient with cad and lv dysfunction?": "Beta-blockers and ACE inhibitors/ARNI are preferred due to mortality benefit; add CCBs cautiously if angina persists (avoid non-DHP CCBs in HFrEF).",
    "how should statin intensity be selected in secondary prevention?": "Use high-intensity statins (atorvastatin 40–80 mg or rosuvastatin 20–40 mg) aiming for ≥50% LDL-C reduction; add ezetimibe/PCSK9 if targets aren’t met.",
    "what anticoagulant is preferred in atrial fibrillation with normal renal function?": "DOACs (apixaban, rivaroxaban, dabigatran, edoxaban) are preferred over warfarin unless contraindicated (e.g., mechanical valves).",
    "how should i adjust hf medications in ckd stage 3?": "Start low, titrate slowly; monitor potassium and eGFR closely. SGLT2 inhibitors are generally safe down to guideline-specified eGFR thresholds.",
    "what drug interactions should i watch for with amiodarone?": "Increased levels of warfarin, digoxin, and statins (especially simvastatin); monitor INR, digoxin levels, and consider statin dose limits.",
    "when is ivabradine indicated in heart failure?": "In sinus rhythm, LVEF ≤35%, HR ≥70 bpm despite maximally tolerated beta-blocker, to reduce HF hospitalizations.",
    "which biomarkers are most useful for hf prognosis today?": "NT-proBNP/BNP for diagnosis and prognosis; hs-troponin for risk stratification; consider ST2 and galectin-3 as adjuncts.",
    "when should coronary ct angiography be preferred over stress testing?": "In low–intermediate risk chest pain with unclear diagnosis; CCTA provides high negative predictive value for CAD.",
    "how can ai assist in ecg interpretation for arrhythmias?": "AI can detect subtle AF, VT risk, LV dysfunction patterns, and reduce interpretation variability—used as decision support, not replacement.",
    "what’s new in interventional cardiology for complex cad?": "Advances include IVUS/OCT-guided PCI, drug-coated balloons, physiology-guided revascularization (FFR/iFR), and improved CTO techniques.",
    "what are current indications for tavr over savr?": "TAVR is preferred in older patients and those with intermediate to high surgical risk; expanding use in selected low-risk patients.",
    "are there newer lipid-lowering therapies beyond pcsk9 inhibitors?": "Yes—inclisiran (siRNA) provides durable LDL-C reduction with twice-yearly dosing after loading.",
    "what’s the role of renal denervation in resistant hypertension?": "Emerging evidence supports modest BP reduction in carefully selected patients; availability and guideline adoption vary.",
    "how is ai used in echocardiography today?": "AI automates EF measurement, strain analysis,, chamber quantification, improving speed and reproducibility.",
    "what’s new in hfpef management?": "SGLT2 inhibitors now show benefit; focus on comorbidity management, diuretics for congestion, and phenotype-guided therapy.",
    "can ai recommend exact drug doses for my patient?": "AI can suggest guideline-based ranges, but final dosing must consider patient-specific factors and clinician judgment.",
    "how reliable is ai for clinical decision-making?": "AI is best used as clinical decision support, augmenting—not replacing—expert judgment and guidelines.",
    "how should ai outputs be documented in clinical practice?": "Document AI as a supporting tool, note clinician validation, and reference guidelines and patient context."
}

@router.post("/query")
async def query_agents(request: QueryRequest):
    """
    Send a query to the multi-agent system.
    """
    # Check for sample questions
    normalized_query = request.query.strip().lower()
    if normalized_query in SAMPLE_RESPONSES:
        return {"response": SAMPLE_RESPONSES[normalized_query]}

    orchestrator = get_orchestrator()
    try:
        response = orchestrator.route_and_execute(request.query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
