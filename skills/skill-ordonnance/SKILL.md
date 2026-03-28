# Skill: Prescription & Ordonnance — skill-ordonnance

**Version:** 1.0 | **Priorité:** V1 Core | **Domaine:** Prescription médicamenteuse

## Triggers

Ce skill est activé quand :
- Le médecin demande une ordonnance via le chat
- Le diagnostic est confirmé et nécessite un traitement
- Le médecin tape : "ordonnance", "prescription", "traitement", "médicament"
- Fin de consultation

## Context

### Règles de prescription au Maroc

1. **DCI obligatoire** — toujours prescrire en DCI + nom commercial possible
2. **Générique en priorité** — favoriser les génériques disponibles (remboursement AMO)
3. **Interactions médicamenteuses** — vérifier systématiquement avant prescription
4. **Allergie** — vérifier les allergies connues du patient dans la fiche
5. **Insuffisance rénale/hépatique** — adapter les posologies si antécédents
6. **Grossesse** — contre-indications absolues (catégorie X FDA)
7. **Pédiatrie** — posologie en mg/kg pour les enfants

### Protocoles thérapeutiques courants (Maroc)

**Angine streptococcique**
- Amoxicilline 1g x3/j × 7j (adulte)
- Si allergie péni : Azithromycine 500mg J1 puis 250mg J2-5

**HTA stade 1 (non traitée)**
- 1ère ligne : IEC (Périndopril 5mg/j) ou ARA2 (Losartan 50mg/j)
- Alternative : Amlodipine 5mg/j

**Diabète type 2 (initiation)**
- Metformine 500mg x2/j repas, augmentation progressive

**Infection urinaire simple (femme)**
- Cotrimoxazole 960mg x2/j × 5j
- Alternative : Nitrofurantoïne 100mg x2/j × 5j

**Rhinopharyngite virale**
- Paracétamol 1g x4/j si fièvre (PAS d'antibiotiques)
- Lavage nasal sérum physiologique

**AINS pour douleur**
- Ibuprofène 400mg x3/j (repas obligatoire), max 5 jours

### Format d'ordonnance Maroc

```
Cabinet du Dr [Nom]
Adresse, Téléphone
N° INPE: [XXXXX]

ORDONNANCE
Patient: [Nom], [Âge] ans
Date: [JJ/MM/AAAA]

Rp/
1. [DCI (nom commercial)] — [forme] — [posologie] — [durée]
   └─ [instructions spéciales]

2. [DCI] — ...

Renouvelable: Oui / Non
```

## Output format

```json
{
  "ordonnance": [
    {
      "rang": 1,
      "dci": "string",
      "nomCommercial": "string (Maroc)",
      "forme": "comprimé|sirop|injectable|crème",
      "posologie": "string",
      "duree": "string",
      "instructions": "string",
      "prix_estimé_MAD": 0,
      "remboursable_AMO": true
    }
  ],
  "interactions": [],
  "contreIndications": [],
  "textFormate": "string (ordonnance complète formatée)"
}
```
