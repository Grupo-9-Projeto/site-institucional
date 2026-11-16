const MODO_PREVIEW = true;

const btnHamburguer = document.getElementById('btn-hamburguer');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');

function abrirSidebar() {
    if (!sidebar || !overlay) return;

    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
}

function fecharSidebar() {
    if (!sidebar || !overlay) return;

    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
}

if (btnHamburguer && sidebar && overlay) {
    btnHamburguer.addEventListener('click', () => {
        const fechada = sidebar.classList.contains('-translate-x-full');

        fechada ? abrirSidebar() : fecharSidebar();
    });

    overlay.addEventListener('click', fecharSidebar);
}

const modal = document.getElementById('modal');

function abrirModal() {
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function fecharModal() {
    if (!modal) return;

    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

const dadosClientes = [
    { nome: "Bradesco", status: "Critico", texto_violados: "2 SLAs violados" },
    { nome: "Itaú", status: "Atencao", texto_violados: "1 SLA violado" },
    { nome: "Santander", status: "Estavel", texto_violados: "0 SLAs violados" },
    { nome: "Banco do Brasil", status: "Atencao", texto_violados: "1 SLA violado" },
    { nome: "Nubank", status: "Estavel", texto_violados: "0 SLAs violados" }
];

function chamadosCliente(termoBusca = "") {
    const clientes = document.getElementById("container_clientes");

    if (!clientes) return;

    clientes.innerHTML = "";

    const filtrados = dadosClientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(termoBusca.toLowerCase())
    );

    if (filtrados.length === 0) {
        clientes.innerHTML = `
            <p class="text-gray-400 text-xs text-center py-4">
                Nenhum cliente encontrado.
            </p>
        `;
        return;
    }

    filtrados.forEach(cliente => {
        const corBadgeBg = cliente.status === "Critico"
            ? "bg-red-400/20 text-red-300 border-red-400/20"
            : cliente.status === "Atencao"
                ? "bg-amber-400/20 text-amber-300 border-amber-400/20"
                : "bg-green-400/20 text-green-300 border-green-400/20";

        const card = document.createElement("div");

        card.className = "flex items-center justify-between p-3.5 bg-[#09121B] rounded-xl border border-white/5 hover:border-light-blue/50 cursor-pointer transition-element font-['Poppins']";

        card.innerHTML = `
            <div class="flex flex-col gap-1">
                <span class="text-white font-bold text-sm">${cliente.nome}</span>
                <span class="text-gray-400 text-xs">${cliente.texto_violados}</span>
            </div>

            <div class="px-3 py-1 rounded-full text-xs font-semibold border ${corBadgeBg}">
                ${cliente.status === "Atencao"
                    ? "Atenção"
                    : cliente.status === "Critico"
                        ? "Crítico"
                        : "Estável"}
            </div>
        `;

        card.addEventListener("click", () => {
            window.location.href = `./sla-empresa.html?empresa=${encodeURIComponent(cliente.nome)}`;
        });

        clientes.appendChild(card);
    });
}

let dados = [];
let empresaSelecionada = "";
let equipamentoSelecionado = "";
let periodoSelecionado = "Último mês";

async function carregarDadosRelatorio() {
    try {
        const resposta = await fetch("./dados.json");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar JSON");
        }

        dados = await resposta.json();

    } catch (erro) {
        console.error("Erro ao carregar dados do relatório:", erro);

        dados = [
            {
                empresa: "Bradesco",
                equipamento: "FW-CORE-03",
                data: "2026-09-15",
                cpu: "95.5",
                ram: "82.1",
                disco: "64.0",
                rede: "450.2"
            },
            {
                empresa: "Bradesco",
                equipamento: "FW-CORE-02",
                data: "2026-09-18",
                cpu: "88.0",
                ram: "79.4",
                disco: "55.2",
                rede: "310.8"
            },
            {
                empresa: "Itaú",
                equipamento: "SW-ACCESS-01",
                data: "2026-09-15",
                cpu: "60.4",
                ram: "78.0",
                disco: "50.0",
                rede: "820.0"
            },
            {
                empresa: "Santander",
                equipamento: "RT-CORE-01",
                data: "2026-09-15",
                cpu: "54.2",
                ram: "48.6",
                disco: "30.0",
                rede: "120.0"
            }
        ];
    }
}

function obterMetricasSelecionadas() {
    return Array.from(
        document.querySelectorAll('.metric-option input[type="checkbox"]:checked')
    ).map(cb => cb.value);
}

function filtrarDadosRelatorio() {
    const dataInicialInput = document.getElementById("dataInicial");
    const dataFinalInput = document.getElementById("dataFinal");

    if (dados.length === 0) return [];

    const datasDisponiveis = dados.map(d =>
        new Date(d.data + "T00:00:00").getTime()
    );

    const dataReferencia = new Date(Math.max(...datasDisponiveis));

    return dados.filter(item => {

        if (empresaSelecionada && item.empresa !== empresaSelecionada) {
            return false;
        }

        if (equipamentoSelecionado && item.equipamento !== equipamentoSelecionado) {
            return false;
        }

        const dataItem = new Date(item.data + "T00:00:00");

        if (periodoSelecionado === "Última semana") {
            const limite = new Date(dataReferencia);
            limite.setDate(limite.getDate() - 7);

            return dataItem >= limite && dataItem <= dataReferencia;
        }

        if (periodoSelecionado === "Último mês") {
            const limite = new Date(dataReferencia);
            limite.setMonth(limite.getMonth() - 1);

            return dataItem >= limite && dataItem <= dataReferencia;
        }

        if (periodoSelecionado === "Período personalizado") {
            const inicio = dataInicialInput?.value
                ? new Date(dataInicialInput.value + "T00:00:00")
                : null;

            const fim = dataFinalInput?.value
                ? new Date(dataFinalInput.value + "T23:59:59")
                : null;

            if (inicio && dataItem < inicio) return false;
            if (fim && dataItem > fim) return false;
        }

        return true;
    });
}

function atualizarResumoRelatorio() {
    const resPeriodo = document.getElementById("resPeriodo");
    const resEmpresa = document.getElementById("resEmpresa");
    const resEquip = document.getElementById("resEquip");
    const resMetricas = document.getElementById("resMetricas");
    const qtdRegistros = document.getElementById("quantidadeRegistros");

    if (!resPeriodo) return;

    if (periodoSelecionado === "Período personalizado") {
        const inicio = document.getElementById("dataInicial")?.value;
        const fim = document.getElementById("dataFinal")?.value;

        resPeriodo.textContent = (inicio && fim)
            ? `${inicio} até ${fim}`
            : "Personalizado";

    } else {
        resPeriodo.textContent = periodoSelecionado;
    }

    if (resEmpresa) {
        resEmpresa.textContent = empresaSelecionada || "-";
    }

    if (resEquip) {
        resEquip.textContent = equipamentoSelecionado || "-";
    }

    const metricas = obterMetricasSelecionadas();

    if (resMetricas) {
        resMetricas.textContent = metricas.length > 0
            ? metricas.join(", ")
            : "Nenhuma";
    }

    const filtrados = filtrarDadosRelatorio();

    if (qtdRegistros) {
        qtdRegistros.textContent = `${filtrados.length} ${
            filtrados.length === 1
                ? "registro disponível"
                : "registros disponíveis"
        }`;
    }
}

function renderizarEquipamentos() {
    const selectEquip = document.getElementById("equipamento");

    if (!selectEquip) return;

    const equipamentos = [...new Set(
        dados
            .filter(d => d.empresa === empresaSelecionada)
            .map(d => d.equipamento)
    )];

    selectEquip.innerHTML = "";

    equipamentos.forEach(eq => {
        const option = document.createElement("option");

        option.value = eq;
        option.textContent = eq;

        selectEquip.appendChild(option);
    });

    equipamentoSelecionado = equipamentos[0] || "";

    selectEquip.value = equipamentoSelecionado;

    atualizarResumoRelatorio();
}

function renderizarEmpresas() {
    const container = document.getElementById("empresasContainer");

    if (!container) return;

    const empresas = [...new Set(dados.map(d => d.empresa))];

    if (!empresaSelecionada && empresas.length > 0) {
        empresaSelecionada = empresas[0];
    }

    container.innerHTML = "";

    empresas.forEach(empresa => {
        const btn = document.createElement("button");

        btn.type = "button";

        const selecionada = empresa === empresaSelecionada;

        btn.className = selecionada
            ? "min-h-11 rounded-lg border border-light-blue bg-light-blue/10 px-4 text-sm font-semibold text-white cursor-pointer transition-element text-left"
            : "min-h-11 rounded-lg bg-main-blue border border-white/15 px-4 text-sm text-white/70 hover:text-white cursor-pointer transition-element text-left";

        btn.textContent = empresa;

        btn.addEventListener("click", () => {
            empresaSelecionada = empresa;

            renderizarEmpresas();
            renderizarEquipamentos();
        });

        container.appendChild(btn);
    });
}

function gerarCsvRelatorio() {
    const registros = filtrarDadosRelatorio();
    const metricas = obterMetricasSelecionadas();

    if (registros.length === 0) {
        alert("Não há registros disponíveis para os filtros selecionados.");
        return;
    }

    if (metricas.length === 0) {
        alert("Selecione pelo menos uma métrica para exportar.");
        return;
    }

    const cabecalho = ["Empresa", "Equipamento", "Data", ...metricas];

    const linhas = registros.map(item => [
        item.empresa,
        item.equipamento,
        item.data,
        ...metricas.map(m => item[m.toLowerCase()] ?? "")
    ]);

    const csvConteudo = [cabecalho, ...linhas]
        .map(linha => linha.join(";"))
        .join("\n");

    const blob = new Blob(
        ["\uFEFF" + csvConteudo],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `relatorio_${empresaSelecionada || "argos"}_${equipamentoSelecionado || "dados"}.csv`;

    link.click();

    URL.revokeObjectURL(url);
}

async function inicializarRelatorio() {
    const empresasContainer = document.getElementById("empresasContainer");

    if (!empresasContainer) return;

    await carregarDadosRelatorio();

    renderizarEmpresas();
    renderizarEquipamentos();

    const botoesPeriodo = document.querySelectorAll(".period-button");
    const containerDatas = document.getElementById("datas");

    botoesPeriodo.forEach(btn => {
        btn.addEventListener("click", () => {

            botoesPeriodo.forEach(b => {
                b.className = "period-button min-h-11 rounded-lg bg-main-blue border border-white/15 px-4 text-sm text-white/70 hover:text-white cursor-pointer transition-element";
            });

            btn.className = "period-button selected min-h-11 rounded-lg border border-light-blue bg-light-blue/10 px-4 text-sm font-semibold cursor-pointer transition-element";

            periodoSelecionado = btn.dataset.valor;

            if (containerDatas) {
                if (periodoSelecionado === "Período personalizado") {
                    containerDatas.classList.remove("hidden");
                    containerDatas.classList.add("grid");
                } else {
                    containerDatas.classList.add("hidden");
                    containerDatas.classList.remove("grid");
                }
            }

            atualizarResumoRelatorio();
        });
    });

    document.getElementById("dataInicial")?.addEventListener(
        "change",
        atualizarResumoRelatorio
    );

    document.getElementById("dataFinal")?.addEventListener(
        "change",
        atualizarResumoRelatorio
    );

    document.getElementById("equipamento")?.addEventListener("change", (e) => {
        equipamentoSelecionado = e.target.value;
        atualizarResumoRelatorio();
    });

    document.querySelectorAll('.metric-option input[type="checkbox"]').forEach(cb => {
        cb.addEventListener("change", atualizarResumoRelatorio);
    });

    document.getElementById("btnCsv")?.addEventListener(
        "click",
        gerarCsvRelatorio
    );

    atualizarResumoRelatorio();
}

async function chamarApi(caminho, metodo, corpo) {
    try {
        return await apiFetch(caminho, {
            method: metodo,
            body: corpo ? JSON.stringify(corpo) : undefined
        });

    } catch (erro) {

        if (erro && erro.sessaoExpirada) {
            return {
                ok: false,
                status: 401,
                dados: null
            };
        }

        console.error("Erro ao chamar API:", erro);

        return {
            ok: false,
            status: 0,
            dados: null
        };
    }
}

const dadosJsonSlas = {
    historico_slas_violados: [
        {
            id_sla: "SLA-031",
            equipamento: "FW-CORE-03",
            cliente: "Bradesco",
            tipo_sla: "Disponibilidade",
            tempo_excedido: "+1h 22m",
            gravidade: "urgente"
        },
        {
            id_sla: "SLA-032",
            equipamento: "FW-CORE-02",
            cliente: "Bradesco",
            tipo_sla: "Resolução",
            tempo_excedido: "+2h 05m",
            gravidade: "urgente"
        },
        {
            id_sla: "SLA-033",
            equipamento: "SW-ACCESS-01",
            cliente: "Itaú",
            tipo_sla: "Tempo de Resposta",
            tempo_excedido: "+45m",
            gravidade: "medio"
        },
        {
            id_sla: "SLA-034",
            equipamento: "RT-CORE-01",
            cliente: "Santander",
            tipo_sla: "Disponibilidade",
            tempo_excedido: "0m",
            gravidade: "estavel"
        }
    ]
};

function ordenarSLAs(dados) {
    const listaSLAs = dados.historico_slas_violados || dados;

    const listaCopiaSLAs = [...listaSLAs];

    const prioridade = {
        urgente: 1,
        medio: 2,
        estavel: 3
    };

    return listaCopiaSLAs.sort((a, b) => {
        return (prioridade[a.gravidade] || 99) -
            (prioridade[b.gravidade] || 99);
    });
}

const PLANOS_CISCO = {
    "24x7x2": {
        nome: "Smart Net Total Care 24x7x2",
        sigla: "2HR",
        prazoRmaTexto: "2 horas",
        disponibilidade: "24h / 7 dias (inclui feriados)",
        corteHora: null,
        onsiteTexto: "24/7",
        onsiteDetalhe: "Agendamento a qualquer hora"
    },
    "24x7x4": {
        nome: "Smart Net Total Care 24x7x4",
        sigla: "4HR",
        prazoRmaTexto: "4 horas",
        disponibilidade: "24h / 7 dias (inclui feriados)",
        corteHora: null,
        onsiteTexto: "24/7",
        onsiteDetalhe: "Agendamento a qualquer hora"
    },
    "8x5x4": {
        nome: "Smart Net Total Care 8x5x4",
        sigla: "4HR Comercial",
        prazoRmaTexto: "4 horas",
        disponibilidade: "Dias úteis, horário comercial (sem feriados)",
        corteHora: 13,
        onsiteTexto: "Comercial",
        onsiteDetalhe: "Dias úteis · corte às 13:00"
    },
    "8x7xNCD": {
        nome: "Smart Net Total Care 8x7xNCD",
        sigla: "NCD",
        prazoRmaTexto: "Próx. dia",
        disponibilidade: "7 dias/semana, 09:00 às 17:00 (inclui feriados)",
        corteHora: 15,
        onsiteTexto: "09h – 17h",
        onsiteDetalhe: "Dia seguinte à entrega da peça"
    },
    "8x5xNBD": {
        nome: "Smart Net Total Care 8x5xNBD",
        sigla: "NBD",
        prazoRmaTexto: "Próx. dia útil",
        disponibilidade: "Dias úteis, 09:00 às 17:00 (sem feriados)",
        corteHora: 15,
        onsiteTexto: "09h – 17h",
        onsiteDetalhe: "Próx. dia útil após a peça"
    },
    "8x5xSNBD": {
        nome: "Smart Net Total Care 8x5xSNBD",
        sigla: "SNBD",
        prazoRmaTexto: "Próx. dia útil",
        disponibilidade: "Dias úteis, horário comercial (sem feriados)",
        corteHora: 15,
        onsiteTexto: "Não incluso",
        onsiteDetalhe: "Somente envio da peça"
    }
};

const EMPRESAS_SLA = {
    "bradesco": {
        empresa: "Bradesco",
        plano: "8x5x4",
        equipamentos: [
            { nome: "FW-CORE-02", modelo: "Cisco Firepower 4100", status: "coberto", detalhe: "Coberto 8x5x4 · Corte às 13:00" },
            { nome: "FW-CORE-03", modelo: "Cisco ASA 5510", status: "ldos", detalhe: "LDoS vencido · Sem suporte Cisco" },
            { nome: "FW-EDGE-01", modelo: "Cisco Firepower 2100", status: "descoberto", detalhe: "Sem contrato RMA ativo" },
            { nome: "RT-DC-02", modelo: "Cisco ASR-9006", status: "coberto", detalhe: "Coberto 8x5x4 · Corte às 13:00" }
        ]
    },
    "itau": {
        empresa: "Itaú",
        plano: "24x7x4",
        equipamentos: [
            { nome: "SW-CORE-01", modelo: "Cisco Nexus 9500", status: "coberto", detalhe: "Coberto 24x7x4 · Software em dia" },
            { nome: "SW-ACCESS-01", modelo: "Cisco Catalyst 2960", status: "ldos", detalhe: "LDoS em 90 dias · Planejar troca" },
            { nome: "SW-ACCESS-04", modelo: "Cisco Catalyst 9300", status: "coberto", detalhe: "Coberto 24x7x4 · Coletor ativo" },
            { nome: "FW-PIX-01", modelo: "Cisco Firepower 9300", status: "coberto", detalhe: "Coberto 24x7x4 · Crítico" }
        ]
    },
    "santander": {
        empresa: "Santander",
        plano: "8x5xNBD",
        equipamentos: [
            { nome: "RT-CORE-01", modelo: "Cisco ASR-9006", status: "coberto", detalhe: "Coberto 8x5xNBD · Corte às 15:00" },
            { nome: "RT-EDGE-02", modelo: "Cisco ISR 4451", status: "coberto", detalhe: "Coberto 8x5xNBD · Corte às 15:00" },
            { nome: "SRV-DB-01", modelo: "Cisco UCS C240", status: "ldos", detalhe: "Fim de suporte próximo (LDoS)" }
        ]
    },
    "banco do brasil": {
        empresa: "Banco do Brasil",
        plano: "24x7x2",
        equipamentos: [
            { nome: "RT-FILIAL-01", modelo: "Cisco ASR 1001-X", status: "coberto", detalhe: "Coberto 24x7x2 · Missão crítica" },
            { nome: "SW-ACCESS-07", modelo: "Cisco Catalyst 9200", status: "coberto", detalhe: "Coberto 24x7x2 · Coletor ativo" },
            { nome: "FW-MATRIZ-01", modelo: "Cisco Firepower 9300", status: "coberto", detalhe: "Coberto 24x7x2 · Crítico" }
        ]
    },
    "nubank": {
        empresa: "Nubank",
        plano: "8x7xNCD",
        equipamentos: [
            { nome: "SW-CLOUD-01", modelo: "Cisco Nexus 93180YC", status: "coberto", detalhe: "Coberto 8x7xNCD · Corte às 15:00" },
            { nome: "FW-EDGE-04", modelo: "Cisco Firepower 4100", status: "coberto", detalhe: "Coberto 8x7xNCD · Coletor ativo" },
            { nome: "RT-BGP-02", modelo: "Cisco ASR 1002-HX", status: "coberto", detalhe: "Coberto 8x7xNCD · Software em dia" }
        ]
    }
};

const estadoSlaEmpresa = {
    dadosEmpresa: null,
    filtroEquipamentos: "todos"
};

function escHtml(t) {
    return String(t ?? "").replace(/[&<>"']/g, c =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function normalizarNomeEmpresa(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

function obterEmpresaSlaDaUrl() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get("empresa") || "";
    const chave = normalizarNomeEmpresa(nome);

    if (EMPRESAS_SLA[chave]) {
        return EMPRESAS_SLA[chave];
    }

    if (nome.trim()) {
        return {
            empresa: nome.trim(),
            plano: "8x5xNBD",
            equipamentos: [
                { nome: "EQ-PRINCIPAL-01", modelo: "Cisco Hardware", status: "coberto", detalhe: "Coberto 8x5xNBD · Corte às 15:00" }
            ]
        };
    }

    return EMPRESAS_SLA["bradesco"];
}

function obterStatusRmaAgora(emp, plano) {
    if (plano.corteHora === null) {
        return {
            statusAgora: "Sem horário de corte (24/7)",
            cor: "text-green-500"
        };
    }

    const agora = new Date();
    const dia = agora.getDay();
    const horaDecimal = agora.getHours() + agora.getMinutes() / 60;
    const ehFds = dia === 0 || dia === 6;

    if (ehFds && emp.plano !== "8x7xNCD") {
        return {
            statusAgora: "Fim de semana · próx. dia útil",
            cor: "text-amber-400"
        };
    }

    if (horaDecimal >= plano.corteHora) {
        return {
            statusAgora: `Passou do corte (${plano.corteHora}:00) · próx. dia útil`,
            cor: "text-amber-400"
        };
    }

    return {
        statusAgora: `Dentro do corte · fecha às ${plano.corteHora}:00`,
        cor: "text-green-500"
    };
}

const ESTADO_EQUIPAMENTO = {
    coberto: { estado: "ok", rotulo: "Coberto" },
    ldos: { estado: "atencao", rotulo: "Alerta LDoS" },
    descoberto: { estado: "critico", rotulo: "Sem cobertura" }
};

const ORDEM_EQUIPAMENTO = { descoberto: 0, ldos: 1, coberto: 2 };

const ESTILO_ESTADO = {
    ok: {
        veredito: "rounded-xl border border-white/10 border-l-4 border-l-green-400 bg-[#0D1924] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        icone: "size-9 rounded-lg shrink-0 grid place-items-center text-sm font-bold bg-green-400/15 text-green-300 border border-green-400/25",
        badge: "px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-400/20 text-green-300 border-green-400/20",
        ponto: "size-2.5 rounded-full shrink-0 mt-1.5 sm:mt-0 bg-green-400"
    },
    atencao: {
        veredito: "rounded-xl border border-white/10 border-l-4 border-l-amber-400 bg-[#0D1924] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        icone: "size-9 rounded-lg shrink-0 grid place-items-center text-sm font-bold bg-amber-400/15 text-amber-300 border border-amber-400/25",
        badge: "px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-400/20 text-amber-300 border-amber-400/20",
        ponto: "size-2.5 rounded-full shrink-0 mt-1.5 sm:mt-0 bg-amber-400"
    },
    critico: {
        veredito: "rounded-xl border border-white/10 border-l-4 border-l-red-400 bg-[#0D1924] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        icone: "size-9 rounded-lg shrink-0 grid place-items-center text-sm font-bold bg-red-400/15 text-red-300 border border-red-400/25",
        badge: "px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-red-400/20 text-red-300 border-red-400/20",
        ponto: "size-2.5 rounded-full shrink-0 mt-1.5 sm:mt-0 bg-red-400"
    }
};

function renderizarSlaEmpresa() {
    const emp = estadoSlaEmpresa.dadosEmpresa;
    const plano = PLANOS_CISCO[emp.plano];
    const rma = obterStatusRmaAgora(emp, plano);
    const el = id => document.getElementById(id);

    document.title = `Argos (Gerente) - SLA ${emp.empresa}`;
    el("titulo-empresa").textContent = emp.empresa;
    el("badge-nivel").textContent = `${plano.nome} (${plano.sigla})`;
    el("subtitulo-contrato").textContent = `Cobertura do contrato: ${plano.disponibilidade}`;

    const total = emp.equipamentos.length;
    const cobertos = emp.equipamentos.filter(e => e.status === "coberto").length;
    const descobertos = emp.equipamentos.filter(e => e.status === "descoberto").length;
    const ldos = emp.equipamentos.filter(e => e.status === "ldos").length;
    const alertas = descobertos + ldos;

    let estado, statusEmpresa, icone, titulo, texto;

    if (descobertos > 0) {
        estado = "critico";
        statusEmpresa = "Crítico";
        icone = "!";
        titulo = `Regularizar ${descobertos} equipamento(s) sem cobertura RMA`;
        texto = "Solicitar inclusão no contrato com 30 dias de antecedência para garantir reposição.";
    } else if (ldos > 0) {
        estado = "atencao";
        statusEmpresa = "Atenção";
        icone = "!";
        titulo = "Planejar substituição de hardware (LDoS)";
        texto = "Há equipamento próximo ou após o fim de suporte. Utilize o Cisco Migration Support na transição.";
    } else {
        estado = "ok";
        statusEmpresa = "Estável";
        icone = "✓";
        titulo = `Contrato de ${emp.empresa} em conformidade`;
        texto = "Todos os equipamentos da base estão cobertos e dentro da janela de suporte.";
    }

    const estilo = ESTILO_ESTADO[estado];

    const badgeStatus = el("badge-status-empresa");
    if (badgeStatus) {
        badgeStatus.className = estilo.badge;
        badgeStatus.textContent = statusEmpresa;
    }

    el("sla-veredito").className = estilo.veredito;
    el("veredito-icone").className = estilo.icone;
    el("veredito-icone").textContent = icone;
    el("rec-titulo").textContent = titulo;
    el("rec-texto").textContent = texto;

    el("kpi-cobertura").textContent = `${cobertos} de ${total}`;
    el("kpi-cobertura-sub").textContent = descobertos > 0
        ? `${descobertos} sem cobertura · ${ldos} alerta LDoS`
        : (ldos > 0 ? `${ldos} alerta LDoS` : "Base 100% coberta");

    const pct = qtd => total ? `${(qtd / total) * 100}%` : "0%";
    el("barra-ok").style.width = pct(cobertos);
    el("barra-atencao").style.width = pct(ldos);
    el("barra-critico").style.width = pct(descobertos);

    el("valor-tac").textContent = "Até 1 hora";
    el("detalhe-tac").textContent = "Sev 1–2: 24/7 · Sev 3–4: comercial";

    el("valor-rma").textContent = plano.prazoRmaTexto;
    el("status-rma-agora").className = `text-[12px] leading-snug mt-2 break-words ${rma.cor}`;
    el("status-rma-agora").textContent = rma.statusAgora;

    el("valor-onsite").textContent = plano.onsiteTexto;
    el("detalhe-onsite").textContent = plano.onsiteDetalhe;

    el("titulo-equipamentos").textContent = `Equipamentos (${total})`;

    const btnTodos = el("filtro-eq-todos");
    const btnAtencao = el("filtro-eq-atencao");
    if (btnAtencao) {
        btnAtencao.textContent = alertas > 0 ? `Com alerta (${alertas})` : "Com alerta";
    }

    if (btnTodos && btnAtencao) {
        const ativoClasse = "px-3 py-1.5 rounded-lg text-xs font-medium border border-light-blue bg-light-blue/10 text-white cursor-pointer transition-colors";
        const inativoClasse = "px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-[#09121B] text-white/60 hover:text-white cursor-pointer transition-colors";

        btnTodos.className = estadoSlaEmpresa.filtroEquipamentos === "todos" ? ativoClasse : inativoClasse;
        btnAtencao.className = estadoSlaEmpresa.filtroEquipamentos === "atencao" ? ativoClasse : inativoClasse;
    }

    const ordenados = emp.equipamentos
        .filter(eq => estadoSlaEmpresa.filtroEquipamentos === "todos" || eq.status !== "coberto")
        .slice()
        .sort((a, b) => ORDEM_EQUIPAMENTO[a.status] - ORDEM_EQUIPAMENTO[b.status]);

    const containerEq = el("lista-equipamentos");
    if (ordenados.length === 0) {
        containerEq.innerHTML = `
            <p class="text-xs text-gray-400 text-center py-4">
                Nenhum equipamento com alerta para esta empresa.
            </p>
        `;
        return;
    }

    containerEq.innerHTML = ordenados.map(eq => {
        const info = ESTADO_EQUIPAMENTO[eq.status];
        const eqEstilo = ESTILO_ESTADO[info.estado];
        return `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 p-3.5 rounded-xl bg-[#09121B] border border-white/5">
            <div class="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <span class="${eqEstilo.ponto}"></span>
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-white break-words">
                        ${escHtml(eq.nome)} <span class="font-normal text-white/50">· ${escHtml(eq.modelo)}</span>
                    </p>
                    <p class="text-xs text-gray-400 mt-0.5 break-words">${escHtml(eq.detalhe)}</p>
                </div>
            </div>
            <span class="self-start sm:self-center shrink-0 ${eqEstilo.badge}">${info.rotulo}</span>
        </div>`;
    }).join("");
}

function inicializarSlaEmpresa() {
    if (!document.getElementById("titulo-empresa")) return;

    estadoSlaEmpresa.dadosEmpresa = obterEmpresaSlaDaUrl();

    document.getElementById("filtro-eq-todos")?.addEventListener("click", () => {
        estadoSlaEmpresa.filtroEquipamentos = "todos";
        renderizarSlaEmpresa();
    });

    document.getElementById("filtro-eq-atencao")?.addEventListener("click", () => {
        estadoSlaEmpresa.filtroEquipamentos = "atencao";
        renderizarSlaEmpresa();
    });

    renderizarSlaEmpresa();
}

document.addEventListener("DOMContentLoaded", () => {

    const btnSair = document.getElementById("btn-sair");

    if (btnSair) {
        btnSair.addEventListener("click", (e) => {
            e.preventDefault();
            abrirModal();
        });
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });
    }

    chamadosCliente();

    const inputBuscaCliente = document.getElementById("input-busca-cliente");

    if (inputBuscaCliente) {
        inputBuscaCliente.addEventListener("input", (e) => {
            chamadosCliente(e.target.value);
        });
    }

    inicializarSlaEmpresa();

    inicializarRelatorio();

    if (typeof renderizarGraficos === "function") {
        renderizarGraficos();
    }

});