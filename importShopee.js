export function initImportShopee() {
  const input = document.getElementById('inputPlanilhaShopee');
  const preview = document.getElementById('importPreview');
  const saveBtn = document.getElementById('saveFirebaseBtn');
  let records = [];

  input.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const rows = (await Promise.all(files.map(readWorkbook))).flat();
    const merged = mergeBySku(rows);
    records = Object.values(merged);
    renderTable(records, preview);
  });

  saveBtn.addEventListener('click', async () => {
    if (!records.length) return;
    const db = window.firestore;
    const col = window.firebaseCollection(db, 'anuncios');
    for (const rec of records) {
      const sku = rec.item_sku || rec.sku;
      if (!sku) continue;
      const q = window.firebaseQuery(col, window.firebaseWhere('item_sku', '==', sku));
      const snap = await window.firebaseGetDocs(q);
      if (snap.empty) {
        await window.firebaseAddDoc(col, rec);
      } else {
        const docRef = window.firebaseDoc(db, 'anuncios', snap.docs[0].id);
        await window.firebaseUpdateDoc(docRef, rec);
        console.warn(`SKU ${sku} atualizado`);
      }
    }
    alert('Dados salvos no Firebase');
  });
}

function readWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const rows = [];
      workbook.SheetNames.forEach(name => {
        rows.push(...XLSX.utils.sheet_to_json(workbook.Sheets[name]));
      });
      resolve(rows);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function mergeBySku(rows) {
  const map = {};
  const shipKeys = {
    'package_length(cm)': 'package_length',
    'package_width(cm)': 'package_width',
    'package_height(cm)': 'package_height',
    'package_weight': 'weight',
    'weight(g)': 'weight',
    'weight(kg)': 'weight'
  };

  rows.forEach(row => {
    const sku = row.item_sku || row.sku || row.SKU || row['item_sku'];
    if (!sku) return;
  if (!map[sku]) map[sku] = { item_sku: sku, basic: {}, media: {}, shipping: {} };

    Object.entries(row).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;

      if (shipKeys[k]) {
        const key = shipKeys[k];
        map[sku].shipping[key] = v;
        map[sku][key] = v; // flatten for preview
      } else if (k === 'logistics_channels_enabled') {
        map[sku].shipping.logistics_channels_enabled = v;
        map[sku].logistics_channels_enabled = v;
      } else if (k === 'image' || k === 'images' || k === 'video') {
        map[sku].media[k] = v;
        map[sku][k] = v;
      } else {
        map[sku].basic[k] = v;
        map[sku][k] = v;
      }
    });
  });
  return map;
}

function renderTable(data, container) {
  container.innerHTML = '';
  if (!data.length) return;
  const table = document.createElement('table');
  table.className = 'table table-bordered table-sm';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  ['SKU','Nome','Link','Imagem','Descrição','Preço','Comprimento','Largura','Altura','Peso','Status'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  data.forEach(rec => {
    const tr = document.createElement('tr');
    const sku = rec.item_sku || rec.sku;
    const name = rec.item_name || rec.name || '';
    const link = rec.shopid && rec.item_id ? `https://shopee.com.br/product/${rec.shopid}/${rec.item_id}` : (rec.link || '');
    const imgSrc = rec.image || rec.images;
    const desc = rec.description || '';
    const price = rec.price || rec.preco || '';
    const length = rec.package_length || rec.length || rec.shipping?.package_length || '';
    const width = rec.package_width || rec.width || rec.shipping?.package_width || '';
    const height = rec.package_height || rec.height || rec.shipping?.package_height || '';
    const weight = rec.weight || rec.package_weight || rec.shipping?.weight || '';
    const status = rec.status || '';
    const cells = [
      sku,
      name,
      link ? `<a href="${link}" target="_blank">${link}</a>` : '',
      imgSrc ? `<img src="${imgSrc}" style="max-width:60px" class="img-thumbnail"/>` : '',
      desc,
      price,
      length,
      width,
      height,
      weight,
      status
    ];
    cells.forEach(html => {
      const td = document.createElement('td');
      td.innerHTML = html;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

// initialize when module is loaded
initImportShopee();
