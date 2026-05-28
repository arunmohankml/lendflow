# LendFlow

<div align="center">

### Modern Personal Loan & Interest Tracking PWA

Track customer loans, interest, payments, and balances with a clean app-like experience.

![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge\&logo=node.js\&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge\&logo=supabase\&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Installable-blue?style=for-the-badge)
![Mobile First](https://img.shields.io/badge/Mobile-First-black?style=for-the-badge)
![Responsive](https://img.shields.io/badge/Responsive-UI-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

</div>

---

## Overview

LendFlow is a clean and modern Progressive Web App (PWA) built for tracking:

* Customer loan records
* Interest calculations
* Paid amount updates
* Remaining balances
* Active / Paid statuses

The app is designed with a simple and non-technical user experience in mind.

It behaves like a real mobile application and can be installed directly on phones or desktops.

---

## Features

### Loan Management

* Add customer loan records
* Edit existing records
* Delete records safely
* Search customer names instantly

### Interest Tracking

* Percentage-based interest system
* Monthly interest calculations
* Auto-updating balances
* Running total calculations

### Payment Updates

* Update paid amounts
* Automatically calculate remaining balance
* Automatically mark records as paid

### PWA Experience

* Installable app
* Mobile-first UI
* Fast loading
* Smooth transitions
* Offline-ready structure
* App-like navigation

### UI/UX

* Inspired by modern Google apps & Material 3
* Rounded soft cards
* Floating action button
* Bottom-sheet forms
* Clean typography
* Lightweight animations
* Responsive desktop layout

---

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* Supabase

---

## Screens

* Customer List Dashboard
* Add Loan Record
* Edit Loan Record
* Payment Update Popup
* Search & Filter System

---

## Database Structure

Example table: `loan_records`

| Column              | Type      |
| ------------------- | --------- |
| id                  | UUID      |
| customer_name       | Text      |
| phone               | Text      |
| loan_amount         | Number    |
| interest_percentage | Number    |
| interest_amount     | Number    |
| total_amount        | Number    |
| paid_amount         | Number    |
| balance_amount      | Number    |
| loan_date           | Date      |
| status              | Text      |
| notes               | Text      |
| created_at          | Timestamp |
| updated_at          | Timestamp |

---

## Environment Variables

Create a `.env` file:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
PORT=3000
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/lendflow.git
cd lendflow
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Production Start

```bash
npm start
```

---

## PWA Support

LendFlow includes:

* Manifest setup
* Service worker
* Installable experience
* Mobile app feel
* Home screen support

---

## UI Inspiration

The UI design is inspired by:

* Google Gemini
* Material 3
* Modern mobile productivity apps

Focus areas:

* Simplicity
* Smoothness
* Accessibility
* Non-technical usability

---

## Future Improvements

* PIN lock support
* Data export
* Cloud backups
* Charts & analytics
* Multi-user support
* Dark mode
* Notification reminders

---

## Project Goal

The goal of LendFlow is to provide a lightweight and modern alternative to:

* paper loan notebooks
* manual interest calculations
* spreadsheet-based tracking

while keeping the experience extremely simple and mobile friendly.

---

## License

MIT License

---

## Author

Built by Arun Mohan

* GitHub: https://github.com/Arunmohankml
* Portfolio: https://arunmohankml.github.io/portfolio/
