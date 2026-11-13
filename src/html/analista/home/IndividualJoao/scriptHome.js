const empresasMock = [
    {
        id: 1,
        nome: "Bradesco",
        criticos: 3,
        atencao: 0,
        saudaveis: 0
    },
    {
        id: 2,
        nome: "sei la",
        criticos: 1,
        atencao: 2,
        saudaveis: 4
    },
    {
        id: 3,
        nome: "Itaú",
        criticos: 0,
        atencao: 1,
        saudaveis: 6
    }
];


const rankingMock = [
    {
        idDispositivo: 1,
        idEmpresa: 1,
        nome: "FW-CORE-03",
        empresa: "Bradesco",
        categoria: "Firewall",
        status: "Ativo",
        conexao: "Offline",
        alertas_criticos: 8
    },
    {
        idDispositivo: 2,
        idEmpresa: 1,
        nome: "FW-CORE-02",
        empresa: "Bradesco",
        categoria: "Firewall",
        status: "Ativo",
        conexao: "Online",
        alertas_criticos: 6
    },
    {
        idDispositivo: 3,
        idEmpresa: 2,
        nome: "FW-EDGE-01",
        empresa: "Bradesco",
        categoria: "Firewall",
        status: "Ativo",
        conexao: "Online",
        alertas_criticos: 4
    },
    {
        idDispositivo: 4,
        idEmpresa: 2,
        nome: "SW-ACCESS-01",
        empresa: "Itaú",
        categoria: "Switch",
        status: "Ativo",
        conexao: "Online",
        alertas_criticos: 2
    },
    {
        idDispositivo: 5,
        idEmpresa: 2,
        nome: "RT-CORE-01",
        empresa: "Santander",
        categoria: "Router",
        status: "Ativo",
        conexao: "Online",
        alertas_criticos: 1
    }
];


function criarGraficoDisponibilidade(online, offline) {

    const canvas = document.getElementById('graficoDisponibilidade');

    graficoDisponibilidade = new Chart(canvas, {

        // Tipo do gráfico
        type: 'doughnut',

        // Dados
        data: {
            labels: ['Online', 'Offline'],

            datasets: [{
                data: [online, offline],

                backgroundColor: [
                    '#22c55e',
                    '#1e293b'
                ],

                borderWidth: 0,
                hoverOffset: 0
            }]
        },

        // Configurações visuais
        options: {
            responsive: true,
            maintainAspectRatio: false,

            // Espessura do círculo
            cutout: '78%',

            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function carregarCardsEmpresas() {
    const container = document.getElementById('containerEmpresas');

    container.innerHTML = '';

    empresasMock.forEach(empresa => {

        let total = empresa.atencao + empresa.criticos + empresa.saudaveis;

        const card = document.createElement('div');
        card.className = `
            mt-8 bg-card w-full min-h-[380px]
            rounded-xl border border-light-blue/20
            p-6

            cursor-pointer
            transition-colors duration-200
            hover:bg-white/5
            active:bg-white/10
        `;

        card.addEventListener('click', () => {
            direcionarPaginaEquipamentos(empresa.id);
        });

        card.innerHTML = `
            <h2 class="text-center text-xl font-bold mb-5">
                ${empresa.nome}
            </h2>

            <div class="border-t border-white/10"></div>

            <div class="flex items-center justify-between py-5 px-1">
                <span class="text-white/60 text-sm font-semibold">
                    Equipamentos monitorados
                </span>

                <span class="text-light-blue text-2xl font-bold">
                    ${total}
                </span>
            </div>

            <div class="border-t border-white/10"></div>

            <p class="text-white/60 text-xs font-bold text-center uppercase mt-3 mb-3">
                Distribuição de saúde
            </p>

            <div class="relative w-36 h-36 mx-auto">

                <canvas id="grafico-saude-${empresa.id}"></canvas>

                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

                    <span class="text-white text-3xl font-bold">
                        ${total}
                    </span>

                    <span class="text-white/50 text-[10px] font-bold uppercase">
                        Total
                    </span>

                </div>

            </div>

            <div class="grid grid-cols-3 gap-2 mt-4">

                <div class="flex flex-col items-center gap-1">
                    <div class="flex items-center gap-1">
                        <span class="size-2 rounded-full bg-red-500"></span>
                        <span class="text-red-500 font-bold">
                            ${empresa.criticos}
                        </span>
                    </div>
                    <span class="text-white/50 text-[10px]">Críticos</span>
                </div>

                <div class="flex flex-col items-center gap-1">
                    <div class="flex items-center gap-1">
                        <span class="size-2 rounded-full bg-amber-400"></span>
                        <span class="text-amber-400 font-bold">
                            ${empresa.atencao}
                        </span>
                    </div>
                    <span class="text-white/50 text-[10px]">Atenção</span>
                </div>

                <div class="flex flex-col items-center gap-1">
                    <div class="flex items-center gap-1">
                        <span class="size-2 rounded-full bg-green-500"></span>
                        <span class="text-green-500 font-bold">
                            ${empresa.saudaveis}
                        </span>
                    </div>
                    <span class="text-white/50 text-[10px]">Saudáveis</span>
                </div>

            </div>
        `;

        container.appendChild(card)
        const canvas = document.getElementById(
            `grafico-saude-${empresa.id}`
        );

        new Chart(canvas, {

            type: 'doughnut',

            data: {
                labels: ['Críticos', 'Atenção', 'Saudáveis'],

                datasets: [{
                    data: [
                        empresa.criticos,
                        empresa.atencao,
                        empresa.saudaveis
                    ],

                    backgroundColor: [
                        '#ef4444',
                        '#fbbf24',
                        '#22c55e'
                    ],

                    borderColor: '#0D1924',
                    borderWidth: 2,

                    hoverOffset: 4
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                cutout: '68%',

                plugins: {
                    legend: {
                        display: false
                    }
                }
            }

        });
    })
}


function carregarRankEquipamentos() {
    const container = document.getElementById('containerRanking');
    container.innerHTML = "";

    rankingMock.forEach((item, index) => {

        const posicao = index + 1;

        const online = item.conexao.toLowerCase() === "online";

        const corPosicao = posicao <= 3
            ? "bg-red-500/10 text-red-500"
            : "bg-[#1A2731] text-white/50";

        const corConexao = online
            ? "bg-green-500"
            : "bg-gray-500";

        const corTextoConexao = online
            ? "text-green-500"
            : "text-gray-500";

        const card = document.createElement('div');

        card.className = `
            grid grid-cols-[60px_minmax(220px,1.5fr)_minmax(100px,0.6fr)_minmax(100px,0.5fr)_minmax(120px,0.6fr)_minmax(180px,0.8fr)]
            items-center gap-4 px-6 py-4 min-w-[900px]
            border-t border-white/10

            cursor-pointer
            transition-colors duration-200
            hover:bg-white/5
            active:bg-white/10
        `;

        card.addEventListener('click', () => {
            direcionarPaginaDetalhesEquipamentos(item);
        });

        card.innerHTML = `
            <!-- Rank -->
            <div>
                <div class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${corPosicao}">
                    ${posicao}°
                </div>
            </div>

            <!-- Equipamento -->
            <div class="flex flex-col gap-1">
                <span class="text-cyan-400 font-bold text-sm">
                    ${item.nome}
                </span>

                <span class="text-white/50 text-xs">
                    ${item.empresa}
                </span>
            </div>

            <!-- Categoria -->
            <div class="text-white/80 text-sm">
                ${item.categoria}
            </div>

            <!-- Status -->
            <div class="text-cyan-400 font-bold text-sm">
                ${item.status}
            </div>

            <!-- Conexão -->
            <div class="flex items-center gap-2 ${corTextoConexao} text-sm font-semibold">
                <span class="w-2 h-2 rounded-full ${corConexao}"></span>
                ${item.conexao}
            </div>

            <!-- Alertas críticos: somente quantidade -->
            <div class="text-red-500 font-bold text-sm text-center">
                ${item.alertas_criticos}
            </div>
        `;
        container.appendChild(card);
    });
}

async function chamarApi(caminho, metodo, corpo) {
    try {
        return await apiFetch(caminho, {
            method: metodo,
            body: corpo ? JSON.stringify(corpo) : undefined
        });
    } catch (erro) {
        if (erro && erro.sessaoExpirada) {
            return { ok: false, status: 401, dados: null };
        }
        return { ok: false, status: 0, dados: null };
    }
}

async function carregarInformacoesUsuario() {
    let nome_title = document.getElementById("nome_title");
    let foto = document.getElementById("foto_usuario");

    const resposta = await chamarApi("/usuarios/informacoes_usuario", "GET");

    console.log(resposta.dados[0])
    nome_title.textContent = resposta.dados[0].nome;
    foto.textContent = resposta.dados[0].nome[0]
}

async function direcionarPaginaEquipamentos(empresaId) {
    window.location.href = `equipamentos.html?idEmpresa=${empresaId}`;
}

async function direcionarPaginaDetalhesEquipamentos(dados) {
    window.location.href = `../equipamento.html?idEmpresa=${dados.idEmpresa}idEquipamento=${dados.idDispositivo}`;
}


document.addEventListener('DOMContentLoaded', () => {
    carregarCardsEmpresas()
    carregarRankEquipamentos()
    carregarInformacoesUsuario();
});
