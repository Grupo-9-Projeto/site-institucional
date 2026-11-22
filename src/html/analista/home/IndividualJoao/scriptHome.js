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

async function carregarCardsEmpresas() {
    const container = document.getElementById('containerEmpresas');

    container.innerHTML = '';

    const dados = await chamarApi("/joao/equipamentos_monitorados", "GET");

    if (!dados.ok || !Array.isArray(dados.dados)) return;

    dados.dados.forEach(async empresa => {

        const resposta1 = await chamarApi("/joao/alertas_empresa", "POST", {
            id_empresa: empresa.id_empresa
        })
        const resposta2 = await chamarApi("/joao/porcentagem_empresa", "POST", {
            id_empresa: empresa.id_empresa
        })

        if (!resposta1.ok || !resposta2.ok || !resposta1.dados?.[0] || !resposta2.dados?.[0]) return;

        const dadosAlertas = resposta1.dados[0];
        const percentual = resposta2.dados[0];



        let total = dadosAlertas.alerta_atencao + dadosAlertas.alerta_critico + dadosAlertas.alerta_saudavel;

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
            direcionarPaginaEquipamentos(empresa.id_empresa);
        });

        card.innerHTML = `
            <h2 class="text-center text-xl font-bold mb-5">
                ${empresa.nome_empresa}
            </h2>

            <div class="border-t border-white/10"></div>

            <div class="flex items-center justify-between py-5 px-1">
                <span class="text-white/60 text-sm font-semibold">
                    Equipamentos monitorados
                </span>

                <span class="text-light-blue text-2xl font-bold">
                    ${empresa.dispositivos_monitorados}
                </span>
            </div>

            <div class="border-t border-white/10"></div>

<!-- Disponibilidade da infraestrutura -->
<div class="flex items-center justify-between py-4 px-1">

    <span class="text-white/60 text-xs font-bold uppercase">
        Infraestrutura disponível
    </span>

    <span class="text-green-500 text-2xl font-bold">
        ${Math.trunc(percentual.porcentagem)}%
    </span>

</div>

<div class="border-t border-white/10"></div>

<p class="text-white/60 text-xs font-bold text-center uppercase mt-3 mb-3">
    Distribuição de saúde
</p>

            <div class="relative w-36 h-36 mx-auto">

                <canvas id="grafico-saude-${empresa.id_empresa}"></canvas>

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
                            ${dadosAlertas.alerta_critico}
                        </span>
                    </div>
                    <span class="text-white/50 text-[10px]">Críticos</span>
                </div>

                <div class="flex flex-col items-center gap-1">
                    <div class="flex items-center gap-1">
                        <span class="size-2 rounded-full bg-amber-400"></span>
                        <span class="text-amber-400 font-bold">
                            ${dadosAlertas.alerta_atencao}
                        </span>
                    </div>
                    <span class="text-white/50 text-[10px]">Atenção</span>
                </div>

                <div class="flex flex-col items-center gap-1">
                    <div class="flex items-center gap-1">
                        <span class="size-2 rounded-full bg-green-500"></span>
                        <span class="text-green-500 font-bold">
                            ${dadosAlertas.alerta_saudavel}
                        </span>
                    </div>
                    <span class="text-white/50 text-[10px]">Saudáveis</span>
                </div>

            </div>
        `;

        container.appendChild(card)
        const canvas = document.getElementById(
            `grafico-saude-${empresa.id_empresa}`
        );

        new Chart(canvas, {

            type: 'doughnut',

            data: {
                labels: ['Críticos', 'Atenção', 'Saudáveis'],

                datasets: [{
                    data: [
                        dadosAlertas.alerta_critico,
                        dadosAlertas.alerta_atencao,
                        dadosAlertas.alerta_saudavel
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



async function carregarRankEquipamentos() {
    const container = document.getElementById('containerRanking');
    container.innerHTML = "";

    const dados = await chamarApi("/joao/rankEquipamentos", "GET");

    if (!dados.ok || !Array.isArray(dados.dados)) return;

    dados.dados.forEach((item, index) => {

        const posicao = index + 1;

        const ativo = item.status.toLowerCase() === "ativo";

        const corPosicao = posicao <= 3
            ? "bg-red-500/10 text-red-500"
            : "bg-[#1A2731] text-white/50";

        const corStatus = ativo
            ? "bg-green-500"
            : "bg-gray-500";

        const corTextoStatus = ativo
            ? "text-green-500"
            : "text-gray-500";

        const card = document.createElement('div');

        card.className = `
    grid grid-cols-[60px_minmax(200px,1.5fr)_minmax(120px,0.7fr)_minmax(120px,0.7fr)_minmax(150px,0.8fr)]
    items-center gap-4 px-6 py-4 min-w-[750px]
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

            <!-- Endereço MAC -->
            <div class="flex flex-col gap-1">
                <span class="text-cyan-400 font-bold text-sm">
                    ${item.endereco_mac}
                </span>

                <span class="text-white/40 text-xs">
                    Endereço MAC
                </span>
            </div>

            <!-- Categoria -->
            <div class="text-white/80 text-sm">
                ${item.categoria}
            </div>

            <!-- Status -->
            <div class="flex items-center gap-2 ${corTextoStatus} text-sm font-semibold">
                <span class="w-2 h-2 rounded-full ${corStatus}"></span>
                ${item.status}
            </div>

            <!-- Alertas críticos -->
            <div class="flex items-center justify-center gap-2">
                <span class="text-red-500 font-bold text-lg">
                    ${item.alertas_criticos}
                </span>

                <span class="text-white/40 text-xs">
                    críticos
                </span>
            </div>
        `;

        container.appendChild(card);
    });
}


async function carregarInformacoesUsuario() {
    let nome_title = document.getElementById("nome_title");
    let foto = document.getElementById("foto_usuario");

    const resposta = await chamarApi("/usuarios/informacoes_usuario", "GET");

    if (!resposta.ok || !Array.isArray(resposta.dados) || !resposta.dados[0]) return;

    nome_title.textContent = resposta.dados[0].nome;
    foto.textContent = resposta.dados[0].nome[0]
}

async function direcionarPaginaEquipamentos(empresaId) {
    window.location.href = `equipamentos.html?idEmpresa=${empresaId}`;
}

async function direcionarPaginaDetalhesEquipamentos(dados) {
    window.location.href = `../equipamento.html?idEmpresa=${dados.id_empresa}&idEquipamento=${dados.id_dispositivo}`;
}


document.addEventListener('DOMContentLoaded', () => {
    if (!exigirAnalista()) return;

    carregarCardsEmpresas()
    carregarRankEquipamentos()
    carregarInformacoesUsuario();
});
