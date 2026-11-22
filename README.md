# NexaPanel Pro v2.1

A bilingual React and TypeScript dashboard portfolio project.

## Features

- English and Persian interface with an instant language toggle in the header
- Full RTL and LTR page layouts, including mobile navigation and drawers
- Persistent language and light/dark theme preferences using localStorage
- Persian calendar dates and Persian digit formatting in Farsi mode
- Local demo customer, transaction, analytics, plan, activity and settings pages
- Filtering, pagination, CSV exports, charts and local sample-data editing
- Responsive dashboard with command search and notification preview

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Language

Use the language switch in the top bar, or select a language on the Settings page and save the preferences. Data identifiers, statuses and stored sample values remain language-neutral so switching languages does not change data or filtering behavior.

## Data

This project uses demonstration data stored in the browser. It has no production backend, real authentication or live payment processing. Financial figures remain USD in both languages.
