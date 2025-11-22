# 🛡️ SecInsight AI - Intelligent DevSecOps Assistant

An AI-powered security vulnerability analysis dashboard that helps teams understand, prioritize, and remediate security issues efficiently.

## ✨ Features

- 🤖 **AI-Powered Analysis**: Uses Google Gemini to analyze security vulnerabilities
- 📊 **Smart Prioritization**: Assigns priority scores (1-10) based on actual risk
- 🔍 **Deep Insights**: Provides context-aware explanations and false positive likelihood
- ⚡ **One-Click Remediation**: Copy-paste ready fixes and upgrade commands
- 📈 **Visual Dashboard**: Interactive charts and tables with sorting/filtering
- 🎯 **Multi-Tool Support**: Works with Snyk, Trivy, npm audit, ScoutSuite, Semgrep, Dependabot, and more

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Google AI Studio API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. Install dependencies:

```bash
npm install
```

2. Make sure `.env.local` file exists in the root directory with your Google AI API key:

```env
GOOGLE_AI_API_KEY=your_api_key_here
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Usage

### 1. Upload CSV File

Navigate to the upload page and drag-and-drop your security scan CSV file. The CSV should have columns like:

- Title (vulnerability name)
- Severity (Critical/High/Medium/Low)
- Package (affected package name)
- CVE (CVE identifier, optional)
- Description
- Affected File (optional)
- Fix/Remediation (optional)

**Sample CSV included at** `/public/sample-vulnerabilities.csv`

### 2. AI Analysis

The system will:

- Parse your CSV using PapaParse
- Send data to Google Gemini for analysis
- Generate priority scores and insights
- Identify false positive risks
- Provide actionable remediation steps

### 3. View Dashboard

The dashboard displays:

- **Summary Cards**: Total counts by severity
- **Charts**: Severity distribution and priority score distribution
- **Top Packages**: Most affected packages
- **Vulnerability Table**: Sortable, filterable table with detailed information

## 🏗️ Project Structure

```
security-dashboard/
├── app/
│   ├── api/analyze/route.ts      # CSV processing API
│   ├── dashboard/page.tsx         # Dashboard page
│   ├── lib/gemini.ts              # Google Gemini integration
│   ├── upload/page.tsx            # Upload page
│   └── page.tsx                   # Home page
├── components/
│   ├── UploadZone.tsx             # File upload component
│   ├── VulnerabilityTable.tsx     # Interactive table
│   └── RiskChart.tsx              # Charts and visualizations
└── public/
    └── sample-vulnerabilities.csv # Sample data
```

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini 1.5 Pro
- **CSV Parsing**: PapaParse
- **Charts**: Recharts
- **Tables**: TanStack Table

## 🎯 Supported Security Tools

Works with CSV exports from: Snyk, Trivy, npm audit, ScoutSuite, Semgrep, Dependabot, OWASP ZAP, Bandit, and more!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
