# منصة تسجيل ودليل السماسرة العقاريين

# Real Estate Broker Directory Platform

A modern, attractive, and mobile-friendly directory for real estate brokers in Egypt. Features live search, a responsive table with direct contact links (WhatsApp, Facebook, LinkedIn), and dynamic data loading from Google Sheets via Google Apps Script. The site uses a luxury design, Cairo font, and is fully RTL-compatible.

## Features
- Modern, luxury design (gradients, modern fonts, high-quality icons)
- Fully mobile responsive
- Central, fast live search bar
- Full-width brokers table with alternating row colors and clear card-like data
- Dedicated WhatsApp column: button opens direct chat with the broker
- Social links in the footer (Facebook, LinkedIn, WhatsApp)
- Full Arabic (RTL) and Cairo font support

## How It Works
1. **Frontend:**
   - HTML, CSS, JavaScript (Vanilla)
   - Displays brokers in a responsive table with live search
   - "Register as Broker" button links to a Google Form
2. **Data:**
   - Pulled from Google Sheets via Google Apps Script Web App (GET only)
3. **Hosting:**
   - GitHub Pages

## WhatsApp Column Logic
- WhatsApp links are generated automatically from the phone number:
  - All non-digit characters are removed from the number.
  - The country code (2) is automatically added before the number (e.g., 201001234567)
  - Clicking the green WhatsApp icon opens a direct chat with the broker via [https://wa.me/](https://wa.me/)
- The icon used is high-quality and matches WhatsApp's official branding.

## Customizing Social Links
- The footer includes links to:
  - **Facebook:** [https://www.facebook.com/tito.sadek](https://www.facebook.com/tito.sadek)
  - **LinkedIn:** [https://www.linkedin.com/in/abdelrahman-sadek90/](https://www.linkedin.com/in/abdelrahman-sadek90/)
  - **WhatsApp:** [https://wa.me/201001373851](https://wa.me/201001373851)
- You can change these links by editing the footer section in `index.html`.

## Setup & Deployment
1. Set the `GOOGLE_SCRIPT_URL` variable in `app.js` to your Google Apps Script Web App URL.
2. Upload all files to your GitHub repository.
3. Enable GitHub Pages in your repository settings.
4. Create a new Google Sheet and add the Apps Script code (see below).
5. Make sure the first row in your Google Sheet contains column headers.

## Google Apps Script Code (for Google Sheets)
```js
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.fullName, data.phone, data.governorate, data.cities, data.areas,
    data.propertyTypes, data.services, data.bio, data.mapLink, data.photo
  ]);
  return ContentService.createTextOutput(JSON.stringify({message: 'Registration successful!'})).setMimeType(ContentService.MimeType.JSON);
}
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var brokers = rows.slice(1).map(function(row) {
    return {
      fullName: row[0], phone: row[1], governorate: row[2], cities: row[3], areas: row[4],
      propertyTypes: row[5], services: row[6], bio: row[7], mapLink: row[8], photo: row[9]
    };
  });
  return ContentService.createTextOutput(JSON.stringify(brokers)).setMimeType(ContentService.MimeType.JSON);
}
```

## License
MIT 
