let dados = [];
let empresaSelecionada = "";
let equipamentoSelecionado = "";

async function carregarDadosRelatorio() {
    try {
        const resposta = await fetch("./dados.json");
        dados = await resposta.json();
    } catch (erro) {
        dados = [
            { "empresa": "Bradesco", "equipamento": "FW-CORE-03", "data": "2026-09-15", "cpu": "95.5", "ram": "82.1", "disco": "64.0", "rede": "450.2" },
            { "empresa": "Bradesco", "equipamento": "FW-CORE-03", "data": "2026-09-16", "cpu": "91.2", "ram": "80.5", "disco": "64.1", "rede": "420.0" },
            { "empresa": "Bradesco", "equipamento": "FW-CORE-02", "data": "2026-09-18", "cpu": "88.0", "ram": "79.4", "disco": "55.2", "rede": "310.8" },
            { "empresa": "Bradesco", "equipamento": "FW-CORE-02", "data": "2026-10-02", "cpu": "92.4", "ram": "83.0", "disco": "55.5", "rede": "395.4" },
            { "empresa": "Bradesco", "equipamento": "FW-EDGE-01", "data": "2026-09-22", "cpu": "72.3", "ram": "65.0", "disco": "40.1", "rede": "180.5" },
            { "empresa": "Bradesco", "equipamento": "FW-EDGE-01", "data": "2026-10-10", "cpu": "89.9", "ram": "88.2", "disco": "41.0", "rede": "512.0" },
            { "empresa": "Itaú", "equipamento": "SW-ACCESS-01", "data": "2026-09-15", "cpu": "60.4", "ram": "78.0", "disco": "50.0", "rede": "820.0" },
            { "empresa": "Itaú", "equipamento": "SW-ACCESS-01", "data": "2026-09-20", "cpu": "65.1", "ram": "79.2", "disco": "50.0", "rede": "845.3" },
            { "empresa": "Itaú", "equipamento": "SW-CORE-01", "data": "2026-09-20", "cpu": "76.9", "ram": "84.2", "disco": "70.5", "rede": "950.4" },
            { "empresa": "Itaú", "equipamento": "SW-CORE-01", "data": "2026-09-28", "cpu": "84.0", "ram": "89.5", "disco": "71.0", "rede": "1020.6" },
            { "empresa": "Santander", "equipamento": "RT-CORE-01", "data": "2026-09-15", "cpu": "54.2", "ram": "48.6", "disco": "30.0", "rede": "120.0" },
            { "empresa": "Santander", "equipamento": "RT-CORE-01", "data": "2026-09-25", "cpu": "58.9", "ram": "51.2", "disco": "30.0", "rede": "145.2" },
            { "empresa": "Santander", "equipamento": "RT-EDGE-02", "data": "2026-09-25", "cpu": "81.0", "ram": "75.3", "disco": "58.9", "rede": "340.1" },
            { "empresa": "Santander", "equipamento": "RT-EDGE-02", "data": "2026-10-05", "cpu": "94.8", "ram": "90.1", "disco": "60.0", "rede": "480.9" },
            { "empresa": "Santander", "equipamento": "SRV-DB-01", "data": "2026-09-20", "cpu": "85.0", "ram": "88.9", "disco": "85.2", "rede": "610.0" },
            { "empresa": "Santander", "equipamento": "SRV-DB-01", "data": "2026-09-28", "cpu": "91.2", "ram": "92.4", "disco": "89.5", "rede": "670.3" }
        ];
    }

    mostrarEmpresas();
    mostrarEquipamentos();
    configurarEventosRelatorio();
    atualizarResumo();
}

function mostrarEmpresas() {
    const empresas = [...new Set(dados.map(item => item.empresa))];
    const container = document.getElementById("empresasContainer");
    if (!container) return;

    container.innerHTML = "";

    empresas.forEach(empresa => {
        container.innerHTML += `
            <button
                type="button"
                class="empresa-button min-h-14 rounded-xl bg-[#09121B] border border-white/15 px-5 text-left text-sm font-medium hover:border-white cursor-pointer transition-element"
                data-empresa="${empresa}"
            >
                ${empresa}
            </button>
        `;
    });
}

function mostrarEquipamentos() {
    const select = document.getElementById("equipamento");
    if (!select) return;

    select.innerHTML = `<option value="">Todos os equipamentos</option>`;
    const equipamentos = [...new Set(dados.map(item => item.equipamento))];

    equipamentos.forEach(equipamento => {
        select.innerHTML += `<option value="${equipamento}">${equipamento}</option>`;
    });
}

function mostrarEquipamentosDaEmpresa() {
    const select = document.getElementById("equipamento");
    if (!select) return;

    select.innerHTML = `<option value="">Todos os equipamentos</option>`;
    const equipamentos = [
        ...new Set(
            dados
                .filter(item => item.empresa === empresaSelecionada)
                .map(item => item.equipamento)
        )
    ];

    equipamentos.forEach(equipamento => {
        select.innerHTML += `<option value="${equipamento}">${equipamento}</option>`;
    });

    equipamentoSelecionado = "";
}

function configurarEventosRelatorio() {
    document.querySelectorAll(".empresa-button").forEach(botao => {
        botao.addEventListener("click", function () {
            empresaSelecionada = botao.dataset.empresa;

            document.querySelectorAll(".empresa-button").forEach(item => {
                item.classList.remove("border-light-blue", "bg-light-blue/10", "font-semibold");
                item.classList.add("border-white/15");
            });

            botao.classList.remove("border-white/15");
            botao.classList.add("border-light-blue", "bg-light-blue/10", "font-semibold");

            mostrarEquipamentosDaEmpresa();
            atualizarResumo();
        });
    });

    const selectEquip = document.getElementById("equipamento");
    if (selectEquip) {
        selectEquip.addEventListener("change", function () {
            equipamentoSelecionado = this.value;
            atualizarResumo();
        });
    }

    document.querySelectorAll(".period-button").forEach(botao => {
        botao.addEventListener("click", function () {
            document.querySelectorAll(".period-button").forEach(item => {
                item.classList.remove("selected", "border-light-blue", "bg-light-blue/10", "font-semibold", "text-white");
                item.classList.add("border-white/15", "bg-main-blue", "text-white/70");
            });

            botao.classList.remove("border-white/15", "bg-main-blue", "text-white/70");
            botao.classList.add("selected", "border-light-blue", "bg-light-blue/10", "font-semibold", "text-white");

            const datas = document.getElementById("datas");
            if (botao.dataset.valor === "Período personalizado") {
                if (datas) datas.classList.remove("hidden");
            } else {
                if (datas) datas.classList.add("hidden");
                const dIni = document.getElementById("dataInicial");
                const dFim = document.getElementById("dataFinal");
                if (dIni) dIni.value = "";
                if (dFim) dFim.value = "";
            }

            atualizarResumo();
        });
    });

    const dIni = document.getElementById("dataInicial");
    const dFim = document.getElementById("dataFinal");
    if (dIni) dIni.addEventListener("change", atualizarResumo);
    if (dFim) dFim.addEventListener("change", atualizarResumo);

    document.querySelectorAll(".metric-option input").forEach(input => {
        input.addEventListener("change", atualizarResumo);
    });

    const btnCsv = document.getElementById("btnCsv");
    if (btnCsv) {
        btnCsv.addEventListener("click", gerarCsv);
    }
}

function filtrarDados() {
    const periodoAtivo = document.querySelector(".period-button.selected")?.dataset.valor || "Último mês";
    const dataInicialInput = document.getElementById("dataInicial")?.value || "";
    const dataFinalInput = document.getElementById("dataFinal")?.value || "";

    return dados.filter(item => {
        if (empresaSelecionada && item.empresa !== empresaSelecionada) return false;
        if (equipamentoSelecionado && item.equipamento !== equipamentoSelecionado) return false;

        const dataItem = new Date(item.data + "T00:00:00");
        const hoje = new Date("2026-10-16T00:00:00");

        if (periodoAtivo === "Última semana") {
            const umaSemanaAtras = new Date(hoje);
            umaSemanaAtras.setDate(hoje.getDate() - 7);
            if (dataItem < umaSemanaAtras || dataItem > hoje) return false;
        } else if (periodoAtivo === "Último mês") {
            const umMesAtras = new Date(hoje);
            umMesAtras.setMonth(hoje.getMonth() - 1);
            if (dataItem < umMesAtras || dataItem > hoje) return false;
        } else if (periodoAtivo === "Período personalizado") {
            if (dataInicialInput && item.data < dataInicialInput) return false;
            if (dataFinalInput && item.data > dataFinalInput) return false;
        }

        return true;
    });
}

function atualizarResumo() {
    const dadosFiltrados = filtrarDados();

    const regEl = document.getElementById("quantidadeRegistros");
    if (regEl) regEl.innerText = dadosFiltrados.length + " registros disponíveis";

    const resEmp = document.getElementById("resEmpresa");
    if (resEmp) resEmp.innerText = empresaSelecionada || "Todas";

    const resEq = document.getElementById("resEquip");
    if (resEq) resEq.innerText = equipamentoSelecionado || "Todos";

    const periodoAtivo = document.querySelector(".period-button.selected");
    const dataInicial = document.getElementById("dataInicial")?.value;
    const dataFinal = document.getElementById("dataFinal")?.value;
    const resPer = document.getElementById("resPeriodo");

    if (resPer && periodoAtivo) {
        if (periodoAtivo.dataset.valor === "Período personalizado") {
            if (dataInicial || dataFinal) {
                resPer.innerText = (dataInicial || "...") + " até " + (dataFinal || "...");
            } else {
                resPer.innerText = "Personalizado";
            }
        } else {
            resPer.innerText = periodoAtivo.dataset.valor;
        }
    }

    const metricas = document.querySelectorAll(".metric-option input:checked");
    const nomes = [...metricas].map(input => input.value);
    const resMet = document.getElementById("resMetricas");
    if (resMet) {
        resMet.innerText = nomes.length > 0 ? nomes.join(", ") : "Nenhuma";
    }
}

function gerarCsv() {
    const dadosFiltrados = filtrarDados();

    if (dadosFiltrados.length === 0) {
        alert("Nenhum dado encontrado para gerar o relatório.");
        return;
    }

    const metricas = document.querySelectorAll(".metric-option input:checked");
    const nomes = [...metricas].map(input => input.value);

    let csv = "empresa,equipamento,data";

    if (nomes.includes("CPU")) csv += ",cpu";
    if (nomes.includes("RAM")) csv += ",ram";
    if (nomes.includes("Disco")) csv += ",disco";
    if (nomes.includes("Rede")) csv += ",rede";

    dadosFiltrados.forEach(item => {
        let linha = `${item.empresa},${item.equipamento},${item.data}`;

        if (nomes.includes("CPU")) linha += `,${item.cpu || ""}`;
        if (nomes.includes("RAM")) linha += `,${item.ram || ""}`;
        if (nomes.includes("Disco")) linha += `,${item.disco || ""}`;
        if (nomes.includes("Rede")) linha += `,${item.rede || ""}`;

        csv += "\n" + linha;
    });

    const arquivo = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = url;
    link.download = "relatorio-telemetria-argos.csv";
    link.click();
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
    const btnHamburguer = document.getElementById('btn-hamburguer');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function toggleMenu() {
        if (!sidebar || !overlay) return;
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    }

    if (btnHamburguer && overlay) {
        btnHamburguer.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    }

    carregarDadosRelatorio();
    mostrarFuncionarios();
    renderizarGraficos();
    renderizarSLAs();
});

const funcionarios = [
    { id: 1, nome: "Junin da Silva", status: "ativo" },
    { id: 2, nome: "Isabella Albuquerque", status: "ativo" },
    { id: 3, nome: "Pedro", status: "ativo" },
    { id: 4, nome: "Lara Pereira", status: "ativo" },
    { id: 5, nome: "Cláudio Lopes", status: "ativo" },
    { id: 6, nome: "Lucas Silva", status: "inativo" },
    { id: 7, nome: "Mariana Costa", status: "ativo" },
    { id: 8, nome: "Carlos Eduardo", status: "inativo" },
    { id: 9, nome: "Beatriz Oliveira", status: "ativo" },
    { id: 10, nome: "Gabriel Santos", status: "ativo" },
    { id: 11, nome: "Fernanda Lima", status: "inativo" },
    { id: 12, nome: "Rafael Alves", status: "ativo" }
];

const containerFuncionarios = document.getElementById("lista-funcionarios");
const inputBusca = document.getElementById("input-busca");

function ordenarFuncionarios(lista) {
    const listaCopia = [...lista];
    listaCopia.sort(function (a, b) {
        if (a.status === "ativo" && b.status !== "ativo") return -1;
        if (a.status !== "ativo" && b.status === "ativo") return 1;
        return a.nome.localeCompare(b.nome);
    });
    return listaCopia;
}

function mostrarFuncionarios(termo) {
    if (termo === undefined) termo = "";
    if (!containerFuncionarios) return;

    containerFuncionarios.innerHTML = "";
    const listaOrdenada = ordenarFuncionarios(funcionarios);
    const listaFiltrada = [];

    for (let i = 0; i < listaOrdenada.length; i++) {
        const empregado = listaOrdenada[i];
        if (empregado.nome.toLowerCase().includes(termo.toLowerCase())) {
            listaFiltrada.push(empregado);
        }
    }

    if (listaFiltrada.length === 0) {
        containerFuncionarios.innerHTML = `<p class="text-gray-400 font-['Poppins'] text-sm col-span-full py-4 text-center">Nenhum funcionário encontrado.</p>`;
    } else {
        for (let i = 0; i < listaFiltrada.length; i++) {
            const empregado = listaFiltrada[i];
            const inicial = empregado.nome.charAt(0).toUpperCase();
            let corStatus = empregado.status === "ativo" ? "bg-green-500" : "bg-orange-500";

            const card = document.createElement("div");
            card.className = "flex flex-col items-center justify-start w-24 text-center";
            card.innerHTML = `
                <div class="relative w-16 h-16 rounded-full bg-[#09121B] border-2 border-blue-500 flex items-center justify-center text-cyan-400 font-bold text-xl shrink-0">
                    ${inicial}
                    <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#09121B] ${corStatus}"></span>
                </div>
                <span class="text-sm font-medium text-gray-300 mt-2 w-full truncate font-['Poppins']" title="${empregado.nome}">${empregado.nome}</span>
            `;
            containerFuncionarios.appendChild(card);
        }
    }

    if (termo.trim() !== "") {
        containerFuncionarios.style.maxHeight = containerFuncionarios.scrollHeight + "px";
    } else {
        containerFuncionarios.style.maxHeight = "110px";
    }
}

if (inputBusca) {
    inputBusca.addEventListener("input", function (evento) {
        mostrarFuncionarios(evento.target.value);
    });
}

const dadosJsonAbertos = {
  "resumo_por_equipamento": [
    {
      "id_equipamento": "FW-CORE-02",
      "chamados_semana": 4,
      "chamados_setembro": 9,
      "historico_chamados": [
        { "data": "2026-09-02", "data_fechamento": "2026-09-03" },
        { "data": "2026-09-05", "data_fechamento": "2026-09-06" },
        { "data": "2026-09-12", "data_fechamento": "2026-09-14" },
        { "data": "2026-09-18", "data_fechamento": "2026-09-19" },
        { "data": "2026-09-22", "data_fechamento": "2026-09-23" },
        { "data": "2026-09-25", "data_fechamento": "2026-09-26" },
        { "data": "2026-09-28", "data_fechamento": "2026-09-28" },
        { "data": "2026-09-29", "data_fechamento": "2026-09-30" },
        { "data": "2026-09-30", "data_fechamento": "2026-10-01" }
      ]
    },
    {
      "id_equipamento": "FW-CORE-03",
      "chamados_semana": 9,
      "chamados_setembro": 22,
      "historico_chamados": Array(22).fill({ "data": "2026-09-15", "data_fechamento": "2026-09-16" })
    },
    {
      "id_equipamento": "SW-ACCESS-01",
      "chamados_semana": 6,
      "chamados_setembro": 15,
      "historico_chamados": Array(15).fill({ "data": "2026-09-20", "data_fechamento": "2026-09-21" })
    },
    {
      "id_equipamento": "RT-CORE-01",
      "chamados_semana": 3,
      "chamados_setembro": 8,
      "historico_chamados": Array(8).fill({ "data": "2026-09-15", "data_fechamento": "2026-09-17" })
    },
    {
      "id_equipamento": "FW-EDGE-01",
      "chamados_semana": 7,
      "chamados_setembro": 17,
      "historico_chamados": Array(17).fill({ "data": "2026-09-10", "data_fechamento": "2026-09-12" })
    }
  ]
};

const dadosJsonResolvidos = {
  "semana": {
    "labels": ["Seg", "Ter", "Qua", "Qui", "Sex"],
    "valores": [3, 7, 5, 2, 5]
  },
  "mes": {
    "labels": ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    "valores": [18, 24, 21, 19]
  }
};

let graficoAbertos = null;
let graficoResolvidos = null;

function criarGraficoBarraHorizontal(idCanvas, rotulo, corBarra, dadosIniciais) {
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return null;

    const equipamentos = dadosJsonAbertos.resumo_por_equipamento;
    const labels = [];
    for (let i = 0; i < equipamentos.length; i++) {
        labels.push(equipamentos[i].id_equipamento);
    }

    return new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: rotulo,
                data: dadosIniciais,
                backgroundColor: corBarra,
                borderWidth: 0,
                borderRadius: 2,
                barPercentage: 0.75,
                categoryPercentage: 0.85
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: '#9CA3AF', font: { family: 'Poppins', size: 11 } },
                    grid: { color: 'rgba(255, 255, 255, 0.08)', drawBorder: false }
                },
                y: {
                    ticks: { color: '#9CA3AF', font: { family: 'Poppins', size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

function criarGraficoBarraVertical(idCanvas, rotulo, corBarra, labelsIniciais, dadosIniciais) {
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return null;

    return new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labelsIniciais,
            datasets: [{
                label: rotulo,
                data: dadosIniciais,
                backgroundColor: corBarra,
                borderWidth: 0,
                borderRadius: 4,
                barPercentage: 0.5,
                categoryPercentage: 0.8
            }]
        },
        options: {
            indexAxis: 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            scales: {
                x: {
                    ticks: { color: '#9CA3AF', font: { family: 'Poppins', size: 11 } },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9CA3AF', font: { family: 'Poppins', size: 11 } },
                    grid: { color: 'rgba(255, 255, 255, 0.08)', drawBorder: false }
                }
            }
        }
    });
}

function renderizarGraficos() {
    if (graficoAbertos) graficoAbertos.destroy();
    if (graficoResolvidos) graficoResolvidos.destroy();

    const valoresAbertosIniciais = extrairValoresPorChave(dadosJsonAbertos, "chamados_semana");

    graficoAbertos = criarGraficoBarraHorizontal('graficoChamadosAbertos', 'Chamados Abertos', '#D9383A', valoresAbertosIniciais);
    graficoResolvidos = criarGraficoBarraVertical('graficoChamadosResolvidos', 'Chamados Resolvidos', '#22C55E', dadosJsonResolvidos.semana.labels, dadosJsonResolvidos.semana.valores);
}

window.addEventListener('resize', () => {
    if (graficoAbertos) graficoAbertos.resize();
    if (graficoResolvidos) graficoResolvidos.resize();
});

function atualizarGrafico(instanciaGrafico, novosValores, novasLabels) {
    if (!instanciaGrafico) return;

    if (novasLabels) {
        instanciaGrafico.data.labels = novasLabels;
    }
    
    instanciaGrafico.data.datasets[0].data = novosValores;
    
    if (instanciaGrafico.options.scales.x && instanciaGrafico.options.scales.x.max) {
        delete instanciaGrafico.options.scales.x.max;
    }
    
    instanciaGrafico.update();
}

function extrairValoresPorChave(jsonFonte, chave) {
    const equipamentos = jsonFonte.resumo_por_equipamento;
    const valores = [];
    for (let i = 0; i < equipamentos.length; i++) {
        valores.push(equipamentos[i][chave]);
    }
    return valores;
}

function extrairValoresPorData(jsonFonte, dataInicio, dataFim) {
    const equipamentos = jsonFonte.resumo_por_equipamento;
    const valores = [];

    for (let i = 0; i < equipamentos.length; i++) {
        const equip = equipamentos[i];
        let contagem = 0;

        if (equip.historico_chamados) {
            for (let j = 0; j < equip.historico_chamados.length; j++) {
                const dataItem = new Date(equip.historico_chamados[j].data + "T12:00:00");
                if (dataItem >= dataInicio && dataItem <= dataFim) {
                    contagem++;
                }
            }
        }
        valores.push(contagem);
    }
    return valores;
}

function extrairResolvidosPorData(jsonFonte, dataInicio, dataFim) {
    const equipamentos = jsonFonte.resumo_por_equipamento;
    let totalFechados = 0;

    for (let i = 0; i < equipamentos.length; i++) {
        const equip = equipamentos[i];
        if (equip.historico_chamados) {
            for (let j = 0; j < equip.historico_chamados.length; j++) {
                const item = equip.historico_chamados[j];
                if (item.data_fechamento) {
                    const dataFechamento = new Date(item.data_fechamento + "T12:00:00");
                    if (dataFechamento >= dataInicio && dataFechamento <= dataFim) {
                        totalFechados++;
                    }
                }
            }
        }
    }
    return totalFechados;
}

const botoesFiltros = document.querySelectorAll(".btn-filtro");
const painelPersonalizado = document.getElementById("personalizados");
const subtitulos = document.querySelectorAll(".subtitulo-grafico");

function atualizarTextoSubtitulos(texto) {
    for (let i = 0; i < subtitulos.length; i++) {
        subtitulos[i].textContent = texto;
    }
}

for (let i = 0; i < botoesFiltros.length; i++) {
    const botao = botoesFiltros[i];
    const indice = i;

    botao.addEventListener("click", function () {
        for (let j = 0; j < botoesFiltros.length; j++) {
            botoesFiltros[j].classList.remove("bg-light-blue", "text-main-blue", "border-transparent", "font-bold");
            botoesFiltros[j].classList.add("border-white/15", "text-white/70", "hover:border-white", "hover:text-white");
        }

        this.classList.remove("border-white/15", "text-white/70", "hover:border-white", "hover:text-white");
        this.classList.add("bg-light-blue", "text-main-blue", "border-transparent", "font-bold");

        if (indice === 0) {
            atualizarTextoSubtitulos("Última Semana");
            if (painelPersonalizado) {
                painelPersonalizado.classList.remove("max-h-30", "max-h-24", "md:max-h-24", "opacity-100", "border-gray-700");
                painelPersonalizado.classList.add("max-h-0", "opacity-0", "border-gray-700/0");
            }
            atualizarGrafico(graficoAbertos, extrairValoresPorChave(dadosJsonAbertos, "chamados_semana"));
            atualizarGrafico(graficoResolvidos, dadosJsonResolvidos.semana.valores, dadosJsonResolvidos.semana.labels);

        } else if (indice === 1) {
            atualizarTextoSubtitulos("Último Mês");
            if (painelPersonalizado) {
                painelPersonalizado.classList.remove("max-h-30", "max-h-24", "md:max-h-24", "opacity-100", "border-gray-700");
                painelPersonalizado.classList.add("max-h-0", "opacity-0", "border-gray-700/0");
            }
            atualizarGrafico(graficoAbertos, extrairValoresPorChave(dadosJsonAbertos, "chamados_setembro"));
            atualizarGrafico(graficoResolvidos, dadosJsonResolvidos.mes.valores, dadosJsonResolvidos.mes.labels);

        } else if (indice === 2) {
            atualizarTextoSubtitulos("Período Personalizado");
            if (painelPersonalizado) {
                painelPersonalizado.classList.remove("max-h-0", "md:max-h-0", "opacity-0", "border-gray-700/0");
                painelPersonalizado.classList.add("max-h-30", "md:max-h-24", "opacity-100", "border-gray-700");
            }
            aplicarFiltroDatasPersonalizadas();
        }
    });
}

function aplicarFiltroDatasPersonalizadas() {
    const inputDataInicio = document.getElementById("data-inicio");
    const inputDataFim = document.getElementById("data-fim");

    if (!inputDataInicio || !inputDataFim) return;

    const dataInicioStr = inputDataInicio.value;
    const dataFimStr = inputDataFim.value;

    if (!dataInicioStr || !dataFimStr) return;

    const dataInicio = new Date(dataInicioStr + "T00:00:00");
    const dataFim = new Date(dataFimStr + "T23:59:59");

    if (dataFim < dataInicio) {
        alert("A data final não pode ser anterior à data inicial.");
        return;
    }

    const abertosFiltrados = extrairValoresPorData(dadosJsonAbertos, dataInicio, dataFim);
    const resolvidosFiltrados = extrairResolvidosPorData(dadosJsonAbertos, dataInicio, dataFim);

    const dtInicioFmt = dataInicioStr.split('-').reverse().join('/');
    const dtFimFmt = dataFimStr.split('-').reverse().join('/');
    atualizarTextoSubtitulos(`Período: ${dtInicioFmt} a ${dtFimFmt}`);

    atualizarGrafico(graficoAbertos, abertosFiltrados);
    atualizarGrafico(graficoResolvidos, [resolvidosFiltrados], ["Período Selecionado"]);
}

document.addEventListener("change", function (e) {
    if (e.target && (e.target.id === "data-inicio" || e.target.id === "data-fim")) {
        aplicarFiltroDatasPersonalizadas();
    }
});

document.addEventListener('DOMContentLoaded', renderizarGraficos);

const dadosJsonSlas = {
  "historico_slas_violados": [
    {
      "id_sla": "SLA-031",
      "equipamento": "FW-CORE-03",
      "cliente": "Bradesco",
      "tipo_sla": "Disponibilidade",
      "tempo_excedido": "+1h 22m",
      "gravidade": "urgente"
    },
    {
      "id_sla": "SLA-032",
      "equipamento": "FW-CORE-02",
      "cliente": "Bradesco",
      "tipo_sla": "Resolução",
      "tempo_excedido": "+2h 05m",
      "gravidade": "urgente"
    },
    {
      "id_sla": "SLA-033",
      "equipamento": "SW-ACCESS-01",
      "cliente": "Itaú",
      "tipo_sla": "Tempo de Resposta",
      "tempo_excedido": "+45m",
      "gravidade": "medio"
    },
    {
      "id_sla": "SLA-034",
      "equipamento": "RT-CORE-01",
      "cliente": "Santander",
      "tipo_sla": "Disponibilidade",
      "tempo_excedido": "0m",
      "gravidade": "estavel"
    }
  ]
};

function ordenarSLAs(dados) {
    const listaSLAs = dados.historico_slas_violados || dados;
    const listaCopiaSLAs = [...listaSLAs];

    const prioridade = {
        "urgente": 1,
        "medio": 2,
        "estavel": 3
    };

    listaCopiaSLAs.sort(function (a, b) {
        const pesoA = prioridade[a.gravidade] || 99;
        const pesoB = prioridade[b.gravidade] || 99;

        if (pesoA !== pesoB) {
            return pesoA - pesoB;
        }

        return a.cliente.localeCompare(b.cliente);
    });

    return listaCopiaSLAs.slice(0, 3);
}

function renderizarSLAs() {
    const containerSLAs = document.getElementById("lista-slas-container");
    if (!containerSLAs) return;

    const top3 = ordenarSLAs(dadosJsonSlas);
    containerSLAs.innerHTML = "";

    top3.forEach(item => {
        let corBorda = "border-red-500";
        if (item.gravidade === "medio") corBorda = "border-amber-500";
        if (item.gravidade === "estavel") corBorda = "border-blue-500";

        const card = document.createElement("div");
        card.className = `flex items-center justify-between p-3.5 bg-[#09121B] rounded border-l-4 ${corBorda} font-['Poppins'] text-sm`;
        
        card.innerHTML = `
        <div class="flex flex-col items-start gap-2 w-full md:flex-row md:items-center md:justify-between">
            <div class="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                <span class="text-cyan-400 font-semibold text-[13px]">${item.id_sla}</span>
                <span class="text-gray-300 text-[12px]">${item.equipamento} — ${item.cliente}</span>
            </div>
            <div class="flex flex-row items-center gap-4 md:ml-auto">
                <span class="text-gray-400 text-[12px]">${item.tipo_sla}</span>
                <span class="font-bold text-red-500 text-[12px]">${item.tempo_excedido}</span>
            </div>
        </div>
`;

        containerSLAs.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', renderizarSLAs);