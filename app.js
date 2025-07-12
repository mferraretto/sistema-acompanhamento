// JavaScript module for handling forms and Firestore operations

document.addEventListener('DOMContentLoaded', () => {
  const db = window.firestore;
  const collection = window.firebaseCollection;
  const addDoc = window.firebaseAddDoc;
  const getDocs = window.firebaseGetDocs;

  const cadastrosCol = collection(db, 'cadastros');
  const alteracoesCol = collection(db, 'alteracoes');
  const evolucoesCol = collection(db, 'evolucoes');

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

  atualizarHistorico();
});
