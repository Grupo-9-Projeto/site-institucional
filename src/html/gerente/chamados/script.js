const dadosChamados = [
    {
        "id": "SLA-031",
        "data": "2026-09-15",
        "empresa": "Bradesco",
        "equipamento": "FW-CORE-03",
        "tipo_sla": "Disponibilidade",
        "prioridade": "Crítico",
        "status": "Em Aberto",
        "chamado_vinculado": "ARG-142",
        "responsavel": "Cláudio Lopes",
        "descricao": "Equipamento ficou indisponível por 1h 22m, excedendo o limite de SLA de 4h acumuladas no mês. Incidente relacionado ao alto uso de CPU."
    },
    {
        "id": "SLA-032",
        "data": "2026-10-02",
        "empresa": "Bradesco",
        "equipamento": "FW-CORE-02",
        "tipo_sla": "Resolução",
        "prioridade": "Crítico",
        "status": "Em atendimento",
        "chamado_vinculado": "ARG-141",
        "responsavel": "Junin da Silva",
        "descricao": "Perda de pacotes na interface principal acima de 12%. Verificando link com a operadora."
    },
    {
        "id": "SLA-033",
        "data": "2026-09-15",
        "empresa": "Itaú",
        "equipamento": "SW-ACCESS-01",
        "tipo_sla": "Tempo de Resposta",
        "prioridade": "Médio",
        "status": "Em Aberto",
        "chamado_vinculado": "ARG-142",
        "responsavel": "Não atribuído",
        "descricao": "Uso de memória estável em 78%. Monitoramento ativo. Nenhum impacto ao tráfego identificado."
    },
    {
        "id": "SLA-034",
        "data": "2026-09-15",
        "empresa": "Santander",
        "equipamento": "RT-CORE-01",
        "tipo_sla": "Disponibilidade",
        "prioridade": "Alto",
        "status": "Resolvido",
        "chamado_vinculado": "ARG-139",
        "responsavel": "Lara Pereira",
        "descricao": "Pico temporário de CPU devido à sincronização de tabelas de roteamento. Incidente normalizado."
    },
    {
        "id": "SLA-035",
        "data": "2026-10-05",
        "empresa": "Santander",
        "equipamento": "RT-EDGE-02",
        "tipo_sla": "Disponibilidade",
        "prioridade": "Crítico",
        "status": "Em atendimento",
        "chamado_vinculado": "ARG-145",
        "responsavel": "Isabella Albuquerque",
        "descricao": "Interface WAN principal inoperante. Tráfego redirecionado automaticamente para o link de contingência (Backup)."
    },
    {
        "id": "SLA-036",
        "data": "2026-09-28",
        "empresa": "Itaú",
        "equipamento": "SW-CORE-01",
        "tipo_sla": "Tempo de Resposta",
        "prioridade": "Alto",
        "status": "Resolvido",
        "tipo_sla_detalhe": "Desempenho",
        "chamado_vinculado": "ARG-144",
        "responsavel": "Pedro",
        "descricao": "Latência acima do limite contratual detectada no switch central devido a broadcast storm. Isolamento da porta efetuado com sucesso."
    },
    {
        "id": "SLA-037",
        "data": "2026-10-10",
        "empresa": "Bradesco",
        "equipamento": "FW-EDGE-01",
        "tipo_sla": "Segurança",
        "prioridade": "Crítico",
        "status": "Em atendimento",
        "chamado_vinculado": "ARG-150",
        "responsavel": "Cláudio Lopes",
        "descricao": "Detectado alto volume de requisições maliciosas direcionadas ao portal de transações. Regras de mitigação ativadas no firewall de borda."
    },
    {
        "id": "SLA-038",
        "data": "2026-09-20",
        "empresa": "Santander",
        "equipamento": "SRV-DB-01",
        "tipo_sla": "Capacidade",
        "prioridade": "Médio",
        "status": "Resolvido",
        "chamado_vinculado": "ARG-138",
        "responsavel": "Lara Pereira",
        "descricao": "Partição de logs atingiu 90% de ocupação. Limpeza de logs antigos realizada e rotatividade de backup ajustada."
    }
];

let statusSelecionado = "todos";
let equipamentoSelecionado = "";
let dataInicial = "";
let dataFinal = "";

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

    if (document.getElementById('tabela-violacoes')) {
        popularEquipamentos();
        configurarFiltros();
        atualizarTabela();
    }

    if (document.getElementById('detalhes-chamado-container')) {
        carregarDetalhesChamado();
    }
});

function formatarData(iso) {
    if (!iso) return "—";
    const partes = iso.split("-");
    if (partes.length !== 3) return iso;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function popularEquipamentos() {
    const select = document.getElementById("filtro-equipamento");
    if (!select) return;

    const equipamentos = [...new Set(dadosChamados.map(item => item.equipamento))];

    equipamentos.forEach(equipamento => {
        const option = document.createElement("option");
        option.value = equipamento;
        option.textContent = equipamento;
        select.appendChild(option);
    });
}

function filtrarChamados() {
    return dadosChamados.filter(item => {
        if (dataInicial && item.data < dataInicial) return false;
        if (dataFinal && item.data > dataFinal) return false;
        if (equipamentoSelecionado && item.equipamento !== equipamentoSelecionado) return false;
        if (statusSelecionado !== "todos" && item.status !== statusSelecionado) return false;
        return true;
    });
}

function configurarFiltros() {
    document.querySelectorAll(".btn-status").forEach(botao => {
        botao.addEventListener("click", () => {
            statusSelecionado = botao.dataset.status;

            document.querySelectorAll(".btn-status").forEach(b => {
                b.className = "btn-status px-4 py-2 rounded-md text-xs font-semibold border border-white/15 text-white/70 hover:border-white hover:text-white cursor-pointer transition-element";
            });
            botao.className = "btn-status px-4 py-2 rounded-md text-xs font-bold bg-light-blue text-main-blue cursor-pointer transition-element";

            atualizarTabela();
        });
    });

    document.getElementById("data-inicial")?.addEventListener("change", function () {
        dataInicial = this.value;
        atualizarTabela();
    });

    document.getElementById("data-final")?.addEventListener("change", function () {
        dataFinal = this.value;
        atualizarTabela();
    });

    document.getElementById("filtro-equipamento")?.addEventListener("change", function () {
        equipamentoSelecionado = this.value;
        atualizarTabela();
    });
}

function atualizarTabela() {
    renderizarTabela(filtrarChamados());
}

const PRIORIDADES = {
    "Crítico": { ponto: "bg-red-500", texto: "text-red-500" },
    "Alto": { ponto: "bg-orange-500", texto: "text-orange-500" },
    "Médio": { ponto: "bg-yellow-400", texto: "text-yellow-400" }
};

const STATUS_CLASSES = {
    "Em Aberto": "bg-red-900/50 text-red-300",
    "Em atendimento": "bg-amber-900/50 text-amber-300",
    "Resolvido": "bg-emerald-900/50 text-emerald-300"
};

function renderizarTabela(lista) {
    const tbody = document.getElementById("tabela-violacoes");
    if (!tbody) return;

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="py-6 text-center text-white/60">
                    Nenhum chamado encontrado para os filtros selecionados.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(item => {
        const prioridade = PRIORIDADES[item.prioridade] || { ponto: "bg-gray-400", texto: "text-gray-400" };
        const statusClass = STATUS_CLASSES[item.status] || "bg-gray-800 text-gray-300";

        return `
            <tr class="h-14 border-b border-white/10 hover:bg-white/[0.04] transition-element cursor-pointer"
                onclick="window.location.href='detalheChamado.html?id=${encodeURIComponent(item.id)}'">
                <td class="py-3 px-5 font-bold text-light-blue whitespace-nowrap">${item.id}</td>
                <td class="py-3 px-5 text-white/80 whitespace-nowrap">${formatarData(item.data)}</td>
                <td class="py-3 px-5 text-white font-medium whitespace-nowrap">${item.empresa}</td>
                <td class="py-3 px-5 text-white/80 whitespace-nowrap">${item.equipamento}</td>
                <td class="py-3 px-5 text-white/60 whitespace-nowrap">${item.tipo_sla}</td>
                <td class="py-3 px-5 whitespace-nowrap">
                    <span class="flex items-center gap-1.5 text-xs font-semibold ${prioridade.texto}">
                        <span class="w-2 h-2 rounded-full ${prioridade.ponto}"></span>${item.prioridade}
                    </span>
                </td>
                <td class="py-3 px-5 whitespace-nowrap">
                    <span class="px-2.5 py-1 text-xs font-medium rounded-md inline-block ${statusClass}">${item.status}</span>
                </td>
            </tr>
        `;
    }).join("");
}

function carregarDetalhesChamado() {
    const container = document.getElementById('detalhes-chamado-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id') || "SLA-031";

    const chamado = dadosChamados.find(c => c.id === idParam) || dadosChamados[0];

    const isCritico = chamado.prioridade === 'Crítico';
    const corPrioridade = isCritico ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    const corStatus = STATUS_CLASSES[chamado.status] || "bg-gray-800 text-gray-300";

    container.innerHTML = `
        <div class="mb-6 font-poppins">
            <p class="text-xs text-white/60 mb-1">
                <a href="index.html" class="hover:text-white transition-element cursor-pointer">Histórico de Chamados</a> &gt; <span class="text-white font-semibold">${chamado.id}</span>
            </p>
            <h1 class="text-2xl font-bold text-white mb-1">Detalhes da Violação</h1>
            <p class="text-xs text-white/60">${chamado.equipamento} — ${chamado.empresa}</p>
        </div>

        <div class="flex flex-wrap gap-2 mb-6 font-poppins">
            <span class="px-3 py-1 text-xs font-semibold rounded ${corStatus}">
                ${chamado.status}
            </span>
            <span class="px-3 py-1 text-xs font-semibold rounded border ${corPrioridade}">
                ● ${chamado.prioridade}
            </span>
        </div>

        <div class="bg-[#0D1924] rounded-2xl border border-white/10 overflow-hidden mb-6 shadow-xl">
            <div class="flex justify-between items-center py-3.5 px-5 border-b border-white/10 text-sm">
                <span class="text-white/60 font-medium">ID da Violação</span>
                <span class="text-white font-semibold">${chamado.id}</span>
            </div>
            <div class="flex justify-between items-center py-3.5 px-5 border-b border-white/10 text-sm">
                <span class="text-white/60 font-medium">Data</span>
                <span class="text-white font-semibold">${formatarData(chamado.data)}</span>
            </div>
            <div class="flex justify-between items-center py-3.5 px-5 border-b border-white/10 text-sm">
                <span class="text-white/60 font-medium">Empresa</span>
                <span class="text-white font-semibold">${chamado.empresa}</span>
            </div>
            <div class="flex justify-between items-center py-3.5 px-5 border-b border-white/10 text-sm">
                <span class="text-white/60 font-medium">Equipamento</span>
                <span class="text-white font-semibold">${chamado.equipamento}</span>
            </div>
            <div class="flex justify-between items-center py-3.5 px-5 border-b border-white/10 text-sm">
                <span class="text-white/60 font-medium">Tipo de SLA</span>
                <span class="text-white font-semibold">${chamado.tipo_sla}</span>
            </div>
            <div class="flex justify-between items-center py-3.5 px-5 border-b border-white/10 text-sm">
                <span class="text-white/60 font-medium">Chamado Vinculado</span>
                <span class="text-white font-semibold">${chamado.chamado_vinculado}</span>
            </div>
            <div class="flex justify-between items-center py-3.5 px-5 text-sm">
                <span class="text-white/60 font-medium">Responsável</span>
                <span class="text-white font-semibold">${chamado.responsavel}</span>
            </div>
        </div>

        <div class="bg-[#0D1924] p-5 rounded-2xl border border-white/10 font-poppins shadow-xl">
            <h3 class="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Descrição da Ocorrência</h3>
            <p class="text-sm text-white/80 leading-relaxed">
                ${chamado.descricao}
            </p>
        </div>
    `;
}