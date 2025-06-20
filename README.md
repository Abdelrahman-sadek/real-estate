# منصة تسجيل ودليل السماسرة العقاريين

A modern, lightweight, static web application (Arabic, RTL, Cairo font) for real estate broker registration and directory. Data is stored in Google Sheets via Google Apps Script. Hosted on GitHub Pages.

## Features
- Broker registration form (Arabic, RTL, Cairo font)
- Stores data in Google Sheets (via Apps Script Web App)
- Admin view: directory of all brokers
- Mobile-friendly, great UI/UX

## Setup & Deployment

### 1. Frontend (GitHub Pages)
- Clone or download this repository.
- Edit `app.js` and set your Google Apps Script Web App URL in `GOOGLE_SCRIPT_URL`.
- Push to your GitHub repository.
- Enable GitHub Pages in repository settings (root or `/docs` folder).

### 2. Google Sheets Backend
- Create a new Google Sheet for broker data.
- Go to **Extensions > Apps Script** and paste the provided Apps Script code (see below).
- Deploy as Web App (new deployment):
  - Execute as: Me
  - Who has access: Anyone
  - Copy the Web App URL and use it in `app.js`.
- Make sure to enable CORS in the Apps Script code.

### 3. Apps Script Example
```js
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.fullName, data.phone, data.governorate, data.cities, data.areas,
    data.propertyTypes, data.services, data.bio, data.mapLink, data.photo
  ]);
  return ContentService.createTextOutput(JSON.stringify({message: 'تم التسجيل بنجاح!'})).setMimeType(ContentService.MimeType.JSON);
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