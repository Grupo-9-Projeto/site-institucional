const dadosEmpresas = [
    {
        id: 1,
        nome: "Bradesco",
        equipamentos: [
            {
                id: 1,
                nome: "FW-CORE-03",
                componentes: [
                    {
                        id: 1,
                        nome: "CPU Principal",
                        tipo: "CPU",
                        unidadeMedida: "%",
                        capacidade: "100",
                        limiarAtencao: "70",
                        limiarAlto: "85",
                        limiarCritico: "95",
                        status: "Ativo"
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        nome: "Itaú",
        equipamentos: [
            {
                id: 1,
                nome: "SW-ACCESS-01",
                componentes: [
                    {
                        id: 1,
                        nome: "Uso de Memória",
                        tipo: "Memória",
                        unidadeMedida: "%",
                        capacidade: "16 GB",
                        limiarAtencao: "70",
                        limiarAlto: "80",
                        limiarCritico: "90",
                        status: "Ativo"
                    }
                ]
            }
        ]
    }
];

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

    const urlParams = new URLSearchParams(window.location.search);
    const empresaId = parseInt(urlParams.get('empresaId')) || 1;
    const eqId = parseInt(urlParams.get('eqId')) || 0;
    const compId = parseInt(urlParams.get('compId')) || 0;

    const empresa = dadosEmpresas.find(e => e.id === empresaId) || dadosEmpresas[0];
    const equipamento = empresa && empresa.equipamentos ? (empresa.equipamentos[eqId] || empresa.equipamentos[0]) : null;
    const componente = equipamento && equipamento.componentes ? (equipamento.componentes[compId] || equipamento.componentes[0]) : null;

    const linkVoltar = document.getElementById('link-voltar');
    if (linkVoltar) {
        if (window.location.pathname.includes('componentes')) {
            linkVoltar.href = `../informacoesEquipamento.html?empresaId=${empresaId}&eqId=${eqId}`;
        } else {
            linkVoltar.href = `../informacoesEmpresa.html?id=${empresaId}`;
        }
    }

    const linkCancelar = document.getElementById('link-cancelar');
    if (linkCancelar) {
        linkCancelar.href = `../informacoesEquipamento.html?empresaId=${empresaId}&eqId=${eqId}`;
    }

    const linkEditar = document.getElementById('link-editar');
    if (linkEditar) {
        linkEditar.href = `./editarComponente.html?empresaId=${empresaId}&eqId=${eqId}&compId=${compId}`;
    }

    if (equipamento && document.getElementById('edit-eq-nome')) {
        const editEqNome = document.getElementById('edit-eq-nome');
        if (editEqNome) editEqNome.textContent = equipamento.nome;

        const badgeStatus = document.getElementById('edit-eq-status-badge');
        if (badgeStatus) badgeStatus.textContent = equipamento.status;

        const dataEl = document.getElementById('edit-eq-data');
        if (dataEl) dataEl.textContent = equipamento.cadastradoEm || '--/--/----';

        const catEl = document.getElementById('edit-eq-categoria');
        if (catEl) catEl.textContent = equipamento.categoria || '---';

        const modEl = document.getElementById('edit-eq-modelo');
        if (modEl) modEl.textContent = equipamento.modelo || '---';

        const ipEl = document.getElementById('edit-eq-ip');
        if (ipEl) ipEl.textContent = equipamento.ip || '---';

        const macEl = document.getElementById('edit-eq-mac');
        if (macEl) macEl.textContent = equipamento.mac || '---';

        const serieEl = document.getElementById('edit-eq-serie');
        if (serieEl) serieEl.textContent = equipamento.serie || '---';

        const statusEl = document.getElementById('edit-eq-status');
        if (statusEl) {
            statusEl.textContent = equipamento.status || '---';
            const isAtivo = equipamento.status === 'Ativo' || equipamento.status === 'Online';
            statusEl.className = `text-sm font-medium ${isAtivo ? 'text-green-500' : 'text-red-500'}`;
        }

        const compContainer = document.getElementById('lista-componentes-container');
        const compContador = document.getElementById('componentes-contador');

        if (compContainer && equipamento.componentes) {
            if (compContador) compContador.textContent = `${equipamento.componentes.length} componente(s) cadastrado(s)`;
            compContainer.innerHTML = '';

            equipamento.componentes.forEach((comp, compIndex) => {
                const isActive = comp.status === 'Ativo';
                compContainer.innerHTML += `
                    <div onclick="window.location.href='./componentes/detalhesComponente.html?empresaId=${empresa.id}&eqId=${eqId}&compId=${compIndex}'" class="w-full h-16 border border-white/10 flex items-center px-5 rounded-[7px] bg-[#09121B] justify-between hover:border-light-blue/40 hover:bg-white/5 outline-none focus:outline-none focus:ring-0 cursor-pointer transition-element">
                        <div class="flex items-center gap-4">
                            <span class="size-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}"></span>
                            <div class="flex flex-col">
                                <span class="text-sm font-medium text-white">${comp.nome}</span>
                                <span class="text-gray-500 text-[11px]">${comp.tipo} - ${comp.unidadeMedida || ''}</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 text-white/60" onclick="event.stopPropagation()">
                            <a href="./componentes/detalhesComponente.html?empresaId=${empresa.id}&eqId=${eqId}&compId=${compIndex}" class="w-9 h-9 rounded-md flex items-center justify-center hover:text-light-blue outline-none focus:outline-none focus:ring-0 cursor-pointer transition-element">
                                <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </a>
                            <a href="./componentes/editarComponente.html?empresaId=${empresa.id}&eqId=${eqId}&compId=${compIndex}" class="w-9 h-9 rounded-md flex items-center justify-center hover:text-light-blue outline-none focus:outline-none focus:ring-0 cursor-pointer transition-element">
                                <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </a>
                            <button type="button" class="w-9 h-9 rounded-md flex items-center justify-center hover:text-red-400 outline-none focus:outline-none focus:ring-0 cursor-pointer transition-element" onclick="abrirModalExcluir(${comp.id});">
                                <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
    }

    if (componente && document.getElementById('comp-nome')) {
        const eqNomeEl = document.getElementById('comp-eq-nome');
        if (eqNomeEl) eqNomeEl.textContent = `${equipamento.nome} - Informações`;

        const nomeEl = document.getElementById('comp-nome');
        if (nomeEl) nomeEl.textContent = componente.nome;

        const badgeStatus = document.getElementById('comp-status-badge');
        if (badgeStatus) {
            badgeStatus.textContent = componente.status || 'Ativo';
            const isAtivo = componente.status === 'Ativo';
            badgeStatus.className = `px-3 py-1 rounded-md border text-xs font-bold ${isAtivo ? 'border-light-blue/40 bg-light-blue/10 text-light-blue' : 'border-red-500/40 bg-red-500/10 text-red-500'}`;
        }

        const tipoEl = document.getElementById('comp-tipo');
        if (tipoEl) tipoEl.textContent = componente.tipo || '---';

        const unidadeEl = document.getElementById('comp-unidade');
        if (unidadeEl) unidadeEl.textContent = componente.unidadeMedida || '---';

        const capacidadeEl = document.getElementById('comp-capacidade');
        if (capacidadeEl) capacidadeEl.textContent = componente.capacidade || '---';

        const atencaoEl = document.getElementById('comp-atencao');
        if (atencaoEl) atencaoEl.textContent = componente.limiarAtencao || '---';

        const altoEl = document.getElementById('comp-alto');
        if (altoEl) altoEl.textContent = componente.limiarAlto || '---';

        const criticoEl = document.getElementById('comp-critico');
        if (criticoEl) criticoEl.textContent = componente.limiarCritico || '---';
    }

    if (componente && document.getElementById('form-editar-componente')) {
        const inputNome = document.getElementById('nome');
        if (inputNome) inputNome.value = componente.nome || '';

        const selectTipo = document.getElementById('tipo');
        if (selectTipo) selectTipo.value = componente.tipo || '';

        const inputUnidade = document.getElementById('unidade');
        if (inputUnidade) inputUnidade.value = componente.unidadeMedida || '';

        const inputCapacidade = document.getElementById('Capacidade_total');
        if (inputCapacidade) inputCapacidade.value = componente.capacidade || '';

        const inputCritico = document.getElementById('limiar_critico');
        if (inputCritico) inputCritico.value = componente.limiarCritico || '';

        const inputAlto = document.getElementById('limiar_alto');
        if (inputAlto) inputAlto.value = componente.limiarAlto || '';

        const inputAtencao = document.getElementById('limiar_atencao');
        if (inputAtencao) inputAtencao.value = componente.limiarAtencao || '';

        const selectStatus = document.getElementById('status');
        if (selectStatus) selectStatus.value = componente.status || 'Ativo';
    }
});

let modal_excluir = document.getElementById('modal_excluir');

function abrirModalExcluir(id) {
    if (modal_excluir) {
        modal_excluir.classList.remove('hidden');
        modal_excluir.classList.add('flex');
    }
}

function fecharModalExcluir() {
    if (modal_excluir) {
        modal_excluir.classList.add('hidden');
        modal_excluir.classList.remove('flex');
    }
}

if (modal_excluir) {
    modal_excluir.addEventListener('click', e => { 
        if (e.target === modal_excluir) fecharModalExcluir(); 
    });
}

document.addEventListener('keydown', e => { 
    if (e.key === 'Escape') fecharModalExcluir(); 
});