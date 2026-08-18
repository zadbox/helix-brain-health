# AUDIT COMPLET — FICHE PATIENT HELIX
**Généré le 2026-03-29 | Projet Brain Health / HELIX**

---

## RÉSUMÉ GLOBAL

| Section | Titre | Champs | Conditionnel |
|---------|-------|--------|-------------|
| 1 | Identité du Patient | 6 | Non |
| 2 | Motif Principal de Consultation | 2 | Non |
| 3a | HMA — Douleur (PQRST) | 7 | Motif = douleur |
| 3b | HMA — Fièvre | 5 | Motif = fièvre |
| 3c | Histoire de la Maladie Actuelle (libre) | 1 | Motif ≠ douleur, ≠ fièvre |
| 4 | Signes Associés | 20 options | Non |
| 5 | Antécédents Médicaux & Chirurgicaux | 22 options + 1 libre | Non |
| 5b | Antécédents Gynéco-Obstétricaux | 4 | Sexe = F |
| 6 | Allergies & Traitements en cours | 7 options + 2 libres | Non |
| 7 | Mode de Vie | 6 | Non |
| 8 | Antécédents Familiaux | 9 options | Non |
| 9 | Constantes Vitales | 8 | Non (alertes auto) |
| 10 | Examen Clinique | 11 appareils | Non |
| 11 | Notes Libres du Médecin | 1 | Non |

**Total : ~100 champs / options distincts**

---

## SECTION 1 — IDENTITÉ DU PATIENT

| Champ | Type | Requis | Interface |
|-------|------|--------|-----------|
| `prenom` | string | Oui | Input texte |
| `nom` | string | Oui | Input texte |
| `age` | number | Oui | Input number |
| `sexe` | "M" \| "F" | Oui | Select (Masculin / Féminin) |
| `profession` | string | Non | Input texte |
| `dateConsultation` | string (ISO date) | Non | Input date (auto = aujourd'hui) |

**Logique :** Section ouverte par défaut. Complétée (✓ vert) si nom + prénom + âge + sexe renseignés.

---

## SECTION 2 — MOTIF PRINCIPAL DE CONSULTATION

| Champ | Type | Requis | Interface |
|-------|------|--------|-----------|
| `motifPrincipal` | MotifPrincipal | Oui | Boutons-grille (2 colonnes) |
| `motifLibre` | string | Non | Input texte libre |

### Valeurs possibles pour `motifPrincipal`

| Valeur | Label affiché |
|--------|--------------|
| `douleur` | Douleur |
| `fievre` | Fièvre |
| `dyspnee` | Dyspnée |
| `toux` | Toux |
| `cephalee` | Céphalée |
| `vertiges` | Vertiges |
| `palpitations` | Palpitations |
| `digestif` | Troubles digestifs |
| `urinaire` | Troubles urinaires |
| `cutane` | Éruption cutanée |
| `orl` | Symptômes ORL |
| `traumatisme` | Traumatisme |
| `fatigue` | Fatigue / Asthénie |
| `autre` | Autre |

**Logique :** Le motif sélectionné conditionne l'apparition de la section HMA (3a, 3b ou 3c).

---

## SECTION 3A — HMA DOULEUR (PQRST)
*Visible uniquement si `motifPrincipal === "douleur"`*

| Champ | Type | Interface |
|-------|------|-----------|
| `hmaDouleur.type` | string | Select |
| `hmaDouleur.eva` | number (0–10) | Slider EVA avec emoji |
| `hmaDouleur.localisation` | string | Input texte |
| `hmaDouleur.irradiation` | string | Input texte |
| `hmaDouleur.evolution` | string | Select |
| `hmaDouleur.facteursDeclenchants` | string | Input texte |
| `hmaDouleur.facteursCalmantsAggravants` | string | Input texte |

### Types de douleur (15 options)

| Valeur | Label |
|--------|-------|
| `mecanique` | Mécanique — aggravée à l'effort, soulagée au repos |
| `inflammatoire` | Inflammatoire — nocturne, dérouillage matinal |
| `neuropathique` | Neuropathique — brûlure, décharges, allodynie |
| `vasculaire` | Vasculaire — pulsatile, battements |
| `viscérale` | Viscérale — profonde, diffuse, mal localisée |
| `projetée` | Projetée — irradie à distance de la source |
| `constrictive` | Constrictive / en étau |
| `brulure` | Brûlure superficielle |
| `pique` | Piqûre / coup de poignard |
| `torsion` | Torsion / crampe |
| `pesanteur` | Pesanteur / lourdeur |
| `colique` | Colique — paroxystique, ondulante |
| `psychogene` | Psychogène / somatoforme |
| `mixte` | Mixte — plusieurs composantes |
| `autre` | Autre |

### Évolution de la douleur (5 options)

| Valeur | Label |
|--------|-------|
| `permanente` | Permanente / continue |
| `intermittente` | Intermittente / crises |
| `progressive` | Progressive |
| `regressive` | Régressive |
| `stable` | Stable |

### EVA — Échelle Visuelle Analogique

- Slider 0–10, feedback emoji (😌 → 💀)
- Couleur accent orange

---

## SECTION 3B — HMA FIÈVRE
*Visible uniquement si `motifPrincipal === "fievre"`*

| Champ | Type | Interface |
|-------|------|-----------|
| `hmaFievre.temperature` | number (°C) | Input number |
| `hmaFievre.duree` | string | Input texte |
| `hmaFievre.mode` | string | Select |
| `hmaFievre.frissons` | boolean | Checkbox |
| `hmaFievre.sueurs` | boolean | Checkbox |

### Mode d'installation (2 options)

| Valeur | Label |
|--------|-------|
| `brutal` | Brutal / Soudain |
| `progressif` | Progressif |

---

## SECTION 3C — HISTOIRE MALADIE ACTUELLE (libre)
*Visible si motif ≠ douleur ET ≠ fièvre*

| Champ | Type | Interface |
|-------|------|-----------|
| `hmaLibre` | string | Textarea 4 lignes |

---

## SECTION 4 — SIGNES ASSOCIÉS (20 options)

Interface : CheckGroup 2 colonnes

| | |
|-|-|
| Nausées | Vomissements |
| Diarrhée | Constipation |
| Anorexie | Amaigrissement |
| Asthénie | Sueurs |
| Dyspnée | Toux |
| Rhinorrhée | Odynophagie |
| Dysurie | Pollakiurie |
| Œdèmes | Éruption cutanée |
| Céphalées | Vertiges |
| Palpitations | Syncope |

Stocké dans `signesAssocies: string[]`

---

## SECTION 5 — ANTÉCÉDENTS MÉDICAUX & CHIRURGICAUX

### Antécédents médicaux (22 options)

Interface : CheckGroup 2 colonnes. Stocké dans `antecedentsMedicaux: string[]`

| | | |
|-|-|-|
| HTA | Diabète type 2 | Diabète type 1 |
| Obésité | Coronaropathie | Insuffisance cardiaque |
| ACFA | AVC/AIT | BPCO |
| Asthme | Tuberculose | Hépatite B/C |
| IRC | Néphropathie | Dyslipidémie |
| Hypothyroïdie | Hyperthyroïdie | Cancer |
| Dépression | Épilepsie | Polyarthrite rhumatoïde |
| Lupus | | |

### Antécédents chirurgicaux

| Champ | Type | Interface |
|-------|------|-----------|
| `antecedentsChirurgicaux` | string | Textarea 2 lignes |

Placeholder : *Chirurgies, hospitalisations antérieures...*

---

## SECTION 5B — ANTÉCÉDENTS GYNÉCO-OBSTÉTRICAUX
*Visible uniquement si `sexe === "F"`*

| Champ | Type | Interface |
|-------|------|-----------|
| `grossesses` | number | Input number (G) |
| `parites` | number | Input number (P) |
| `ddr` | string (date) | Input date |
| `cyclesReguliers` | boolean | Select (Réguliers / Irréguliers) |

---

## SECTION 6 — ALLERGIES & TRAITEMENTS EN COURS

### Allergies (7 options + détail)

Interface : CheckGroup 3 colonnes. Stocké dans `allergies: string[]`

| Pénicilline | Aspirine | AINS |
|-------------|---------|------|
| Iode | Latex | Aliments |
| Autre | | |

| Champ | Type | Interface |
|-------|------|-----------|
| `allergieDetail` | string | Input texte (précision) |
| `traitementsCours` | string | Textarea 2 lignes |

---

## SECTION 7 — MODE DE VIE

| Champ | Type | Interface |
|-------|------|-----------|
| `tabac` | boolean | Checkbox |
| `tabacPA` | number | Input number (si tabac = true) |
| `alcool` | boolean | Checkbox |
| `activitePhysique` | string | RadioGroup 2 colonnes |
| `alimentation` | string | RadioGroup 2 colonnes |

### Activité physique (4 options)

| Valeur | Label |
|--------|-------|
| `sedentaire` | Sédentaire |
| `faible` | Faible (marche) |
| `moderee` | Modérée (3x/sem) |
| `intense` | Intense (sportif) |

### Alimentation (4 options)

| Valeur | Label |
|--------|-------|
| `equilibree` | Équilibrée |
| `hypercalorique` | Hypercalorique |
| `hypocalorique` | Pauvre / insuffisante |
| `traditionnelle` | Traditionnelle |

---

## SECTION 8 — ANTÉCÉDENTS FAMILIAUX (9 options)

Interface : CheckGroup 3 colonnes. Stocké dans `antecedentsFamiliaux: string[]`

| | | |
|-|-|-|
| Diabète | HTA | Coronaropathie |
| AVC | Cancer colorectal | Cancer du sein |
| Cancer de la prostate | Maladies auto-immunes | Maladies psychiatriques |

---

## SECTION 9 — CONSTANTES VITALES

| Champ | Unité | Alerte si | Interface |
|-------|-------|-----------|-----------|
| `constantes.temperature` | °C | > 38.5 | Input number (rouge) |
| `constantes.taSystolique` | mmHg | > 180 ou < 90 | Input number (rouge) |
| `constantes.taDiastolique` | mmHg | — | Input number |
| `constantes.fc` | bpm | > 120 ou < 50 | Input number (orange) |
| `constantes.fr` | /min | > 25 | Input number (rouge) |
| `constantes.spo2` | % | < 94 | Input number (rouge) |
| `constantes.poids` | kg | — | Input number |
| `constantes.taille` | cm | — | Input number |

**Logique :** Alertes cliniques auto-générées et affichées dans le panneau agent. Section avec indicateur pulsant rouge si alerte active.

---

## SECTION 10 — EXAMEN CLINIQUE (11 appareils)

Structure : `examenClinique: Record<string, string>` — clé = appareil, valeur = texte libre + chips.

Chaque appareil dispose de :
- Bouton **✓ Normal** (remplace tout le contenu)
- Chips de trouvailles cliquables (toggle on/off)
- Textarea auto-resize pour notes libres
- Collapsible individuel + bouton "Déplier tout"

### Appareils et trouvailles

#### Cardiovasculaire (10 trouvailles)
`B1B2 normaux` | `Tachycardie` | `Bradycardie` | `Souffle systolique` | `Souffle diastolique` | `HTA` | `Hypotension` | `IC droite` | `IC gauche` | `Pouls faibles`

#### Pulmonaire / Respiratoire (8 trouvailles)
`MV normal` | `Râles crépitants` | `Sibilants` | `Ronchus` | `Diminution MV` | `Douleur pleurale` | `SpO2 basse` | `Dyspnée`

#### Abdominal / Digestif (8 trouvailles)
`Abdomen souple` | `Douleur à la palpation` | `Défense` | `Contracture` | `Hépatomégalie` | `Splénomégalie` | `Masse palpable` | `BHA diminués`

#### Neurologique (30 trouvailles)
`Conscience normale` | `Somnolence` | `Confusion` | `Coma` | `GCS 15/15` | `Désorientation T/L/E` | `Déficit moteur` | `Déficit sensitif` | `Hémiparésie` | `Hémiplégie` | `ROT normaux` | `ROT diminués` | `ROT vifs` | `Babinski +` | `Raideur méningée` | `Kernig +` | `Brudzinski +` | `Ataxie` | `Dysmétrie` | `Nystagmus` | `Troubles du langage` | `Aphasie` | `Dysarthrie` | `PC II–XII normaux` | `Ptosis` | `Diplopie` | `Paralysie faciale` | `Troubles de la marche` | `Tremblements`

#### Ophtalmologique (17 trouvailles)
`AV normale` | `BAV` | `Flou visuel` | `Diplopie` | `Fond d'œil normal` | `Papilledème` | `Atrophie optique` | `Hémorragies rétiniennes` | `Champ visuel normal` | `Hémianopsie` | `Quadranopsie` | `Pupilles isocores-réactives` | `Anisocorie` | `Mydriase` | `Myosis` | `Ptosis` | `Nystagmus` | `Paralysie oculomotrice`

#### Psychiatrique / Cognitif (27 trouvailles)
`Orienté T/L/E` | `Désorientation temporelle` | `Désorientation spatiale` | `Mémoire immédiate normale` | `Troubles mémoire immédiate` | `Mémoire récente normale` | `Troubles mémoire récente` | `Mémoire ancienne préservée` | `Troubles mémoire ancienne` | `Attention normale` | `Troubles attentionnels` | `Langage normal` | `Aphasie` | `Manque du mot` | `Humeur normale` | `Dépression` | `Anxiété` | `Euphorie` | `Comportement adapté` | `Agitation` | `Apathie` | `Désinhibition` | `Jugement conservé` | `Jugement altéré` | `MMSE normal (≥27)` | `MMSE léger (21-26)` | `MMSE modéré (11-20)` | `MMSE sévère (≤10)` | `Hallucinations` | `Idées délirantes`

#### ORL / Tête & Cou (7 trouvailles)
`Oropharynx normal` | `Amygdales inflammées` | `Otite` | `Adénopathies` | `Goitre` | `Sinusite` | `Déviation septale`

#### Cutané / Téguments (8 trouvailles)
`Peau normale` | `Ictère` | `Cyanose` | `Pâleur` | `Éruption` | `Œdèmes` | `Lésion suspecte` | `Cicatrice`

#### Locomoteur / Ostéo-articulaire (6 trouvailles)
`Mobilité normale` | `Douleur articulaire` | `Tuméfaction` | `Limitation d'amplitude` | `Déficit musculaire` | `Déformation`

#### Uro-génital / Rénal (5 trouvailles)
`Fosses lombaires libres` | `Douleur lombaire` | `Globe vésical` | `Dysurie` | `Hématurie`

#### État général (6 trouvailles)
`Bon état général` | `Altération EG` | `Fièvre` | `Asthénie` | `Amaigrissement` | `Déshydratation`

---

## SECTION 11 — NOTES LIBRES DU MÉDECIN

| Champ | Type | Interface |
|-------|------|-----------|
| `notesLibres` | string | Textarea 4 lignes |

Placeholder : *Notes personnelles, observations complémentaires, éléments importants non couverts...*

---

## INTERFACE TypeScript — `FichePatient`

```typescript
export interface FichePatient {
  // Section 1
  nom?: string;
  prenom?: string;
  age?: number;
  sexe?: "M" | "F";
  profession?: string;
  dateConsultation?: string;

  // Section 2
  motifPrincipal?: MotifPrincipal;
  motifLibre?: string;

  // Section 3
  hmaDouleur?: {
    type?: string;
    eva?: number;
    localisation?: string;
    irradiation?: string;
    evolution?: string;
    facteursDeclenchants?: string;
    facteursCalmantsAggravants?: string;
  };
  hmaFievre?: {
    temperature?: number;
    duree?: string;
    mode?: string;
    frissons?: boolean;
    sueurs?: boolean;
  };
  hmaLibre?: string;

  // Section 4
  signesAssocies?: string[];

  // Section 5
  antecedentsMedicaux?: string[];
  antecedentsChirurgicaux?: string;

  // Section 5b
  grossesses?: number;
  parites?: number;
  ddr?: string;
  cyclesReguliers?: boolean;

  // Section 6
  allergies?: string[];
  allergieDetail?: string;
  traitementsCours?: string;

  // Section 7
  tabac?: boolean;
  tabacPA?: number;
  alcool?: boolean;
  activitePhysique?: string;
  alimentation?: string;

  // Section 8
  antecedentsFamiliaux?: string[];

  // Section 9
  constantes?: {
    temperature?: number;
    taSystolique?: number;
    taDiastolique?: number;
    fc?: number;
    fr?: number;
    spo2?: number;
    poids?: number;
    taille?: number;
  };

  // Section 10
  examenClinique?: Record<string, string>; // clé = appareil, valeur = trouvailles

  // Section 11
  notesLibres?: string;
}
```

---

## ALERTES AUTOMATIQUES (Section 9)

| Paramètre | Seuil d'alerte | Niveau |
|-----------|---------------|--------|
| Température | > 38.5°C | Urgent |
| TA Systolique | > 180 mmHg | Urgent |
| TA Systolique | < 90 mmHg | Urgent |
| SpO2 | < 94% | Urgent |
| FC | > 120 bpm | Warning |
| FC | < 50 bpm | Warning |
| FR | > 25 /min | Warning |

---

## POINTS À VÉRIFIER / MANQUANTS POTENTIELS

### Champs non couverts actuellement
- [ ] **IMC** — calculé automatiquement depuis poids + taille (non affiché)
- [ ] **Durée des symptômes** — absente comme champ distinct (partiellement dans hmaLibre)
- [ ] **Lieu d'origine / voyage récent** — pertinent pour maladies infectieuses/tropicales
- [ ] **Situation familiale** — célibataire, marié, veuf (pertinent psychiatrie/social)
- [ ] **Niveau socio-économique** — couverture sociale, accès aux soins
- [ ] **Consommation drogues** — pas de champ dédié (seul tabac/alcool couverts)
- [ ] **Médecin traitant / référent** — pas de champ
- [ ] **Groupe sanguin / rhésus** — non inclus
- [ ] **Vaccinations** — pas de section
- [ ] **Bilan biologique récent** — pas de section résultats paracliniques
- [ ] **Imagerie** — pas de section pour résultats d'imagerie

### Améliorations possibles HMA Fièvre
- [ ] Mode d'installation : option `"progressif"` en double dans le code (bug mineur)
- [ ] Voyages récents / contages infectieux — non couverts

### Examen Clinique
- [ ] Rectal / prostate — non inclus dans appareils
- [ ] Sein / gynécologique — non inclus (pertinent pour section féminine)
- [ ] Cardiaque : pas de champ FC/TA redondant depuis constantes

---

*Fin de l'audit — HELIX BRAINHEALTH 2026*
