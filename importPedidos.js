export function initImportPedidos() {
  const input = document.getElementById('inputPlanilhaPedidos');
  const preview = document.getElementById('previewPedidos');
  const saveBtn = document.getElementById('savePedidosBtn');
  let records = [];

  input?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const rows = (await Promise.all(files.map(readWorkbook))).flat();
    records = rows.map(normalizeRow);
    renderTable(records, preview);
  });

  saveBtn?.addEventListener('click', async () => {
    if (!records.length) return;
    const db = window.firestore;
    const pedidosCol = window.firebaseCollection(db, 'pedidos');
    try {
      const skipped = [];
      for (const [idx, rec] of records.entries()) {
        if (!rec.order_id) {
          console.warn(`Registro na posição ${idx + 1} ignorado: order_id ausente`);
          skipped.push(idx + 1);
          continue;
        }
        await window.firebaseAddDoc(pedidosCol, rec);
      }
     let msg = 'Pedidos salvos no Firebase';
      if (skipped.length) {
        msg += `\nLinhas ignoradas: ${skipped.join(', ')}`;
      }
      alert(msg);
    } catch (err) {
      console.error('Erro ao salvar pedidos', err);
      alert('Não foi possível salvar os pedidos.');
    }
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

function normalizeRow(row) {
  return {
    order_id: row.order_id || row['Order ID'] || row.ID || row['ID do pedido'],
    buyer: row.buyer || row.Buyer || row.Comprador,
    quantity: row.quantity || row.qty || row.Quantidade,
    price: row.price || row['unit price'] || row.Preço,
    total: row.total || row['Total'] || row['Valor Total'],
    status: row.status || row.Status,
  };
}

function renderTable(data, container) {
  if (!container) return;
  container.innerHTML = '';
  if (!data.length) return;
  const table = document.createElement('table');
  table.className = 'table table-bordered table-sm';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  ['ID','Comprador','Qtd','Preço','Total','Status'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  data.forEach(rec => {
    const tr = document.createElement('tr');
    const cells = [
      rec.order_id || '',
      rec.buyer || '',
      rec.quantity || '',
      rec.price || '',
      rec.total || '',
      rec.status || ''
    ];
    cells.forEach(text => {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

// initialize when module is loaded
initImportPedidos();
