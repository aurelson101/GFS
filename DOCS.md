# Documentation Technique - Gestion Financière SAS

## Description des fichiers

Cette documentation détaille la fonction de chaque fichier dans l'application de gestion financière.

### Fichiers principaux

| Fichier | Description |
|---------|-------------|
| `index.html` | Page principale de l'application, contient la structure HTML, les références aux fichiers CSS et JavaScript, et quelques styles intégrés. Point d'entrée de l'application. |
| `script_new_fixed.js` | Contrôleur principal de l'application contenant les fonctions core de l'application (initialisation, gestion des événements, manipulation des données, etc.). Implémente la logique métier générale. |

### Modules fonctionnels

| Fichier | Description |
|---------|-------------|
| `comparison.js` | Module de comparaison financière permettant d'analyser et comparer les performances entre différentes années. Inclut des outils de visualisation comparative et d'export Excel. |
| `comparison_module.js` | Version améliorée du module de comparaison avec des fonctionnalités supplémentaires. |
| `stats.js` | Module d'analyse statistique des données financières, calcule les indicateurs clés de performance, les tendances et les variations. |
| `forecast_new.js` | Module de prévisions financières amélioré, permet de générer des projections basées sur les données historiques et des paramètres configurables. |
| `forecast_module.js` | Module de prévisions de base, contient les algorithmes de projection financière. |
| `budget_module.js` | Gestion du budget et des objectifs financiers, permet de définir des budgets et de suivre leur réalisation. |
| `reports_module.js` | Génération de rapports financiers standardisés. |
| `reports_new.js` | Version améliorée du module de rapports avec plus d'options et de types de rapports. |

### Utilitaires et outils

| Fichier | Description |
|---------|-------------|
| `data_manager.js` | Gestionnaire de données responsable de la sauvegarde, du chargement et de la synchronisation des données financières. Utilise localStorage pour la persistance côté client. |
| `export-libs.js` | Bibliothèque d'export permettant de générer des fichiers Excel (XLSX), PDF et autres formats à partir des données de l'application. |
| `enhancements.js` | Fonctionnalités supplémentaires et améliorations diverses pour enrichir l'expérience utilisateur. |
| `service-worker.js` | Service worker pour améliorer les performances et permettre l'utilisation hors ligne de l'application. |
| `manifest.json` | Manifeste d'application web pour permettre l'installation sur les appareils mobiles (PWA). |

### Styles et design responsive

| Fichier | Description |
|---------|-------------|
| `styles.css` | Feuille de style principale contenant tous les styles de base de l'application. |
| `responsive.css` | Styles spécifiques pour l'adaptation aux différents appareils (desktop, tablette, mobile). Contient les media queries et les ajustements responsives. |
| `mobile-optimizations.js` | Optimisations spécifiques pour les appareils mobiles, gestion des événements tactiles et ajustements d'interface. |
| `optimizations.js` | Optimisations générales de performance pour améliorer la réactivité de l'application. |

## Architecture technique

L'application est construite sur une architecture modulaire, où chaque fichier JavaScript encapsule une fonctionnalité spécifique. L'approche adoptée est orientée objet avec une séparation claire des responsabilités :

- **Couche de présentation** : HTML et CSS pour l'interface utilisateur
- **Couche logique** : Modules JavaScript pour la logique métier
- **Couche de données** : Data manager pour la persistance et la gestion des données

La communication entre les modules se fait via des événements personnalisés et des références directes, en suivant un design pattern proche du MVC (Modèle-Vue-Contrôleur).

## Évolutions prévues

1. Migration vers une architecture basée sur des composants web
2. Amélioration de la synchronisation des données via une API REST
3. Ajout de nouvelles visualisations et analyses financières
4. Optimisation pour les appareils à faible puissance

## Conseils pour les développeurs

- Les fichiers se terminant par `_new.js` sont des versions améliorées destinées à remplacer les versions originales
- Utilisez `data_manager.js` pour toutes les opérations liées aux données
- La stylisation doit être faite dans `styles.css` ou `responsive.css` selon le contexte
- Testez toujours sur différents appareils avant de déployer des modifications
