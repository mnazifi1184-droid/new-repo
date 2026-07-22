# Inventory Management

A modular inventory management system being migrated from Google Apps Script to JavaScript and Node.js.

## Current Architecture

- **Frontend:** HTML, CSS, JavaScript ES Modules
- **Backend:** Node.js + Express
- **Database:** Planned for a later commit
- **Excel Processing:** Planned for a later commit
- **Authentication:** Planned for a later commit

## Project Structure

```text
.
├── client/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── server/
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Run Locally

Install dependencies:

```bash
npm install
```

Create a local environment file from `.env.example` and configure the port if needed.

Start the application:

```bash
npm start
```

For development with Node.js watch mode:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## API Health Check

```text
GET /api/health
```

## Development Roadmap

1. Project initialization
2. Authentication and Login/Signup
3. Session management and roles
4. Dashboard
5. Excel upload
6. Excel preview and column selection
7. Data management
8. Merge engine
9. Saved merge templates
10. Admin panel
11. Inventory management modules
