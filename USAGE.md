# 🎯 Quick Usage Guide

## Your DevSecOps AI Dashboard is Ready!

### 🌐 Access the Application

The server is running at: **http://localhost:3000**

### 📋 How to Use

#### Step 1: Visit the Home Page

- Go to http://localhost:3000
- Click the "🚀 Analyze Security Scan" button

#### Step 2: Upload Your CSV

- Drag and drop your security scan CSV file
- Or click to browse and select a file
- Supported formats: Any CSV with vulnerability data

#### Step 3: AI Analysis

- The application will:
  - Parse your CSV file
  - Send it to Google Gemini AI
  - Generate intelligent insights and priority scores
  - Identify false positive risks
  - Provide remediation steps

#### Step 4: View Results

- **Summary Cards**: See counts of Critical, High, Medium, Low severity issues
- **Charts**: Visual representation of risk distribution
- **Top Packages**: Which packages have the most vulnerabilities
- **Interactive Table**:
  - Click column headers to sort
  - Use search box to filter
  - Click "Details" button to see:
    - AI explanation of the vulnerability
    - Copy-paste remediation code
    - Affected files

### 🧪 Test with Sample Data

A sample CSV is included at:
`/public/sample-vulnerabilities.csv`

Download it from: http://localhost:3000/sample-vulnerabilities.csv

This contains 20 realistic security vulnerabilities to test the system.

### 📊 CSV Format

Your CSV should include these columns (flexible, AI adapts):

- **Title**: Name of the vulnerability
- **Severity**: Critical, High, Medium, or Low
- **Package**: Affected package/library name
- **CVE**: CVE identifier (optional)
- **Description**: Details about the issue
- **Affected File**: File path (optional)
- **Fix**: Remediation advice (optional)

Example:

```csv
Title,Severity,Package,CVE,Description
SQL Injection,Critical,express,CVE-2024-1234,User input not sanitized
XSS Vulnerability,High,react-dom,CVE-2024-5678,Unescaped user content
```

### 🔑 Features to Try

1. **Sort by Priority**: Click the Priority column header
2. **Search**: Type a package name or vulnerability type
3. **View Details**: Click any Details button to see AI analysis
4. **Copy Remediation**: Copy the code fixes provided
5. **Check False Positive Risk**: See which issues might be false positives

### 🛠️ Customization

You can modify:

- **Gemini Prompt**: Edit `app/lib/gemini.ts` to change AI behavior
- **Table Columns**: Modify `components/VulnerabilityTable.tsx`
- **Charts**: Customize in `components/RiskChart.tsx`
- **Styling**: Update Tailwind classes throughout

### 🚨 Troubleshooting

**No results showing?**

- Check browser console for errors
- Verify your Google AI API key in `.env.local`
- Make sure CSV has proper headers

**CSV parsing errors?**

- Ensure CSV is properly formatted
- Check for special characters or encoding issues
- Try the sample CSV first

**API errors?**

- Check your Google AI API key is valid
- Verify you have API credits/quota
- Check terminal for error messages

### 📝 Next Steps

1. Test with your real security scan data
2. Share dashboard with your team
3. Customize the AI prompts for your specific needs
4. Add authentication if deploying publicly
5. Export results as PDF/reports (future enhancement)

### 🚀 Deploy to Production

When ready to deploy:

```bash
npm run build
npm start
```

Or deploy to Vercel:

```bash
vercel deploy
```

Remember to set your `GOOGLE_AI_API_KEY` in production environment variables!

---

**Need Help?** Check the main README.md for detailed documentation.
