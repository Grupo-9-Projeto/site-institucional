document.addEventListener('DOMContentLoaded', () => {
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

    inicializarPaginaEmpresas();
});

const dadosEmpresas = [
    {
        id: 1,
        nome: "Bradesco",
        cnpj: "60.746.948/0001-12",
        cadastradoEm: "15/03/2024",
        sla: "Ouro",
        limiteResposta: "1 hora",
        status: "Ativo",
        equipamentos: [
            { id: 1, nome: "FW-CORE-03", status: "Ativo" },
            { id: 2, nome: "FW-CORE-02", status: "Ativo" },
            { id: 3, nome: "FW-EDGE-01", status: "Ativo" }
        ]
    },
    {
        id: 2,
        nome: "Itaú",
        cnpj: "60.701.190/0001-04",
        cadastradoEm: "20/05/2024",
        sla: "Ouro",
        limiteResposta: "1 hora",
        status: "Ativo",
        equipamentos: [
            { id: 1, nome: "SW-ACCESS-01", status: "Ativo" },
            { id: 2, nome: "SW-CORE-01", status: "Ativo" }
        ]
    },
    {
        id: 3,
        nome: "Santander",
        cnpj: "90.400.888/0001-42",
        cadastradoEm: "10/01/2025",
        sla: "Prata",
        limiteResposta: "4 horas",
        status: "Ativo",
        equipamentos: [
            { id: 1, nome: "RT-CORE-01", status: "Ativo" },
            { id: 2, nome: "RT-EDGE-02", status: "Ativo" },
            { id: 3, nome: "SRV-DB-01", status: "Ativo" }
        ]
    }
];

function inicializarPaginaEmpresas() {
    const urlParams = new URLSearchParams(window.location.search);
    const empresaId = parseInt(urlParams.get('id')) || 1; 

    const listaContainer = document.getElementById('lista-empresas-container');
    if (listaContainer) {
        listaContainer.innerHTML = '';
        dadosEmpresas.forEach(empresaItem => {
            const card = document.createElement('div');
            card.className = "flex items-center justify-between px-6 py-5 rounded-lg border border-white/10 bg-[#0D1924] w-full hover:border-light-blue/50 transition-element cursor-pointer";
            card.onclick = () => window.location.href = `informacoesEmpresa.html?id=${empresaItem.id}`;

            card.innerHTML = `
                <span class="text-base font-medium">${empresaItem.nome}</span>
                <div class="flex items-center gap-4 text-white/60">
                    <a href="./editarEmpresa.html?id=${empresaItem.id}" class="hover:text-light-blue cursor-pointer transition-element p-1" onclick="event.stopPropagation()">
                        <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </a>
                    <button type="button" class="hover:text-red-400 cursor-pointer transition-element p-1" onclick="event.stopPropagation(); abrirModalExcluir(${empresaItem.id});">
                        <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                    </button>
                </div>
            `;
            listaContainer.appendChild(card);
        });
    }

    const infoNome = document.getElementById('info-nome');
    if (infoNome) {
        const empresa = dadosEmpresas.find(e => e.id === empresaId) || dadosEmpresas[0];

        infoNome.textContent = empresa.nome;

        const elCnpj = document.getElementById('info-cnpj');
        if (elCnpj) elCnpj.textContent = empresa.cnpj;

        const elData = document.getElementById('info-data');
        if (elData) elData.textContent = `Cadastrado em: ${empresa.cadastradoEm}`;

        const elSla = document.getElementById('info-sla');
        if (elSla) elSla.textContent = empresa.sla;

        const elLimite = document.getElementById('info-limite');
        if (elLimite) elLimite.textContent = empresa.limiteResposta;

        const statusEl = document.getElementById('info-status');
        if (statusEl) {
            statusEl.textContent = empresa.status;
            statusEl.className = `font-medium ${empresa.status === 'Ativo' ? 'text-green-500' : 'text-red-500'}`;
        }

        const eqContainer = document.getElementById('info-equipamentos');
        if (eqContainer) {
            eqContainer.innerHTML = '';
            empresa.equipamentos.forEach((eq, index) => {
                const isOnline = eq.status === 'Ativo' || eq.status === 'Online';
                
                const eqCard = document.createElement('div');
                eqCard.className = "relative flex items-center justify-between px-4 py-3.5 rounded-lg border border-white/10 bg-[#0B141D] hover:bg-white/5 transition-element cursor-pointer";
                eqCard.onclick = () => window.location.href = `./equipamentos/informacoesEquipamento.html?empresaId=${empresa.id}&eqId=${index}`;
                
                eqCard.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span class="size-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}"></span>
                        <span class="text-sm font-medium">${eq.nome}</span>
                    </div>

                    <div class="flex items-center gap-4">
                        <span class="text-xs font-bold ${isOnline ? 'text-green-500' : 'text-red-500'}">${eq.status}</span>
                        
                        <div class="flex items-center gap-2 text-white/60">
                            <a href="./equipamentos/editarEquipamento.html?empresaId=${empresa.id}&eqId=${index}" class="hover:text-light-blue cursor-pointer transition-element p-1" onclick="event.stopPropagation()">
                                <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </a>
                            <button type="button" class="btn-lixeira-eq hover:text-red-400 cursor-pointer transition-element p-1">
                                <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                            </button>
                        </div>
                    </div>
                `;

                const btnLixeira = eqCard.querySelector('.btn-lixeira-eq');
                btnLixeira.addEventListener('click', (e) => {
                    e.stopPropagation();
                    abrirModalExcluirEquipamento(index);
                });

                eqContainer.appendChild(eqCard);
            });
        }
    }

    const inputNome = document.getElementById('nome');
    if (inputNome) {
        const empresa = dadosEmpresas.find(e => e.id === empresaId) || dadosEmpresas[0];

        const editNome = document.getElementById('edit-titulo-nome');
        if (editNome) editNome.textContent = empresa.nome;

        const editCnpj = document.getElementById('edit-sub-cnpj');
        if (editCnpj) editCnpj.textContent = empresa.cnpj;

        const editData = document.getElementById('edit-data');
        if (editData) editData.textContent = `Cadastrado em: ${empresa.cadastradoEm}`;

        inputNome.value = empresa.nome;
        const inputCnpj = document.getElementById('cnpj');
        if (inputCnpj) inputCnpj.value = empresa.cnpj;
    }
}

let modal = document.getElementById('modal');
let modal_excluir = document.getElementById('modal_excluir');
let indiceEquipamentoParaExcluir = null;

function abrirModal() {
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function abrirModalExcluir(id) {
    if (modal_excluir) {
        modal_excluir.classList.remove('hidden');
        modal_excluir.classList.add('flex');
    }
}

function abrirModalExcluirEquipamento(index) {
    indiceEquipamentoParaExcluir = index; 
    if (modal_excluir) {
        modal_excluir.classList.remove('hidden');
        modal_excluir.classList.add('flex');
    }
}

function fecharModal() {
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
}

function fecharModalExcluir() {
    indiceEquipamentoParaExcluir = null;
    if (modal_excluir) { 
        modal_excluir.classList.add('hidden'); 
        modal_excluir.classList.remove('flex'); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
    if (btnConfirmarExclusao) {
        btnConfirmarExclusao.addEventListener('click', () => {
            if (indiceEquipamentoParaExcluir !== null) {
                const urlParams = new URLSearchParams(window.location.search);
                const empresaId = parseInt(urlParams.get('id')) || 1;
                const empresa = dadosEmpresas.find(e => e.id === empresaId);

                if (empresa && empresa.equipamentos) {

                    empresa.equipamentos.splice(indiceEquipamentoParaExcluir, 1);

                    inicializarPaginaEmpresas();
                }
            }
            fecharModalExcluir();
        });
    }
});

if (modal) modal.addEventListener('click', e => { if (e.target === modal) fecharModal(); });
if (modal_excluir) modal_excluir.addEventListener('click', e => { if (e.target === modal_excluir) fecharModalExcluir(); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { fecharModal(); fecharModalExcluir(); }
});