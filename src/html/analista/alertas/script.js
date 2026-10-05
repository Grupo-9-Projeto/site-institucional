const dadosAlertas = {
    "alertas": [
        {
            "id": "ARG-140",
            "dispositivo": "FW-CORE-03",
            "cliente": "Bradesco",
            "tipo": "Uso de CPU",
            "data": "08/06/2026",
            "hora": "14:30",
            "severidade": "Crítico",
            "sla": { "status": "SLA Violado", "tempo_excedido": "+1h 22m" },
            "status": "Aberto",
            "analista": "Cláudio",
            "slaVinculado": "SLA-031",
            "descricao": "Processamento da CPU acima de 95% de forma constante. Recomenda-se verificação das regras de firewall ativas."
        },
        {
            "id": "ARG-141",
            "dispositivo": "FW-CORE-02",
            "cliente": "Bradesco",
            "tipo": "Perda de Pacotes",
            "data": "02/10/2026",
            "hora": "09:15",
            "severidade": "Crítico",
            "sla": { "status": "Dentro do SLA", "tempo_excedido": null },
            "status": "Em atendimento",
            "analista": "Junin",
            "slaVinculado": "SLA-023",
            "descricao": "Perda de pacotes na interface principal acima de 12%. Verificando link com a operadora."
        },
        {
            "id": "ARG-142",
            "dispositivo": "SW-ACCESS-01",
            "cliente": "Itaú",
            "tipo": "Memória alta",
            "data": "15/09/2026",
            "hora": "12:05",
            "severidade": "Atenção",
            "sla": { "status": "SLA Violado", "tempo_excedido": "+45m" },
            "status": "Aberto",
            "analista": null,
            "slaVinculado": "SLA-030",
            "descricao": "Uso de memória estável em 78%. Monitoramento ativo. Nenhum impacto ao tráfego identificado. Aguardando alocação de analista."
        },
        {
            "id": "ARG-143",
            "dispositivo": "RT-CORE-01",
            "cliente": "Santander",
            "tipo": "Uso de CPU",
            "data": "15/09/2026",
            "hora": "10:00",
            "severidade": "Atenção",
            "sla": { "status": "Dentro do SLA", "tempo_excedido": null },
            "status": "Resolvido",
            "analista": "Lara",
            "slaVinculado": "SLA-029",
            "descricao": "Pico temporário de CPU devido à sincronização de tabelas de roteamento. Incidente normalizado."
        },
        {
            "id": "ARG-144",
            "dispositivo": "FW-EDGE-01",
            "cliente": "Bradesco",
            "tipo": "Link down",
            "data": "02/09/2026",
            "hora": "18:40",
            "severidade": "Crítico",
            "sla": { "status": "SLA Violado", "tempo_excedido": "+55m" },
            "status": "Em atendimento",
            "analista": "Isa",
            "slaVinculado": "SLA-027",
            "descricao": "Interface de borda indisponível. Equipe de campo acionada para checagem do cabeamento e GPON."
        },
        {
            "id": "ARG-145",
            "dispositivo": "SW-ACCESS-02",
            "cliente": "Itaú",
            "tipo": "Uso de CPU",
            "data": "25/07/2026",
            "hora": "11:20",
            "severidade": "Atenção",
            "sla": { "status": "Dentro do SLA", "tempo_excedido": null },
            "status": "Resolvido",
            "analista": "Pedro",
            "slaVinculado": "SLA-021",
            "descricao": "Uso pontual de CPU solucionado após reinicialização de processos travados no switch."
        }
    ]
};

let filtroSeveridadeAtual = 'Todos';

document.addEventListener('DOMContentLoaded', () => {
    const btnHamburguer = document.getElementById('btn-hamburguer');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function toggleMenu() {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    }

    function ajustarComZoom() {
        if (window.innerWidth >= 1024) {
            btnHamburguer.classList.add('hidden');
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.remove('fixed');
            sidebar.classList.add('relative');
            overlay.classList.add('hidden');
        } else {
            btnHamburguer.classList.remove('hidden');
            sidebar.classList.add('-translate-x-full');
            sidebar.classList.remove('relative');
            sidebar.classList.add('fixed');
        }
    }

    if (btnHamburguer && sidebar && overlay) {
        btnHamburguer.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
        window.addEventListener('resize', ajustarComZoom);
        ajustarComZoom();
    }

    configurarFiltros();
    aplicarFiltros();
    carregarDetalhesAlerta();
});

function parseDataBr(strData) {
    if (!strData) return null;
    const [dia, mes, ano] = strData.split('/').map(Number);
    return new Date(ano, mes - 1, dia);
}

function aplicarFiltros() {
    const inputInicio = document.getElementById('data-inicio');
    const inputFim = document.getElementById('data-fim');

    const dataInicio = inputInicio?.value ? new Date(inputInicio.value + 'T00:00:00') : null;
    const dataFim = inputFim?.value ? new Date(inputFim.value + 'T23:59:59') : null;

    const alertasFiltrados = dadosAlertas.alertas.filter(alerta => {
        if (filtroSeveridadeAtual !== 'Todos' && alerta.severidade !== filtroSeveridadeAtual) return false;

        const dataAlerta = parseDataBr(alerta.data);
        if (dataAlerta) {
            if (dataInicio && dataAlerta < dataInicio) return false;
            if (dataFim && dataAlerta > dataFim) return false;
        }

        return true;
    });

    renderizarTabelaAlertas(alertasFiltrados);
}

function configurarFiltros() {
    const botoesFiltro = document.querySelectorAll('.btn-filtro');
    const btnAtivoClass = 'btn-filtro rounded text-[14px] px-4 h-9 border border-transparent bg-blue-500 text-[#09121B] font-semibold cursor-pointer transition-colors';
    const btnInativoClass = 'btn-filtro rounded text-[14px] px-4 h-9 border border-gray-400 text-gray-400 font-semibold hover:border-white hover:text-white cursor-pointer transition-colors';

    botoesFiltro.forEach(btn => {
        btn.addEventListener('click', () => {
            filtroSeveridadeAtual = btn.textContent.trim();
            botoesFiltro.forEach(b => b.className = btnInativoClass);
            btn.className = btnAtivoClass;
            aplicarFiltros();
        });
    });

    document.getElementById('data-inicio')?.addEventListener('change', aplicarFiltros);
    document.getElementById('data-fim')?.addEventListener('change', aplicarFiltros);
}

function renderizarTabelaAlertas(alertas) {
    const tbody = document.getElementById('tabela-alertas-body');
    if (!tbody) return;

    if (alertas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="py-6 text-center text-gray-400">
                    Nenhum alerta encontrado para os filtros selecionados.
                </td>
            </tr>`;
        return;
    }

    const statusClasses = {
        'Aberto': 'bg-red-900/50 text-red-300',
        'Em atendimento': 'bg-amber-900/50 text-amber-300',
        'Resolvido': 'bg-emerald-900/50 text-emerald-300'
    };

    tbody.innerHTML = alertas.map(alerta => {
        const isCritico = alerta.severidade === 'Crítico';
        const isSlaViolado = alerta.sla.status === 'SLA Violado';

        const corSeveridade = isCritico ? 'text-red-500' : 'text-amber-500';
        const badgeSlaClass = isSlaViolado ? 'bg-red-900/40 text-red-400' : 'bg-emerald-900/40 text-emerald-400';
        const badgeStatusClass = statusClasses[alerta.status] || 'bg-gray-800 text-gray-300';

        return `
            <tr class="border-b border-gray-800 hover:bg-[#132230] transition-colors cursor-pointer"
                onclick="window.location.href='detalheAlerta.html?id=${encodeURIComponent(alerta.id)}'">
                <td class="py-3 px-4">
                    <div class="font-bold text-gray-100">${alerta.dispositivo}</div>
                    <div class="text-xs text-gray-400">${alerta.cliente}</div>
                </td>
                <td class="py-3 px-4 text-gray-300">${alerta.tipo}</td>
                <td class="py-3 px-4 text-gray-300">${alerta.data}</td>
                <td class="py-3 px-4 font-medium ${corSeveridade}">
                    <span class="inline-block w-2 h-2 rounded-full mr-1.5 ${isCritico ? 'bg-red-500' : 'bg-amber-500'}"></span>
                    ${alerta.severidade}
                </td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 text-xs font-semibold rounded ${badgeSlaClass}">
                        ${alerta.sla.status}
                    </span>
                    ${alerta.sla.tempo_excedido ? `<span class="block text-xs text-red-400 mt-1">${alerta.sla.tempo_excedido}</span>` : ''}
                </td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-1 text-xs font-medium rounded-full ${badgeStatusClass}">
                        ${alerta.status}
                    </span>
                </td>
                <td class="py-3 px-4 text-gray-300">${alerta.analista || '—'}</td>
            </tr>`;
    }).join('');
}

function carregarDetalhesAlerta() {
    const containerDetalhes = document.getElementById('detalhes-alerta-container');
    if (!containerDetalhes) return;

    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    const dispositivoParam = urlParams.get('dispositivo');

    let alerta = null;
    if (idParam) {
        alerta = dadosAlertas.alertas.find(a => a.id === idParam);
    } else if (dispositivoParam) {
        alerta = dadosAlertas.alertas.find(a => a.dispositivo === dispositivoParam);
    }

    if (!alerta) {
        containerDetalhes.innerHTML = `<p class="text-center text-gray-400 py-10 font-['Poppins']">Alerta não encontrado.</p>`;
        return;
    }

    const isCritico = alerta.severidade === 'Crítico';
    const isSlaViolado = alerta.sla.status === 'SLA Violado';

    const corSeveridade = isCritico 
        ? 'bg-red-900/30 text-red-400 border-red-800' 
        : 'bg-amber-500/20 text-amber-400 border-amber-500/40';

    const badgeSlaClass = isSlaViolado 
        ? 'bg-red-900/50 text-red-400 border-red-800' 
        : 'bg-emerald-900/50 text-emerald-400 border-emerald-800';

    let badgeStatusClass = 'bg-gray-800 text-gray-300';
    if (alerta.status === 'Aberto') badgeStatusClass = 'bg-red-900/50 text-red-300';
    if (alerta.status === 'Em atendimento') badgeStatusClass = 'bg-amber-900/50 text-amber-300';
    if (alerta.status === 'Resolvido') badgeStatusClass = 'bg-emerald-900/50 text-emerald-300';

    const camposDetalhe = [
        { rotulo: 'Data do Alerta', valor: alerta.data },
        { rotulo: 'Dispositivo', valor: alerta.dispositivo },
        { rotulo: 'Empresa', valor: alerta.cliente },
        { rotulo: 'Tipo de Alerta', valor: alerta.tipo },
        { rotulo: 'Hora', valor: alerta.hora || '—' },
        { rotulo: 'Analista Responsável', valor: alerta.analista || 'Não atribuído' },
        { rotulo: 'SLA Vinculado', valor: alerta.slaVinculado || '—' },
        { rotulo: 'Tempo Excedido', valor: alerta.sla.tempo_excedido || '—' }
    ];

    let tabelaHtml = '';
    camposDetalhe.forEach(campo => {
        tabelaHtml += `
            <div class="flex justify-between items-center py-3 px-4 border-b border-gray-800 text-sm font-['Poppins']">
                <span class="text-gray-400 font-medium">${campo.rotulo}</span>
                <span class="text-gray-200 font-semibold">${campo.valor}</span>
            </div>`;
    });

    containerDetalhes.innerHTML = `
        <div class="mb-6 font-['Poppins']">
            <p class="text-xs text-gray-400 mb-1">
                <a href="index.html" class="hover:text-white transition-colors cursor-pointer">Alertas</a> &gt; <span class="text-gray-200 font-semibold">${alerta.id}</span>
            </p>
            <h1 class="text-2xl font-bold text-white mb-1">Detalhes do Alerta</h1>
            <p class="text-xs text-gray-400">${alerta.dispositivo} — ${alerta.cliente}</p>
        </div>

        <div class="flex flex-wrap gap-2 mb-6 font-['Poppins']">
            <span class="px-3 py-1 text-xs font-semibold rounded font-[${corSeveridade}] bg-[#0D1924]">
                ● ${alerta.severidade}
            </span>
            <span class="px-3 py-1 text-xs font-semibold rounded-full ${badgeStatusClass}">
                ${alerta.status}
            </span>
            <span class="px-3 py-1 text-xs font-semibold rounded border ${badgeSlaClass}">
                ${alerta.sla.status} ${alerta.sla.tempo_excedido ? alerta.sla.tempo_excedido : ''}
            </span>
        </div>

        <div class="bg-[#0D1924] rounded-lg border border-gray-800 overflow-hidden mb-6">
            ${tabelaHtml}
        </div>

        <div class="bg-[#0D1924] p-4 rounded-lg border border-gray-800 font-['Poppins']">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descrição</h3>
            <p class="text-sm text-gray-300">
                ${alerta.descricao}
            </p>
        </div>
    `;
}