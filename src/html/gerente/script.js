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

const HOME_BADGE_ESTILO = {
    critico: {
        texto: "Crítico",
        classe: "px-2.5 py-0.5 rounded-md text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30",
        ponto: "#EF4444"
    },
    atencao: {
        texto: "Atenção",
        classe: "px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30",
        ponto: "#F59E0B"
    },
    ok: {
        texto: "Ok",
        classe: "px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
        ponto: "#10B981"
    }
};

function gerarDadosMockadosHome() {
    return {
        empresasPoucosFuncionarios: [
            { nome: "Santander", funcionarios: 1, status: "Ativa" },
            { nome: "Bradesco", funcionarios: 2, status: "Ativa" },
            { nome: "Itaú", funcionarios: 2, status: "Ativa" },
            { nome: "Safra", funcionarios: 3, status: "Suspensa" },
            { nome: "BTG Pactual", funcionarios: 4, status: "Ativa" },
            { nome: "XP Investimentos", funcionarios: 5, status: "Inativa" }
        ],
        chamados: {
            emAberto: 9,
            emAtendimento: 6,
            resolvidos: 8,
            criticosEmAberto: 2
        },
        slas: {
            disponibilidade: 11,
            resolucao: 7,
            tempoResposta: 5
        }
    };
}

function normalizarDadosHome(bruto) {
    const mock = gerarDadosMockadosHome();
    if (!bruto || typeof bruto !== "object") return mock;

    const origem = bruto.dados && typeof bruto.dados === "object" ? bruto.dados : bruto;

    const listaEmpresas = Array.isArray(origem.empresasPoucosFuncionarios)
        ? origem.empresasPoucosFuncionarios
        : Array.isArray(origem.empresas)
            ? origem.empresas
            : mock.empresasPoucosFuncionarios;

    return {
        empresasPoucosFuncionarios: listaEmpresas
            .map(item => ({
                nome: item.nome || item.empresa || "Empresa",
                funcionarios: Number(item.funcionarios ?? item.qtdFuncionarios ?? item.totalFuncionarios ?? 0),
                status: item.status || "Ativa"
            }))
            .sort((a, b) => a.funcionarios - b.funcionarios),
        chamados: {
            emAberto: Number(origem.chamados?.emAberto ?? origem.chamados?.em_aberto ?? mock.chamados.emAberto),
            emAtendimento: Number(origem.chamados?.emAtendimento ?? origem.chamados?.em_atendimento ?? mock.chamados.emAtendimento),
            resolvidos: Number(origem.chamados?.resolvidos ?? origem.chamados?.resolvidos ?? mock.chamados.resolvidos),
            criticosEmAberto: Number(origem.chamados?.criticosEmAberto ?? origem.chamados?.criticos_em_aberto ?? mock.chamados.criticosEmAberto)
        },
        slas: {
            disponibilidade: Number(origem.slas?.disponibilidade ?? mock.slas.disponibilidade),
            resolucao: Number(origem.slas?.resolucao ?? mock.slas.resolucao),
            tempoResposta: Number(origem.slas?.tempoResposta ?? origem.slas?.tempo_resposta ?? mock.slas.tempoResposta)
        }
    };
}

function aplicarBadgeEsfera(idBadge, nivel) {
    const el = document.getElementById(idBadge);
    if (!el) return;
    const estilo = HOME_BADGE_ESTILO[nivel] || HOME_BADGE_ESTILO.ok;
    el.textContent = estilo.texto;
    el.className = estilo.classe;
}

function desenharGraficoRadar(canvasId, itens) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return false;

    const parent = canvas.parentElement;
    if (!parent) return false;

    const rect = parent.getBoundingClientRect();
    const width = Math.max(200, Math.floor(rect.width));
    const height = Math.max(125, Math.floor(rect.height));

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const n = itens.length;
    if (n < 3) return false;

    const cx = width / 2;
    const cy = height / 2 + 6;
    const raioMax = Math.max(22, Math.min(width / 2 - 58, height / 2 - 22));
    const maxValor = Math.max(1, ...itens.map(i => Math.max(0, i.valor)));
    const aneis = 3;

    for (let nivel = 1; nivel <= aneis; nivel++) {
        const r = (raioMax / aneis) * nivel;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const angulo = -Math.PI / 2 + (i * Math.PI * 2) / n;
            const x = cx + Math.cos(angulo) * r;
            const y = cy + Math.sin(angulo) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    for (let i = 0; i < n; i++) {
        const angulo = -Math.PI / 2 + (i * Math.PI * 2) / n;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angulo) * raioMax, cy + Math.sin(angulo) * raioMax);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    const pontos = itens.map((item, i) => {
        const angulo = -Math.PI / 2 + (i * Math.PI * 2) / n;
        const proporcao = Math.max(0.08, Math.min(1, Math.max(0, item.valor) / maxValor));
        const r = raioMax * proporcao;
        return {
            x: cx + Math.cos(angulo) * r,
            y: cy + Math.sin(angulo) * r,
            angulo,
            item
        };
    });

    ctx.beginPath();
    pontos.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(239, 68, 68, 0.24)";
    ctx.fill();
    ctx.strokeStyle = "#EF4444";
    ctx.lineWidth = 2;
    ctx.stroke();

    pontos.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.item.cor;
        ctx.fill();
        ctx.strokeStyle = "#0D1924";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const labelRaio = raioMax + 10;
        const cosA = Math.cos(p.angulo);
        const sinA = Math.sin(p.angulo);
        let lx = cx + cosA * labelRaio;
        const ly = cy + sinA * labelRaio + (sinA > 0.4 ? 4 : 0);

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "500 10px Poppins, sans-serif";
        ctx.textBaseline = "middle";
        if (Math.abs(cosA) < 0.2) {
            ctx.textAlign = "center";
        } else if (cosA > 0) {
            ctx.textAlign = "left";
            lx = Math.min(width - 86, lx);
        } else {
            ctx.textAlign = "left";
            lx = Math.max(6, lx - 68);
        }
        ctx.fillText(`${p.item.rotulo} (${p.item.valor})`, lx, ly);
    });

    return true;
}

function desenharGraficoRosca(canvasId, itens, rotuloCentro) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return false;

    const parent = canvas.parentElement;
    if (!parent) return false;

    const rect = parent.getBoundingClientRect();
    const width = Math.max(200, Math.floor(rect.width));
    const height = Math.max(120, Math.floor(rect.height));

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const total = itens.reduce((acc, item) => acc + Math.max(0, item.valor), 0);
    const legendWidth = width >= 280 ? 120 : 0;
    const donutAreaWidth = Math.max(80, width - legendWidth);

    const cx = donutAreaWidth / 2;
    const cy = height / 2;
    const outerRadius = Math.max(24, Math.min(donutAreaWidth, height) / 2 - 8);
    const innerRadius = Math.max(14, outerRadius * 0.62);

    if (total === 0) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.lineWidth = outerRadius - innerRadius;
        ctx.beginPath();
        ctx.arc(cx, cy, (outerRadius + innerRadius) / 2, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        let anguloAtual = -Math.PI / 2;
        const gap = itens.filter(i => i.valor > 0).length > 1 ? 0.03 : 0;

        itens.forEach(item => {
            if (item.valor <= 0) return;
            const fatia = (item.valor / total) * (Math.PI * 2);
            const inicio = anguloAtual + gap / 2;
            const fim = anguloAtual + fatia - gap / 2;

            ctx.beginPath();
            ctx.arc(cx, cy, outerRadius, inicio, Math.max(inicio, fim));
            ctx.arc(cx, cy, innerRadius, Math.max(inicio, fim), inicio, true);
            ctx.closePath();
            ctx.fillStyle = item.cor;
            ctx.fill();

            anguloAtual += fatia;
        });
    }

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 15px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(total), cx, cy - 6);

    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = "500 10px Poppins, sans-serif";
    ctx.fillText(rotuloCentro, cx, cy + 9);

    if (legendWidth > 0) {
        const legX = donutAreaWidth + 6;
        const rowH = 22;
        const startY = Math.max(10, cy - (itens.length * rowH) / 2 + rowH / 2);

        itens.forEach((item, idx) => {
            const y = startY + idx * rowH;

            ctx.beginPath();
            ctx.arc(legX + 4, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = item.cor;
            ctx.fill();

            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.font = "500 11px Poppins, sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(`${item.valor} ${item.rotulo}`, legX + 14, y);
        });
    }

    return true;
}

function renderizarGraficoSlas(sla) {
    const itens = [
        { rotulo: "Disponibilidade", valor: sla.disponibilidade, cor: "#EF4444" },
        { rotulo: "Resolução", valor: sla.resolucao, cor: "#F59E0B" },
        { rotulo: "Tempo resp.", valor: sla.tempoResposta, cor: "#3B82F6" }
    ];

    desenharGraficoRadar("canvas-slas", itens);

    const legendaEl = document.getElementById("legenda-slas");
    if (legendaEl) {
        legendaEl.innerHTML = itens.map(item => `
            <span class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full inline-block" style="background:${item.cor};"></span>
                <span>${item.valor} ${item.rotulo.toLowerCase()}</span>
            </span>
        `).join("");
    }
}

function renderizarGraficoChamados(ch) {
    const itens = [
        { rotulo: "Em aberto", valor: ch.emAberto, cor: "#EF4444" },
        { rotulo: "Em atend.", valor: ch.emAtendimento, cor: "#F59E0B" },
        { rotulo: "Resolvidos", valor: ch.resolvidos, cor: "#10B981" }
    ];

    desenharGraficoRosca("canvas-chamados", itens, "CHAMADOS");

    const legendaEl = document.getElementById("legenda-chamados");
    if (legendaEl) {
        legendaEl.innerHTML = itens.map(item => `
            <span class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full inline-block" style="background:${item.cor};"></span>
                <span>${item.valor} ${item.rotulo.toLowerCase()}</span>
            </span>
        `).join("");
    }
}

function renderizarTabelaEmpresasPoucosFuncionarios(lista) {
    const tbody = document.getElementById("tabela-empresas-poucos-funcionarios");
    const legendaEl = document.getElementById("legenda-empresas");
    if (!tbody) return;

    const ordenadas = [...lista].sort((a, b) => a.funcionarios - b.funcionarios);

    if (ordenadas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td class="py-3 px-3 text-white/60" colspan="2">Nenhuma empresa encontrada.</td>
            </tr>
        `;
    } else {
        tbody.innerHTML = ordenadas.map(emp => {
            const qtdTexto = emp.funcionarios === 1 ? "1 func." : `${emp.funcionarios} funcs.`;
            const corQtd = emp.funcionarios <= 2 ? "text-red-400 font-semibold" : "text-amber-300 font-medium";
            return `
                <tr class="hover:bg-white/5 transition-colors">
                    <td class="py-2.5 px-3 font-medium text-white">${emp.nome}</td>
                    <td class="py-2.5 px-3 text-right ${corQtd}">${qtdTexto}</td>
                </tr>
            `;
        }).join("");
    }

    if (legendaEl) {
        const menorEquipe = ordenadas.length > 0 ? ordenadas[0].funcionarios : 0;
        legendaEl.textContent = ordenadas.length > 0
            ? `Menor equipe: ${menorEquipe} ${menorEquipe === 1 ? "funcionário" : "funcionários"}`
            : "";
    }
}

function renderizarHomeHolistica(dadosHome) {
    const normalizados = normalizarDadosHome(dadosHome);
    const { empresasPoucosFuncionarios, chamados: ch, slas: sla } = normalizados;

    const estadosAreas = [];

    const totalSla = sla.disponibilidade + sla.resolucao + sla.tempoResposta;
    const nivelSla = totalSla >= 15 ? "atencao" : (totalSla > 0 ? "atencao" : "ok");
    estadosAreas.push({ nome: "os SLAs", nivel: nivelSla });
    aplicarBadgeEsfera("badge-slas", nivelSla);

    const maiorSla = [
        { nome: "Disponibilidade", valor: sla.disponibilidade },
        { nome: "Resolução", valor: sla.resolucao },
        { nome: "Tempo de resposta", valor: sla.tempoResposta }
    ].sort((a, b) => b.valor - a.valor)[0];

    const tituloSlasEl = document.getElementById("titulo-slas");
    if (tituloSlasEl) {
        tituloSlasEl.textContent = totalSla > 0
            ? `${maiorSla.nome} concentra ${maiorSla.valor} das ${totalSla} violações de SLA`
            : "Nenhuma violação de SLA registrada";
    }
    renderizarGraficoSlas(sla);

    const totalCh = ch.emAberto + ch.emAtendimento + ch.resolvidos;
    const nivelCh = ch.criticosEmAberto > 0 ? "critico" : (ch.emAberto > 0 ? "atencao" : "ok");
    estadosAreas.push({ nome: "os chamados", nivel: nivelCh });
    aplicarBadgeEsfera("badge-chamados", nivelCh);

    const tituloChamadosEl = document.getElementById("titulo-chamados");
    const subtituloChamadosEl = document.getElementById("subtitulo-chamados");
    if (tituloChamadosEl) {
        tituloChamadosEl.textContent = ch.criticosEmAberto > 0
            ? `${ch.criticosEmAberto} ${ch.criticosEmAberto === 1 ? "chamado crítico ainda está em aberto" : "chamados críticos ainda estão em aberto"}`
            : `${ch.emAberto} ${ch.emAberto === 1 ? "chamado em aberto" : "chamados em aberto"}`;
    }
    if (subtituloChamadosEl) {
        subtituloChamadosEl.textContent = `São ${totalCh} chamados no total.`;
    }
    renderizarGraficoChamados(ch);

    const criticaEquipe = empresasPoucosFuncionarios.filter(e => e.funcionarios <= 1).length;
    const atencaoEquipe = empresasPoucosFuncionarios.filter(e => e.funcionarios > 1 && e.funcionarios <= 3).length;
    const nivelEmp = criticaEquipe > 0 ? "critico" : (atencaoEquipe > 0 ? "atencao" : "ok");
    estadosAreas.push({ nome: "as empresas", nivel: nivelEmp });
    aplicarBadgeEsfera("badge-empresas", nivelEmp);

    const tituloEmpEl = document.getElementById("titulo-empresas");
    const subtituloEmpEl = document.getElementById("subtitulo-empresas");
    if (tituloEmpEl) {
        tituloEmpEl.textContent = "Empresas com poucos funcionários";
    }
    if (subtituloEmpEl) {
        subtituloEmpEl.textContent = `${empresasPoucosFuncionarios.length} empresas listadas por menor equipe.`;
    }
    renderizarTabelaEmpresasPoucosFuncionarios(empresasPoucosFuncionarios);

    const faixaEl = document.getElementById("faixa-resumo-home");
    const textoFaixaEl = document.getElementById("texto-faixa-home");
    const indicadoresEl = document.getElementById("indicadores-faixa-home");

    const criticos = estadosAreas.filter(a => a.nivel === "critico");
    const atencoes = estadosAreas.filter(a => a.nivel === "atencao");

    if (faixaEl && textoFaixaEl) {
        if (criticos.length > 0) {
            faixaEl.className = "rounded-xl border border-red-500/30 bg-red-950/35 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 transition-element";
            textoFaixaEl.className = "text-xs sm:text-sm font-medium text-red-300";
            const foco = criticos[0].nome;
            textoFaixaEl.textContent = `${criticos.length} ${criticos.length === 1 ? "área crítica" : "áreas críticas"} e ${atencoes.length} em atenção. Comece por ${foco}.`;
        } else if (atencoes.length > 0) {
            faixaEl.className = "rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 transition-element";
            textoFaixaEl.className = "text-xs sm:text-sm font-medium text-amber-300";
            textoFaixaEl.textContent = `${atencoes.length} ${atencoes.length === 1 ? "área em atenção" : "áreas em atenção"}. Acompanhe os indicadores abaixo.`;
        } else {
            faixaEl.className = "rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 transition-element";
            textoFaixaEl.className = "text-xs sm:text-sm font-medium text-emerald-300";
            textoFaixaEl.textContent = "Todas as áreas estão dentro do esperado.";
        }
    }

    if (indicadoresEl) {
        indicadoresEl.innerHTML = estadosAreas.map(area => {
            const cor = (HOME_BADGE_ESTILO[area.nivel] || HOME_BADGE_ESTILO.ok).ponto;
            return `<span class="h-2.5 w-2.5 rounded-full inline-block" style="background:${cor};"></span>`;
        }).join("");
    }

    const referenciaEl = document.getElementById("referencia");
    if (referenciaEl) {
        const agora = new Date();
        referenciaEl.textContent = `Atualizado em ${agora.toLocaleDateString("pt-BR")}, ${agora.toLocaleTimeString("pt-BR")}`;
    }
}

async function inicializarHome() {
    const gridHome = document.getElementById("grid-esferas-home");
    if (!gridHome) return;

    const dadosMock = gerarDadosMockadosHome();
    renderizarHomeHolistica(dadosMock);

    if (typeof apiFetch !== "function") return;

    const resposta = await chamarApi("/thabata/home", "GET");
    if (resposta.ok && resposta.dados) {
        renderizarHomeHolistica(resposta.dados);
    }

    window.addEventListener("resize", () => {
        const atual = resposta.ok && resposta.dados ? normalizarDadosHome(resposta.dados) : dadosMock;
        renderizarGraficoSlas(atual.slas);
        renderizarGraficoChamados(atual.chamados);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarInformacoesUsuario();
    inicializarHome();
    inicializarRelatorio();
});