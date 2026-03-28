# Skill: Médicaments Maroc — skill-medicaments-ma

**Version:** 1.0 | **Priorité:** V1 Core | **Domaine:** Pharmacologie Marocaine

## Triggers

Ce skill est activé quand :
- Le médecin prescrit ou cherche un médicament
- Demande de vérification d'interactions
- Demande de génériques disponibles au Maroc
- Demande de prix ou remboursement AMO

## Context

### Base de données médicaments Maroc (top classes)

#### Antibiotiques (fréquents)
| DCI | Nom Maroc | Prix (MAD) | AMO | Classe |
|---|---|---|---|---|
| Amoxicilline 1g | Amoxil, Clamoxyl, Ospamox | 15-25 | Oui | Pénicilline |
| Amoxicilline + Acide clav. 1g | Augmentin | 55-70 | Oui | Pénicilline + IBL |
| Azithromycine 500mg | Zithromax, Azadose | 40-60 | Partiel | Macrolide |
| Ciprofloxacine 500mg | Ciflox, Ciprobay | 20-35 | Oui | Fluoroquinolone |
| Cotrimoxazole 960mg | Bactrim | 10-20 | Oui | Sulfamide |
| Métronidazole 500mg | Flagyl | 15-25 | Oui | Nitroimidazole |

#### Cardiovasculaires
| DCI | Nom Maroc | Prix (MAD) | AMO |
|---|---|---|---|
| Amlodipine 5mg | Amlor, Norvasc | 20-40 | Oui |
| Périndopril 5mg | Coversyl | 40-60 | Oui |
| Losartan 50mg | Cozaar, Losarpress | 30-50 | Oui |
| Bisoprolol 5mg | Cardensiel | 25-45 | Oui |
| Furosémide 40mg | Lasilix | 5-15 | Oui |
| Aspirine 100mg | Kardégic, Aspégic | 5-15 | Oui |
| Atorvastatine 20mg | Tahor, Lipitor | 40-70 | Oui |

#### Antidiabétiques
| DCI | Nom Maroc | Prix (MAD) | AMO |
|---|---|---|---|
| Metformine 500mg | Glucophage | 15-25 | Oui |
| Glibenclamide 5mg | Daonil | 10-20 | Oui |
| Insuline rapide | Actrapid, NovoRapid | 60-90 | Oui |
| Insuline NPH | Insulatard | 55-80 | Oui |

#### Antalgiques / AINS
| DCI | Nom Maroc | Prix (MAD) | AMO |
|---|---|---|---|
| Paracétamol 1g | Doliprane, Efferalgan | 10-20 | Partiel |
| Ibuprofène 400mg | Brufen, Nurofen | 15-30 | Partiel |
| Diclofénac 50mg | Voltarène | 15-25 | Oui |
| Tramadol 50mg | Contramal, Topalgic | 25-45 | Oui |
| Kétoprofène 100mg | Profénid | 20-35 | Oui |

### Interactions importantes à surveiller
- Warfarine + AINS → risque hémorragique +++
- IEC + AINS → insuffisance rénale aiguë
- Metformine + produit de contraste iodé → acidose lactique
- Fluoroquinolones + antiacides (Al, Mg) → absorption réduite
- Statines + Clarithromycine → rhabdomyolyse

### Règles AMO Maroc (CNSS/CNOPS)
- Remboursement 70-90% pour ALD (affections longue durée)
- ALD : HTA, Diabète, Cancer, Tuberculose, Insuffisance rénale, VIH
- Médicaments essentiels : disponibles dans pharmacies communautaires

## Output format

```json
{
  "medicament": {
    "dci": "string",
    "nomCommercial": ["string"],
    "prixMin_MAD": 0,
    "prixMax_MAD": 0,
    "remboursable": true,
    "disponibilite": "courant|spécialisé|hospitalier",
    "generiquesDisponibles": ["string"]
  },
  "interactions": [
    { "avec": "string", "severite": "mineure|modérée|sévère", "mecanisme": "string" }
  ],
  "contreIndications": ["string"]
}
```
