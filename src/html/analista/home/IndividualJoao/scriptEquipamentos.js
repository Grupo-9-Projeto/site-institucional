
const rankingMock = [
    {
        idDispositivo: 1,
        idEmpresa: 1,
        nome: "FW-CORE-03",
        empresa: "Bradesco",
        categoria: "Firewall",
        status: "Ativo",
        conexao: "Offline",
        alertas_criticos: 8,
        ultimo_alerta: "CPU > 90%",
        data_alerta: "15/09/2026"
    },
    {
        idDispositivo: 2,
        idEmpresa: 1,
        nome: "FW-CORE-02",
        empresa: "Bradesco",
        categoria: "Firewall",
        status: "Ativo",
        conexao: "Online",
        alertas_criticos: 6,
        ultimo_alerta: "Perda de pacotes > 15%",
        data_alerta: "15/09/2026"
    },
    {
        idDispositivo: 3,
        idEmpresa: 1,
        nome: "FW-EDGE-01",
        empresa: "Bradesco",
        categoria: "Firewall",
        status: "Ativo",
        conexao: "Online",
        alertas_criticos: 4,
        ultimo_alerta: "Link down — interface WAN",
        data_alerta: "14/09/2026"
    },
    {
        idDispositivo: 4,
        idEmpresa: 2,
        nome: "SW-ACCESS-01",
        empresa: "Itaú",
        categoria: "Switch",
        status: "Ativo",
        conexao: "Online",
        alertas_criticos: 2,
        ultimo_alerta: "Nenhum alerta",
        data_alerta: null
    },
    {
        idDispositivo: 5,
        idEmpresa: 3,
        nome: "RT-CORE-01",
        empresa: "Santander",
        categoria: "Router",
        status: "Ativo",
        conexao: "Online",
        alertas_criticos: 1,
        ultimo_alerta: "Nenhum alerta",
        data_alerta: null
    }
];

document.addEventListener('DOMContentLoaded', () => {
    carregarEquipamentosEmpresa();
    carregarInformacoesUsuario();
});

async function direcionarPaginaDetalhesEquipamentos(dados) {
    window.location.href = `../equipamento.html?idEmpresa=${dados.idEmpresa}idEquipamento=${dados.idDispositivo}`;
}

function pegarIdDaUrl() {
    const parametros = new URLSearchParams(window.location.search);
    const id = Number(parametros.get("idEmpresa"));

    return id || 0;
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

function carregarEquipamentosEmpresa() {

    const container = document.getElementById('equipamentos-container');

    const empresaId = pegarIdDaUrl();

    // Filtra somente os equipamentos da empresa selecionada
    const equipamentosEmpresa = rankingMock.filter(item =>
        Number(item.idEmpresa) === empresaId
    );

    // Caso a empresa não possua equipamentos
    if (equipamentosEmpresa.length === 0) {

        container.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8 text-white/50">
                    Nenhum equipamento encontrado para esta empresa.
                </td>
            </tr>
        `;

        document.getElementById('empresa-titulo').textContent = 'Empresa';
        document.getElementById('empresa-nome-breadcrumb').textContent = 'Empresa';

        document.getElementById('empresa-subtitulo').textContent =
            '0 equipamentos vinculados';

        return;
    }

    // Atualiza o nome da empresa
    const nomeEmpresa = equipamentosEmpresa[0].empresa;

    document.getElementById('empresa-titulo').textContent = nomeEmpresa;

    document.getElementById('empresa-nome-breadcrumb').textContent = nomeEmpresa;

    // Atualiza a quantidade de equipamentos
    document.getElementById('empresa-subtitulo').textContent =
        `${equipamentosEmpresa.length} equipamentos vinculados`;

    // Limpa a tabela
    container.innerHTML = '';

    // Cria uma linha para cada equipamento
    equipamentosEmpresa.forEach(item => {

        const online = item.conexao.toLowerCase() === 'online';

        const corConexao = online
            ? 'bg-green-500'
            : 'bg-gray-500';

        const textoConexao = online
            ? 'text-green-500'
            : 'text-gray-500';

        const ultimoAlerta = item.ultimo_alerta || 'Nenhum alerta';

        const dataAlerta = item.data_alerta || '';

        const linha = document.createElement('tr');

        linha.className = `
            h-[75px]
            border-b border-white/10
            last:border-b-0
            transition-colors duration-200
            hover:bg-white/5
            cursor-pointer
        `;

        
        linha.addEventListener('click', () => {
            direcionarPaginaDetalhesEquipamentos(item);
        });

        linha.innerHTML = `

            <!-- Equipamento -->
            <td class="py-3 px-4 whitespace-nowrap">
                <div class="flex items-center gap-10">

                    <span class="w-2 h-2 rounded-full ${corConexao} shrink-0"></span>

                    <span class="text-cyan-400 font-bold">
                        ${item.nome}
                    </span>

                </div>
            </td>

            <!-- Categoria -->
            <td class="py-3 px-4 text-white/80 whitespace-nowrap">
                ${item.categoria}
            </td>

            <!-- Status -->
            <td class="py-3 px-4 whitespace-nowrap">
                <span class="inline-block min-w-[150px] rounded bg-cyan-500/10 px-3 py-1 text-cyan-400 font-semibold text-xs">
                    ${item.status}
                </span>
            </td>

            <!-- Conexão -->
            <td class="py-3 px-4 whitespace-nowrap">
                <span class="${textoConexao} font-semibold">
                    ${item.conexao}
                </span>
            </td>

            <!-- Último alerta -->
            <td class="py-3 px-4">
                <div class="flex items-start gap-2">

                    ${item.ultimo_alerta && item.ultimo_alerta !== 'Nenhum alerta'
                        ? '<span class="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>'
                        : '<span class="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></span>'
                    }

                    <div class="flex flex-col gap-1">

                        <span class="text-white/90 text-sm">
                            ${ultimoAlerta}
                        </span>

                        <span class="text-white/40 text-[10px]">
                            ${dataAlerta}
                        </span>

                    </div>

                </div>
            </td>
        `;

        // Clique na linha
        linha.addEventListener('click', () => {
            console.log('Equipamento selecionado:', item.idDispositivo);
        });

        container.appendChild(linha);

    });
}
