const funcionarios = [
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

function renderizarFuncionarios() {
    const container = document.getElementById("lista-funcionarios-container");
    if (!container) return;

    container.innerHTML = "";

    funcionarios.forEach((funcionario, index) => {
        const inicial = funcionario.nome ? funcionario.nome.charAt(0).toUpperCase() : "F";
        const nome = funcionario.nome || `Funcionário ${index + 1}`;

        const card = document.createElement("div");
        card.className = "flex items-center justify-between px-6 py-5 rounded-xl border border-white/10 bg-[#0D1924]";
        
        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="size-12 rounded-full grid place-items-center bg-main-purple border-2 border-[#2d3a6b] text-light-blue text-xl font-bold">
                    ${inicial}
                </div>
                <span class="text-base ">${nome}</span>
            </div>
            <div class="flex items-center gap-4 text-white/60">
                <a href="./editarFuncionario.html?id=${funcionario.id || index}" class="hover:text-light-blue cursor-pointer transition-element outline-none focus:outline-none focus:ring-0">
                    <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </a>
                <button type="button" class="hover:text-red-400 cursor-pointer transition-element outline-none focus:outline-none focus:ring-0" onclick="abrirModalExcluir()">
                    <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

let modal = document.getElementById('modal');
let modal_excluir = document.getElementById('modal_excluir');

function abrirModal() {
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function abrirModalExcluir() {
    if (modal_excluir) {
        modal_excluir.classList.remove('hidden');
        modal_excluir.classList.add('flex');
    }
}

function fecharModal() {
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function fecharModalExcluir() {
    if (modal_excluir) {
        modal_excluir.classList.add('hidden');
        modal_excluir.classList.remove('flex');
    }
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