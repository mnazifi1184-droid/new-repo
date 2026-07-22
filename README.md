# Inventory Management — Google Apps Script

This repository is being migrated from the original project export to a modular Google Apps Script + Google Sheets architecture.

## Stack

- Google Apps Script (V8)
- Google Sheets as database
- HTML / CSS / JavaScript frontend
- Google Drive / Advanced Drive Service for Excel workflows

## Original project modules

- `Code.gs` — authentication, sessions, sheet operations, Excel upload, merge logic
- `Styles.html` — shared styles
- `Common.html` — shared client utilities
- `Login.html` — login page
- `Signup.html` — registration page
- `Dashboard.html` — dashboard
- `Upload.html` — Excel upload and preview
- `View.html` — sheet data viewer
- `Merge.html` — sheet merge and template workflows

## Development direction

The original exported project is the source of truth. The Node.js/Express prototype is no longer the development target.

Planned evolution:

1. Import the original source files without losing functionality.
2. Split server-side code into modular `.gs` services.
3. Split client-side JavaScript into reusable modules.
4. Keep Google Sheets as the initial database.
5. Add authentication, roles, permissions, Excel upload, column mapping, merge workflows, inventory, purchasing, sales, and reporting.
6. Deploy as a Google Apps Script Web App.

## Deployment

The web app configuration is defined in `appsscript.json`.

For production deployment, configure the Apps Script project with the required Google Sheet ID and Advanced Drive Service settings, then deploy as a Web App.
