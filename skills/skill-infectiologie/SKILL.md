# Skill: Infectiologie — skill-infectiologie

**Version:** 1.0 | **Priorité:** V1 | **Domaine:** Infectiologie

## Triggers

Ce skill est activé quand :
- Motif = fièvre, infections, sepsis
- Signes infectieux (fièvre + leucocytose + CRP élevée)
- Demande d'antibiothérapie guidée

## Context

### Score qSOFA (Sepsis — SOFA simplifié)
- FR ≥ 22/min : +1
- Altération conscience : +1
- PAS ≤ 100 mmHg : +1
→ qSOFA ≥ 2 = sepsis probable → réanimation

### Critères SIRS (Syndrome Inflammatoire Réponse Systémique)
- Température > 38.3°C ou < 36°C
- FC > 90 bpm
- FR > 20/min ou PaCO2 < 32 mmHg
- GB > 12 000 ou < 4 000 ou > 10% formes jeunes

### Antibiothérapie guidée Maroc (épidémiologie locale)

**Pneumonie communautaire (adulte)** — Score PSI/CURB-65
- CURB-65 ≤ 1 : Amoxicilline PO 1g x3/j × 7j
- CURB-65 2 : Amoxicilline-clav + Macrolide
- CURB-65 ≥ 3 : Hospitalisation + C3G + Macrolide IV

**Score CURB-65**
- C : Confusion +1
- U : Urée > 7 mmol/L +1
- R : FR ≥ 30/min +1
- B : TA sys < 90 ou dia < 60 +1
- 65 : Âge ≥ 65 ans +1

**Infection urinaire**
- Cystite simple : Cotrimoxazole 960mg x2 × 5j
- IU compliquée : Ciprofloxacine 500mg x2 × 10-14j
- Pyélonéphrite : C3G IV si signes de gravité

**Tuberculose (Maroc — endémique)**
- 2RHZE / 4RH (schéma OMS)
- Notification obligatoire
- Dépistage contacts

**Paludisme (voyageurs Afrique subsaharienne)**
- Frottis + goutte épaisse en urgence
- Artéméther-Luméfantrine si P. falciparum

## Output format

```json
{
  "hypotheses": [],
  "qSOFA": 0,
  "sirs": false,
  "foierInfectieux": "string",
  "antibiotiqueRecommande": {
    "molecule": "string",
    "posologie": "string",
    "duree": "string",
    "voie": "PO|IV|IM"
  },
  "bilansRecommandes": ["NFS", "CRP", "Hémocultures", "..."],
  "hospitalisationNecessaire": false
}
```
