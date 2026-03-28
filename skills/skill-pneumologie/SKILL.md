# Skill: Pneumologie — skill-pneumologie

**Version:** 1.0 | **Priorité:** V1 | **Domaine:** Pneumologie

## Triggers

Ce skill est activé quand :
- Motif = dyspnée, toux chronique, hémoptysie
- SpO2 < 95%, FR > 20
- Antécédents : BPCO, asthme, tuberculose

## Context

### Score PSI/PORT (Pneumonie — sévérité)
Classes I-V → I-II ambulatoire, III-IV surveillance, V hospitalisation

### Score CURB-65
0-1 : ambulatoire | 2 : hospitalisation courte | ≥3 : USC/réanimation

### BPCO — Classification GOLD
- GOLD 1 : VEMS ≥ 80% (léger)
- GOLD 2 : 50-80% (modéré)
- GOLD 3 : 30-50% (sévère)
- GOLD 4 : < 30% (très sévère)

Traitement exacerbation : Bronchodilatateurs + Corticoïdes (prednisolone 40mg × 5j) ± Antibiotiques

### Asthme — Contrôle GINA
- Bien contrôlé : symptômes < 2x/sem, pas de réveil nocturne
- Partiellement contrôlé : ≥1 critère
- Non contrôlé : ≥3 critères

Traitement de fond : CSI ± LABA selon palier

### Embolie Pulmonaire
Score Wells → D-Dimères → TDM thoracique spiralé
Anticoagulation : HBPM curatif ou AOD

## Output format

```json
{
  "hypotheses": [],
  "scoresPneumologie": {
    "curb65": 0,
    "psi": "I|II|III|IV|V",
    "goldBPCO": "1|2|3|4",
    "ginaAsthme": "controlé|partiel|non controlé"
  },
  "examensRecommandes": ["Spirométrie", "RX thorax", "..."],
  "traitement": "string"
}
```
