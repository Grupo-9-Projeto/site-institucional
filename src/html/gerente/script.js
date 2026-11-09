function abrirModal(idModal = 'modal') {
    const el = document.getElementById(idModal);
    if (el) {
        el.classList.remove('hidden');
        el.style.display = 'flex';
    } else {
        console.error(`Modal com id "${idModal}" não foi encontrado no HTML!`);
    }
}

function fecharModal(idModal = 'modal') {
    const el = document.getElementById(idModal);
    if (el) {
        el.style.display = 'none';
        el.classList.add('hidden');
    }
}

window.abrirModal = abrirModal;
window.fecharModal = fecharModal;

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
            { "empresa": "Bradesco", "equipamento": "FW-CORE-02", "data": "2026-09-18", "cpu": "88.0", "ram": "79.4", "disco": "55.2", "rede": "310.8" },
            { "empresa": "Itaú", "equipamento": "SW-ACCESS-01", "data": "2026-09-15", "cpu": "60.4", "ram": "78.0", "disco": "50.0", "rede": "820.0" },
            { "empresa": "Santander", "equipamento": "RT-CORE-01", "data": "2026-09-15", "cpu": "54.2", "ram": "48.6", "disco": "30.0", "rede": "120.0" }
        ];
    }
}

const dadosJsonSlas = {
    "em_risco": [
        {
            "equipamento": "FW-CORE-03",
            "cliente": "Bradesco",
            "tipo_sla": "Disponibilidade",
            "tempo_texto": "restam 24 min",
            "porcentagem": 85,
            "gravidade": "urgente",
            "peso_ordenacao": 24
        },
        {
            "equipamento": "SW-ACCESS-01",
            "cliente": "Itaú",
            "tipo_sla": "Tempo de Resposta",
            "tempo_texto": "restam 45 min",
            "porcentagem": 60,
            "gravidade": "medio",
            "peso_ordenacao": 45
        },
        {
            "equipamento": "FW-CORE-02",
            "cliente": "Bradesco",
            "tipo_sla": "Resolução",
            "tempo_texto": "restam 1h 10min",
            "porcentagem": 40,
            "gravidade": "urgente",
            "peso_ordenacao": 70
        }
    ],
    "violados": [
        {
            "equipamento": "SRV-LDAP-01",
            "cliente": "Banco do Brasil",
            "tipo_sla": "Segurança",
            "tempo_texto": "excedido em 2h 10min",
            "porcentagem": 100,
            "gravidade": "urgente",
            "peso_ordenacao": 130
        },
        {
            "equipamento": "FW-EDGE-01",
            "cliente": "Nubank",
            "tipo_sla": "Resolução",
            "tempo_texto": "excedido em 45 min",
            "porcentagem": 100,
            "gravidade": "urgente",
            "peso_ordenacao": 45
        }
    ]
};

let abaAtiva = "em_risco";

function renderizarSLAs() {
    const containerSLAs = document.getElementById("lista-slas-container");
    const btnEmRisco = document.getElementById("btn-em-risco");
    const btnViolados = document.getElementById("btn-violados");
    const indicador = document.getElementById("aba-indicador");

    if (!containerSLAs) return;

    const totalEmRisco = dadosJsonSlas.em_risco.length;
    const totalViolados = dadosJsonSlas.violados.length;

    if (btnEmRisco) btnEmRisco.innerText = `Em risco(${totalEmRisco})`;
    if (btnViolados) btnViolados.innerText = `Violados(${totalViolados})`;

    if (indicador) {
        if (abaAtiva === "em_risco") {
            btnEmRisco.classList = "text-yellow-400 font-semibold text-[12px] transition-colors cursor-pointer";
            indicador.className = "bg-yellow-400 h-[2px] w-20 mb-3 mt-2 translate-x-0 transition-all duration-300";
            btnViolados.classList = "text-gray-400 font-semibold text-[12px] transition-colors cursor-pointer";
        } else {
            btnEmRisco.classList = "text-gray-400 font-semibold text-[12px] transition-colors cursor-pointer";
            btnViolados.className = "text-red-400 font-semibold text-[12px] transition-colors cursor-pointer";
            indicador.className = "bg-red-400 h-[2px] w-20 mb-3 mt-2 -ml-6 translate-x-28 transition-all duration-300";
        }
    }

    let listaDados = abaAtiva === "em_risco" ? [...dadosJsonSlas.em_risco] : [...dadosJsonSlas.violados];

    if (abaAtiva === "em_risco") {
        listaDados.sort((a, b) => a.peso_ordenacao - b.peso_ordenacao);
    } else {
        listaDados.sort((a, b) => b.peso_ordenacao - a.peso_ordenacao);
    }

    const top3 = listaDados.slice(0, 3);
    containerSLAs.innerHTML = "";

    top3.forEach(item => {
        let corBorda = "border-red-500";
        let corBarra = "bg-red-400";
        let corTextoTempo = "text-red-400";

        if (item.gravidade === "medio") {
            corBorda = "border-amber-500";
            corBarra = "bg-amber-400";
            corTextoTempo = "text-amber-400";
        }

        const card = document.createElement("div");
        card.className = `flex flex-col p-3.5 bg-[#09121B] rounded border-l-4 ${corBorda} font-['Poppins'] text-sm gap-2`;

        card.innerHTML = `
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-2">
                    <span class="text-cyan-400 font-semibold text-[13px]">${item.equipamento}</span>
                    <span class="text-gray-300 text-[12px]">- ${item.cliente} - ${item.tipo_sla}</span>
                </div>
                <span class="${corTextoTempo} font-semibold text-[12px]">${item.tempo_texto}</span>
            </div>
            <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div class="${corBarra} h-full rounded-full" style="width: ${item.porcentagem}%;"></div>
            </div>
        `;

        containerSLAs.appendChild(card);
    });
}

const dadosClientes = [
    { nome: "Bradesco", status: "Critico", texto_violados: "2 SLAs violados" },
    { nome: "Itaú", status: "Atencao", texto_violados: "1 SLA violado" },
    { nome: "Santander", status: "Estavel", texto_violados: "0 SLAs violados" },
    { nome: "Banco do Brasil", status: "Atencao", texto_violados: "1 SLA violado" },
    { nome: "Nubank", status: "Estavel", texto_violados: "0 SLAs violados" }
];

function chamadosCliente(termoBusca = "") {
    const clientes = document.getElementById("container_clientes");
    if (!clientes) return;

    clientes.innerHTML = "";

    const filtrados = dadosClientes.filter(c => c.nome.toLowerCase().includes(termoBusca.toLowerCase()));

    if (filtrados.length === 0) {
        clientes.innerHTML = `<p class="text-gray-400 text-xs text-center py-4">Nenhum cliente encontrado.</p>`;
        return;
    }

    filtrados.forEach(cliente => {
        let corBadgeBg = cliente.status === "Critico" ? "bg-red-400/20 text-red-300 border-red-400/20" :
            cliente.status === "Atencao" ? "bg-amber-400/20 text-amber-300 border-amber-400/20" :
                "bg-green-400/20 text-green-300 border-green-400/20";

        const card = document.createElement("div");
        card.className = "flex items-center justify-between p-3.5 bg-[#09121B] rounded-xl border border-white/5 font-['Poppins']";

        card.innerHTML = `
            <div class="flex flex-col gap-1">
                <span class="text-white font-bold text-sm">${cliente.nome}</span>
                <span class="text-gray-400 text-xs">${cliente.texto_violados}</span>
            </div>
            <div class="px-3 py-1 rounded-full text-xs font-semibold border ${corBadgeBg}">
                ${cliente.status === "Atencao" ? "Atenção" : cliente.status === "Critico" ? "Crítico" : "Estável"}
            </div>
        `;

        clientes.appendChild(card);
    });
}

const funcionarios = [
    { id: 1, nome: "Junin da Silva", status: "ativo" },
    { id: 2, nome: "Isabella Albuquerque", status: "ativo" },
    { id: 3, nome: "Pedro", status: "ativo" },
    { id: 4, nome: "Lara Pereira", status: "ativo" }
];

function mostrarFuncionarios(termo = "") {
    const containerFuncionarios = document.getElementById("lista-funcionarios");
    if (!containerFuncionarios) return;

    containerFuncionarios.innerHTML = "";

    funcionarios.forEach(empregado => {
        if (empregado.nome.toLowerCase().includes(termo.toLowerCase())) {
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
    });
}

let graficoAbertos = null;
let graficoCriticidade = null;

const dadosJsonAbertos = {
    "resumo_por_equipamento": [
        {
            "id_equipamento": "FW-CORE-02",
            "chamados_semana": 4,
            "chamados_mes": 12,
            "chamados": [
                { "data": "2026-09-02", "estado": "Critico" },
                { "data": "2026-09-05", "estado": "Atencao" },
                { "data": "2026-09-12", "estado": "Estavel" },
                { "data": "2026-09-18", "estado": "Critico" }
            ]
        },
        {
            "id_equipamento": "FW-CORE-03",
            "chamados_semana": 9,
            "chamados_mes": 22,
            "chamados": [
                { "data": "2026-09-10", "estado": "Critico" },
                { "data": "2026-09-12", "estado": "Critico" },
                { "data": "2026-09-15", "estado": "Atencao" }
            ]
        },
        {
            "id_equipamento": "SW-ACCESS-01",
            "chamados_semana": 6,
            "chamados_mes": 15,
            "chamados": [
                { "data": "2026-09-14", "estado": "Atencao" },
                { "data": "2026-09-19", "estado": "Estavel" }
            ]
        },
        {
            "id_equipamento": "RT-CORE-01",
            "chamados_semana": 3,
            "chamados_mes": 8,
            "chamados": [
                { "data": "2026-09-20", "estado": "Estavel" }
            ]
        },
        {
            "id_equipamento": "FW-EDGE-01",
            "chamados_semana": 7,
            "chamados_mes": 17,
            "chamados": [
                { "data": "2026-09-22", "estado": "Critico" },
                { "data": "2026-09-25", "estado": "Atencao" }
            ]
        }
    ]
};

function calcularCriticidadePorFiltro(dataInicio, dataFim) {
    let critico = 0;
    let atencao = 0;
    let estavel = 0;

    const lista = dadosJsonAbertos.resumo_por_equipamento;
    for (let i = 0; i < lista.length; i++) {
        const chamados = lista[i].chamados;
        if (chamados) {
            for (let j = 0; j < chamados.length; j++) {
                const item = chamados[j];
                const dataItem = new Date(item.data + "T00:00:00");

                if (dataItem >= dataInicio && dataItem <= dataFim) {
                    if (item.estado === "Critico") critico++;
                    else if (item.estado === "Atencao") atencao++;
                    else if (item.estado === "Estavel") estavel++;
                }
            }
        }
    }

    return [critico, atencao, estavel];
}

function calcularCriticidadePorPeriodoFixo(tipoPeriodo) {
    const hoje = new Date("2026-09-26T00:00:00");
    const inicio = new Date(hoje);

    if (tipoPeriodo === "semana") {
        inicio.setDate(hoje.getDate() - 7);
    } else {
        inicio.setMonth(hoje.getMonth() - 1);
    }

    return calcularCriticidadePorFiltro(inicio, hoje);
}

function renderizarGraficos() {
    const canvasAbertos = document.getElementById('graficoChamadosAbertos');
    const canvasCrit = document.getElementById('graficoCriticidadeEquipamento');

    if (canvasAbertos) {
        if (graficoAbertos) graficoAbertos.destroy();
        graficoAbertos = new Chart(canvasAbertos.getContext('2d'), {
            type: 'bar',
            data: {
                labels: dadosJsonAbertos.resumo_por_equipamento.map(e => e.id_equipamento),
                datasets: [{
                    label: 'Chamados Abertos',
                    data: dadosJsonAbertos.resumo_por_equipamento.map(e => e.chamados_semana),
                    backgroundColor: '#D9383A',
                    borderRadius: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(255, 255, 255, 0.08)' } },
                    y: { ticks: { color: '#9CA3AF' }, grid: { display: false } }
                }
            }
        });
    }

    if (canvasCrit) {
        if (graficoCriticidade) graficoCriticidade.destroy();

        graficoCriticidade = new Chart(canvasCrit.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Crítico', 'Atenção', 'Estável'],
                datasets: [{
                    data: calcularCriticidadePorPeriodoFixo('semana'),
                    backgroundColor: ['#EF4444', '#F59E0B', '#22C55E'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: '#9CA3AF',
                            font: { family: 'Poppins', size: 11 },
                            padding: 10,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                let value = context.raw || 0;
                                return ` ${label}: ${value} chamados`;
                            }
                        }
                    }
                }
            }
        });
    }
}

function atualizarTextoSubtitulos(texto) {
    const subtitulos = document.querySelectorAll(".subtitulo-grafico");
    for (let i = 0; i < subtitulos.length; i++) {
        subtitulos[i].textContent = texto;
    }
}

function atualizarGraficoAbertos(novosDados) {
    if (!graficoAbertos) return;
    graficoAbertos.data.datasets[0].data = novosDados;
    graficoAbertos.update();
}

function atualizarGraficoCriticidade(novosDados) {
    if (!graficoCriticidade) return;
    graficoCriticidade.data.datasets[0].data = novosDados;
    graficoCriticidade.update();
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicialização dos elementos do modal
    modal = document.getElementById('modal');
    modal_excluir = document.getElementById('modal_excluir');

    const btnSair = document.getElementById('btn-sair');
    const btnFecharModal = document.getElementById('btn-fechar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');

    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModal();
        });
    }

    if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModal);
    if (btnCancelarModal) btnCancelarModal.addEventListener('click', fecharModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) fecharModal();
        });
    }

    if (modal_excluir) {
        modal_excluir.addEventListener('click', (e) => {
            if (e.target === modal_excluir) fecharModalExcluir();
        });
    }

    carregarDadosRelatorio();
    renderizarSLAs();
    chamadosCliente();
    mostrarFuncionarios();
    renderizarGraficos();

    const btnEmRisco = document.getElementById("btn-em-risco");
    const btnViolados = document.getElementById("btn-violados");
    const inputBusca = document.getElementById("input-busca");
    const inputBuscaCliente = document.getElementById("input-busca-cliente");

    if (btnEmRisco) {
        btnEmRisco.addEventListener("click", () => {
            abaAtiva = "em_risco";
            renderizarSLAs();
        });
    }

    if (btnViolados) {
        btnViolados.addEventListener("click", () => {
            abaAtiva = "violados";
            renderizarSLAs();
        });
    }

    if (inputBusca) {
        inputBusca.addEventListener("input", (e) => {
            mostrarFuncionarios(e.target.value);
        });
    }

    if (inputBuscaCliente) {
        inputBuscaCliente.addEventListener("input", (e) => {
            chamadosCliente(e.target.value);
        });
    }

    const botoesFiltros = document.querySelectorAll(".btn-filtro");
    const painelPersonalizado = document.getElementById("personalizados");

    for (let i = 0; i < botoesFiltros.length; i++) {
        const botao = botoesFiltros[i];
        const indice = i;

        botao.addEventListener("click", function () {
            for (let j = 0; j < botoesFiltros.length; j++) {
                botoesFiltros[j].classList.remove("bg-light-blue", "text-main-blue", "border-transparent", "font-bold");
                botoesFiltros[j].classList.add("border-white/15", "text-white/70", "font-semibold", "hover:border-white", "hover:text-white");
            }

            this.classList.remove("border-white/15", "text-white/70", "hover:border-white", "hover:text-white");
            this.classList.add("bg-light-blue", "text-main-blue", "border-transparent", "font-bold");

            if (indice === 0) {
                atualizarTextoSubtitulos("Última Semana");
                if (painelPersonalizado) {
                    painelPersonalizado.classList.remove("max-h-30", "opacity-100");
                    painelPersonalizado.classList.add("max-h-0", "opacity-0");
                }
                atualizarGraficoAbertos(dadosJsonAbertos.resumo_por_equipamento.map(e => e.chamados_semana));
                atualizarGraficoCriticidade(calcularCriticidadePorPeriodoFixo('semana'));
            } else if (indice === 1) {
                atualizarTextoSubtitulos("Último Mês");
                if (painelPersonalizado) {
                    painelPersonalizado.classList.remove("max-h-30", "opacity-100");
                    painelPersonalizado.classList.add("max-h-0", "opacity-0");
                }
                atualizarGraficoAbertos(dadosJsonAbertos.resumo_por_equipamento.map(e => e.chamados_mes));
                atualizarGraficoCriticidade(calcularCriticidadePorPeriodoFixo('mes'));
            } else if (indice === 2) {
                atualizarTextoSubtitulos("Período Personalizado");
                if (painelPersonalizado) {
                    painelPersonalizado.classList.remove("max-h-0", "opacity-0");
                    painelPersonalizado.classList.add("max-h-30", "opacity-100");
                }
            }
        });
    }

    const inputDataInicio = document.getElementById("data-inicio");
    const inputDataFim = document.getElementById("data-fim");

    function aplicarFiltroDatasPersonalizadas() {
        if (!inputDataInicio || !inputDataFim) return;
        const inicioStr = inputDataInicio.value;
        const fimStr = inputDataFim.value;

        if (!inicioStr || !fimStr) return;

        const dataInicio = new Date(inicioStr + "T00:00:00");
        const dataFim = new Date(fimStr + "T23:59:59");

        if (dataFim < dataInicio) return;

        const novosDadosCriticidade = calcularCriticidadePorFiltro(dataInicio, dataFim);
        atualizarGraficoCriticidade(novosDadosCriticidade);
    }

    if (inputDataInicio) inputDataInicio.addEventListener("change", aplicarFiltroDatasPersonalizadas);
    if (inputDataFim) inputDataFim.addEventListener("change", aplicarFiltroDatasPersonalizadas);
});