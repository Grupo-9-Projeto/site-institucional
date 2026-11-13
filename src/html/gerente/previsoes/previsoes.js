const COR_VERDE = "#22C55E";
const COR_AMARELA = "#FBBF24";
const COR_VERMELHA = "#EF4444";
const COR_AZUL = "#03C8FF";

const CORES_MAPA = ["#142235", "#1D3B63", "#2875A8", "#F5C542", "#FF6B6B"];
const CORES_TEXTO_MAPA = ["#9AA6C0", "#E6EBF5", "#FFFFFF", "#2A2000", "#2A0505"];

let grafico = null;
let usandoDadosSimulados = false;

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {
    if (!exigirGerente()) return;

    carregarNomeDoUsuario();

    try {
        const dados = await carregarDados();
        const resultado = calcularPrevisoes(dados, new Date());

        mostrarReferencia(resultado);
        mostrarCards(resultado);
        mostrarMapaDeCalor(resultado);
        mostrarGrafico(resultado);
        mostrarTabela(resultado);
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
    return await resposta.json();
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
    const origem = usandoDadosSimulados ? "DADOS SIMULADOS (Jira indisponível)" : "dados do Jira";

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
            <p class="text-[10px] font-semibold uppercase tracking-wider text-white/50">${titulo}</p>
            <p class="text-2xl xl:text-3xl font-bold mt-1.5 truncate" style="color:${cor};">${valor}</p>
            <p class="text-[11px] mt-1 truncate" style="color:${cor};">${detalhe}</p>
            <p class="text-[10px] text-white/40 mt-0.5 truncate">${rodape}</p>
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

            let nivel = 0;
            if (valor > 0) {
                nivel = Math.ceil((valor / calor.maior) * 4);
            }

            html += `<div class="heatmap-cell" style="background:${CORES_MAPA[nivel]};color:${CORES_TEXTO_MAPA[nivel]};">${valor}</div>`;
        }
    }
    html += `</div>`;

    document.getElementById("mapa-calor").innerHTML = html;

    let frase = "Sem alertas previstos para a próxima semana.";
    if (calor.total > 0) {
        const horaInicial = calor.faixaMaior * 4;
        frase = "Maior concentração prevista: " + DIAS_DA_SEMANA[calor.diaMaior] +
            ", entre " + horaInicial + "h e " + (horaInicial + 4) + "h (" + calor.maior + " alertas).";
    }
    document.getElementById("mapa-calor-insight").textContent = frase;
}


function mostrarGrafico(r) {
    const nomesDasSemanas = [];
    const alertasReais = [];
    const alertasPrevistos = [];

    for (let i = 0; i < r.semanasGrafico.length; i++) {
        const semana = r.semanasGrafico[i];
        nomesDasSemanas.push(dataCurta(semana.inicio));

        if (semana.tipo === "historico") {
            alertasReais.push(semana.valor);
            alertasPrevistos.push(null);
        } else {
            alertasReais.push(null);
            alertasPrevistos.push(semana.valor);
        }
    }

    if (grafico) grafico.destroy();

    const corDoTexto = "rgba(255,255,255,0.65)";

    grafico = new Chart(document.getElementById("grafico-previsao"), {
        type: "bar",
        data: {
            labels: nomesDasSemanas,
            datasets: [
                { label: "Alertas reais", data: alertasReais, backgroundColor: "#3B82F6" },
                { label: "Alertas previstos", data: alertasPrevistos, backgroundColor: COR_AZUL }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom", labels: { color: corDoTexto } }
            },
            scales: {
                x: { stacked: true, ticks: { color: corDoTexto }, grid: { display: false } },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: { color: corDoTexto, precision: 0 },
                    grid: { color: "rgba(255,255,255,0.07)" }
                }
            }
        }
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
                    <span class="block text-[9px] text-white/40 font-normal">${empresa.minimo}–${empresa.maximo}</span>
                </td>
                <td class="px-2 py-3 text-center">${formatarHoras(empresa.tempoMedioHoras)}</td>
                <td class="px-2 py-3 text-center font-semibold">${formatarHoras(empresa.esforcoHoras)}</td>
                <td class="px-2 py-3 text-center">${empresa.prazoHoras}h<br>${situacaoSla}</td>
            </tr>
        `;
    }

    document.getElementById("tabela-empresas").innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead>
                    <tr class="text-[9px] uppercase tracking-wider text-white/50 border-b border-white/10">
                        <th class="px-2 py-3">Empresa</th>
                        <th class="px-2 py-3 text-center">Alertas<br>previstos</th>
                        <th class="px-2 py-3 text-center">Tempo médio<br>de resolução</th>
                        <th class="px-2 py-3 text-center">Esforço<br>estimado</th>
                        <th class="px-2 py-3 text-center">SLA</th>
                    </tr>
                </thead>
                <tbody>${linhas}</tbody>
            </table>
        </div>
        
    `;
}
