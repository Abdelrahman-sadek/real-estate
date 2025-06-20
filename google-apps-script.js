// Google Apps Script for Real Estate Broker Registration Platform

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.fullName, data.phone, data.governorate, data.cities, data.areas,
    data.propertyTypes, data.services, data.bio, data.mapLink, data.photo
  ]);
  return ContentService.createTextOutput(JSON.stringify({message: 'تم التسجيل بنجاح!'}))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var brokers = rows.slice(1).map(function(row) {
    return {
      fullName: row[0],
      phone: row[1],
      governorate: row[2],
      cities: row[3],
      areas: row[4],
      propertyTypes: row[5],
      services: row[6],
      bio: row[7],
      mapLink: row[8],
      photo: row[9]
    };
  });
  return ContentService.createTextOutput(JSON.stringify(brokers))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
} 