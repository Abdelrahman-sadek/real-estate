// --- Constants ---
const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "السويس", "اسوان", "اسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا", "شمال سيناء", "سوهاج"
];
const PROPERTY_TYPES = [
  { value: "شقق", label: "شقق" },
  { value: "أراضي", label: "أراضي" },
  { value: "محلات", label: "محلات" },
  { value: "فيلات", label: "فيلات" },
  { value: "مخازن", label: "مخازن" },
  { value: "عقارات أخرى", label: "عقارات أخرى" }
];
const SERVICES = [
  { value: "بيع", label: "بيع" },
  { value: "إيجار", label: "إيجار" },
  { value: "إدارة عقارات", label: "إدارة عقارات" },
  { value: "خدمات أخرى", label: "خدمات أخرى" }
];
const GOOGLE_SCRIPT_URL = "https://corsproxy.io/?" + encodeURIComponent("https://script.google.com/macros/s/AKfycbz10UQbqEh6O71zlguUi1mTSjgvUdoTcJklvR77y5UxYUuUhu5uADLTFq0jnB2rGg1hPg/exec");

// --- Populate Dropdowns & Checkboxes ---
document.addEventListener('DOMContentLoaded', () => {
  // Governorates
  const govSelect = document.getElementById('governorate');
  GOVERNORATES.forEach(gov => {
    const opt = document.createElement('option');
    opt.value = gov;
    opt.textContent = gov;
    govSelect.appendChild(opt);
  });
  // Property Types
  const propTypesDiv = document.getElementById('property-types');
  PROPERTY_TYPES.forEach(type => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" name="propertyTypes" value="${type.value}"> ${type.label}`;
    propTypesDiv.appendChild(label);
  });
  // Services
  const servicesDiv = document.getElementById('services');
  SERVICES.forEach(service => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" name="services" value="${service.value}"> ${service.label}`;
    servicesDiv.appendChild(label);
  });
  // Multi-inputs
  setupMultiInput('cities', 'cities-list');
  setupMultiInput('areas', 'areas-list');
  // Form submit
  document.getElementById('broker-form').addEventListener('submit', handleFormSubmit);
  // Load brokers (admin view)
  loadBrokers();
});

// --- Multi-input Helper ---
function setupMultiInput(inputId, listId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  let values = [];
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      e.preventDefault();
      addValue(input.value.trim());
      input.value = '';
    }
  });
  function addValue(val) {
    if (!values.includes(val)) {
      values.push(val);
      render();
    }
  }
  function removeValue(val) {
    values = values.filter(v => v !== val);
    render();
  }
  function render() {
    list.innerHTML = '';
    values.forEach(val => {
      const span = document.createElement('span');
      span.textContent = val;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = '&times;';
      btn.onclick = () => removeValue(val);
      span.appendChild(btn);
      list.appendChild(span);
    });
  }
  // Expose values for form submission
  input.closest('form').addEventListener('submit', () => {
    input.value = values.join(', ');
  });
}

// --- Form Submission ---
async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  // Prepare data
  const data = {
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    governorate: formData.get('governorate'),
    cities: formData.get('cities'),
    areas: formData.get('areas'),
    propertyTypes: formData.getAll('propertyTypes').join(', '),
    services: formData.getAll('services').join(', '),
    bio: formData.get('bio'),
    mapLink: formData.get('mapLink'),
    photo: '' // Will handle below
  };
  // Handle photo upload (optional, base64)
  const photoFile = formData.get('photo');
  if (photoFile && photoFile.size > 0) {
    data.photo = await toBase64(photoFile);
  }
  // Debug: Log data being sent
  console.log('Submitting broker data:', data);
  // Send to Google Apps Script
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    // Debug: Log raw response
    console.log('Raw response:', res);
    let resultText = await res.text();
    // Debug: Log response text
    console.log('Response text:', resultText);
    let result;
    try {
      result = JSON.parse(resultText);
    } catch (parseErr) {
      console.error('Failed to parse response as JSON:', parseErr);
      document.getElementById('form-message').textContent = 'خطأ في قراءة استجابة الخادم: ' + resultText;
      return;
    }
    document.getElementById('form-message').textContent = result.message || 'تم التسجيل بنجاح!';
    form.reset();
    loadBrokers();
  } catch (err) {
    // Debug: Log error
    console.error('Submission error:', err);
    document.getElementById('form-message').textContent = 'حدث خطأ أثناء التسجيل: ' + err;
  }
}
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- Load Brokers (Admin View) ---
let allBrokers = [];

async function loadBrokers() {
  const list = document.getElementById('brokers-list');
  list.innerHTML = '<p>جاري التحميل...</p>';
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL + '?action=get', { method: 'GET' });
    allBrokers = await res.json();
    renderBrokers(allBrokers);
  } catch (err) {
    list.innerHTML = '<p>تعذر تحميل الدليل.</p>';
  }
}

function renderBrokers(brokers) {
  const list = document.getElementById('brokers-list');
  if (!Array.isArray(brokers) || brokers.length === 0) {
    list.innerHTML = '<tr><td colspan="11">لا يوجد سماسرة مسجلين بعد.</td></tr>';
    return;
  }
  list.innerHTML = '';
  brokers.forEach(broker => {
    // Format WhatsApp link
    let phone = (broker.phone || '').replace(/\D/g, '');
    let waLink = phone ? `<a href="https://wa.me/2${phone}" target="_blank" aria-label="واتساب"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#25D366"/><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.173.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.58-.487-.501-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.21 5.077 4.377.71.306 1.263.489 1.695.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.008-1.413.248-.694.248-1.277.173-1.413-.074-.136-.272-.223-.57-.372z" fill="#fff"/></svg></a>` : '';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${broker.fullName || ''}</td>
      <td>${broker.phone || ''}</td>
      <td>${waLink}</td>
      <td>${broker.governorate || ''}</td>
      <td>${broker.cities || ''}</td>
      <td>${broker.areas || ''}</td>
      <td>${broker.propertyTypes || ''}</td>
      <td>${broker.services || ''}</td>
      <td>${broker.bio || ''}</td>
      <td>${broker.mapLink ? `<a href="${broker.mapLink}" target="_blank">رابط</a>` : ''}</td>
      <td>${broker.photo ? `<img src="${broker.photo}" alt="صورة" style="max-width:50px;max-height:50px;border-radius:50%;object-fit:cover;">` : ''}</td>
    `;
    list.appendChild(row);
  });
}

// --- Search Functionality ---
document.addEventListener('DOMContentLoaded', () => {
  loadBrokers();
  const searchBar = document.getElementById('search-bar');
  if (searchBar) {
    searchBar.addEventListener('input', function() {
      const query = this.value.trim().toLowerCase();
      if (!query) {
        renderBrokers(allBrokers);
        return;
      }
      const filtered = allBrokers.filter(broker => {
        return Object.values(broker).some(val =>
          (val || '').toString().toLowerCase().includes(query)
        );
      });
      renderBrokers(filtered);
    });
  }
}); 
