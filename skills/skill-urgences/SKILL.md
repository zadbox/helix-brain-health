# Skill: Urgences & Tri — skill-urgences

**Version:** 1.0 | **Priorité:** V1 Core | **Domaine:** Urgences / Triage

## Triggers

Ce skill est activé quand :
- Constantes vitales anormales (TA > 180, SpO2 < 94%, FC > 120, FR > 25, T° > 40°C)
- Douleur EVA ≥ 8/10
- Symptômes suggérant une urgence vitale
- Médecin tape "urgence" ou "grave" dans le chat
- Combinaison de signes de gravité

## Context

### Scores d'urgence intégrés

**Score ABCDE (Triage rapide)**
- A — Airway (voies aériennes libres ?)
- B — Breathing (FR, SpO2, tirage)
- C — Circulation (TA, FC, TRC, couleur)
- D — Disability (Glasgow, pupilles, glycémie)
- E — Exposure (température, lésions visibles)

**Score de Glasgow** (réponse oculaire + verbale + motrice / 15)

**qSOFA (Sepsis hors réanimation)**
- FR ≥ 22/min : +1
- Altération conscience (Glasgow < 15) : +1
- TAS ≤ 100 mmHg : +1
→ qSOFA ≥ 2 : suspicion sepsis, transfert urgent

**Score NIHSS (AVC — simplifié)**
- Conscience, regard, champs visuels, paralysie faciale, motricité membres, ataxie, sensibilité, langage, dysarthrie, extinction

### Pathologies = URGENCES ABSOLUES

| Pathologie | Signes clés | Action immédiate |
|---|---|---|
| SCA (infarctus) | Douleur constrictive + irradiation + sueurs | ECG, aspirine 300mg, SAMU |
| AVC ischémique | FAST positif, < 4h30 | SAMU, IRM cérébrale |
| Dissection Ao | Douleur déchirante + pouls asymétriques | SAMU, TA différentielle |
| EP massive | Dyspnée + tachycardie + SpO2 chute | SAMU, anticoagulation |
| Méningite | Fièvre + raideur nuque + purpura | Amoxicilline IV immédiat |
| Anaphylaxie | Urticaire + dyspnée + TA chute | Adrénaline IM 0.5mg |
| Crise convulsive | > 5min ou répétitive | Diazépam rectal/IV |
| DKA | Hyperglycémie + dyspnée de Kussmaul + cétonurie | Insuline + remplissage |
| Hypoglycémie sévère | Glycémie < 0.5g/L + signes neuro | Glucose IV 30% |

## Output format

```json
{
  "niveauUrgence": "5-vert|4-bleu|3-jaune|2-orange|1-rouge",
  "classification": "Non urgent|Urgent|Très urgent|Extrême urgence",
  "scoreABCDE": { "A": "ok|compromis", "B": "ok|compromis", "C": "ok|compromis", "D": "ok|compromis", "E": "ok|anomalie" },
  "qSOFA": 0,
  "actionImmediate": "string",
  "transfertUrgent": true,
  "hypotheses": [],
  "commentaire": "string"
}
```
