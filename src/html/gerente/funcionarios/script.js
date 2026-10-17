const funcionariosPadrao = [
  {
    "id": 1,
    "nome": "Cláudio Lopes",
    "email": "claudio@gmail.com",
    "status": "ativo",
    "empresas": ["Bradesco", "Itaú"]
  },
  {
    "id": 2,
    "nome": "Junin da Silva",
    "email": "junin.silva@argos.com",
    "status": "ativo",
    "empresas": ["Bradesco"]
  },
  {
    "id": 3,
    "nome": "Lara Pereira",
    "email": "lara.pereira@argos.com",
    "status": "ativo",
    "empresas": ["Santander", "Nubank"]
  },
  {
    "id": 4,
    "nome": "Cleiton Bravo",
    "email": "cleiton.bravo@argos.com",
    "status": "ativo",
    "empresas": ["Itaú"]
  },
  {
    "id": 5,
    "nome": "Isabella Albuquerque",
    "email": "isabella.albuquerque@argos.com",
    "status": "ativo",
    "empresas": ["Banco do Brasil", "Caixa"]
  }
];

if (!localStorage.getItem("argos_funcionarios")) {
    localStorage.setItem("argos_funcionarios", JSON.stringify(funcionariosPadrao));
}

function obterFuncionarios() {
    return JSON.parse(localStorage.getItem("argos_funcionarios")) || funcionariosPadrao;
}

function salvarFuncionarios(lista) {
    localStorage.setItem("argos_funcionarios", JSON.stringify(lista));
}

function renderizarFuncionarios() {
    const container = document.getElementById("lista-funcionarios-container");
    if (!container) return;

    const lista = obterFuncionarios();
    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = `<p class="text-white/40 text-sm text-center py-4">Nenhum funcionário cadastrado.</p>`;
        return;
    }

    lista.forEach((funcionario) => {
        const inicial = funcionario.nome ? funcionario.nome.charAt(0).toUpperCase() : "F";
        const nome = funcionario.nome || "Funcionário";

        const card = document.createElement("div");
        card.className = "flex items-center justify-between px-6 py-5 rounded-xl border border-white/10 bg-[#0D1924]";
        
        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="size-12 rounded-full grid place-items-center bg-main-purple border-2 border-[#2d3a6b] text-light-blue text-xl font-bold">
                    ${inicial}
                </div>
                <span class="text-base">${nome}</span>
            </div>
            <div class="flex items-center gap-4 text-white/60">
                <a href="./editarFuncionario.html?id=${funcionario.id}" class="hover:text-light-blue cursor-pointer transition-element outline-none focus:outline-none focus:ring-0">
                    <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </a>
                <button type="button" class="hover:text-red-400 cursor-pointer transition-element outline-none focus:outline-none focus:ring-0" onclick="confirmarExclusao(${funcionario.id})">
                    <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

function inicializarEdicaoFuncionario() {
    const elNome = document.getElementById("nome-funcionario");
    if (!elNome) return;

    const params = new URLSearchParams(window.location.search);
    const idFuncionario = parseInt(params.get("id")) || 1;

    let lista = obterFuncionarios();
    let funcionarioAtual = lista.find(f => f.id === idFuncionario);

    if (!funcionarioAtual && lista.length > 0) {
        funcionarioAtual = lista[0];
    }

    const elAvatar = document.getElementById("avatar-inicial");
    const elEmail = document.getElementById("email");

    if (elNome) elNome.innerText = funcionarioAtual.nome;
    if (elAvatar) elAvatar.innerText = funcionarioAtual.nome.charAt(0).toUpperCase();
    if (elEmail) elEmail.value = funcionarioAtual.email;

    window.funcionarioAtual = funcionarioAtual;
    renderizarEmpresasEdicao();
}

function renderizarEmpresasEdicao() {
    const listaContainer = document.getElementById("lista-empresas-vinculadas");
    if (!listaContainer) return;

    listaContainer.innerHTML = "";

    if (!window.funcionarioAtual || window.funcionarioAtual.empresas.length === 0) {
        listaContainer.innerHTML = `<li class="px-4 py-3.5 text-sm text-white/40 text-center">Nenhuma empresa vinculada</li>`;
        return;
    }

    window.funcionarioAtual.empresas.forEach((empresa, index) => {
        const li = document.createElement("li");
        li.className = "flex items-center justify-between px-4 py-3.5 text-sm border-b border-white/10 last:border-b-0";
        li.innerHTML = `
            <span>${empresa}</span>
            <button type="button" onclick="removerEmpresa(${index})" class="text-white/40 hover:text-red-400 cursor-pointer transition-element">
                <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
        `;
        listaContainer.appendChild(li);
    });
}

function adicionarEmpresa() {
    const input = document.getElementById("input-nova-empresa");
    const empresaDigitada = input ? input.value.trim() : "";

    if (empresaDigitada && window.funcionarioAtual && !window.funcionarioAtual.empresas.includes(empresaDigitada)) {
        window.funcionarioAtual.empresas.push(empresaDigitada);
        salvarAlteracoesNoStorage();
        renderizarEmpresasEdicao();
        input.value = "";
    }
    fecharModal();
}

function removerEmpresa(index) {
    if (window.funcionarioAtual) {
        window.funcionarioAtual.empresas.splice(index, 1);
        salvarAlteracoesNoStorage();
        renderizarEmpresasEdicao();
    }
}

function salvarAlteracoes() {
    const elEmail = document.getElementById("email");
    if (window.funcionarioAtual && elEmail) {
        window.funcionarioAtual.email = elEmail.value;
        salvarAlteracoesNoStorage();
        window.location.href = "index.html";
    }
}

function salvarAlteracoesNoStorage() {
    let lista = obterFuncionarios();
    const index = lista.findIndex(f => f.id === window.funcionarioAtual.id);
    if (index !== -1) {
        lista[index] = window.funcionarioAtual;
        salvarFuncionarios(lista);
    }
}

function desativarFuncionario() {
    if (window.funcionarioAtual) {
        let lista = obterFuncionarios();
        lista = lista.filter(f => f.id !== window.funcionarioAtual.id);
        salvarFuncionarios(lista);
        window.location.href = "index.html";
    }
}

let modal = document.getElementById('modal');
let modal_excluir = document.getElementById('modal_excluir');
let funcionarioParaExcluir = null;

function abrirModal() {
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function fecharModal() {
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function confirmarExclusao(id) {
    funcionarioParaExcluir = id;
    if (modal_excluir) {
        modal_excluir.classList.remove('hidden');
        modal_excluir.classList.add('flex');
    }
}

function fecharModalExcluir() {
    funcionarioParaExcluir = null;
    if (modal_excluir) {
        modal_excluir.classList.add('hidden');
        modal_excluir.classList.remove('flex');
    }
}

function executarExclusao() {
    if (funcionarioParaExcluir !== null) {
        let lista = obterFuncionarios();
        lista = lista.filter(f => f.id !== funcionarioParaExcluir);
        salvarFuncionarios(lista);
        renderizarFuncionarios();
    }
    fecharModalExcluir();
}

if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal) fecharModal(); });
}
if (modal_excluir) {
    modal_excluir.addEventListener('click', e => { if (e.target === modal_excluir) fecharModalExcluir(); });
}

document.addEventListener('keydown', e => { 
    if (e.key === 'Escape') {
        fecharModal(); 
        fecharModalExcluir(); 
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderizarFuncionarios();
    inicializarEdicaoFuncionario();

    const btnHamburguer = document.getElementById('btn-hamburguer');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function toggleMenu() {
        if (!sidebar || !overlay) return;
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    }

    if (btnHamburguer && overlay) {
        btnHamburguer.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    }
});