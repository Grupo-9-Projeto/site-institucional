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

const JIRA_BASE_URL = "https://argos-cisco.atlassian.net/browse";

let dados;
let tooltipGraficoEl = null;
let estadoAlertas = {
    inicio: "",
    fim: "",
    severidade: "todos",
    metrica: "todas"
};

document.addEventListener("DOMContentLoaded", iniciar);

function obterIdEquipamento() {
    const params = new URLSearchParams(window.location.search);
    let id = params.get("idEquipamento") || params.get("idDispositivo") || params.get("id");
    if (!id) {
        const match = window.location.search.match(/idEquipamento=(\d+)/i);
        if (match) id = match[1];
    }
    return id || sessionStorage.getItem("ID_DISPOSITIVO") || "";
}

async function iniciar() {
    if (!exigirAnalista()) return;

    criarTooltipGrafico();
    configurarSubfiltrosAlertas();
    carregarInformacoesUsuario();

    const idDispositivo = obterIdEquipamento();
    if (!idDispositivo) {
        mostrarErro("ID do equipamento não informado na URL.");
        return;
    }

    try {
        const resposta = await apiFetch(`/lucas/equipamento/${encodeURIComponent(idDispositivo)}`, {
            method: "GET"
        });

        if (!resposta.ok || !resposta.dados) {
            throw new Error("Erro ao carregar os dados do equipamento.");
        }

        dados = prepararDados(resposta.dados);
        preencherCabecalho();
        preencherCards();
        configurarFiltro("registros", mostrarGraficos);
        configurarFiltro("alertas", mostrarAlertas);
    } catch (erro) {
        if (erro && erro.sessaoExpirada) return;
        console.log(erro);
        mostrarErro("Não foi possível carregar os dados do equipamento.");
    }
}

async function carregarInformacoesUsuario() {
    try {
        const resposta = await apiFetch("/usuarios/informacoes_usuario", {
            method: "GET"
        });

        if (!resposta.ok || !Array.isArray(resposta.dados) || resposta.dados.length === 0) {
            return;
        }

        const nome = String(resposta.dados[0].nome || "").trim();
        if (!nome) return;

        preencherTexto("nome_title", nome);
        preencherTexto("foto_usuario", nome.charAt(0).toUpperCase());
    } catch (erro) {
        if (erro && erro.sessaoExpirada) return;
        console.log("Erro ao carregar informações do usuário:", erro);
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

function isStatusJiraConcluido(statusJira) {
    if (!statusJira) return false;
    let s = String(statusJira).toLowerCase();
    return s.includes("conclu") || s.includes("done") || s.includes("resol") || s.includes("fechad");
}

function obterNivelAlerta(alerta) {
    let nivelOriginal = String(alerta.nivel || alerta.nivel_alerta || "").toLowerCase().trim();
    if (nivelOriginal.includes("crítico") || nivelOriginal.includes("critico")) {
        return "Crítico";
    }
    if (nivelOriginal.includes("alto")) {
        return "Alto";
    }
    if (nivelOriginal.includes("atenção") || nivelOriginal.includes("atencao")) {
        return "Atenção";
    }

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
            if (alerta.valor_registrado !== undefined && alerta.valor_registrado !== null) {
                alerta.valor = Number(alerta.valor_registrado);
            } else if (registro && campo) {
                alerta.valor = registro[campo];
            }
        }

        alerta.nivel = obterNivelAlerta(alerta);
        alerta.unidade = alerta.unidade || alerta.unidade_medida || "%";
        alerta.componente = alerta.componente || alerta.tipo || "—";
        alerta.jiraKey = alerta.jiraKey || alerta.jira_key || null;
        alerta.statusJira = alerta.statusJira || alerta.status_jira || null;
        alerta.resolvido = Boolean(alerta.resolvido) || isStatusJiraConcluido(alerta.statusJira);

        if (!alerta.descricao) {
            let nome = campo === "pacotes"
                ? "Perda de pacotes"
                : "Uso de " + (alerta.componente || alerta.tipo);
            if (alerta.nivel === "Crítico") {
                alerta.descricao = nome + " atingiu ou ultrapassou o limite crítico configurado.";
            } else if (alerta.nivel === "Alto") {
                alerta.descricao = nome + " atingiu nível alto de utilização.";
            } else {
                alerta.descricao = nome + " entrou na faixa de atenção.";
            }
        }
    }

    alertas.sort(function (a, b) {
        return (b.dia + (b.hora || "")).localeCompare(a.dia + (a.hora || ""));
    });

    let limitesConfig = extrairLimites(json.limites, json.limitesAlto, json.limitesAtencao, alertas);

    return {
        dispositivo: json.dispositivo,
        atual: json.atual,
        historico: historico,
        alertas: alertas,
        limites: limitesConfig.critico,
        limitesAlto: limitesConfig.alto,
        limitesAtencao: limitesConfig.atencao,
        metricaDominante: json.metricaDominante
    };
}

function extrairLimites(limitesJson, limitesAltoJson, limitesAtencaoJson, alertasOrdenados) {
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
        if (campo && !encontrados[campo] && alerta.limite != null && alerta.nivel === "Crítico") {
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

    let limitesAlto = {
        cpu: Math.max(limites.cpu - 5, 0),
        ram: Math.max(limites.ram - 5, 0),
        disco: Math.max(limites.disco - 5, 0),
        pacotes: Math.round(limites.pacotes * 0.75)
    };

    if (limitesAltoJson) {
        if (limitesAltoJson.cpu != null) limitesAlto.cpu = Number(limitesAltoJson.cpu);
        if (limitesAltoJson.ram != null) limitesAlto.ram = Number(limitesAltoJson.ram);
        if (limitesAltoJson.disco != null) limitesAlto.disco = Number(limitesAltoJson.disco);
        if (limitesAltoJson.pacotes != null) limitesAlto.pacotes = Number(limitesAltoJson.pacotes);
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
        alto: limitesAlto,
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

    let linkEmpresa = document.getElementById("empresa-breadcrumb");
    let paramsUrl = new URLSearchParams(window.location.search);
    let idEmpresa = equipamento.idEmpresa || paramsUrl.get("idEmpresa");
    if (linkEmpresa && idEmpresa) {
        linkEmpresa.href = "IndividualJoao/equipamentos.html?idEmpresa=" + encodeURIComponent(idEmpresa);
    }

    preencherTexto(
        "equipamento-categoria",
        equipamento.categoria + " · " + equipamento.modelo
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
    preencherTexto("card-pacotes-abs", atual.pacotes != null ? formatarNumero(atual.pacotes) + " coletas" : "—");

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

    let criticosAtivos = 0;
    let totalCriticos = 0;
    for (let i = 0; i < dados.alertas.length; i++) {
        if (dados.alertas[i].nivel === "Crítico") {
            totalCriticos++;
            if (!dados.alertas[i].resolvido) {
                criticosAtivos++;
            }
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
    } else if (cpuPct >= 90 || ramPct >= 90 || acimaDoLimite >= 2 || criticosAtivos > 0) {
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
        criticosAtivos + " crítico" + (criticosAtivos === 1 ? "" : "s") + " ativo" + (criticosAtivos === 1 ? "" : "s") +
        " (" + totalCriticos + " total) de " + dados.alertas.length + " alertas"
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
        elLimite.textContent = "Limite: " + cfg.limite + "% · " + complemento;
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
                    "px-3 sm:px-4 py-2 text-xs font-semibold rounded-md border border-white/15 text-white/70 hover:border-white hover:text-white transition-colors cursor-pointer text-center";
            }

            this.className =
                "px-3 sm:px-4 py-2 text-xs font-semibold rounded-md border border-light-blue bg-light-blue text-main-blue cursor-pointer text-center";

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
        "Uso diário de recursos · " + dataBr(dataInicio) + " até " + dataBr(dataFim)
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

function badgeSeveridade(nivel) {
    if (nivel === "Crítico") {
        return `<span class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-500/10 border border-red-500/30 text-red-400">Crítico</span>`;
    }
    if (nivel === "Alto") {
        return `<span class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-orange-500/10 border border-orange-500/30 text-orange-400">Alto</span>`;
    }
    return `<span class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">Atenção</span>`;
}

function badgeStatusJira(statusJira) {
    if (!statusJira) {
        return `<span class="text-xs text-white/35">Monitoramento local</span>`;
    }

    const textoSeguro = escapeHTML(statusJira);
    const normalizado = statusJira.toLowerCase();
    const concluido = isStatusJiraConcluido(normalizado);
    const andamento = normalizado.includes("andamento") || normalizado.includes("progress");

    if (concluido) {
        return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span class="size-1.5 rounded-full bg-emerald-400"></span>${textoSeguro}
        </span>`;
    }

    if (andamento) {
        return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <span class="size-1.5 rounded-full bg-sky-400 animate-pulse"></span>${textoSeguro}
        </span>`;
    }

    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
        <span class="size-1.5 rounded-full bg-amber-400"></span>${textoSeguro}
    </span>`;
}

function renderizarTabelaAlertas() {
    const container = document.getElementById("alertas-container");
    if (!container || !dados) return;

    const noPeriodo = dados.alertas.filter(function (alerta) {
        if (estadoAlertas.inicio && alerta.dia < estadoAlertas.inicio) return false;
        if (estadoAlertas.fim && alerta.dia > estadoAlertas.fim) return false;
        return true;
    });

    let qtdCriticos = 0;
    let qtdAltos = 0;
    let qtdAtencao = 0;

    for (let i = 0; i < noPeriodo.length; i++) {
        if (noPeriodo[i].nivel === "Crítico") qtdCriticos++;
        else if (noPeriodo[i].nivel === "Alto") qtdAltos++;
        else qtdAtencao++;
    }

    preencherTexto("alertas-badge-criticos", qtdCriticos + (qtdCriticos === 1 ? " crítico" : " críticos"));
    preencherTexto("alertas-badge-altos", qtdAltos + (qtdAltos === 1 ? " alto" : " altos"));
    preencherTexto("alertas-badge-atencao", qtdAtencao + " atenção");

    if (estadoAlertas.inicio && estadoAlertas.fim) {
        preencherTexto(
            "alertas-descricao",
            "Registros de " + dataBr(estadoAlertas.inicio) + " até " + dataBr(estadoAlertas.fim)
        );
    }

    const filtrados = noPeriodo.filter(function (alerta) {
        if (estadoAlertas.severidade !== "todos") {
            if (estadoAlertas.severidade === "critico" && alerta.nivel !== "Crítico") return false;
            if (estadoAlertas.severidade === "alto" && alerta.nivel !== "Alto") return false;
            if (estadoAlertas.severidade === "atencao" && alerta.nivel !== "Atenção") return false;
        }

        if (estadoAlertas.metrica !== "todas") {
            if (campoDaMetrica(alerta.tipo) !== estadoAlertas.metrica) return false;
        }

        return true;
    });

    if (filtrados.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center text-xs text-white/45">
                Nenhum alerta registrado para os filtros selecionados.
            </div>
        `;
        return;
    }

    const linhas = filtrados.map(function (alerta) {
        const dataHoraTexto = dataBr(alerta.dia) + (alerta.hora ? " às " + alerta.hora : "");
        const valorFormatado = alerta.valor != null
            ? `${formatarNumero(alerta.valor, 1)} ${escapeHTML(alerta.unidade || "%")}`
            : "—";

        const celulaChamado = alerta.jiraKey
            ? `<a href="${JIRA_BASE_URL}/${encodeURIComponent(alerta.jiraKey)}" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-light-blue/10 border border-light-blue/30 text-light-blue text-xs font-semibold hover:bg-light-blue hover:text-main-blue transition-colors">
                  <span>${escapeHTML(alerta.jiraKey)}</span>
                  <span>&#8599;</span>
               </a>`
            : `<span class="text-xs text-white/35">—</span>`;

        return `
            <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td class="px-5 py-3.5 text-xs text-white/75 whitespace-nowrap">${escapeHTML(dataHoraTexto)}</td>
                <td class="px-5 py-3.5 whitespace-nowrap">${badgeSeveridade(alerta.nivel)}</td>
                <td class="px-5 py-3.5 text-xs font-medium text-white">${escapeHTML(alerta.componente || alerta.tipo || "—")}</td>
                <td class="px-5 py-3.5 text-xs font-semibold text-white/90 whitespace-nowrap">${valorFormatado}</td>
                <td class="px-5 py-3.5 text-xs text-white/65 max-w-xs truncate" title="${escapeHTML(alerta.descricao || "")}">${escapeHTML(alerta.descricao || "—")}</td>
                <td class="px-5 py-3.5 whitespace-nowrap">${celulaChamado}</td>
                <td class="px-5 py-3.5 whitespace-nowrap">${badgeStatusJira(alerta.statusJira)}</td>
            </tr>
        `;
    }).join("");

    container.innerHTML = `
        <table class="w-full text-left border-collapse min-w-[820px]">
            <thead>
                <tr class="border-b border-white/10 text-[10px] font-semibold uppercase tracking-wider text-white/45 bg-white/[0.02]">
                    <th class="px-5 py-3">Data / Hora</th>
                    <th class="px-5 py-3">Severidade</th>
                    <th class="px-5 py-3">Componente</th>
                    <th class="px-5 py-3">Leitura</th>
                    <th class="px-5 py-3">Descrição</th>
                    <th class="px-5 py-3">Chamado Jira</th>
                    <th class="px-5 py-3">Status</th>
                </tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>
    `;
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