let dados = [];
let empresaSelecionada = "";
let equipamentoSelecionado = "";


async function carregarDados() {

    const resposta = await fetch("./dados.json");

    dados = await resposta.json();

    mostrarEmpresas();
    mostrarEquipamentos();
    configurarEventos();
    atualizarResumo();
}


function mostrarEmpresas() {

    const empresas = [...new Set(dados.map(item => item.empresa))];

    const container = document.getElementById("empresasContainer");

    container.innerHTML = "";

    empresas.forEach(empresa => {

        container.innerHTML += `
            <button
                type="button"
                class="empresa-button min-h-14 rounded-xl bg-[#09121B] px-5 text-left"
                data-empresa="${empresa}"
            >
                ${empresa}
            </button>
        `;

    });

}


function mostrarEquipamentos() {

    const select = document.getElementById("equipamento");

    select.innerHTML = `
        <option value="">Todos os equipamentos</option>
    `;

    const equipamentos = [...new Set(dados.map(item => item.equipamento))];

    equipamentos.forEach(equipamento => {

        select.innerHTML += `
            <option value="${equipamento}">
                ${equipamento}
            </option>
        `;

    });

}


function configurarEventos() {

    document.querySelectorAll(".empresa-button").forEach(botao => {

        botao.addEventListener("click", function () {

            empresaSelecionada = botao.dataset.empresa;

            document.querySelectorAll(".empresa-button").forEach(item => {
                item.classList.remove(
                    "border-[#03C8FF]",
                    "bg-[#03C8FF]/10"
                );
            });

            botao.classList.add(
                "border-[#03C8FF]",
                "bg-[#03C8FF]/10"
            );

            mostrarEquipamentosDaEmpresa();

            atualizarResumo();
        });

    });


    document.getElementById("equipamento").addEventListener("change", function () {

        equipamentoSelecionado = this.value;

        atualizarResumo();

    });


    document.querySelectorAll(".period-button").forEach(botao => {

        botao.addEventListener("click", function () {

            document.querySelectorAll(".period-button").forEach(item => {

                item.classList.remove(
                    "selected",
                    "border-[#03C8FF]",
                    "bg-[#03C8FF]/10",
                    "font-semibold"
                );

                item.classList.add(
                    "border-white/10",
                    "bg-[#09121B]"
                );

            });


            botao.classList.remove(
                "border-white/10",
                "bg-[#09121B]"
            );

            botao.classList.add(
                "selected",
                "border-[#03C8FF]",
                "bg-[#03C8FF]/10",
                "font-semibold"
            );


            const datas = document.getElementById("datas");

            if (botao.dataset.valor === "Período personalizado") {

                datas.classList.remove("hidden");

            } else {

                datas.classList.add("hidden");

                document.getElementById("dataInicial").value = "";
                document.getElementById("dataFinal").value = "";

            }

            atualizarResumo();

        });

    });


    document.getElementById("dataInicial").addEventListener(
        "change",
        atualizarResumo
    );

    document.getElementById("dataFinal").addEventListener(
        "change",
        atualizarResumo
    );


    document.querySelectorAll(".metric-option input").forEach(input => {

        input.addEventListener("change", atualizarResumo);

    });


    document.getElementById("btnCsv").addEventListener(
        "click",
        gerarCsv
    );

}


function mostrarEquipamentosDaEmpresa() {

    const select = document.getElementById("equipamento");

    select.innerHTML = `
        <option value="">Todos os equipamentos</option>
    `;

    const equipamentos = [
        ...new Set(
            dados
                .filter(item => item.empresa === empresaSelecionada)
                .map(item => item.equipamento)
        )
    ];

    equipamentos.forEach(equipamento => {

        select.innerHTML += `
            <option value="${equipamento}">
                ${equipamento}
            </option>
        `;

    });

    equipamentoSelecionado = "";
}


function filtrarDados() {

    const dataInicial = document.getElementById("dataInicial").value;
    const dataFinal = document.getElementById("dataFinal").value;

    return dados.filter(item => {

        if (
            empresaSelecionada &&
            item.empresa !== empresaSelecionada
        ) {
            return false;
        }

        if (
            equipamentoSelecionado &&
            item.equipamento !== equipamentoSelecionado
        ) {
            return false;
        }

        if (
            dataInicial &&
            item.data < dataInicial
        ) {
            return false;
        }

        if (
            dataFinal &&
            item.data > dataFinal
        ) {
            return false;
        }

        return true;
    });

}


function atualizarResumo() {

    const dadosFiltrados = filtrarDados();

    document.getElementById("quantidadeRegistros").innerText =
        dadosFiltrados.length + " registros disponíveis";


    document.getElementById("resEmpresa").innerText =
        empresaSelecionada || "Todas";


    document.getElementById("resEquip").innerText =
        equipamentoSelecionado || "Todos";


    const periodo = document.querySelector(".period-button.selected");

    const dataInicial = document.getElementById("dataInicial").value;
    const dataFinal = document.getElementById("dataFinal").value;


    if (periodo.dataset.valor === "Período personalizado") {

        if (dataInicial || dataFinal) {

            document.getElementById("resPeriodo").innerText =
                (dataInicial || "...") +
                " até " +
                (dataFinal || "...");

        } else {

            document.getElementById("resPeriodo").innerText =
                "Personalizado";

        }

    } else {

        document.getElementById("resPeriodo").innerText =
            periodo.dataset.valor;

    }


    const metricas = document.querySelectorAll(
        ".metric-option input:checked"
    );


    const nomes = [...metricas].map(input => input.value);


    document.getElementById("resMetricas").innerText =
        nomes.length > 0
            ? nomes.join(", ")
            : "Nenhuma";

}


function gerarCsv() {

    const dadosFiltrados = filtrarDados();

    if (dadosFiltrados.length === 0) {

        alert("Nenhum dado encontrado.");

        return;
    }


    const metricas = document.querySelectorAll(
        ".metric-option input:checked"
    );


    const nomes = [...metricas].map(input => input.value);


    let csv = "empresa,equipamento,data";


    if (nomes.includes("CPU")) {
        csv += ",cpu";
    }

    if (nomes.includes("RAM")) {
        csv += ",ram";
    }

    if (nomes.includes("Disco")) {
        csv += ",disco";
    }

    if (nomes.includes("Rede")) {
        csv += ",rede";
    }


    dadosFiltrados.forEach(item => {

        let linha =
            item.empresa + "," +
            item.equipamento + "," +
            item.data;


        if (nomes.includes("CPU")) {
            linha += "," + item.cpu;
        }

        if (nomes.includes("RAM")) {
            linha += "," + item.ram;
        }

        if (nomes.includes("Disco")) {
            linha += "," + item.disco;
        }

        if (nomes.includes("Rede")) {
            linha += "," + item.rede;
        }


        csv += "\n" + linha;

    });


    const arquivo = new Blob(
        [csv],
        { type: "text/csv" }
    );


    const url = URL.createObjectURL(arquivo);

    const link = document.createElement("a");

    link.href = url;
    link.download = "relatorio-argos.csv";
    link.click()
    URL.revokeObjectURL(url);

}

carregarDados();

document.addEventListener('DOMContentLoaded', () => {
    const btnHamburguer = document.getElementById('btn-hamburguer');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function toggleMenu() {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    }

    function ajustarComZoom() {
        if (window.innerWidth >= 1024) {
            btnHamburguer.classList.add('hidden');
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.remove('fixed');
            sidebar.classList.add('relative');
            overlay.classList.add('hidden');
        } else {
            btnHamburguer.classList.remove('hidden');
            sidebar.classList.add('-translate-x-full');
            sidebar.classList.remove('relative');
            sidebar.classList.add('fixed');
        }
    }

    if (btnHamburguer && sidebar && overlay) {
        btnHamburguer.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
        window.addEventListener('resize', ajustarComZoom);
        ajustarComZoom();
    }
});

const funcionarios = [
    { id: 1, nome: "Junin Vilentino", status: "ativo" },
    { id: 2, nome: "Isa Cardoso", status: "ativo" },
    { id: 3, nome: "Pedro Alves", status: "ativo" },
    { id: 4, nome: "Lara da Silva", status: "ativo" },
    { id: 5, nome: "Gabrielly Souza", status: "ativo" },
    { id: 6, nome: "Lucas Silva", status: "inativo" },
    { id: 7, nome: "Mariana Costa", status: "ativo" },
    { id: 8, nome: "Carlos Eduardo", status: "inativo" },
    { id: 9, nome: "Beatriz Oliveira", status: "ativo" },
    { id: 10, nome: "Gabriel Santos", status: "ativo" },
    { id: 11, nome: "Fernanda Lima", status: "inativo" },
    { id: 12, nome: "Rafael Alves", status: "ativo" },
    { id: 13, nome: "Camila Rocha", status: "ativo" },
    { id: 14, nome: "Thiago Martins", status: "inativo" },
    { id: 15, nome: "Amanda Ribeiro", status: "ativo" },
    { id: 16, nome: "Bruno Souza", status: "inativo" },
    { id: 17, nome: "Larissa Pereira", status: "ativo" },
    { id: 18, nome: "Rodrigo Carvalho", status: "ativo" },
    { id: 19, nome: "Juliana Mendes", status: "inativo" },
    { id: 20, nome: "Diego Ferreira", status: "ativo" },
    { id: 21, nome: "Sofia Ramos", status: "inativo" },
    { id: 22, nome: "Mateus Barbosa", status: "ativo" }
];

const container = document.getElementById("lista-funcionarios");
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
    if (!container) return;

    container.innerHTML = "";
    const listaOrdenada = ordenarFuncionarios(funcionarios);
    const listaFiltrada = [];

    for (let i = 0; i < listaOrdenada.length; i++) {
        const empregado = listaOrdenada[i];
        if (empregado.nome.toLowerCase().includes(termo.toLowerCase())) {
            listaFiltrada.push(empregado);
        }
    }

    if (listaFiltrada.length === 0) {
        container.innerHTML = `<p class="text-gray-400 font-['Poppins'] text-sm col-span-full py-4 text-center">Nenhum funcionário encontrado.</p>`;
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
            container.appendChild(card);
        }
    }

    if (termo.trim() !== "") {
        container.style.maxHeight = container.scrollHeight + "px";
    } else {
        container.style.maxHeight = "110px";
    }
}

if (inputBusca) {
    inputBusca.addEventListener("input", function (evento) {
        mostrarFuncionarios(evento.target.value);
    });
}

mostrarFuncionarios();

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
            resizeDelay: 100,
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
    const valoresAbertosIniciais = extrairValoresPorChave(dadosJsonAbertos, "chamados_semana");

    graficoAbertos = criarGraficoBarraHorizontal('graficoChamadosAbertos', 'Chamados Abertos', '#D9383A', valoresAbertosIniciais);
    graficoResolvidos = criarGraficoBarraVertical('graficoChamadosResolvidos', 'Chamados Resolvidos', '#22C55E', dadosJsonResolvidos.semana.labels, dadosJsonResolvidos.semana.valores);
}

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

for (let i = 0; i < botoesFiltros.length; i++) {
    const botao = botoesFiltros[i];
    const indice = i;

    botao.addEventListener("click", function () {
        for (let j = 0; j < botoesFiltros.length; j++) {
            botoesFiltros[j].classList.remove("bg-blue-500", "text-[#09121B]", "border-transparent");
            botoesFiltros[j].classList.add("border-gray-400", "text-gray-400", "hover:border-white", "hover:text-white");
        }

        this.classList.remove("border-gray-400", "text-gray-400", "hover:border-white", "hover:text-white");
        this.classList.add("bg-blue-500", "text-[#09121B]", "border-transparent");

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
      "id_sla": "SLA-030",
      "equipamento": "SW-ACCESS-01",
      "cliente": "Itaú",
      "tipo_sla": "Tempo de Resposta",
      "tempo_excedido": "+45m",
      "gravidade": "medio"
    },
    {
      "id_sla": "SLA-029",
      "equipamento": "RT-CORE-01",
      "cliente": "Santander",
      "tipo_sla": "Disponibilidade",
      "tempo_excedido": "0m",
      "gravidade": "estavel"
    },
    {
      "id_sla": "SLA-028",
      "equipamento": "FW-EDGE-02",
      "cliente": "Nubank",
      "tipo_sla": "Perda de Pacotes",
      "tempo_excedido": "+2h 05m",
      "gravidade": "urgente"
    },
    {
      "id_sla": "SLA-027",
      "equipamento": "FW-EDGE-01",
      "cliente": "Itaú",
      "tipo_sla": "Tempo de Resposta",
      "tempo_excedido": "+5m",
      "gravidade": "medio"
    },
    {
      "id_sla": "SLA-026",
      "equipamento": "SW-CORE-01",
      "cliente": "Banco do Brasil",
      "tipo_sla": "Disponibilidade",
      "tempo_excedido": "0m",
      "gravidade": "estavel"
    },
    {
      "id_sla": "SLA-025",
      "equipamento": "RT-EDGE-03",
      "cliente": "Caixa",
      "tipo_sla": "Latência",
      "tempo_excedido": "+3h 40m",
      "gravidade": "urgente"
    },
    {
      "id_sla": "SLA-024",
      "equipamento": "SW-ACCESS-04",
      "cliente": "Bradesco",
      "tipo_sla": "Tempo de Resposta",
      "tempo_excedido": "+18m",
      "gravidade": "medio"
    },
    {
      "id_sla": "SLA-023",
      "equipamento": "FW-CORE-01",
      "cliente": "BTG Pactual",
      "tipo_sla": "Disponibilidade",
      "tempo_excedido": "0m",
      "gravidade": "estavel"
    },
    {
      "id_sla": "SLA-022",
      "equipamento": "RT-CORE-02",
      "cliente": "Safra",
      "tipo_sla": "Disponibilidade",
      "tempo_excedido": "+4h 10m",
      "gravidade": "urgente"
    },
    {
      "id_sla": "SLA-021",
      "equipamento": "SW-ACCESS-02",
      "cliente": "Santander",
      "tipo_sla": "Tempo de Resposta",
      "tempo_excedido": "+25m",
      "gravidade": "medio"
    },
    {
      "id_sla": "SLA-020",
      "equipamento": "FW-EDGE-03",
      "cliente": "XP Investimentos",
      "tipo_sla": "Latência",
      "tempo_excedido": "0m",
      "gravidade": "estavel"
    },
    {
      "id_sla": "SLA-019",
      "equipamento": "RT-EDGE-01",
      "cliente": "Inter",
      "tipo_sla": "Perda de Pacotes",
      "tempo_excedido": "+1h 50m",
      "gravidade": "urgente"
    },
    {
      "id_sla": "SLA-018",
      "equipamento": "SW-CORE-02",
      "cliente": "Nubank",
      "tipo_sla": "Tempo de Resposta",
      "tempo_excedido": "+12m",
      "gravidade": "medio"
    },
    {
      "id_sla": "SLA-017",
      "equipamento": "FW-CORE-04",
      "cliente": "Itaú",
      "tipo_sla": "Disponibilidade",
      "tempo_excedido": "0m",
      "gravidade": "estavel"
    },
    {
      "id_sla": "SLA-016",
      "equipamento": "SW-ACCESS-03",
      "cliente": "C6 Bank",
      "tipo_sla": "Disponibilidade",
      "tempo_excedido": "+2h 30m",
      "gravidade": "urgente"
    },
    {
      "id_sla": "SLA-015",
      "equipamento": "RT-CORE-04",
      "cliente": "Bradesco",
      "tipo_sla": "Latência",
      "tempo_excedido": "+30m",
      "gravidade": "medio"
    },
    {
      "id_sla": "SLA-014",
      "equipamento": "FW-EDGE-04",
      "cliente": "BTG Pactual",
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