
const CORES = {
    cpu: "#38BDF8",
    ram: "#F59E0B",
    disco: "#A78BFA",
    pacotes: "#22C55E"
};

const NOMES = {
    cpu: "CPU",
    ram: "RAM",
    disco: "Disco",
    pacotes: "Rede"
};

let dados;

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {
    try {
        const resposta = await fetch("equipamento-mock.json");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar o JSON.");
        }

        const json = await resposta.json();

        dados = prepararDados(json);

        preencherCabecalho();
        preencherCards();

        configurarFiltro("registros", mostrarGraficos);
        configurarFiltro("alertas", mostrarAlertas);

    } catch (erro) {
        console.log(erro);
        mostrarErro("Não foi possível carregar os dados do equipamento.");
    }
}

function prepararDados(json) {

    let historico = json.historico || [];

    for (let i = 0; i < historico.length; i++) {

        if (!historico[i].data) {
            historico[i].data = calcularDataAtras(historico[i].diasAtras || 0);
        }

        historico[i].dia = historico[i].data;
    }

    historico.sort(function(a, b) {
        return a.dia.localeCompare(b.dia);
    });

    let alertas = json.alertas || [];

    for (let i = 0; i < alertas.length; i++) {

        let alerta = alertas[i];

        if (!alerta.data) {
            alerta.dia = calcularDataAtras(alerta.diasAtras || 0);
        } else {
            alerta.dia = alerta.data;
        }

        let registro = null;

        for (let j = 0; j < historico.length; j++) {
            if (historico[j].dia === alerta.dia) {
                registro = historico[j];
                break;
            }
        }
        let campo = campoDaMetrica(alerta.tipo);

        if (alerta.valor === undefined || alerta.valor === null) {
            if (registro && campo) {
                alerta.valor = registro[campo];
            }
        }

        if (!alerta.descricao) {
            let nome = alerta.tipo === "Rede"
                ? "Perda de pacotes"
                : "Uso de " + alerta.tipo;

            alerta.descricao = nome + " atingiu ou ultrapassou o limite configurado.";
        }
    }

    alertas.sort(function(a, b) {
        return (b.dia + (b.hora || "")).localeCompare(a.dia + (a.hora || ""));
    });

    return {
        dispositivo: json.dispositivo,
        atual: json.atual,
        historico: historico,
        alertas: alertas,
        metricaDominante: json.metricaDominante
    };
}

function campoDaMetrica(tipo) {

    tipo = String(tipo || "").toLowerCase();

    if (tipo.includes("cpu")) return "cpu";
    if (tipo.includes("ram")) return "ram";
    if (tipo.includes("disco")) return "disco";

    if (tipo.includes("rede") || tipo.includes("pacote")) {
        return "pacotes";
    }

    return "";
}

function calcularDataAtras(dias) {

    let data = new Date();

    data.setDate(data.getDate() - Number(dias));
    
    let ano = data.getFullYear();
    let mes = String(data.getMonth() + 1).padStart(2, "0");
    let dia = String(data.getDate()).padStart(2, "0");

    return ano + "-" + mes + "-" + dia;
}

function dataBr(data) {

    if (!data) return "—";

    let partes = data.split("-");

    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function formatarNumero(valor, casas = 0) {

    if (valor === null || valor === undefined || valor === "") {
        return "—";
    }

    return Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}

// Preenche um elemento pelo seu ID
function preencherTexto(id, valor) {

    let elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}

function mostrarErro(mensagem) {

    let principal = document.querySelector("main > div");

    if (!principal) return;

    let aviso = document.createElement("p");

    aviso.className = "mt-8 rounded-xl border border-red-500/30 bg-red-950/20 p-5 text-sm text-red-300";
    aviso.textContent = mensagem;

    principal.appendChild(aviso);
}

function preencherCabecalho() {

    let equipamento = dados.dispositivo;

    preencherTexto("equipamento-titulo", equipamento.nome);
    preencherTexto("equipamento-breadcrumb", equipamento.nome);
    preencherTexto("empresa-breadcrumb", equipamento.empresa);

    preencherTexto(
        "equipamento-categoria",
        equipamento.categoria + " — " + equipamento.modelo
    );

    let status = document.getElementById("equipamento-status");

    if (equipamento.online) {

        status.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="text-emerald-500">Online</span>
        `;

    } else {

        status.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-gray-500"></span>
            <span class="text-gray-400">Offline</span>
        `;
    }
}

function preencherCards() {

    let atual = dados.atual || {};
    let historico = dados.historico;

    let ultimoRegistro = {};

    if (historico.length > 0) {
        ultimoRegistro = historico[historico.length - 1];
    }

    preencherTexto("card-cpu", formatarNumero(atual.cpuGhz, 1) + " GHz");
    preencherTexto("card-ram", formatarNumero(atual.ramGb, 1) + " GB");
    preencherTexto("card-disco", formatarNumero(atual.discoGb, 0) + " GB");
    preencherTexto("card-pacotes", formatarNumero(atual.pacotes));

    let criticos = 0;

    for (let i = 0; i < dados.alertas.length; i++) {
        if (dados.alertas[i].nivel === "Crítico") {
            criticos++;
        }
    }

    preencherTexto("card-alertas-total", dados.alertas.length);
    preencherTexto("card-alertas-criticos", criticos);

    let dominante = dados.metricaDominante || "";

    if (dominante) {
        dominante = campoDaMetrica(dominante);
    }

    if (!dominante) {

        dominante = "cpu";

        if (ultimoRegistro.ram > ultimoRegistro[dominante]) {
            dominante = "ram";
        }

        if (ultimoRegistro.disco > ultimoRegistro[dominante]) {
            dominante = "disco";
        }

        if (ultimoRegistro.pacotes > ultimoRegistro[dominante]) {
            dominante = "pacotes";
        }
    }

    let cardDominante = document.getElementById("card-dominante");

    if (cardDominante) {
        cardDominante.textContent = NOMES[dominante] || "—";
        cardDominante.style.color = CORES[dominante] || "#FFFFFF";
    }

    let conexao = document.getElementById("card-conexao");

    if (dados.dispositivo.online) {
        conexao.textContent = "Online";
        conexao.style.color = CORES.pacotes;
    } else {
        conexao.textContent = "Offline";
        conexao.style.color = "#9CA3AF";
    }

    preencherTexto(
        "card-conexao-legenda",
        dados.dispositivo.online
            ? "Respondendo em " + dados.dispositivo.ip
            : "Sem resposta em " + dados.dispositivo.ip
    );
}

function configurarFiltro(nomeFiltro, atualizar) {

    let botoes = document.querySelectorAll(
        '[data-filtro="' + nomeFiltro + '"] button'
    );

    let personalizado = document.querySelector(
        '[data-personalizado="' + nomeFiltro + '"]'
    );

    if (!botoes.length || !personalizado) return;

    for (let i = 0; i < botoes.length; i++) {

        botoes[i].addEventListener("click", function() {

            for (let j = 0; j < botoes.length; j++) {
                botoes[j].className =
                    "px-4 py-2 text-xs font-semibold rounded-md border border-white/15 text-white/70 hover:border-white hover:text-white transition-colors cursor-pointer";
            }

            this.className =
                "px-4 py-2 text-xs font-semibold rounded-md border border-light-blue bg-light-blue text-main-blue cursor-pointer";

            let periodo = this.dataset.periodo;

            if (periodo === "personalizado") {
                personalizado.classList.remove("hidden");
                return;
            }

            personalizado.classList.add("hidden");

            let dias = 29;

            if (periodo === "semana") {
                dias = 6;
            }

            atualizar(
                calcularDataAtras(dias),
                calcularDataAtras(0)
            );
        });
    }

    let aplicar = personalizado.querySelector("[data-aplicar]");

    if (aplicar) {

        aplicar.addEventListener("click", function() {

            let inicio = personalizado.querySelector("[data-inicio]").value;
            let fim = personalizado.querySelector("[data-fim]").value;

            if (!inicio || !fim) {
                alert("Selecione a data inicial e a data final.");
                return;
            }

            if (inicio > fim) {
                alert("A data inicial não pode ser maior que a data final.");
                return;
            }

            atualizar(inicio, fim);
        });
    }

    let botaoInicial = null;

    for (let i = 0; i < botoes.length; i++) {

        if (botoes[i].dataset.periodo === "mes") {
            botaoInicial = botoes[i];
            break;
        }
    }

    if (!botaoInicial) {
        botaoInicial = botoes[0];
    }

    botaoInicial.click();
}

function mostrarGraficos(dataInicio, dataFim) {

    let filtrado = dados.historico.filter(function(registro) {
        return registro.dia >= dataInicio && registro.dia <= dataFim;
    });

    preencherTexto(
        "periodo-descricao",
        "Uso diário de recursos — " + dataBr(dataInicio) + " até " + dataBr(dataFim)
    );

    desenharGrafico("grafico-cpu", filtrado, "cpu", CORES.cpu);
    desenharGrafico("grafico-ram", filtrado, "ram", CORES.ram);
    desenharGrafico("grafico-disco", filtrado, "disco", CORES.disco);
    desenharGrafico("grafico-pacotes", filtrado, "pacotes", CORES.pacotes);

    let datas = [];

    if (filtrado.length > 0) {

        datas.push(filtrado[0]);

        let meio = Math.floor(filtrado.length / 3);
        let doisTerços = Math.floor(filtrado.length * 2 / 3);

        datas.push(filtrado[meio]);
        datas.push(filtrado[doisTerços]);
        datas.push(filtrado[filtrado.length - 1]);
    }

    let eixos = document.querySelectorAll("[data-eixo-x]");

    for (let i = 0; i < eixos.length; i++) {

        eixos[i].innerHTML = "";

        for (let j = 0; j < datas.length; j++) {

            let texto = document.createElement("span");

            texto.textContent = dataBr(datas[j].dia).slice(0, 5);

            eixos[i].appendChild(texto);
        }
    }
}

function desenharGrafico(id, historico, metrica, cor) {

    let grafico = document.getElementById(id);

    if (!grafico) return;

    grafico.innerHTML = "";

    if (historico.length === 0) {

        grafico.innerHTML =
            '<p class="m-auto text-xs text-white/40">Sem leituras no período</p>';

        return;
    }

    for (let i = 0; i < historico.length; i++) {

        let valor = Number(historico[i][metrica]);

        if (!Number.isFinite(valor)) continue;

        let coluna = document.createElement("div");

        coluna.className = "flex-1 h-full flex items-end min-w-[3px]";

        let barra = document.createElement("div");

        barra.className = "w-full rounded-t-sm transition-all duration-300";

        let altura = valor;

        if (altura < 3) {
            altura = 3;
        }

        if (altura > 100) {
            altura = 100;
        }

        barra.style.height = altura + "%";
        barra.style.backgroundColor = cor;

        barra.title =
            dataBr(historico[i].dia) + ": " + formatarNumero(valor, 1) + "%";

        coluna.appendChild(barra);
        grafico.appendChild(coluna);
    }
}
function mostrarAlertas(dataInicio, dataFim) {

    preencherTexto(
        "alertas-descricao",
        "Registros de eventos do dispositivo — " +
        dataBr(dataInicio) + " até " + dataBr(dataFim)
    );

    let container = document.getElementById("alertas-container");

    if (!container) return;

    let filtrados = dados.alertas.filter(function(alerta) {
        return alerta.dia >= dataInicio && alerta.dia <= dataFim;
    });

    if (filtrados.length === 0) {

        container.innerHTML = `
            <div class="px-5 py-8 text-center text-sm text-white/50">
                Nenhum alerta registrado no período.
            </div>
        `;

        return;
    }

    let linhas = "";

    for (let i = 0; i < filtrados.length; i++) {

        let alerta = filtrados[i];

        let critico = alerta.nivel === "Crítico";

        let cor = critico ? "text-red-400" : "text-amber-400";
        let fundo = critico ? "bg-red-500" : "bg-amber-500";

        let valor = alerta.valor == null
            ? "—"
            : formatarNumero(alerta.valor, 1) + "%";

        let codigo = "ALT-" + String(alerta.id).padStart(3, "0");

        linhas += `
            <tr class="border-b border-white/10 hover:bg-white/[0.03] transition-colors cursor-pointer"
                tabindex="0"
                role="link"
                data-alerta-id="${escapeHTML(alerta.id)}">

                <td class="px-4 py-3 whitespace-nowrap text-white/80">
                    ${dataBr(alerta.dia)}
                    <span class="text-white/40">${escapeHTML(alerta.hora || "—")}</span>
                </td>

                <td class="px-4 py-3 whitespace-nowrap font-medium">
                    ${escapeHTML(alerta.tipo || "—")}
                </td>

                <td class="px-4 py-3 whitespace-nowrap text-white/80">
                    ${valor}
                </td>

                <td class="px-4 py-3 whitespace-nowrap text-white/60">
                    ${alerta.limite == null ? "—" : formatarNumero(alerta.limite) + "%"}
                </td>

                <td class="px-4 py-3 whitespace-nowrap">
                    <span class="inline-flex items-center gap-2 ${cor}">
                        <span class="w-2 h-2 rounded-full ${fundo}"></span>
                        ${escapeHTML(alerta.nivel || "—")}
                    </span>
                </td>

                <td class="px-4 py-3 whitespace-nowrap text-light-blue">
                    ${codigo} →
                </td>
            </tr>
        `;
    }

    container.innerHTML = `
        <div class="w-full overflow-x-auto">
            <table class="w-full min-w-[650px] text-left text-xs">

                <thead>
                    <tr class="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wider text-white/50">
                        <th class="px-4 py-3">Data / Hora</th>
                        <th class="px-4 py-3">Métrica</th>
                        <th class="px-4 py-3">Valor</th>
                        <th class="px-4 py-3">Limite</th>
                        <th class="px-4 py-3">Severidade</th>
                        <th class="px-4 py-3">Detalhes</th>
                    </tr>
                </thead>

                <tbody>${linhas}</tbody>

            </table>
        </div>
    `;

    let linhasTabela = container.querySelectorAll("[data-alerta-id]");

    for (let i = 0; i < linhasTabela.length; i++) {

        linhasTabela[i].addEventListener("click", function() {

            let id = this.getAttribute("data-alerta-id");

            window.location.href =
                "detalheAlerta.html?id=" + encodeURIComponent(id);
        });

        linhasTabela[i].addEventListener("keydown", function(evento) {

            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                this.click();
            }
        });
    }
}

function escapeHTML(valor) {

    return String(valor ?? "").replace(/[&<>"']/g, function(caractere) {

        let caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return caracteres[caractere];
    });
}
