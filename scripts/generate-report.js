/**
 * Script to generate consolidated HTML and PDF reports from test results
 */

const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf');

const generateReport = async () => {
  console.log('Generating consolidated reports...');
  
  // Path configurations
  const reportsDir = path.join(__dirname, '../results/reports');
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Generate HTML report
  try {
    // Create a basic HTML report template
    const htmlReport = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Results - React Shopping Cart Multi-Framework Testing</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          .summary { margin: 20px 0; padding: 10px; background-color: #f0f0f0; }
          .framework { margin: 30px 0; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .pass { color: green; }
          .fail { color: red; }
        </style>
      </head>
      <body>
        <h1>Test Results - React Shopping Cart Multi-Framework Testing</h1>
        <div class="summary">
          <h2>Summary</h2>
          <p>Date: ${new Date().toLocaleString()}</p>
          <p>This report shows the combined results from Playwright, Selenium, and Puppeteer tests.</p>
        </div>
        
        <div class="framework">
          <h2>Playwright Results</h2>
          <!-- Playwright results will be injected here -->
        </div>
        
        <div class="framework">
          <h2>Selenium Results</h2>
          <!-- Selenium results will be injected here -->
        </div>
        
        <div class="framework">
          <h2>Puppeteer Results</h2>
          <!-- Puppeteer results will be injected here -->
        </div>
      </body>
      </html>
    `;
    
    // Write HTML report
    const htmlReportPath = path.join(reportsDir, 'report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`HTML report generated: ${htmlReportPath}`);
    
    // Generate PDF from HTML
    const pdfReportPath = path.join(reportsDir, 'report.pdf');
    const pdfOptions = { format: 'A4' };
    
    pdf.create(htmlReport, pdfOptions).toFile(pdfReportPath, (err, res) => {
      if (err) {
        console.error('Error generating PDF report:', err);
      } else {
        console.log(`PDF report generated: ${pdfReportPath}`);
      }
    });
    
  } catch (error) {
    console.error('Error generating reports:', error);
  }
};

// Run the report generation
generateReport();