# 📊 Architecture Overview

## Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                         │
└─────────────────────────────────────────────────────────────┘

1. HOME PAGE (/)
   └─> User clicks "Analyze Security Scan"
       │
       v
2. UPLOAD PAGE (/upload)
   └─> User drags/drops CSV file
       │
       v
3. CLIENT-SIDE PROCESSING
   └─> UploadZone component uploads file
       │
       v
4. API ROUTE (/api/analyze)
   ├─> Parse CSV with PapaParse
   ├─> Extract vulnerability data
   └─> Send to Gemini AI
       │
       v
5. GEMINI AI ANALYSIS
   ├─> Analyze vulnerabilities
   ├─> Generate priority scores (1-10)
   ├─> Assess false positive risk
   ├─> Create remediation advice
   └─> Return structured JSON
       │
       v
6. DASHBOARD PAGE (/dashboard)
   ├─> Summary Cards (Critical/High/Medium/Low)
   ├─> RiskChart (Charts & Visualizations)
   └─> VulnerabilityTable (Interactive Table)
```

## Component Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND COMPONENTS                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ UploadZone  │  │  RiskChart   │  │ Vulnerability  │  │
│  │             │  │              │  │     Table      │  │
│  │ - Drag/Drop │  │ - Pie Chart  │  │ - Sortable    │  │
│  │ - Validate  │  │ - Bar Chart  │  │ - Filterable  │  │
│  │ - Upload    │  │ - Top Pkgs   │  │ - Expandable  │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                     BACKEND SERVICES                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │           /api/analyze (Next.js Route)          │     │
│  │                                                 │     │
│  │  1. Receive FormData with CSV file             │     │
│  │  2. Validate file type (.csv)                  │     │
│  │  3. Parse CSV → Array of Objects               │     │
│  │  4. Call analyzeWithGemini()                   │     │
│  │  5. Return JSON response                       │     │
│  └─────────────────────────────────────────────────┘     │
│                            │                              │
│                            v                              │
│  ┌─────────────────────────────────────────────────┐     │
│  │         app/lib/gemini.ts (AI Service)          │     │
│  │                                                 │     │
│  │  1. Construct detailed prompt                  │     │
│  │  2. Send to Google Gemini 1.5 Pro              │     │
│  │  3. Parse JSON response                        │     │
│  │  4. Return structured analysis                 │     │
│  └─────────────────────────────────────────────────┘     │
│                                                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                    │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │         Google Gemini 1.5 Pro API               │     │
│  │                                                 │     │
│  │  - Receives vulnerability data                 │     │
│  │  - Performs intelligent analysis               │     │
│  │  - Generates priority scores                   │     │
│  │  - Assesses false positive risk                │     │
│  │  - Creates remediation advice                  │     │
│  └─────────────────────────────────────────────────┘     │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

```
CSV File → PapaParse → Raw Data Array → Gemini AI → Structured Analysis

Example Input CSV:
┌───────────────────────────────────────────────────────┐
│ Title,Severity,Package,CVE,Description               │
│ SQL Injection,Critical,express,CVE-2024-1234,...     │
│ XSS,High,react-dom,CVE-2024-5678,...                 │
└───────────────────────────────────────────────────────┘

Example Output JSON:
┌───────────────────────────────────────────────────────┐
│ {                                                     │
│   "summary": {                                        │
│     "critical": 5, "high": 8, "medium": 12, "low": 3 │
│   },                                                  │
│   "insights": "AI-generated summary...",              │
│   "prioritizedIssues": [                              │
│     {                                                 │
│       "id": "1",                                      │
│       "title": "SQL Injection",                       │
│       "priorityScore": 9,                             │
│       "aiExplanation": "This is critical because...", │
│       "remediation": "Use parameterized queries...",  │
│       "falsePositiveRisk": "Low"                      │
│     }                                                 │
│   ]                                                   │
│ }                                                     │
└───────────────────────────────────────────────────────┘
```

## Tech Stack Details

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling
- **React**: UI library
- **TanStack Table**: Powerful table features
- **Recharts**: Chart visualization

### Backend

- **Next.js API Routes**: Serverless functions
- **PapaParse**: CSV parsing library
- **Google Generative AI SDK**: Gemini integration

### AI

- **Google Gemini 1.5 Pro**: Large language model
- **Custom Prompts**: Specialized for security analysis

## File Structure

```
security-dashboard/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts           # CSV processing endpoint
│   ├── dashboard/
│   │   └── page.tsx                # Results dashboard
│   ├── lib/
│   │   └── gemini.ts               # AI integration
│   ├── upload/
│   │   └── page.tsx                # File upload page
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page
│
├── components/
│   ├── UploadZone.tsx              # File upload UI
│   ├── VulnerabilityTable.tsx      # Interactive table
│   └── RiskChart.tsx               # Charts & graphs
│
├── public/
│   └── sample-vulnerabilities.csv  # Test data
│
├── .env.local                       # API keys (gitignored)
├── .env.example                     # Template
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts               # Tailwind config
├── README.md                        # Documentation
├── USAGE.md                         # Quick guide
└── ARCHITECTURE.md                  # This file
```

## Key Features Implementation

### 1. CSV Upload

- Drag-and-drop interface
- File validation (.csv only)
- Client-side file reading
- FormData API for upload

### 2. AI Analysis

- Structured prompt engineering
- JSON response parsing
- Error handling
- Token optimization (first 10,000 chars)

### 3. Priority Scoring

- AI-generated scores (1-10)
- Based on multiple factors:
  - Severity level
  - Exploitability
  - Impact
  - Context
  - False positive likelihood

### 4. Interactive Dashboard

- Real-time filtering
- Column sorting
- Row expansion
- Copy-friendly remediation code

### 5. Visualizations

- Severity distribution (Pie Chart)
- Priority distribution (Bar Chart)
- Top affected packages

## Security Considerations

- **API Key Protection**: Stored in .env.local (never committed)
- **Server-side Processing**: CSV parsed on server
- **Input Validation**: File type and size checks
- **Error Handling**: Graceful failures
- **CORS**: Configured for same-origin

## Performance

- **Lazy Loading**: Components loaded on demand
- **Turbopack**: Fast development builds
- **Code Splitting**: Automatic by Next.js
- **Optimized Charts**: Responsive containers
- **CSV Chunking**: First 10K characters to AI

## Future Enhancements

- [ ] PDF Report Export
- [ ] User Authentication
- [ ] Historical Analysis Tracking
- [ ] Multi-file Batch Processing
- [ ] Custom AI Model Fine-tuning
- [ ] Webhook Integrations
- [ ] Jira/GitHub Issue Creation
- [ ] Scheduled Scans
- [ ] Team Collaboration Features
- [ ] API for Programmatic Access
