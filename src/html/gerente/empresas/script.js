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
        nome: "Tech Solutions Ltda",
        cnpj: "12.345.678/0001-90",
        cadastradoEm: "15/03/2024",
        sla: "Ouro",
        limiteResposta: "2 horas",
        status: "Ativo",
        equipamentos: [
            {
                id: 1,
                nome: "FW-CORE-02",
                status: "Ativo"
            },
            {
                id: 2,
                nome: "Switch Core 24 Portas",
                status: "Ativo"
            }
        ]
    },
    {
        id: 2,
        nome: "Inovação & Sistemas S.A.",
        cnpj: "98.765.432/0001-12",
        cadastradoEm: "20/05/2024",
        sla: "Prata",
        limiteResposta: "4 horas",
        status: "Ativo",
        equipamentos: [
            {
                id: 1,
                nome: "Firewall de Borda",
                status: "Ativo"
            }
        ]
    },
    {
        id: 3,
        nome: "Logística Global Express",
        cnpj: "45.678.123/0001-55",
        cadastradoEm: "10/01/2025",
        sla: "Bronze",
        limiteResposta: "8 horas",
        status: "Inativo",
        equipamentos: [
            {
                id: 1,
                nome: "Terminal de Consulta 01",
                status: "Offline"
            }
        ]
    },
    {
        id: 4,
        nome: "Alpha Engenharia e Consultoria",
        cnpj: "11.222.333/0001-44",
        cadastradoEm: "05/08/2025",
        sla: "Ouro",
        limiteResposta: "1 hora",
        status: "Ativo",
        equipamentos: [
            {
                id: 1,
                nome: "Workstation CAD Principal",
                status: "Ativo"
            },
            {
                id: 2,
                nome: "No-break Torre 3kVA",
                status: "Ativo"
            }
        ]
    },
    {
        id: 5,
        nome: "Nexus Digital Hub",
        cnpj: "77.889.900/0001-21",
        cadastradoEm: "12/11/2025",
        sla: "Prata",
        limiteResposta: "4 horas",
        status: "Ativo",
        equipamentos: [
            {
                id: 1,
                nome: "Roteador Wi-Fi Corporativo",
                status: "Ativo"
            }
        ]
    }
];

function inicializarPaginaEmpresas() {
    const urlParams = new URLSearchParams(window.location.search);
    const empresaId = parseInt(urlParams.get('id')) || 1; // Se não houver ID na URL, assume o 1 por padrão

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
                eqContainer.innerHTML += `
                    <div class="relative flex items-center justify-between px-4 py-3.5 rounded-lg border border-white/10 bg-[#0B141D] hover:bg-white/5 transition-element cursor-pointer" onclick="window.location.href='./equipamentos/informacoesEquipamento.html?empresaId=${empresa.id}&eqId=${index}'">
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
                                <button type="button" class="hover:text-red-400 cursor-pointer transition-element p-1" onclick="event.stopPropagation(); abrirModalExcluirEquipamento(${index});">
                                    <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
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
    // Função pronta caso queira tratar a exclusão do equipamento pelo ID/Index
    console.log("Excluir equipamento index:", index);
}

function fecharModal() {
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
}

function fecharModalExcluir() {
    if (modal_excluir) { modal_excluir.classList.add('hidden'); modal_excluir.classList.remove('flex'); }
}

if (modal) modal.addEventListener('click', e => { if (e.target === modal) fecharModal(); });
if (modal_excluir) modal_excluir.addEventListener('click', e => { if (e.target === modal_excluir) fecharModalExcluir(); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { fecharModal(); fecharModalExcluir(); }
});