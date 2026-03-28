# Skill: Médecine Générale — skill-generaliste

**Version:** 1.0 | **Priorité:** V1 Core | **Domaine:** Médecine Générale

## Triggers

Ce skill est activé quand :
- Le médecin est généraliste (non spécialisé)
- Le motif de consultation est non spécifié ou général
- Les symptômes couvrent plusieurs systèmes
- Besoin d'un diagnostic différentiel large
- Pathologies courantes : infections, HTA, diabète, douleurs, fatigue, toux

## Context

Ce skill encode la logique de raisonnement clinique en médecine générale marocaine :
- Pathologies les plus fréquentes (prévalence locale)
- Approche PQRST pour la douleur
- RED FLAGS systémiques à ne jamais manquer
- Adaptation aux ressources disponibles au Maroc

### Pathologies prioritaires (top 20 MG Maroc)
1. Infections respiratoires hautes (rhinopharyngite, angine, OMA)
2. HTA (40% adultes >40ans au Maroc)
3. Diabète type 2
4. Lombalgies aiguës et chroniques
5. Gastro-entérite aiguë
6. Céphalées tension / migraines
7. Anxiété / dépression
8. Dermatoses (eczéma, psoriasis, mycoses)
9. Anémie ferriprive
10. Arthrose, tendinopathies
11. Reflux gastro-oesophagien
12. Syndrome irritable du côlon
13. Infections urinaires
14. Thyroïdite / hypothyroïdie
15. Conjonctivite

### RED FLAGS — ne jamais manquer

| Symptôme | Red Flag | Urgence |
|---|---|---|
| Douleur thoracique | + irradiation bras gauche, dyspnée, sueurs → SCA | Absolue |
| Céphalée | "pire céphalée de ma vie" → HSA | Absolue |
| Fièvre | + raideur nuque, purpura → Méningite | Absolue |
| Dyspnée | + SpO2 < 94%, FR > 25 → IRA | Urgente |
| Douleur abdominale | + défense, fièvre → Urgence chirurgicale | Urgente |
| Faiblesse brutale | unilatérale, faciale → AVC (FAST) | Absolue |
| Syncope | + douleur thoracique → Dissection Ao | Absolue |

## Output format

```json
{
  "hypotheses": [
    {
      "id": "string",
      "diagnostic": "string",
      "probabilite": "haute|moyenne|faible",
      "arguments": ["string"],
      "ddx": ["string"],
      "redFlags": ["string"],
      "examensRecommandes": ["string"]
    }
  ],
  "suggestions": [
    {
      "id": "string",
      "type": "question|examen|action",
      "texte": "string",
      "priorite": "immediate|routine"
    }
  ],
  "alerteGravite": "aucune|moderee|urgente|absolue",
  "commentaire": "string"
}
```
