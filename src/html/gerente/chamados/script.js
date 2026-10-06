let violacoes = [];
let dataReferencia = ""; // data mais recente dos dados (YYYY-MM-DD) — base de "última semana" e "último mês"

let periodoSelecionado = "ultima-semana";
let equipamentoSelecionado = "";
let statusSelecionado = "todos";
let dataInicial = "";
let dataFinal = "";

const ATIVO = ["bg-light-blue", "text-main-blue", "border-light-blue"];
const INATIVO_PERIODO = ["border-transparent", "text-white/70", "hover:text-white"];
const INATIVO_STATUS = ["bg-[#09121B]", "border-white/10", "text-white/70", "hover:text-white", "hover:border-white/30"];

const PRIORIDADES = {
    "Crítico": { ponto: "bg-red-500", texto: "text-red-500" },
    "Alto": { ponto: "bg-orange-500", texto: "text-orange-500" },
    "Médio": { ponto: "bg-yellow-400", texto: "text-yellow-400" }
};

const STATUS = {
    "Em Aberto": "bg-red-950/60 text-red-500",
    "Resolvido": "bg-green-950/60 text-green-500"
};


async function carregarDados() {
    try {
        const resposta = await fetch("./dados.json");
        violacoes = await resposta.json();
    } catch (erro) {
        console.error("Não foi possível carregar dados.json", erro);
        mostrarMensagem("Não foi possível carregar os dados. Abra a página por um servidor local (ex.: Live Server).");
        return;
    }

    violacoes.sort((a, b) => b.data.localeCompare(a.data) || b.id.localeCompare(a.id));
    dataReferencia = violacoes.length ? violacoes[0].data : "";

    popularEquipamentos();
    configurarFiltros();
    atualizarBotoes();
    atualizarTabela();
}


function formatarData(iso) {
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
}

function subtrairDias(iso, dias) {
    const [ano, mes, dia] = iso.split("-").map(Number);
    const data = new Date(ano, mes - 1, dia - dias);
    const m = String(data.getMonth() + 1).padStart(2, "0");
    const d = String(data.getDate()).padStart(2, "0");
    return `${data.getFullYear()}-${m}-${d}`;
}


function filtrarPorPeriodo() {
    if (periodoSelecionado === "ultima-semana") {
        return { de: subtrairDias(dataReferencia, 6), ate: dataReferencia };
    }
    if (periodoSelecionado === "ultimo-mes") {
        return { de: subtrairDias(dataReferencia, 29), ate: dataReferencia };
    }
    return { de: dataInicial, ate: dataFinal };
}



function filtrarViolacoes() {
    const { de, ate } = filtrarPorPeriodo();

    return violacoes.filter(item => {
        if (de && item.data < de) return false;
        if (ate && item.data > ate) return false;
        if (equipamentoSelecionado && item.equipamento !== equipamentoSelecionado) return false;
        if (statusSelecionado !== "todos" && item.status !== statusSelecionado) return false;
        return true;
    });
}

function popularEquipamentos() {
    const select = document.getElementById("filtro-equipamento");
    const equipamentos = [...new Set(violacoes.map(item => item.equipamento))];

    equipamentos.forEach(equipamento => {
        const option = document.createElement("option");
        option.value = equipamento;
        option.textContent = equipamento;
        select.appendChild(option);
    });
}

function configurarFiltros() {
    document.querySelectorAll(".btn-periodo").forEach(botao => {
        botao.addEventListener("click", () => {
            periodoSelecionado = botao.dataset.periodo;

            if (periodoSelecionado !== "personalizado") {
                dataInicial = "";
                dataFinal = "";
                document.getElementById("data-inicial").value = "";
                document.getElementById("data-final").value = "";
            }

            atualizarBotoes();
            atualizarTabela();
        });
    });

    document.getElementById("data-inicial").addEventListener("change", function () {
        dataInicial = this.value;
        atualizarTabela();
    });

    document.getElementById("data-final").addEventListener("change", function () {
        dataFinal = this.value;
        atualizarTabela();
    });

    document.getElementById("filtro-equipamento").addEventListener("change", function () {
        equipamentoSelecionado = this.value;
        atualizarTabela();
    });

    document.querySelectorAll(".btn-status").forEach(botao => {
        botao.addEventListener("click", () => {
            statusSelecionado = botao.dataset.status;
            atualizarBotoes();
            atualizarTabela();
        });
    });
}

function atualizarBotoes() {
    document.querySelectorAll(".btn-periodo").forEach(botao => {
        const ativo = botao.dataset.periodo === periodoSelecionado;
        botao.classList.remove(...ATIVO, ...INATIVO_PERIODO);
        botao.classList.add(...(ativo ? ATIVO : INATIVO_PERIODO));
    });

    document.querySelectorAll(".btn-status").forEach(botao => {
        const ativo = botao.dataset.status === statusSelecionado;
        botao.classList.remove(...ATIVO, ...INATIVO_STATUS);
        botao.classList.add(...(ativo ? ATIVO : INATIVO_STATUS));
    });

    const personalizado = periodoSelecionado === "personalizado";
    const datas = document.getElementById("datas");
    datas.classList.toggle("hidden", !personalizado);
    datas.classList.toggle("flex", personalizado);
}


function atualizarTabela() {
    renderizarTabela(filtrarViolacoes());
}

function mostrarMensagem(texto) {
    document.getElementById("tabela-violacoes").innerHTML = `
        <tr>
            <td colspan="7" class="py-12 text-center text-sm text-gray-400">${texto}</td>
        </tr>
    `;
}

function renderizarTabela(lista) {
    const tbody = document.getElementById("tabela-violacoes");

    if (lista.length === 0) {
        mostrarMensagem("Nenhuma violação encontrada para os filtros selecionados.");
        return;
    }

    tbody.innerHTML = lista.map(item => {
        const prioridade = PRIORIDADES[item.prioridade];
        const status = STATUS[item.status];
    
        return `
            <tr class="h-[46px] border-b border-white/10 hover:bg-white/[0.02] transition-element">
                <td class="pl-5 text-[11px] font-bold text-light-blue">${item.id}</td>
                <td class="text-[11px] text-gray-400">${formatarData(item.data)}</td>
                <td class="text-[13px] text-white truncate">${item.empresa}</td>
                <td class="text-[13px] text-white truncate">${item.equipamento}</td>
                <td class="text-[13px] text-gray-400 whitespace-nowrap">${item.violacao}</td>
                <td>
                    <span class="flex items-center gap-1.5 text-[10px] font-bold ${prioridade.texto}">
                        <span class="size-1.5 rounded-full ${prioridade.ponto}"></span>${item.prioridade}
                    </span>
                </td>
                <td class="pr-5">
                    <span class="block w-[110px] rounded-sm px-2 py-1 text-[10px] font-bold ${status}">${item.status}</span>
                </td>
            </tr>
        `;
    }).join("");
}


carregarDados();