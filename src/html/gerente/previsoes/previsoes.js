const COR_VERDE = "#22C55E";
const COR_AMARELA = "#FBBF24";
const COR_VERMELHA = "#EF4444";
const COR_AZUL = "#03C8FF";

const CORES_MAPA = ["#142235", "#1D3B63", "#2875A8", "#F5C542", "#FF6B6B"];
const CORES_TEXTO_MAPA = ["#99add8", "#E6EBF5", "#FFFFFF", "#2A2000", "#2A0505"];
textContent = ["#f2f4f7"];

let grafico = null;
let usandoDadosSimulados = false;
let dadosSimulados = null;

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {
    if (!exigirGerente()) return;

    carregarNomeDoUsuario();

    try {
        const dados = await carregarDados();
        const resultado = calcularPrevisoes(dados, dados.dataReferencia ? new Date(dados.dataReferencia) : new Date());

        mostrarReferencia(resultado);
        mostrarCards(resultado);
        mostrarMapaDeCalor(resultado);
        mostrarGrafico(resultado);
        mostrarTabela(resultado);
        carregarModelos();
    } catch (erro) {
        if (erro.sessaoExpirada) return;
        console.error(erro);
        alert("Não foi possível carregar os dados das previsões.");
    }
}

async function carregarDados() {
    try {
        const resposta = await apiFetch("/previsoes/chamados", { method: "GET" });
        if (resposta.ok) {
            usandoDadosSimulados = false;
            return resposta.dados;
        }
    } catch (erro) {
        if (erro.sessaoExpirada) throw erro;
    }

    const resposta = await fetch("./previsoes-dados.json");
    usandoDadosSimulados = true;
    dadosSimulados = await resposta.json();
    return dadosSimulados;
}

function carregarNomeDoUsuario() {
    apiFetch("/usuarios/informacoes_usuario", { method: "GET" })
        .then(function (resposta) {
            const nome = resposta.dados[0].nome;
            document.getElementById("nome_title").textContent = nome;
            document.getElementById("foto_usuario").textContent = nome[0];
        })
        .catch(function (erro) {
            console.log("Não foi possível carregar o nome do usuário.", erro);
        });
}

function escapar(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function dataCurta(data) {
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    return dia + "/" + mes;
}

function formatarHoras(horas) {
    if (!(horas > 0)) return "—";

    const minutosTotais = Math.round(horas * 60);
    const h = Math.floor(minutosTotais / 60);
    const m = minutosTotais % 60;

    if (h === 0) return m + " min";
    if (m === 0) return h + "h";
    return h + "h " + m + "min";
}


function mostrarReferencia(r) {
    const fimSemana = somarDias(r.proximaSemana, 6);
    const origem = usandoDadosSimulados ? "" : "dados do Jira";

    document.getElementById("referencia").textContent =
        "Próxima semana: " + dataCurta(r.proximaSemana) + " a " + dataCurta(fimSemana) + " · " + origem;
    document.getElementById("periodo-grafico").textContent =
        "";
    document.getElementById("periodo-tabela").textContent =
        "";
}


function criarCard(titulo, valor, detalhe, rodape, cor) {
    return `
        <article class="border border-white/10 rounded-xl bg-[#0D1924] px-4 py-3 min-w-0" style="border-top: 3px solid ${cor};">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-white/100100">${titulo}</p>
            <p class="text-2xl xl:text-3xl font-bold mt-1.5 truncate" style="color:${cor};">${valor}</p>
            <p class="text-[11px] mt-1 truncate" style="color:${cor};">${detalhe}</p>
            <p class="text-[11px] text-white/100100 mt-0.5 truncate">${rodape}</p>
        </article>
    `;
}

function mostrarCards(r) {
    let corCarga = COR_VERDE;
    let textoCarga = "Dentro da capacidade estimada";
    if (r.carga > 100) {
        corCarga = COR_VERMELHA;
        textoCarga = "Demanda acima da capacidade";
    } else if (r.carga >= 80) {
        corCarga = COR_AMARELA;
        textoCarga = "Próxima do limite da equipe";
    }

    let valorVariacao = "—";
    let textoVariacao = "Sem base de comparação";
    let corVariacao = COR_AZUL;
    if (r.variacao !== null) {
        const sinal = r.variacao > 0 ? "+" : "";
        valorVariacao = sinal + r.variacao + "%";
        textoVariacao = Math.abs(r.variacao) + "% em relação à última semana completa";
        corVariacao = r.variacao > 0 ? COR_AMARELA : COR_VERDE;
    }

    let nomeEmpresa = "—";
    let textoEmpresa = "Sem dados suficientes";
    if (r.empresaMaiorEsforco) {
        const e = r.empresaMaiorEsforco;
        nomeEmpresa = escapar(e.empresa);
        textoEmpresa = e.alertasPrevistos + " alertas · " + formatarHoras(e.esforcoHoras) + " estimadas";
    }

    const alertasPorAnalista = r.alertasPorAnalista.toFixed(1).replace(".", ",");
    const capacidade = Math.round(r.capacidade.porAnalista);

    document.getElementById("cards").innerHTML =
        criarCard("Alertas previstos ", r.previsao.valor,
            "Faixa estimada: " + r.previsao.minimo + " a " + r.previsao.maximo,
            "", COR_AZUL) +
        criarCard("Carga por analista", alertasPorAnalista + " alertas",
            textoCarga,
            r.quantidadeAnalistas + " analistas · capacidade de " + capacidade + " alertas cada", corCarga) +
        criarCard("Variação de alertas", valorVariacao,
            textoVariacao, "", corVariacao) +
        criarCard("Maior esforço previsto", nomeEmpresa,
            textoEmpresa, "", COR_AMARELA);
}


function mostrarMapaDeCalor(r) {
    const calor = r.calor;

    let html = `<div class="heatmap-grid" style="display:grid;grid-template-columns:42px repeat(6,minmax(0,1fr));gap:5px;width:100%;">`;

    html += `<div></div>`;
    for (let faixa = 0; faixa < 6; faixa++) {
        html += `<div class="heatmap-label">${FAIXAS_HORARIO[faixa]}</div>`;
    }

    for (let dia = 0; dia < 7; dia++) {
        html += `<div class="heatmap-day">${DIAS_DA_SEMANA[dia]}</div>`;

        for (let faixa = 0; faixa < 6; faixa++) {
            const valor = calor.tabela[dia][faixa];

            const posicao = calor.maior > 0 ? valor / calor.maior : 0;
            const fundo = corNoDegrade(posicao);
            const texto = valor > 0 ? corDoTextoSobre(fundo) : CORES_TEXTO_MAPA[0];

            html += `<div class="heatmap-cell" style="background:${rgbParaCss(fundo)};color:${texto};">${valor}</div>`;
        }
    }
    html += `</div>`;

    document.getElementById("mapa-calor").innerHTML = html;
    mostrarLegendaMapa(calor.maior);

    let frase = "Sem alertas previstos para a próxima semana.";
    if (calor.total > 0) {
        const horaInicial = calor.faixaMaior * 4;
        frase = "Maior concentração prevista: " + DIAS_DA_SEMANA[calor.diaMaior] +
            ", entre " + horaInicial + "h e " + (horaInicial + 4) + "h (" + textoAlertas(calor.maior) + ", " +
            Math.round((calor.maior / calor.total) * 100) + "% dos " + calor.total + " previstos para a semana).";
    }
    document.getElementById("mapa-calor-insight").textContent = frase;
}


const PARADAS_DEGRADE = [
    { ponto: 0, cor: CORES_MAPA[0] },
    { ponto: 0.2, cor: CORES_MAPA[1] },
    { ponto: 0.42, cor: CORES_MAPA[2] },
    { ponto: 0.6, cor: "#3DB8A0" },
    { ponto: 0.8, cor: CORES_MAPA[3] },
    { ponto: 1, cor: CORES_MAPA[4] }
];

function hexParaRgb(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function rgbParaCss(rgb) {
    return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
}

function corNoDegrade(posicao) {
    const p = Math.min(1, Math.max(0, posicao));
    for (let i = 1; i < PARADAS_DEGRADE.length; i++) {
        const fim = PARADAS_DEGRADE[i];
        if (p <= fim.ponto) {
            const inicio = PARADAS_DEGRADE[i - 1];
            const t = (p - inicio.ponto) / (fim.ponto - inicio.ponto);
            const de = hexParaRgb(inicio.cor);
            const ate = hexParaRgb(fim.cor);
            return [0, 1, 2].map(function (c) { return Math.round(de[c] + (ate[c] - de[c]) * t); });
        }
    }
    return hexParaRgb(PARADAS_DEGRADE[PARADAS_DEGRADE.length - 1].cor);
}

function luminanciaRelativa(rgb) {
    const c = rgb.map(function (v) {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function corDoTextoSobre(rgb) {
    const lf = luminanciaRelativa(rgb);
    const contrasteBranco = 1.05 / (lf + 0.05);
    const contrasteEscuro = (lf + 0.05) / 0.05;
    return contrasteBranco >= contrasteEscuro ? "#FFFFFF" : "#000000";
}

function textoAlertas(quantidade) {
    return quantidade + (quantidade === 1 ? " alerta" : " alertas");
}

function mostrarLegendaMapa(maior) {
    const destino = document.getElementById("mapa-calor-legenda");
    if (!(maior > 0)) {
        destino.innerHTML = "";
        return;
    }

    const paradas = PARADAS_DEGRADE.map(function (parada) {
        return parada.cor + " " + Math.round(parada.ponto * 100) + "%";
    }).join(", ");

    destino.innerHTML = `
        <div class="legenda-vertical" role="img" aria-label="Escala de 0 a ${maior} alertas por período">
            <span>0</span>
            <div class="legenda-vertical-barra" style="background:linear-gradient(to bottom, ${paradas});"></div>
            <span>${maior}</span>
        </div>
    `;
}

const ancoraPrevisao = {
    id: "ancoraPrevisao",
    afterDatasetsDraw(chart, args, opcoes) {
        if (!opcoes) return;
        const { ctx, chartArea, scales } = chart;
        const yCapacidade = opcoes.capacidade > 0 ? scales.y.getPixelForValue(opcoes.capacidade) : null;
        ctx.save();

        if (opcoes.indice >= 1) {
            const x = (scales.x.getPixelForValue(opcoes.indice - 1) + scales.x.getPixelForValue(opcoes.indice)) / 2;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.97)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(x, chartArea.top);
            ctx.lineTo(x, chartArea.bottom);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.font = "600 12px Poppins, sans-serif";
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText("Previsão →", x + 8, chartArea.top + 6);
        }

        if (opcoes.rotulos) {
            ctx.font = "700 13px Poppins, sans-serif";
            ctx.fillStyle = "#03C8FF";
            ctx.textAlign = "center";
            opcoes.rotulos.forEach(function (rotulo) {
                const x = scales.x.getPixelForValue(rotulo.indice);
                const y = scales.y.getPixelForValue(rotulo.posicao);
                const perto = yCapacidade !== null && Math.abs(y - yCapacidade) < 22;
                const abaixo = perto && y > yCapacidade;
                ctx.textBaseline = abaixo ? "top" : "bottom";
                ctx.fillText(String(rotulo.valor), x, abaixo ? y + 10 : y - 10);
            });
        }

        if (yCapacidade !== null) {
            const textoCapacidade = "Capacidade: " + Math.round(opcoes.capacidade);
            ctx.font = "600 12px Poppins, sans-serif";
            const larguraTexto = ctx.measureText(textoCapacidade).width;
            ctx.fillStyle = "rgba(13,25,36,0.92)";
            ctx.fillRect(chartArea.right - 8 - larguraTexto - 6, yCapacidade - 5 - 15, larguraTexto + 12, 19);
            ctx.fillStyle = "#FCA5A5";
            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            ctx.fillText(textoCapacidade, chartArea.right - 8, yCapacidade - 5);
        }
        ctx.restore();
    }
};

function mostrarGrafico(r) {
    const nomesDasSemanas = [];
    const alertasReais = [];
    const alertasPrevistos = [];
    const linhaTendencia = [];
    const linhaCapacidade = [];
    const raioDosPontos = [];
    const faixas = [];
    const rotulos = [];
    const capacidadeSemanal = r.capacidade.total;

    for (let i = 0; i < r.semanasGrafico.length; i++) {
        const semana = r.semanasGrafico[i];
        nomesDasSemanas.push(semana.tipo === "atual" ? [dataCurta(semana.inicio), "em andamento"] : dataCurta(semana.inicio));
        linhaTendencia.push(Math.round(semana.tendencia * 10) / 10);
        linhaCapacidade.push(capacidadeSemanal > 0 ? Math.round(capacidadeSemanal * 10) / 10 : null);
        alertasReais.push(semana.tipo === "historico" ? semana.valor : null);
        alertasPrevistos.push(semana.tipo === "previsao" ? semana.valor : null);

        if (semana.tipo === "previsao") {
            raioDosPontos.push(0);
            faixas.push({ valor: semana.valor, minimo: semana.minimo, maximo: semana.maximo });
            rotulos.push({ indice: i, valor: semana.valor, posicao: Math.round(semana.tendencia * 10) / 10 });
        } else {
            raioDosPontos.push(0);
            faixas.push(null);
        }
    }

    const indiceAtual = r.semanasGrafico.findIndex(function (semana) { return semana.tipo === "atual"; });
    const indicePrimeiraPrevisao = r.semanasGrafico.findIndex(function (semana) { return semana.tipo === "previsao"; });

    if (grafico) grafico.destroy();

    const corDoTexto = "rgba(255, 255, 255, 0.96)";

    grafico = new Chart(document.getElementById("grafico-previsao"), {
        type: "bar",
        data: {
            labels: nomesDasSemanas,
            datasets: [
                { label: "Alertas reais", data: alertasReais, backgroundColor: "#3B82F6", order: 1, grouped: false },
                { label: "Alertas previstos", data: alertasPrevistos, backgroundColor: COR_AZUL, order: 1, grouped: false },
                {
                    type: "line",
                    label: "Tendência e previsão (regressão)",
                    data: linhaTendencia,
                    borderColor: "#FFFFFF",
                    backgroundColor: "#03C8FF",
                    borderWidth: 2.5,
                    pointRadius: raioDosPontos,
                    pointHoverRadius: 7,
                    pointBorderColor: "#0D1924",
                    pointBorderWidth: 2,
                    tension: 0,
                    segment: {
                        borderDash: function (contexto) { return contexto.p0DataIndex >= indiceAtual ? [7, 5] : undefined; }
                    },
                    order: 0
                },
                {
                    type: "line",
                    label: "Capacidade da equipe",
                    data: linhaCapacidade,
                    borderColor: COR_VERMELHA,
                    backgroundColor: COR_VERMELHA,
                    borderWidth: 2,
                    borderDash: [10, 5],
                    pointRadius: 0,
                    tension: 0,
                    order: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "rgb(255, 255, 255)",
                        font: { size: 12 },
                        padding: 16,
                        usePointStyle: true,
                        boxHeight: 10,
                        pointStyleWidth: 30,
                        sort: function (a, b) { return a.datasetIndex - b.datasetIndex; },
                        generateLabels: function (instancia) {
                            const itens = Chart.defaults.plugins.legend.labels.generateLabels(instancia);
                            itens.forEach(function (item) {
                                const serie = instancia.data.datasets[item.datasetIndex];
                                item.pointStyle = serie.type === "line" ? "line" : "rect";
                                item.lineDash = serie.borderDash || [];
                                if (serie.type === "line") {
                                    item.strokeStyle = serie.borderColor;
                                    item.lineWidth = serie.borderWidth;
                                }
                            });
                            return itens;
                        }
                    }
                },
                ancoraPrevisao: { indice: indicePrimeiraPrevisao, capacidade: capacidadeSemanal, rotulos: rotulos },
                tooltip: {
                    callbacks: {
                        label: function (item) {
                            if (item.datasetIndex === 1) {
                                const faixa = faixas[item.dataIndex];
                                return "Alertas previstos: " + item.formattedValue + (faixa ? " (faixa estimada " + faixa.minimo + " a " + faixa.maximo + ")" : "");
                            }
                            if (item.datasetIndex === 2) {
                                return "Tendência: " + String(item.parsed.y).replace(".", ",") + " alertas";
                            }
                            if (item.datasetIndex === 3) {
                                return "Capacidade da equipe: " + item.formattedValue + " alertas por semana (média dos resolvidos nas últimas 8 semanas)";
                            }
                            return item.dataset.label + ": " + item.formattedValue;
                        }
                    }
                }
            },
            scales: {
                x: { ticks: { color: corDoTexto, font: { size: 12 } }, grid: { display: false } },
                y: {
                    beginAtZero: true,
                    grace: "14%",
                    ticks: { color: corDoTexto, precision: 0, font: { size: 12 } },
                    grid: { color: "rgba(255, 255, 255, 0.14)" }
                }
            }
        },
        plugins: [ancoraPrevisao]
    });
}


function mostrarTabela(r) {
    let linhas = "";

    for (let i = 0; i < r.empresas.length; i++) {
        const empresa = r.empresas[i];

        const cor = i === 0 ? COR_AMARELA : COR_AZUL;

        let situacaoSla = `<span class="status-sla acima">Média acima do SLA</span>`;
        if (empresa.dentroSla) {
            situacaoSla = `<span class="status-sla dentro">Média dentro do SLA</span>`;
        }

        linhas += `
            <tr class="border-b border-white/10">
                <td class="px-2 py-3 font-semibold">${escapar(empresa.empresa)}</td>
                <td class="px-2 py-3 text-center font-semibold" style="color:${cor};">${empresa.alertasPrevistos}
                    <span class="block text-[11px] text-white/100100 font-normal">${empresa.minimo}–${empresa.maximo}</span>
                </td>
                <td class="px-2 py-3 text-center font-semibold">${formatarHoras(empresa.esforcoHoras)}</td>
                <td class="px-2 py-3 text-center">${empresa.prazoHoras}h<br>${situacaoSla}</td>
            </tr>
        `;
    }

    document.getElementById("tabela-empresas").innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead>
                    <tr class="text-[11px] uppercase tracking-wider text-white/100100 border-b border-white/10">
                        <th class="px-2 py-3">Empresa</th>
                        <th class="px-2 py-3 text-center">Alertas<br>previstos</th>
                        <th class="px-2 py-3 text-center">Esforço<br>estimado</th>
                        <th class="px-2 py-3 text-center">Situação<br>do SLA</th>
                    </tr>
                </thead>
                <tbody>${linhas}</tbody>
            </table>
        </div>
        
    `;
}


const NOMES_COMPONENTE = { cpu: "CPU", ram: "RAM", disco: "Disco", rede: "Perda de Pacotes" };
const MAXIMO_MODELOS = 4;

async function carregarReservaModelos() {
    try {
        if (!dadosSimulados) {
            const resposta = await fetch("./previsoes-dados.json");
            dadosSimulados = await resposta.json();
        }
        return dadosSimulados.analiseModelos || null;
    } catch (erro) {
        console.error("Não foi possível carregar a reserva da análise por modelo.", erro);
        return null;
    }
}

async function carregarModelos() {
    const area = document.getElementById("tabela-modelos");
    area.innerHTML = `<p class="text-xs text-white/100100 py-2">Carregando...</p>`;

    let dados = null;
    try {
        const resposta = await apiFetch("/previsoes/modelos", { method: "GET" });
        if (resposta.ok) dados = resposta.dados;
    } catch (erro) {
        if (erro.sessaoExpirada) return;
        console.error("Não foi possível carregar a análise por modelo.", erro);
    }

    if (dados && dados.etl.status !== "indisponivel" && dados.etl.status !== "nao_configurado") {
        mostrarModelos(dados, "real");
        return;
    }

    const reserva = await carregarReservaModelos();

    if (dados && reserva) {
        dados.modelos.forEach(function (modelo) {
            const simulado = reserva.modelos.find(function (item) { return item.modelo === modelo.modelo; });
            if (simulado) {
                ["equipamentosComDados", "registrosMonitorados", "leiturasComponentes", "anomalias", "anomaliasTotal", "taxaPorMil", "componentePredominante"]
                    .forEach(function (campo) { modelo[campo] = simulado[campo]; });
            }
        });
        dados.etl = { status: "ok", mensagem: null };
        dados.janelaAnomaliasDias = reserva.janelaAnomaliasDias;
        mostrarModelos(dados, "anomalias-simuladas");
        return;
    }

    if (reserva) {
        mostrarModelos(reserva, "simulado");
        return;
    }

    if (dados) {
        mostrarModelos(dados, "real");
        return;
    }
    area.innerHTML = `<p class="text-xs text-white/100100 py-2">Não foi possível carregar a análise por modelo.</p>`;
    document.getElementById("nota-modelos").textContent = "";
}

function textoAnomalia(modelo, etl) {
    if (etl.status !== "ok" && etl.status !== "sem_dados") {
        return `<span class="text-white/100100">—</span>`;
    }
    if (modelo.registrosMonitorados === null || modelo.registrosMonitorados === 0) {
        return `<span class="text-white/100100">Sem monitoramento</span>`;
    }

    const detalhe = modelo.anomaliasTotal + " ocorr. · " +
        String(modelo.taxaPorMil === null ? 0 : modelo.taxaPorMil).replace(".", ",") + " por mil leituras";

    if (!modelo.componentePredominante) {
        return `<span class="text-white/100100">Sem anomalias</span><span class="anomalia-detalhe">${detalhe}</span>`;
    }
    return `<span class="font-semibold" style="color:${COR_AMARELA};">${NOMES_COMPONENTE[modelo.componentePredominante]}</span>` +
        `<span class="anomalia-detalhe">${detalhe}</span>`;
}

function numeroBR(valor) {
    return String(valor).replace(".", ",");
}

// Coluna "Temp. do ambiente": média da temperatura externa (Open-Meteo, coletada pelo script)
// e a taxa de leituras com anomalia quando estava quente x nas demais.
function textoTemperatura(modelo, etl) {
    const t = modelo.temperatura;
    if (!t || etl.status !== "ok") {
        return `<span class="text-white/100100">—</span>`;
    }

    const media = `<span class="font-semibold" style="color:${COR_AZUL};">${numeroBR(t.media)} °C</span>`;

    if (t.quente.leituras > 0 && t.normal.leituras > 0) {
        return media +
            `<span class="anomalia-detalhe">≥ ${t.limiteQuente} °C: ${numeroBR(t.quente.taxaPorMil)} por mil</span>` +
            `<span class="anomalia-detalhe">demais: ${numeroBR(t.normal.taxaPorMil)} por mil</span>`;
    }
    return media + `<span class="anomalia-detalhe">máx. ${numeroBR(t.maxima)} °C</span>`;
}

function mostrarModelos(dados, origem) {
    const area = document.getElementById("tabela-modelos");
    const nota = document.getElementById("nota-modelos");
    const lista = (dados.modelos || []).slice(0, MAXIMO_MODELOS);

    if (lista.length === 0) {
        area.innerHTML = `<p class="text-xs text-white/100100 py-2">Nenhum modelo com equipamentos cadastrados.</p>`;
        nota.textContent = "";
        return;
    }

    let linhas = "";
    for (let i = 0; i < lista.length; i++) {
        const m = lista[i];
        const equipamentos = m.equipamentos + (m.equipamentos === 1 ? " equipamento" : " equipamentos");
        linhas += `
            <tr class="border-b border-white/10">
                <td class="px-2 py-2 font-semibold text-white/100100">${escapar(m.modelo)}<span class="anomalia-detalhe">${equipamentos}</span></td>
                <td class="px-2 py-2 text-center font-semibold">${m.chamados}</td>
                <td class="px-2 py-2 text-center">${formatarHoras(m.tempoMedioHoras)}</td>
                <td class="px-2 py-2">${textoAnomalia(m, dados.etl)}</td>
                <td class="px-2 py-2">${textoTemperatura(m, dados.etl)}</td>
            </tr>
        `;
    }

    area.innerHTML = `
        <table class="w-full text-left text-xs">
            <thead>
                <tr class="text-[11px] uppercase tracking-wider text-white/100100 border-b border-white/10">
                    <th class="px-2 py-2">Modelo</th>
                    <th class="px-2 py-2 text-center">Chamados</th>
                    <th class="px-2 py-2 text-center">Tempo<br>médio</th>
                    <th class="px-2 py-2">Anomalia<br>predominante</th>
                    <th class="px-2 py-2">Temp. do<br>ambiente</th>
                </tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>
    `;

    if (origem === "simulado") {
        nota.textContent = "Dados simulados do arquivo local (backend e bucket indisponíveis).";
    } else if (origem === "anomalias-simuladas") {
        nota.textContent = "Chamados e tempo médio: banco. Anomalias: dados simulados do arquivo local (bucket indisponível).";
    } else if (dados.etl.status === "ok") {
        nota.textContent = "Chamados e tempo médio: banco (últimas 8 semanas). Anomalias: monitoramento dos últimos " +
            dados.janelaAnomaliasDias + " dias, histórico por componente (não é previsão nem causa dos chamados).";
    } else if (dados.etl.status === "sem_dados") {
        nota.textContent = "Sem registros de monitoramento no período para estes equipamentos.";
    } else {
        nota.textContent = "Indicadores de anomalia indisponíveis no momento: " + (dados.etl.mensagem || "falha na leitura da ETL.");
    }

    if (origem === "real" && dados.etl.status === "ok" && lista.some(function (m) { return m.temperatura; })) {
        nota.textContent += " Temp. do ambiente: Open-Meteo, coletada pelo script de monitoramento; " +
            "\"por mil\" = leituras com alguma anomalia a cada mil (relação nos dados, não causa).";
    }
}
