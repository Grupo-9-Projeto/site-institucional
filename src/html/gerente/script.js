
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


// ==========================================
// MODAL
// ==========================================

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


// ==========================================
// CLIENTES
// ==========================================

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

        card.className = "flex items-center justify-between p-3.5 bg-[#09121B] rounded-xl border border-white/5 font-['Poppins']";

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

        clientes.appendChild(card);
    });
}


// ==========================================
// RELATÓRIO
// ==========================================

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


// ==========================================
// RESUMO DO RELATÓRIO
// ==========================================

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


// ==========================================
// RENDERIZAÇÃO DOS EQUIPAMENTOS
// ==========================================

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


// ==========================================
// RENDERIZAÇÃO DAS EMPRESAS
// ==========================================

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


// ==========================================
// EXPORTAÇÃO CSV
// ==========================================

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


// ==========================================
// INICIALIZAÇÃO DO RELATÓRIO
// ==========================================

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

    // Eventos das datas
    document.getElementById("dataInicial")?.addEventListener(
        "change",
        atualizarResumoRelatorio
    );

    document.getElementById("dataFinal")?.addEventListener(
        "change",
        atualizarResumoRelatorio
    );

    // Evento do equipamento
    document.getElementById("equipamento")?.addEventListener("change", (e) => {
        equipamentoSelecionado = e.target.value;
        atualizarResumoRelatorio();
    });

    // Eventos das métricas
    document.querySelectorAll('.metric-option input[type="checkbox"]').forEach(cb => {
        cb.addEventListener("change", atualizarResumoRelatorio);
    });

    // Botão CSV
    document.getElementById("btnCsv")?.addEventListener(
        "click",
        gerarCsvRelatorio
    );

    atualizarResumoRelatorio();
}


// ==========================================
// API
// ==========================================

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


// ==========================================
// INFORMAÇÕES DO USUÁRIO
// ==========================================

async function carregarInformacoesUsuario() {
    const nome_title = document.getElementById("nome_title");
    const foto = document.getElementById("foto_usuario");

    const resposta = await chamarApi(
        "/usuarios/informacoes_usuario",
        "GET"
    );

    if (!resposta.ok || !resposta.dados || !resposta.dados[0]) {
        console.error("Não foi possível carregar as informações do usuário.");
        return;
    }

    const usuario = resposta.dados[0];

    if (nome_title) {
        nome_title.textContent = usuario.nome;
    }

    if (foto) {
        foto.textContent = usuario.nome?.[0] || "";
    }
}


// ==========================================
// SLAS
// ==========================================

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


// ==========================================
// EVENTOS GERAIS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Informações do usuário
    carregarInformacoesUsuario();

    // Botão sair e modal
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

    // Clientes
    chamadosCliente();

    const inputBuscaCliente = document.getElementById("input-busca-cliente");

    if (inputBuscaCliente) {
        inputBuscaCliente.addEventListener("input", (e) => {
            chamadosCliente(e.target.value);
        });
    }

    // Relatório
    inicializarRelatorio();

    // Gráficos, caso a função exista em outro script
    if (typeof renderizarGraficos === "function") {
        renderizarGraficos();
    }

});
