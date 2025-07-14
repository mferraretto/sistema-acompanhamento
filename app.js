// JavaScript module for handling forms and Firestore operations

document.addEventListener('DOMContentLoaded', () => {
  const db = window.firestore;
  const collection = window.firebaseCollection;
  const addDoc = window.firebaseAddDoc;
  const getDocs = window.firebaseGetDocs;
 const updateDoc = window.firebaseUpdateDoc;
  const docFn = window.firebaseDoc;

  const cadastrosCol = collection(db, 'cadastros');
  const alteracoesCol = collection(db, 'alteracoes');
  const evolucoesCol = collection(db, 'evolucoes');
  const anunciosCol = collection(db, 'anuncios');

  async function atualizarHistorico() {
    const snapshot = await getDocs(alteracoesCol);
    const lista = document.getElementById('listaHistorico');
    lista.innerHTML = '';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const div = document.createElement('div');
      div.className = 'border rounded p-2 mb-2';
      div.textContent = `${data.dataAlteracao} - ${data.campoAlterado}: ${data.valorAntes} → ${data.valorDepois}`;
      lista.appendChild(div);
    });
  }

  document.getElementById('formCadastro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nomeAnuncio: document.getElementById('nomeAnuncio').value,
      linkShopee: document.getElementById('linkShopee').value,
      sku: document.getElementById('sku').value,
      imagem: document.getElementById('imagem').value,
      dataCadastro: document.getElementById('dataCadastro').value
    };
    await addDoc(cadastrosCol, payload);
    e.target.reset();
  });

  document.getElementById('formAlteracao').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      dataAlteracao: document.getElementById('dataAlteracao').value,
      campoAlterado: document.getElementById('campoAlterado').value,
      valorAntes: document.getElementById('valorAntes').value,
      valorDepois: document.getElementById('valorDepois').value,
      motivoMudanca: document.getElementById('motivoMudanca').value
    };
    await addDoc(alteracoesCol, payload);
    e.target.reset();
    atualizarHistorico();
  });

  document.getElementById('formEvolucao').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nome: document.getElementById('nomeEvolucao').value,
      data: document.getElementById('dataEvolucao').value,
      mudancas: document.getElementById('mudancas').value,
      visitantes: parseInt(document.getElementById('visitantes').value) || 0,
      visualizacoes: parseInt(document.getElementById('visualizacoes').value) || 0,
      cliques: parseInt(document.getElementById('cliques').value) || 0,
      carrinhos: parseInt(document.getElementById('carrinhos').value) || 0,
      conversaoCarrinho: parseFloat(document.getElementById('conversaoCarrinho').value) || 0,
      pedidos: parseInt(document.getElementById('pedidos').value) || 0,
      conversaoCompra: parseFloat(document.getElementById('conversaoCompra').value) || 0,
      vendas: parseFloat(document.getElementById('vendas').value) || 0
    };
    await addDoc(evolucoesCol, payload);
    e.target.reset();
  });
 async function carregarAnuncios() {
    const snapshot = await getDocs(anunciosCol);
    const tbody = document.getElementById('tabelaAnunciosBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${data.item_sku || data.sku || ''}</td>` +
        `<td>${data.item_name || data.nome || ''}</td>` +
        `<td>${data.price || ''}</td>` +
        `<td>${data.status || ''}</td>`;
      const tdAcoes = document.createElement('td');
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-secondary';
      btn.textContent = 'Editar';
      btn.addEventListener('click', () => abrirModalEdicao(docSnap.id, data));
      tdAcoes.appendChild(btn);
      tr.appendChild(tdAcoes);
      tbody.appendChild(tr);
    });
  }

  function abrirModalEdicao(id, data) {
    document.getElementById('editDocId').value = id;
    document.getElementById('editNome').value = data.item_name || data.nome || '';
    document.getElementById('editPreco').value = data.price || '';
    document.getElementById('editStatus').value = data.status || '';
    const modal = new bootstrap.Modal(document.getElementById('modalEditarAnuncio'));
    modal.show();
  }

  document.getElementById('formEditAnuncio').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editDocId').value;
    const payload = {
      item_name: document.getElementById('editNome').value,
      price: parseFloat(document.getElementById('editPreco').value) || null,
      status: document.getElementById('editStatus').value
    };
    const ref = docFn(db, 'anuncios', id);
    await updateDoc(ref, payload);
    bootstrap.Modal.getInstance(document.getElementById('modalEditarAnuncio')).hide();
    carregarAnuncios();
  });

  carregarAnuncios();
  atualizarHistorico();
});
