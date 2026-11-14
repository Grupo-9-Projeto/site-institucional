const CORES = {
    cpu: "#38BDF8",
    ram: "#2DD4BF",
    disco: "#A78BFA",
    pacotes: "#22C55E"
};

const NOMES = {
    cpu: "CPU",
    ram: "RAM",
    disco: "Disco",
    pacotes: "Perda de Pacotes"
};

const LIMITES_PADRAO = {
    cpu: 85,
    ram: 85,
    disco: 80,
    pacotes: 30
};

let dados;
let tooltipGraficoEl = null;

let estadoAlertas = {
    inicio: "",
    fim: "",
    severidade: "todos",
    metrica: "todas"
};

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {
    criarTooltipGrafico();
    configurarSubfiltrosAlertas();

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

function criarTooltipGrafico() {
    if (tooltipGraficoEl) return;

    tooltipGraficoEl = document.createElement("div");
    tooltipGraficoEl.id = "tooltip-grafico-argos";
    tooltipGraficoEl.className =
        "fixed z-50 pointer-events-none hidden rounded-lg border border-white/20 bg-[#09121B] px-3 py-2 text-xs text-white transition-opacity duration-150";
    tooltipGraficoEl.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.75)";
    document.body.appendChild(tooltipGraficoEl);

    let areaScroll = document.querySelector("main");
    if (areaScroll) {
        areaScroll.addEventListener("scroll", esconderTooltipGrafico, { passive: true });
    }
    window.addEventListener("resize", esconderTooltipGrafico, { passive: true });
}

function mostrarTooltipGrafico(alvo, dia, valor, cor) {
    if (!tooltipGraficoEl) criarTooltipGrafico();

    let dataFormatada = dataBr(dia);
    let mediaFormatada = formatarNumero(valor, 1) + "%";

    tooltipGraficoEl.innerHTML = `
        <div class="text-[11px] font-medium text-white/60 leading-tight">${escapeHTML(dataFormatada)}</div>
        <div class="mt-1 flex items-center gap-1.5 leading-tight">
            <span class="inline-block w-2 h-2 rounded-full shrink-0" style="background-color: ${cor};"></span>
            <span class="text-white/75">Média:</span>
            <strong class="font-bold text-white">${escapeHTML(mediaFormatada)}</strong>
        </div>
    `;

    tooltipGraficoEl.classList.remove("hidden");

    let rectAlvo = alvo.getBoundingClientRect();
    let rectTooltip = tooltipGraficoEl.getBoundingClientRect();

    let esquerda = rectAlvo.left + rectAlvo.width / 2 - rectTooltip.width / 2;
    let margem = 12;
    if (esquerda < margem) {
        esquerda = margem;
    } else if (esquerda + rectTooltip.width > window.innerWidth - margem) {
        esquerda = window.innerWidth - rectTooltip.width - margem;
    }

    let topo = rectAlvo.top - rectTooltip.height - 10;
    if (topo < margem) {
        topo = rectAlvo.bottom + 10;
    }

    tooltipGraficoEl.style.left = Math.round(esquerda) + "px";
    tooltipGraficoEl.style.top = Math.round(topo) + "px";
}

function esconderTooltipGrafico() {
    if (tooltipGraficoEl) {
        tooltipGraficoEl.classList.add("hidden");
    }
}

function animarEntradaBarra(barra, indice) {
    barra.style.transformOrigin = "bottom center";
    barra.style.transform = "scaleY(0)";
    barra.style.opacity = "0.4";

    let atraso = Math.min(indice * 12, 240);
    setTimeout(function () {
        if (barra.dataset.hoverAtivo === "1") return;
        barra.style.transition =
            "transform 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease-out";
        barra.style.transform = "scaleY(1)";
        barra.style.opacity = "1";
    }, 20 + atraso);
}

function vincularInteracaoBarra(coluna, barra, dia, valor, cor) {
    coluna.className = "relative flex-1 h-full flex items-end min-w-[3px] cursor-pointer";
    barra.style.transformOrigin = "bottom center";

    coluna.addEventListener("mouseenter", function () {
        barra.dataset.hoverAtivo = "1";
        coluna.style.zIndex = "20";
        barra.style.opacity = "1";
        barra.style.transition =
            "transform 180ms ease-out, filter 180ms ease-out, box-shadow 180ms ease-out";
        barra.style.transform = "scaleY(1.06) scaleX(1.25)";
        barra.style.filter = "brightness(1.22)";
        barra.style.boxShadow = "0 0 12px " + cor + "66";
        mostrarTooltipGrafico(barra, dia, valor, cor);
    });

    coluna.addEventListener("mouseleave", function () {
        barra.dataset.hoverAtivo = "0";
        coluna.style.zIndex = "auto";
        barra.style.transition =
            "transform 180ms ease-out, filter 180ms ease-out, box-shadow 180ms ease-out";
        barra.style.transform = "scaleY(1) scaleX(1)";
        barra.style.filter = "none";
        barra.style.boxShadow = "none";
        esconderTooltipGrafico();
    });
}

function animarContagemPercentual(elemento, valorFinal, duracaoMs = 680) {
    if (!elemento || !Number.isFinite(valorFinal)) return;

    let inicioTempo = null;

    function atualizarQuadro(timestamp) {
        if (!inicioTempo) inicioTempo = timestamp;
        let decorrido = timestamp - inicioTempo;
        let progresso = Math.min(decorrido / duracaoMs, 1);
        let suavizado = 1 - Math.pow(1 - progresso, 3);
        let valorAtual = valorFinal * suavizado;

        elemento.textContent = formatarNumero(valorAtual, 1) + "%";

        if (progresso < 1) {
            requestAnimationFrame(atualizarQuadro);
        } else {
            elemento.textContent = formatarNumero(valorFinal, 1) + "%";
        }
    }

    requestAnimationFrame(atualizarQuadro);
}

function obterNivelAlerta(alerta) {
    let temValor =
        alerta.valor !== null &&
        alerta.valor !== undefined &&
        alerta.valor !== "" &&
        Number.isFinite(Number(alerta.valor));
    let temLimite =
        alerta.limite !== null &&
        alerta.limite !== undefined &&
        alerta.limite !== "" &&
        Number.isFinite(Number(alerta.limite));

    if (temValor && temLimite) {
        return Number(alerta.valor) >= Number(alerta.limite) ? "Crítico" : "Atenção";
    }

    let nivelOriginal = String(alerta.nivel || "").toLowerCase();
    if (nivelOriginal.includes("crítico") || nivelOriginal.includes("critico")) {
        return "Crítico";
    }
    return "Atenção";
}

function prepararDados(json) {
    let historico = json.historico || [];
    for (let i = 0; i < historico.length; i++) {
        if (!historico[i].data) {
            historico[i].data = calcularDataAtras(historico[i].diasAtras || 0);
        }
        historico[i].dia = historico[i].data;
    }

    historico.sort(function (a, b) {
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

        alerta.nivel = obterNivelAlerta(alerta);

        if (!alerta.descricao) {
            let nome = campo === "pacotes"
                ? "Perda de pacotes"
                : "Uso de " + alerta.tipo;
            alerta.descricao =
                alerta.nivel === "Crítico"
                    ? nome + " atingiu ou ultrapassou o limite configurado."
                    : nome + " entrou na faixa de atenção próxima ao limite.";
        }
    }

    alertas.sort(function (a, b) {
        return (b.dia + (b.hora || "")).localeCompare(a.dia + (a.hora || ""));
    });

    let limitesConfig = extrairLimites(json.limites, json.limitesAtencao, alertas);

    return {
        dispositivo: json.dispositivo,
        atual: json.atual,
        historico: historico,
        alertas: alertas,
        limites: limitesConfig.critico,
        limitesAtencao: limitesConfig.atencao,
        metricaDominante: json.metricaDominante
    };
}

function extrairLimites(limitesJson, limitesAtencaoJson, alertasOrdenados) {
    let limites = {
        cpu: LIMITES_PADRAO.cpu,
        ram: LIMITES_PADRAO.ram,
        disco: LIMITES_PADRAO.disco,
        pacotes: LIMITES_PADRAO.pacotes
    };

    let encontrados = {};
    for (let i = 0; i < alertasOrdenados.length; i++) {
        let alerta = alertasOrdenados[i];
        let campo = campoDaMetrica(alerta.tipo);
        if (campo && !encontrados[campo] && alerta.limite != null) {
            limites[campo] = Number(alerta.limite);
            encontrados[campo] = true;
        }
    }

    if (limitesJson) {
        if (limitesJson.cpu != null) limites.cpu = Number(limitesJson.cpu);
        if (limitesJson.ram != null) limites.ram = Number(limitesJson.ram);
        if (limitesJson.disco != null) limites.disco = Number(limitesJson.disco);
        if (limitesJson.pacotes != null) limites.pacotes = Number(limitesJson.pacotes);
    }

    let limitesAtencao = {
        cpu: Math.max(limites.cpu - 10, 0),
        ram: Math.max(limites.ram - 10, 0),
        disco: Math.max(limites.disco - 10, 0),
        pacotes: Math.round(limites.pacotes * 0.5)
    };

    if (limitesAtencaoJson) {
        if (limitesAtencaoJson.cpu != null) limitesAtencao.cpu = Number(limitesAtencaoJson.cpu);
        if (limitesAtencaoJson.ram != null) limitesAtencao.ram = Number(limitesAtencaoJson.ram);
        if (limitesAtencaoJson.disco != null) limitesAtencao.disco = Number(limitesAtencaoJson.disco);
        if (limitesAtencaoJson.pacotes != null) limitesAtencao.pacotes = Number(limitesAtencaoJson.pacotes);
    }

    return {
        critico: limites,
        atencao: limitesAtencao
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
    let atual = dados.atual || {};
    let ultimoRegistro = dados.historico.length > 0
        ? dados.historico[dados.historico.length - 1]
        : {};

    preencherTexto("equipamento-titulo", equipamento.nome);
    preencherTexto("equipamento-breadcrumb", equipamento.nome);
    preencherTexto("empresa-breadcrumb", equipamento.empresa);
    preencherTexto(
        "equipamento-categoria",
        equipamento.categoria + " • " + equipamento.modelo
    );

    preencherTexto("equipamento-ip", equipamento.ip || "—");
    preencherTexto("equipamento-mac", equipamento.mac || equipamento.enderecoMac || "—");
    preencherTexto("equipamento-ultima-coleta", atual.hora || "—");

    let discoPct = ultimoRegistro.disco != null ? formatarNumero(ultimoRegistro.disco, 1) + "%" : "—";
    let discoGb = atual.discoGb != null ? " (" + formatarNumero(atual.discoGb, 0) + " GB)" : "";
    preencherTexto("equipamento-disco-resumo", discoPct + discoGb);

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
    let ultimoRegistro = historico.length > 0
        ? historico[historico.length - 1]
        : {};

    let cpuPct = Number(ultimoRegistro.cpu);
    let ramPct = Number(ultimoRegistro.ram);
    let pacotesPct = Number(ultimoRegistro.pacotes);

    preencherTexto("card-cpu-ghz", atual.cpuGhz != null ? formatarNumero(atual.cpuGhz, 1) + " GHz" : "—");
    preencherTexto("card-ram-gb", atual.ramGb != null ? formatarNumero(atual.ramGb, 1) + " GB" : "—");
    preencherTexto("card-pacotes-abs", atual.pacotes != null ? formatarNumero(atual.pacotes) + " pct coletados" : "—");

    atualizarCardMetrica({
        valor: cpuPct,
        limite: dados.limites.cpu,
        limiteAtencao: dados.limitesAtencao.cpu,
        corBase: "#38BDF8",
        bordaBase: "border-t-light-blue",
        idCard: "kpi-card-cpu",
        idValor: "card-cpu",
        idBarra: "barra-kpi-cpu",
        idLimite: "card-cpu-limite"
    });

    atualizarCardMetrica({
        valor: ramPct,
        limite: dados.limites.ram,
        limiteAtencao: dados.limitesAtencao.ram,
        corBase: "#2DD4BF",
        bordaBase: "border-t-teal-400",
        idCard: "kpi-card-ram",
        idValor: "card-ram",
        idBarra: "barra-kpi-ram",
        idLimite: "card-ram-limite"
    });

    atualizarCardMetrica({
        valor: pacotesPct,
        limite: dados.limites.pacotes,
        limiteAtencao: dados.limitesAtencao.pacotes,
        corBase: "#22C55E",
        bordaBase: "border-t-emerald-400",
        idCard: "kpi-card-pacotes",
        idValor: "card-pacotes",
        idBarra: "barra-kpi-pacotes",
        idLimite: "card-pacotes-limite"
    });

    let criticos = 0;
    for (let i = 0; i < dados.alertas.length; i++) {
        if (obterNivelAlerta(dados.alertas[i]) === "Crítico") {
            criticos++;
        }
    }

    let dominante = dados.metricaDominante ? campoDaMetrica(dados.metricaDominante) : "";
    if (!dominante) {
        dominante = "cpu";
        if (ramPct > Number(ultimoRegistro[dominante] || 0)) dominante = "ram";
        if (pacotesPct > Number(ultimoRegistro[dominante] || 0)) dominante = "pacotes";
    }
    preencherTexto("card-dominante", "Dominante: " + (NOMES[dominante] || "—"));

    let saudeStatus = document.getElementById("card-saude-status");
    let saudeCard = document.getElementById("kpi-card-saude");
    let pulsoSaude = document.getElementById("indicador-pulso-saude");
    let acimaDoLimite = [
        cpuPct >= dados.limites.cpu,
        ramPct >= dados.limites.ram,
        pacotesPct >= dados.limites.pacotes
    ].filter(Boolean).length;

    let estadoTexto = "Estável";
    let estadoCor = "#22C55E";
    let estadoBorda = "border-t-emerald-400";
    let isCritico = false;

    if (!dados.dispositivo.online) {
        estadoTexto = "Offline";
        estadoCor = "#9CA3AF";
        estadoBorda = "border-t-gray-500";
    } else if (cpuPct >= 90 || ramPct >= 90 || acimaDoLimite >= 2) {
        estadoTexto = "Crítico";
        estadoCor = "#EF4444";
        estadoBorda = "border-t-red-500";
        isCritico = true;
    } else if (acimaDoLimite === 1) {
        estadoTexto = "Atenção";
        estadoCor = "#F59E0B";
        estadoBorda = "border-t-amber-400";
    }

    if (saudeStatus) {
        saudeStatus.textContent = estadoTexto;
        saudeStatus.style.color = estadoCor;
    }
    if (pulsoSaude) {
        if (isCritico) {
            pulsoSaude.classList.remove("hidden");
        } else {
            pulsoSaude.classList.add("hidden");
        }
    }
    if (saudeCard) {
        saudeCard.classList.remove("border-t-emerald-400", "border-t-amber-400", "border-t-red-500", "border-t-gray-500");
        saudeCard.classList.add(estadoBorda);
    }

    preencherTexto(
        "card-alertas-resumo",
        criticos + " crítico" + (criticos === 1 ? "" : "s") + " de " + dados.alertas.length + " alertas registrados"
    );
}

function atualizarCardMetrica(cfg) {
    let elCard = document.getElementById(cfg.idCard);
    let elValor = document.getElementById(cfg.idValor);
    let elBarra = document.getElementById(cfg.idBarra);
    let elLimite = document.getElementById(cfg.idLimite);

    if (!Number.isFinite(cfg.valor)) {
        if (elValor) elValor.textContent = "—";
        return;
    }

    let excedeu = cfg.valor >= cfg.limite;
    let proximo = !excedeu && cfg.valor >= cfg.limiteAtencao;

    let corFinal = cfg.corBase;
    let bordaFinal = cfg.bordaBase;

    if (excedeu) {
        corFinal = "#EF4444";
        bordaFinal = "border-t-red-500";
    } else if (proximo) {
        corFinal = "#F59E0B";
        bordaFinal = "border-t-amber-400";
    }

    if (elCard) {
        elCard.classList.remove("border-t-light-blue", "border-t-teal-400", "border-t-amber-400", "border-t-emerald-400", "border-t-red-500");
        elCard.classList.add(bordaFinal);
    }

    if (elValor) {
        elValor.style.color = corFinal;
        animarContagemPercentual(elValor, cfg.valor, 680);
    }

    if (elBarra) {
        let largura = Math.min(Math.max(cfg.valor, 0), 100);
        elBarra.style.width = "0%";
        elBarra.style.backgroundColor = corFinal;
        requestAnimationFrame(function () {
            elBarra.style.width = largura + "%";
        });
    }

    if (elLimite) {
        let diferenca = Math.abs(cfg.valor - cfg.limite);
        let complemento = excedeu
            ? "+" + formatarNumero(diferenca, 1) + "% acima"
            : "folga de " + formatarNumero(diferenca, 1) + "%";
        elLimite.textContent = "Limite: " + cfg.limite + "% • " + complemento;
    }
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
        botoes[i].addEventListener("click", function () {
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
        aplicar.addEventListener("click", function () {
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
    esconderTooltipGrafico();

    let filtrado = dados.historico.filter(function (registro) {
        return registro.dia >= dataInicio && registro.dia <= dataFim;
    });

    preencherTexto(
        "periodo-descricao",
        "Uso diário de recursos • " + dataBr(dataInicio) + " até " + dataBr(dataFim)
    );

    desenharGrafico(
        "grafico-cpu",
        filtrado,
        "cpu",
        CORES.cpu,
        dados.limites.cpu,
        dados.limitesAtencao.cpu
    );
    desenharGrafico(
        "grafico-ram",
        filtrado,
        "ram",
        CORES.ram,
        dados.limites.ram,
        dados.limitesAtencao.ram
    );
    desenharGrafico(
        "grafico-disco",
        filtrado,
        "disco",
        CORES.disco,
        dados.limites.disco,
        dados.limitesAtencao.disco
    );
    desenharGraficoPerdaPacotes(
        "grafico-pacotes",
        filtrado,
        dados.limites.pacotes,
        dados.limitesAtencao.pacotes
    );

    let datas = [];
    if (filtrado.length > 0) {
        datas.push(filtrado[0]);
        let meio = Math.floor(filtrado.length / 3);
        let doisTercos = Math.floor(filtrado.length * 2 / 3);
        datas.push(filtrado[meio]);
        datas.push(filtrado[doisTercos]);
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

function renderizarLinhasLimiar(grafico, limiteCritico, limiteAtencao, tetoEscala) {
    if (Number.isFinite(limiteAtencao) && limiteAtencao > 0 && limiteAtencao < limiteCritico) {
        let posAtencao = (limiteAtencao / tetoEscala) * 100;
        if (posAtencao > 0 && posAtencao < 100) {
            let linhaAtencao = document.createElement("div");
            linhaAtencao.className =
                "pointer-events-none absolute inset-x-0 border-t border-dashed border-amber-400/75 z-10";
            linhaAtencao.style.bottom = posAtencao + "%";
            grafico.appendChild(linhaAtencao);
        }
    }

    if (Number.isFinite(limiteCritico) && limiteCritico > 0) {
        let posCritico = (limiteCritico / tetoEscala) * 100;
        if (posCritico > 0 && posCritico <= 100) {
            let linhaLimite = document.createElement("div");
            linhaLimite.className =
                "pointer-events-none absolute inset-x-0 border-t border-dashed border-red-400/80 z-10";
            linhaLimite.style.bottom = posCritico + "%";
            grafico.appendChild(linhaLimite);
        }
    }
}

function desenharGrafico(id, historico, metrica, cor, limiteCritico, limiteAtencao) {
    let grafico = document.getElementById(id);
    if (!grafico) return;
    grafico.innerHTML = "";

    preencherTexto("atencao-label-" + metrica, limiteAtencao + "%");
    preencherTexto("limite-label-" + metrica, limiteCritico + "%");

    if (historico.length === 0) {
        preencherTexto("media-" + metrica, "—");
        preencherTexto("pico-" + metrica, "—");
        grafico.innerHTML =
            '<div class="h-full flex items-center justify-center"><p class="text-xs text-white/40">Sem leituras no período</p></div>';
        return;
    }

    let soma = 0;
    let contagem = 0;
    let pico = -Infinity;

    let containerBarras = document.createElement("div");
    containerBarras.className = "relative z-0 h-full flex items-end gap-[5px]";

    for (let i = 0; i < historico.length; i++) {
        let valor = Number(historico[i][metrica]);
        if (!Number.isFinite(valor)) continue;

        soma += valor;
        contagem++;
        if (valor > pico) pico = valor;

        let coluna = document.createElement("div");
        let barra = document.createElement("div");
        barra.className = "w-full rounded-t-sm";

        let altura = Math.min(Math.max(valor, 3), 100);
        let corBarra = cor;
        if (valor >= limiteCritico) {
            corBarra = "#EF4444";
        } else if (valor >= limiteAtencao) {
            corBarra = "#F59E0B";
        }

        barra.style.height = altura + "%";
        barra.style.backgroundColor = corBarra;

        vincularInteracaoBarra(coluna, barra, historico[i].dia, valor, corBarra);
        animarEntradaBarra(barra, i);

        coluna.appendChild(barra);
        containerBarras.appendChild(coluna);
    }

    grafico.appendChild(containerBarras);
    renderizarLinhasLimiar(grafico, limiteCritico, limiteAtencao, 100);

    let media = contagem > 0 ? soma / contagem : 0;
    preencherTexto("media-" + metrica, formatarNumero(media, 1) + "%");
    preencherTexto("pico-" + metrica, contagem > 0 ? formatarNumero(pico, 1) + "%" : "—");
}

function calcularTetoEscala(maiorValor) {
    if (maiorValor <= 5) return 5;
    if (maiorValor <= 10) return 10;
    if (maiorValor <= 20) return 20;
    if (maiorValor <= 40) return 40;
    if (maiorValor <= 60) return 60;
    return 100;
}

function desenharGraficoPerdaPacotes(id, historico, limiteCritico, limiteAtencao) {
    let grafico = document.getElementById(id);
    if (!grafico) return;
    grafico.innerHTML = "";

    preencherTexto("atencao-label-pacotes", limiteAtencao + "%");
    preencherTexto("limite-label-pacotes", limiteCritico + "%");

    if (historico.length === 0) {
        preencherTexto("media-pacotes", "—");
        preencherTexto("pico-pacotes", "—");
        grafico.innerHTML =
            '<div class="h-full flex items-center justify-center"><p class="text-xs text-white/40">Sem leituras no período</p></div>';
        return;
    }

    let soma = 0;
    let contagem = 0;
    let pico = 0;

    for (let i = 0; i < historico.length; i++) {
        let v = Number(historico[i].pacotes);
        if (!Number.isFinite(v)) continue;
        soma += v;
        contagem++;
        if (v > pico) pico = v;
    }

    let tetoY = calcularTetoEscala(Math.max(pico, limiteCritico) * 1.15);

    let eixoY = document.getElementById("eixo-y-pacotes");
    if (eixoY) {
        eixoY.innerHTML = `
            <span>${tetoY}%</span>
            <span>${formatarNumero(tetoY / 2, tetoY % 2 === 0 ? 0 : 1)}%</span>
            <span>0%</span>
        `;
    }

    let containerBarras = document.createElement("div");
    containerBarras.className = "relative z-0 h-full flex items-end gap-[5px]";

    for (let i = 0; i < historico.length; i++) {
        let valor = Number(historico[i].pacotes);
        if (!Number.isFinite(valor)) continue;

        let coluna = document.createElement("div");
        let barra = document.createElement("div");
        barra.className = "w-full rounded-t-sm";

        let percentualEscala = Math.min((valor / tetoY) * 100, 100);
        let corBarra = "#22C55E";

        if (valor <= 0) {
            barra.style.height = "2px";
            corBarra = "#64748B";
        } else if (valor >= limiteCritico) {
            barra.style.height = Math.max(percentualEscala, 3) + "%";
            corBarra = "#EF4444";
        } else if (valor >= limiteAtencao) {
            barra.style.height = Math.max(percentualEscala, 3) + "%";
            corBarra = "#F59E0B";
        } else {
            barra.style.height = Math.max(percentualEscala, 3) + "%";
            corBarra = "#22C55E";
        }

        barra.style.backgroundColor = corBarra;

        vincularInteracaoBarra(coluna, barra, historico[i].dia, valor, corBarra);
        animarEntradaBarra(barra, i);

        coluna.appendChild(barra);
        containerBarras.appendChild(coluna);
    }

    grafico.appendChild(containerBarras);
    renderizarLinhasLimiar(grafico, limiteCritico, limiteAtencao, tetoY);

    let media = contagem > 0 ? soma / contagem : 0;
    preencherTexto("media-pacotes", formatarNumero(media, 1) + "%");
    preencherTexto("pico-pacotes", formatarNumero(pico, 1) + "%");
}

function configurarSubfiltrosAlertas() {
    let containerSev = document.getElementById("filtro-alerta-severidade");
    if (containerSev) {
        containerSev.addEventListener("click", function (evento) {
            let botao = evento.target.closest("button[data-sev]");
            if (!botao) return;

            let todosBotoes = containerSev.querySelectorAll("button[data-sev]");
            for (let i = 0; i < todosBotoes.length; i++) {
                todosBotoes[i].className =
                    "px-3 py-1 text-xs font-semibold rounded-md border border-white/15 text-white/70 hover:border-white hover:text-white cursor-pointer transition-colors";
            }
            botao.className =
                "px-3 py-1 text-xs font-semibold rounded-md border border-light-blue bg-light-blue text-main-blue cursor-pointer transition-colors";

            estadoAlertas.severidade = botao.dataset.sev || "todos";
            if (dados) {
                renderizarTabelaAlertas();
            }
        });
    }

    let selectMetrica = document.getElementById("filtro-alerta-metrica");
    if (selectMetrica) {
        selectMetrica.addEventListener("change", function () {
            estadoAlertas.metrica = this.value || "todas";
            if (dados) {
                renderizarTabelaAlertas();
            }
        });
    }
}

function mostrarAlertas(dataInicio, dataFim) {
    estadoAlertas.inicio = dataInicio;
    estadoAlertas.fim = dataFim;
    renderizarTabelaAlertas();
}

function obterStatusAlerta(alerta) {
    if (alerta.status) {
        let s = String(alerta.status).trim().toLowerCase();
        if (s === "pendente" || s === "ativo" || s === "aberto") return "Pendente";
        if (s.includes("atendimento")) return "Em atendimento";
        if (s === "resolvido") return "Resolvido";
        return alerta.status;
    }

    let dias = Number(alerta.diasAtras);
    if (dias === 0) return "Pendente";
    if (dias <= 5) return "Em atendimento";
    return "Resolvido";
}

function obterEstiloStatus(statusTexto) {
    let s = String(statusTexto || "").toLowerCase();
    if (s === "pendente" || s === "ativo") {
        return {
            badge: "bg-red-500/10 text-red-400 border border-red-500/30",
            dot: "bg-red-500 animate-pulse"
        };
    }
    if (s.includes("atendimento")) {
        return {
            badge: "bg-orange-500/10 text-orange-500 border border-orange-500/30",
            dot: "bg-orange-500"
        };
    }
    return {
        badge: "bg-emerald-900/40 text-emerald-400 border border-emerald-800/50",
        dot: "bg-emerald-500"
    };
}

function renderizarTabelaAlertas() {
    if (!dados) return;

    let dataInicio = estadoAlertas.inicio || calcularDataAtras(29);
    let dataFim = estadoAlertas.fim || calcularDataAtras(0);

    preencherTexto(
        "alertas-descricao",
        "Registros de eventos do dispositivo • " +
        dataBr(dataInicio) + " até " + dataBr(dataFim)
    );

    let container = document.getElementById("alertas-container");
    if (!container) return;

    let noPeriodo = dados.alertas.filter(function (alerta) {
        return alerta.dia >= dataInicio && alerta.dia <= dataFim;
    });

    let totalCriticos = 0;
    let totalAtencao = 0;
    for (let i = 0; i < noPeriodo.length; i++) {
        if (obterNivelAlerta(noPeriodo[i]) === "Crítico") {
            totalCriticos++;
        } else {
            totalAtencao++;
        }
    }

    preencherTexto(
        "alertas-badge-criticos",
        totalCriticos + (totalCriticos === 1 ? " crítico" : " críticos")
    );
    preencherTexto("alertas-badge-atencao", totalAtencao + " atenção");

    let filtrados = noPeriodo.filter(function (alerta) {
        let nivelCalculado = obterNivelAlerta(alerta);
        let isCritico = nivelCalculado === "Crítico";

        if (estadoAlertas.severidade === "critico" && !isCritico) return false;
        if (estadoAlertas.severidade === "atencao" && isCritico) return false;

        if (estadoAlertas.metrica !== "todas") {
            let campo = campoDaMetrica(alerta.tipo);
            if (campo !== estadoAlertas.metrica) return false;
        }

        return true;
    });

    if (filtrados.length === 0) {
        container.innerHTML = `
            <div class="px-5 py-10 text-center">
                <p class="text-sm text-white/60">Nenhum alerta encontrado para os filtros selecionados.</p>
                <p class="text-xs text-white/40 mt-1">Tente ampliar o período ou alterar o filtro de severidade/métrica.</p>
            </div>
        `;
        return;
    }

    let linhas = "";
    for (let i = 0; i < filtrados.length; i++) {
        let alerta = filtrados[i];
        let nivelCalculado = obterNivelAlerta(alerta);
        let critico = nivelCalculado === "Crítico";

        let badgeSev = critico
            ? "bg-red-500/10 border border-red-500/30 text-red-400"
            : "bg-amber-500/10 border border-amber-500/30 text-amber-400";
        let dotSev = critico ? "bg-red-500" : "bg-amber-400";

        let campo = campoDaMetrica(alerta.tipo);
        let nomeMetrica = NOMES[campo] || alerta.tipo || "—";

        let temValor = alerta.valor != null && Number.isFinite(Number(alerta.valor));
        let temLimite = alerta.limite != null && Number.isFinite(Number(alerta.limite));
        let valorFmt = temValor ? formatarNumero(alerta.valor, 1) + "%" : "—";
        let limiteFmt = temLimite ? formatarNumero(alerta.limite, 0) + "%" : "—";

        let badgeExcedente = "";
        if (temValor && temLimite) {
            let diff = Number(alerta.valor) - Number(alerta.limite);
            if (diff > 0) {
                badgeExcedente = `<span class="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400">+${formatarNumero(diff, 1)}%</span>`;
            }
        }

        let statusTexto = obterStatusAlerta(alerta);
        let estiloStatus = obterEstiloStatus(statusTexto);

        let tagHoje = Number(alerta.diasAtras) === 0
            ? `<span class="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase bg-light-blue/15 text-light-blue">Hoje</span>`
            : "";

        let codigo = "ALT-" + String(alerta.id).padStart(3, "0");

        linhas += `
            <tr class="group border-b border-white/10 last:border-b-0 border-l-2 border-l-transparent hover:border-l-light-blue hover:bg-white/[0.04] transition-all duration-150 cursor-pointer"
                tabindex="0"
                role="link"
                data-alerta-id="${escapeHTML(alerta.id)}">
                <td class="px-4 py-3.5 whitespace-nowrap">
                    <div class="text-white/90 font-medium">${dataBr(alerta.dia)}${tagHoje}</div>
                    <div class="text-[11px] text-white/40 mt-0.5">${escapeHTML(alerta.hora || "—")}</div>
                </td>
                <td class="px-4 py-3.5">
                    <div class="font-semibold text-white/90 group-hover:text-white transition-colors">${escapeHTML(nomeMetrica)}</div>
                    <div class="text-[11px] text-white/50 mt-0.5 line-clamp-1">${escapeHTML(alerta.descricao || "")}</div>
                </td>
                <td class="px-4 py-3.5 whitespace-nowrap">
                    <div class="font-semibold text-white/90">${valorFmt}${badgeExcedente}</div>
                    <div class="text-[11px] text-white/45 mt-0.5">Limite: ${limiteFmt}</div>
                </td>
                <td class="px-4 py-3.5 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${badgeSev}">
                        <span class="w-1.5 h-1.5 rounded-full ${dotSev}"></span>
                        ${escapeHTML(nivelCalculado)}
                    </span>
                </td>
                <td class="px-4 py-3.5 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${estiloStatus.badge}">
                        <span class="w-1.5 h-1.5 rounded-full ${estiloStatus.dot}"></span>
                        ${escapeHTML(statusTexto)}
                    </span>
                </td>
                <td class="px-4 py-3.5 whitespace-nowrap text-right">
                    <span class="inline-flex items-center gap-1 font-semibold text-light-blue group-hover:underline">
                        ${codigo}
                        <span aria-hidden="true" class="transition-transform duration-150 group-hover:translate-x-1">&rarr;</span>
                    </span>
                </td>
            </tr>
        `;
    }

    container.innerHTML = `
        <div class="w-full overflow-x-auto">
            <table class="w-full min-w-[760px] text-left text-xs">
                <thead>
                    <tr class="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wider text-white/50">
                        <th class="px-4 py-3">Data / Hora</th>
                        <th class="px-4 py-3">Métrica / Evento</th>
                        <th class="px-4 py-3">Leitura vs. Limite</th>
                        <th class="px-4 py-3">Severidade</th>
                        <th class="px-4 py-3">Status</th>
                        <th class="px-4 py-3 text-right">Detalhes</th>
                    </tr>
                </thead>
                <tbody>${linhas}</tbody>
            </table>
        </div>
    `;

    let linhasTabela = container.querySelectorAll("[data-alerta-id]");
    for (let i = 0; i < linhasTabela.length; i++) {
        linhasTabela[i].addEventListener("click", function () {
            let id = this.getAttribute("data-alerta-id");
            window.location.href =
                "detalheAlerta.html?id=" + encodeURIComponent(id);
        });
        linhasTabela[i].addEventListener("keydown", function (evento) {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                this.click();
            }
        });
    }
}

function escapeHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, function (caractere) {
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