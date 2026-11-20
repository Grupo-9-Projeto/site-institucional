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

async function carregarInformacoesUsuario() {
    const nomeTitle = document.getElementById("nome_title");
    const foto = document.getElementById("foto_usuario");

    if (!nomeTitle && !foto) return;
    if (typeof apiFetch !== "function") return;

    const resposta = await chamarApi("/usuarios/informacoes_usuario", "GET");

    if (!resposta.ok || !resposta.dados || !resposta.dados[0]) return;

    const usuario = resposta.dados[0];

    if (nomeTitle) nomeTitle.textContent = usuario.nome;
    if (foto) foto.textContent = usuario.nome?.[0] || "";
}

const HOME_ESTILO_NIVEL = {
    ok: { texto: "text-green-500", corHex: "#22C55E" },
    atencao: { texto: "text-yellow-500", corHex: "#FBBF24" },
    critico: { texto: "text-red-500", corHex: "#EF4444" },
    info: { texto: "text-light-blue", corHex: "#7DD3FC" }
};

let resultadoHomeAtual = null;

function gerarDadosMockadosHome() {
    const agora = new Date();
    const minutosAtras = min => new Date(agora.getTime() - min * 60000).toISOString();
    const diasAtras = (dias, hora = 10) => {
        const d = new Date(agora);
        d.setDate(d.getDate() - dias);
        d.setHours(hora, 15, 0, 0);
        return d.toISOString();
    };

    const contratos = [
        { empresa: "Bradesco", prazoHoras: 4 },
        { empresa: "Itaú", prazoHoras: 4 },
        { empresa: "Banco do Brasil", prazoHoras: 2 },
        { empresa: "Santander", prazoHoras: 24 },
        { empresa: "Nubank", prazoHoras: 24 }
    ];

    const semCobertura = [
        { id_dispositivo: 106, equipamento: "FW-EDGE-01", empresa: "Bradesco", motivo: "Equipamento sem cobertura RMA ativa" }
    ];

    const chamados = [
        { id: "CH-412", id_dispositivo: 101, empresa: "Bradesco", equipamento: "FW-CORE-03", status: "aberto", severidade: "critica", responsavel: "Lucas", aberto_em: minutosAtras(206) },
        { id: "CH-415", id_dispositivo: 103, empresa: "Banco do Brasil", equipamento: "FW-MATRIZ-01", status: "aberto", severidade: "critica", responsavel: null, aberto_em: minutosAtras(85) },
        { id: "CH-416", id_dispositivo: 102, empresa: "Itaú", equipamento: "SW-ACCESS-01", status: "aberto", severidade: "critica", responsavel: "Ana", aberto_em: minutosAtras(165) },
        { id: "CH-417", id_dispositivo: 107, empresa: "Bradesco", equipamento: "FW-CORE-02", status: "aberto", severidade: "alta", responsavel: "Rafael", aberto_em: minutosAtras(140) },
        { id: "CH-418", id_dispositivo: 104, empresa: "Santander", equipamento: "RT-CORE-01", status: "aberto", severidade: "normal", responsavel: "Ana", aberto_em: minutosAtras(95) },
        { id: "CH-419", id_dispositivo: 108, empresa: "Itaú", equipamento: "SW-CORE-01", status: "aberto", severidade: "normal", responsavel: "Lucas", aberto_em: minutosAtras(60) },
        { id: "CH-420", id_dispositivo: 105, empresa: "Nubank", equipamento: "SW-CLOUD-01", status: "aberto", severidade: "normal", responsavel: "Rafael", aberto_em: minutosAtras(50) },
        { id: "CH-421", id_dispositivo: 109, empresa: "Bradesco", equipamento: "RT-DC-02", status: "aberto", severidade: "normal", responsavel: "Ana", aberto_em: minutosAtras(40) },
        { id: "CH-422", id_dispositivo: 110, empresa: "Santander", equipamento: "RT-EDGE-02", status: "aberto", severidade: "normal", responsavel: "Lucas", aberto_em: minutosAtras(35) },
        { id: "CH-423", id_dispositivo: 111, empresa: "Itaú", equipamento: "FW-PIX-01", status: "aberto", severidade: "normal", responsavel: "Rafael", aberto_em: minutosAtras(25) },
        { id: "CH-424", id_dispositivo: 112, empresa: "Nubank", equipamento: "FW-EDGE-04", status: "aberto", severidade: "normal", responsavel: "Ana", aberto_em: minutosAtras(15) },
        { id: "CH-425", id_dispositivo: 113, empresa: "Banco do Brasil", equipamento: "RT-FILIAL-01", status: "aberto", severidade: "normal", responsavel: "Lucas", aberto_em: minutosAtras(10) },

        { id: "CH-401", id_dispositivo: 101, empresa: "Bradesco", equipamento: "FW-CORE-03", status: "concluido", aberto_em: diasAtras(1, 9), concluido_em: diasAtras(1, 12) },
        { id: "CH-402", id_dispositivo: 102, empresa: "Itaú", equipamento: "SW-ACCESS-01", status: "concluido", aberto_em: diasAtras(1, 14), concluido_em: diasAtras(1, 16) },
        { id: "CH-403", id_dispositivo: 101, empresa: "Bradesco", equipamento: "FW-CORE-03", status: "concluido", aberto_em: diasAtras(4, 14), concluido_em: diasAtras(4, 19) },
        { id: "CH-404", id_dispositivo: 101, empresa: "Bradesco", equipamento: "FW-CORE-03", status: "concluido", aberto_em: diasAtras(9, 10), concluido_em: diasAtras(9, 13) },
        { id: "CH-405", id_dispositivo: 101, empresa: "Bradesco", equipamento: "FW-CORE-03", status: "concluido", aberto_em: diasAtras(15, 15), concluido_em: diasAtras(15, 18) },
        { id: "CH-406", id_dispositivo: 102, empresa: "Itaú", equipamento: "SW-ACCESS-01", status: "concluido", aberto_em: diasAtras(6, 11), concluido_em: diasAtras(6, 13) },
        { id: "CH-407", id_dispositivo: 102, empresa: "Itaú", equipamento: "SW-ACCESS-01", status: "concluido", aberto_em: diasAtras(12, 16), concluido_em: diasAtras(12, 19) },
        { id: "CH-408", id_dispositivo: 103, empresa: "Banco do Brasil", equipamento: "FW-MATRIZ-01", status: "concluido", aberto_em: diasAtras(5, 8), concluido_em: diasAtras(5, 11) },
        { id: "CH-409", id_dispositivo: 103, empresa: "Banco do Brasil", equipamento: "FW-MATRIZ-01", status: "concluido", aberto_em: diasAtras(14, 14), concluido_em: diasAtras(14, 15) },
        { id: "CH-410", id_dispositivo: 104, empresa: "Santander", equipamento: "RT-CORE-01", status: "concluido", aberto_em: diasAtras(3, 9), concluido_em: diasAtras(3, 12) },
        { id: "CH-411", id_dispositivo: 104, empresa: "Santander", equipamento: "RT-CORE-01", status: "concluido", aberto_em: diasAtras(8, 11), concluido_em: diasAtras(8, 14) },
        { id: "CH-413", id_dispositivo: 105, empresa: "Nubank", equipamento: "SW-CLOUD-01", status: "concluido", aberto_em: diasAtras(7, 13), concluido_em: diasAtras(7, 15) },
        { id: "CH-414", id_dispositivo: 105, empresa: "Nubank", equipamento: "SW-CLOUD-01", status: "concluido", aberto_em: diasAtras(11, 10), concluido_em: diasAtras(11, 12) }
    ];

    return {
        abertosOntem: 9,
        slaMesAnterior: 93,
        metaSla: 95,
        contratos,
        semCobertura,
        chamados
    };
}

function formatarMinutosHome(totalMin) {
    const abs = Math.abs(Math.round(totalMin));
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${String(m).padStart(2, "0")}m`;
}

function calcularHome(dadosHome) {
    const agora = new Date();
    const prazoPorEmpresa = {};
    dadosHome.contratos.forEach(c => { prazoPorEmpresa[c.empresa] = c.prazoHoras * 60; });

    const abertos = dadosHome.chamados.filter(c => c.status === "aberto");
    const diffOntem = abertos.length - dadosHome.abertosOntem;

    const vencendoHoje = [];
    abertos.forEach(c => {
        const limiteMin = prazoPorEmpresa[c.empresa] || 240;
        const decorridoMin = (agora - new Date(c.aberto_em)) / 60000;
        const restanteMin = limiteMin - decorridoMin;
        if (restanteMin <= 180) {
            vencendoHoje.push({ ...c, restanteMin, limiteMin });
        }
    });

    const concluidos = dadosHome.chamados.filter(c => c.status === "concluido");
    let dentroSla = 0;
    concluidos.forEach(c => {
        const limiteMin = prazoPorEmpresa[c.empresa] || 240;
        const duracaoMin = (new Date(c.concluido_em) - new Date(c.aberto_em)) / 60000;
        if (duracaoMin <= limiteMin) dentroSla++;
    });
    const slaMes = concluidos.length > 0 ? Math.round((dentroSla / concluidos.length) * 100) : 100;

    const contagemEq = {};
    dadosHome.chamados.forEach(c => {
        const chave = String(c.id_dispositivo);
        if (!contagemEq[chave]) {
            contagemEq[chave] = {
                id_dispositivo: c.id_dispositivo,
                equipamento: c.equipamento,
                empresa: c.empresa,
                qtd: 0
            };
        }
        contagemEq[chave].qtd++;
    });

    const reincidentes = Object.values(contagemEq)
        .filter(item => item.qtd >= 3)
        .sort((a, b) => b.qtd - a.qtd);

    const filaAcoes = [];

    vencendoHoje
        .slice()
        .sort((a, b) => a.restanteMin - b.restanteMin)
        .forEach(c => {
            const jaPassou = c.restanteMin <= 0;
            filaAcoes.push({
                nivel: "critico",
                titulo: `${c.equipamento} (#${c.id_dispositivo}) · ${c.empresa}`,
                detalhe: jaPassou
                    ? `Chamado #${c.id} estourou o SLA há ${formatarMinutosHome(c.restanteMin)} · agir agora`
                    : `Chamado #${c.id} vence o SLA em ${formatarMinutosHome(c.restanteMin)}`,
                textoBotao: "Ver chamado",
                link: `./chamados/index.html?chamado=${encodeURIComponent(c.id)}`
            });
        });

    abertos
        .filter(c => !c.responsavel && !vencendoHoje.some(v => v.id === c.id))
        .forEach(c => {
            filaAcoes.push({
                nivel: "critico",
                titulo: `Chamado #${c.id} · ${c.equipamento} (#${c.id_dispositivo})`,
                detalhe: `${c.empresa} · está sem analista responsável`,
                textoBotao: "Ver chamado",
                link: `./chamados/index.html?chamado=${encodeURIComponent(c.id)}`
            });
        });

    reincidentes.forEach(r => {
        filaAcoes.push({
            nivel: "atencao",
            titulo: `${r.equipamento} (#${r.id_dispositivo}) · ${r.empresa}`,
            detalhe: `${r.qtd} chamados em 30 dias · investigar recorrência`,
            textoBotao: "Ver chamados",
            link: `./chamados/index.html?dispositivo=${encodeURIComponent(r.id_dispositivo)}`
        });
    });

    dadosHome.semCobertura.forEach(s => {
        filaAcoes.push({
            nivel: "atencao",
            titulo: `${s.equipamento} (#${s.id_dispositivo}) · ${s.empresa}`,
            detalhe: s.motivo,
            textoBotao: "Ver chamados",
            link: `./chamados/index.html?dispositivo=${encodeURIComponent(s.id_dispositivo)}`
        });
    });

    return {
        abertosTotal: abertos.length,
        diffOntem,
        vencemHojeTotal: vencendoHoje.length,
        slaMes,
        slaMesAnterior: dadosHome.slaMesAnterior,
        metaSla: dadosHome.metaSla,
        reincidentes,
        filaAcoes
    };
}

function criarCardHome(titulo, valor, detalhe, nivel) {
    const c = HOME_ESTILO_NIVEL[nivel] || HOME_ESTILO_NIVEL.info;
    return `
        <article class="flex-1 min-w-0 rounded-xl border border-white/10 bg-[#0D1924] flex flex-col justify-between p-4 lg:p-6 overflow-hidden" style="border-top: 3px solid ${c.corHex};">
            <div>
                <p class="text-gray-400 text-[13px] truncate">${titulo}</p>
                <p class="font-bold text-2xl mt-1 truncate ${c.texto}">${valor}</p>
            </div>
            <p class="text-xs leading-snug mt-2 truncate ${c.texto}">${detalhe}</p>
        </article>
    `;
}

function renderizarKpisHome(r) {
    const sinalOntem = r.diffOntem >= 0 ? "↑ +" : "↓ ";
    const nivelAbertos = r.diffOntem > 0 ? "atencao" : "info";

    const nivelVencem = r.vencemHojeTotal > 0 ? "critico" : "ok";
    const detVencem = r.vencemHojeTotal > 0 ? "Prioridade imediata hoje" : "Nenhum prazo em risco hoje";

    const diffSla = r.slaMes - r.slaMesAnterior;
    const nivelSla = r.slaMes >= r.metaSla ? "ok" : (r.slaMes >= r.metaSla - 10 ? "atencao" : "critico");
    let textoSla = `Igual ao mês passado (${r.slaMesAnterior}%)`;
    if (diffSla > 0) {
        textoSla = `${diffSla} pontos acima do mês passado (${r.slaMesAnterior}%)`;
    } else if (diffSla < 0) {
        textoSla = `${Math.abs(diffSla)} pontos abaixo do mês passado (${r.slaMesAnterior}%)`;
    }

    document.getElementById("cards").innerHTML =
        criarCardHome("Chamados em aberto", r.abertosTotal, `${sinalOntem}${r.diffOntem} desde ontem`, nivelAbertos) +
        criarCardHome("Vencem hoje (SLA)", r.vencemHojeTotal, detVencem, nivelVencem) +
        criarCardHome("SLA do mês", `${r.slaMes}%`, textoSla, nivelSla);
}

function renderizarFilaHome(r, termoBusca = "") {
    const container = document.getElementById("fila-acoes");
    const titulo = document.getElementById("titulo-fila");
    if (!container) return;

    const termo = termoBusca.trim().toLowerCase();
    const filtrados = r.filaAcoes.filter(item =>
        !termo ||
        item.titulo.toLowerCase().includes(termo) ||
        item.detalhe.toLowerCase().includes(termo)
    );

    if (titulo) {
        titulo.textContent = `Fila de ações de hoje (${filtrados.length})`;
    }

    if (filtrados.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-xs text-center py-4">Nenhum item encontrado na fila.</p>`;
        return;
    }

    container.innerHTML = filtrados.map(item => {
        const corHex = item.nivel === "critico" ? HOME_ESTILO_NIVEL.critico.corHex : HOME_ESTILO_NIVEL.atencao.corHex;
        return `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-[#09121B] rounded-xl border border-white/5">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                    <span class="h-2 w-2 rounded-full shrink-0" style="background:${corHex};"></span>
                    <div class="min-w-0 flex-1">
                        <p class="text-white font-bold text-sm truncate">${item.titulo}</p>
                        <p class="text-gray-400 text-xs mt-1">${item.detalhe}</p>
                    </div>
                </div>
                <a href="${item.link}"
                    class="px-3 py-2 rounded-lg text-xs font-semibold text-light-blue bg-light-blue/10 border border-light-blue hover:bg-white/5 transition-element shrink-0 text-center">
                    ${item.textoBotao}
                </a>
            </div>
        `;
    }).join("");
}

function renderizarReincidentesHome(r, termoBusca = "") {
    const container = document.getElementById("lista-reincidentes");
    const titulo = document.getElementById("titulo-reincidentes");
    if (!container) return;

    const termo = termoBusca.trim().toLowerCase();
    const filtrados = r.reincidentes.filter(item =>
        !termo ||
        item.equipamento.toLowerCase().includes(termo) ||
        item.empresa.toLowerCase().includes(termo) ||
        String(item.id_dispositivo).includes(termo)
    );

    if (titulo) {
        titulo.textContent = `Reincidentes (${filtrados.length})`;
    }

    if (filtrados.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-xs text-center py-4">Nenhum equipamento reincidente encontrado.</p>`;
        return;
    }

    const maiorQtd = r.reincidentes[0]?.qtd || 1;

    container.innerHTML = filtrados.map((item, i) => {
        const pct = Math.round((item.qtd / maiorQtd) * 100);
        const nivel = i === 0 ? HOME_ESTILO_NIVEL.critico : HOME_ESTILO_NIVEL.atencao;
        const url = `./chamados/index.html?dispositivo=${encodeURIComponent(item.id_dispositivo)}`;

        return `
            <div onclick="window.location.href='${url}'"
                class="flex flex-col gap-2 p-3.5 bg-[#09121B] rounded-xl border border-white/5 hover:border-light-blue/50 cursor-pointer transition-element">
                <div class="flex justify-between items-center gap-3">
                    <p class="text-white font-bold text-sm truncate">
                        ${item.equipamento} <span class="font-normal text-white/60">(#${item.id_dispositivo}) · ${item.empresa}</span>
                    </p>
                    <span class="text-xs font-bold shrink-0 ${nivel.texto}">${item.qtd} chamados</span>
                </div>
                <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <span class="block h-full rounded-full" style="width:${pct}%;background:${nivel.corHex};"></span>
                </div>
            </div>
        `;
    }).join("");
}

function inicializarHome() {
    if (!document.getElementById("fila-acoes")) return;

    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const hora = String(agora.getHours()).padStart(2, "0");
    const min = String(agora.getMinutes()).padStart(2, "0");
    const ref = document.getElementById("referencia");
    if (ref) {
        ref.textContent = `Hoje, ${dia}/${mes} · Atualizado às ${hora}:${min} · dados simulados`;
    }

    const dadosHome = gerarDadosMockadosHome();
    resultadoHomeAtual = calcularHome(dadosHome);

    renderizarKpisHome(resultadoHomeAtual);
    renderizarFilaHome(resultadoHomeAtual);
    renderizarReincidentesHome(resultadoHomeAtual);

    document.getElementById("busca-fila")?.addEventListener("input", (e) => {
        renderizarFilaHome(resultadoHomeAtual, e.target.value);
    });

    document.getElementById("busca-reincidentes")?.addEventListener("input", (e) => {
        renderizarReincidentesHome(resultadoHomeAtual, e.target.value);
    });
}

document.addEventListener("DOMContentLoaded", () => {

    carregarInformacoesUsuario();

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

    inicializarHome();

    inicializarRelatorio();

    if (typeof renderizarGraficos === "function") {
        renderizarGraficos();
    }

});