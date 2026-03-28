# Skill: Cardiologie — skill-cardiologie

**Version:** 1.0 | **Priorité:** V1 | **Domaine:** Cardiologie

## Triggers

Ce skill est activé quand :
- Motif = douleur thoracique, palpitations, dyspnée d'effort, syncope
- Antécédents = coronaropathie, IC, ACFA, HTA
- Constantes = FC anormale, TA > 160 ou < 90

## Context

### Scores cardiaques intégrés

**Score GRACE (SCA — risque à 6 mois)**
Variables : âge, FC, TAS, créatinine, Killip, arrêt cardiaque, ST, troponine

**Score TIMI (STEMI/NSTEMI)**
0-7 points : âge ≥65, ≥3 FDR CV, coronaropathie connue, déviation ST, ≥2 épisodes angineux, aspirine 7j, marqueurs élevés

**Score CHA₂DS₂-VASc (ACFA — risque embolique)**
- Cardiopathie +1, HTA +1, Age 65-74 +1, Age ≥75 +2, Diabète +1, AVC/AIT +2, Sexe féminin +1, Vasculopathie +1
→ Score ≥2 hommes, ≥3 femmes : anticoagulation recommandée

**Score Wells (EP)**
- ATCD TVP/EP : +1.5, FC > 100 : +1.5, Immobilisation ≥3j : +1.5
- Signes TVP : +3, Autre diagnostic improbable : +3
- Cancer actif : +1, Hémoptysie : +1
→ Score > 4 : EP probable, TDM thoracique

### Pathologies cardiaques prioritaires

| Pathologie | Signes clés | Score | Examens |
|---|---|---|---|
| SCA STEMI | Sus-ST ≥ 1mm dans 2 dérivations | GRACE + TIMI | ECG 12 dérivations, troponine |
| SCA NSTEMI | Sous-ST, troponine +, douleur | TIMI | ECG, troponine, ETT |
| IC aiguë | Dyspnée + crépitants + BNP | — | RX thorax, ETT, BNP |
| ACFA | Palpitations + irrégulier + ECG | CHA2DS2 | ECG, Echo, TSH |
| EP | Dyspnée + tachycardie + D-dimères | Wells | D-Dimères, TDM |
| HTA urgence | TA > 180/120 + organes cibles | — | ECG, fond d'œil, créat |

## Output format

```json
{
  "hypotheses": [],
  "scores": {
    "grace": null,
    "timi": null,
    "cha2ds2": null,
    "wells": null
  },
  "examensUrgents": ["ECG", "Troponine", "..."],
  "traitementUrgent": "string",
  "commentaire": "string"
}
```
