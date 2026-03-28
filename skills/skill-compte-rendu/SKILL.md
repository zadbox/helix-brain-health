# Skill: Documentation & Compte Rendu — skill-compte-rendu

**Version:** 1.0 | **Priorité:** V1 Core | **Domaine:** Documentation médicale

## Triggers

Ce skill est activé quand :
- Le médecin clique "Terminer Consultation"
- Le médecin tape "compte rendu", "CR", "résumé" dans le chat
- La progression de la fiche est > 70%

## Context

### Structure du Compte Rendu Brain Health

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPTE RENDU DE CONSULTATION — BRAIN HEALTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cabinet Médical : [Nom du cabinet]
Médecin : Dr [Prénom Nom] — [Spécialité] — N° INPE: [XXXXX]
Date : [Jour DD/MM/AAAA] à [HH:MM]
Durée de consultation : [X] minutes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. IDENTITÉ DU PATIENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nom / Prénom : [NOM Prénom]
Date de naissance : [DD/MM/AAAA] (âge : X ans)
Sexe : Masculin / Féminin
Profession : [...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. MOTIF DE CONSULTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Description du motif principal]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. HISTOIRE DE LA MALADIE ACTUELLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Narration chronologique des symptômes avec caractéristiques PQRST si applicable]

Signes associés : [...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. ANTÉCÉDENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Médicaux : [...]
Chirurgicaux : [...]
Familiaux : [...]
Gynéco-obstétricaux : [si femme] G[X]P[X], DDR [...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. MODE DE VIE & ALLERGIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tabac : [X PA / Non-fumeur]
Alcool : [Oui / Non]
Activité physique : [...]
Allergies : [Aucune connue / ...]
Traitements en cours : [...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. EXAMEN CLINIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Constantes vitales :
- Température : [X°C]
- Tension artérielle : [X/X mmHg]
- Fréquence cardiaque : [X bpm]
- Fréquence respiratoire : [X/min]
- SpO₂ : [X%]
- Poids : [X kg] | Taille : [X cm] | IMC : [X kg/m²]

Examen par appareil :
• Cardiovasculaire : [...]
• Pulmonaire : [...]
• Abdominal : [...]
• Neurologique : [...]
• [autres appareils...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. HYPOTHÈSES DIAGNOSTIQUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Diagnostic principal retenu : [...]
Diagnostics différentiels : [...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. EXAMENS COMPLÉMENTAIRES PRESCRITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Biologie : [NFS, CRP, Ionogramme, ...]
Imagerie : [RX thorax, Écho abdominale, ...]
Autres : [ECG, ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9. ORDONNANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rp/
1. [DCI 1g] — [forme] — [posologie] — [durée]
2. [DCI 2] — ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10. CONSEILS HYGIÉNO-DIÉTÉTIQUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Recommandations personnalisées selon le profil du patient]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11. SUIVI & RÉÉVALUATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Consulter en urgence si : [...]
Réévaluation dans : [X jours/semaines]
Prochain RDV : [...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fait à [Ville], le [DD/MM/AAAA] à [HH:MM]
Généré par Brain Health AI — Document confidentiel

Dr [NOM PRÉNOM]
Cachet et signature
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Règles de rédaction

1. **Ton médical professionnel** — pas de jargon informel
2. **Narration chronologique** — commencer par "M./Mme X, [âge] ans, se présente pour..."
3. **Précision factuelle** — ne jamais inventer des données non saisies (écrire "non renseigné")
4. **IMC auto-calculé** si poids + taille disponibles
5. **Diagnostic différentiel** — toujours mentionner 2-3 DD
6. **Conformité légale** — horodatage obligatoire, signature médecin

## Output format

```json
{
  "compteRendu": "string (texte formaté complet)",
  "sections": {
    "identite": "string",
    "motif": "string",
    "hma": "string",
    "antecedents": "string",
    "examen": "string",
    "diagnostic": "string",
    "examens": "string",
    "ordonnance": "string",
    "conseils": "string",
    "suivi": "string"
  },
  "metadata": {
    "dateGeneration": "ISO string",
    "dureeMsConsultation": 0,
    "completionScore": 0,
    "validationMedecin": false
  }
}
```
