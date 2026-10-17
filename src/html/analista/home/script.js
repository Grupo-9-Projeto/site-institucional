const ARGOS_DATA = {
    empresas: [
        {
            id: "bradesco",
            nome: "Bradesco"
        },
        {
            id: "itau",
            nome: "Itaú"
        },
        {
            id: "santander",
            nome: "Santander"
        }
    ],

    equipamentos: [
        {
            id: "FW-CORE-02",
            empresa: "bradesco",
            categoria: "Firewall",
            modelo: "Cisco ASA 5510",
            status: "Ativo",
            conexao: "Online",
            ultimoAlerta: "Perda de pacotes > 15%",
            dataUltimoAlerta: "15/09/2026",
            severidadeUltimoAlerta: "Crítico",

            cpu: [
                52, 68, 73, 61, 57, 63, 71, 76, 81, 88,
                91, 87, 32, 28, 35, 29, 38, 45, 52, 54,
                49, 43, 38, 42, 48, 57, 63, 72, 69, 61
            ],

            ram: [
                58, 57, 56, 55, 56, 54, 58, 64, 72, 81,
                88, 79, 51, 48, 46, 44, 45, 49, 55, 62,
                69, 76, 82, 85, 81, 78, 72, 39, 34, 48
            ],

            disco: [
                52, 53, 53, 54, 54, 55, 55, 55, 56, 56,
                56, 57, 57, 57, 58, 58, 58, 59, 59, 59,
                60, 60, 60, 61, 61, 61, 62, 62, 62, 63
            ],

            rede: [
                48, 59, 63, 41, 36, 29, 34, 62, 68, 72,
                61, 48, 37, 44, 58, 68, 73, 77, 69, 55,
                42, 48, 65, 76, 82, 79, 68, 91, 28, 14
            ],

            alertas: [
                {
                    severidade: "Crítico",
                    titulo: "Perda de Pacotes",
                    descricao: "Taxa de perda de pacotes > 15% na interface WAN",
                    data: "15/09/2026",
                    hora: "13:10",
                    id: "EVT-006"
                },
                {
                    severidade: "Atenção",
                    titulo: "Interface Instável",
                    descricao: "Interface GigabitEthernet0/1 oscilando — link flap detectado",
                    data: "12/09/2026",
                    hora: "09:44",
                    id: "EVT-005"
                },
                {
                    severidade: "Info",
                    titulo: "Recuperação",
                    descricao: "Interface estabilizada após substituição de cabo SFP",
                    data: "12/09/2026",
                    hora: "12:20",
                    id: "EVT-004"
                }
            ]
        },

        {
            id: "FW-CORE-03",
            empresa: "bradesco",
            categoria: "Firewall",
            modelo: "Cisco ASA 5510",
            status: "Ativo",
            conexao: "Offline",
            ultimoAlerta: "CPU > 90%",
            dataUltimoAlerta: "15/09/2026",
            severidadeUltimoAlerta: "Crítico",

            cpu: [
                60, 64, 70, 75, 79, 84, 87, 92, 94, 91,
                88, 93, 95, 97, 90, 85, 82, 80, 87, 91,
                94, 96, 92, 89, 87, 90, 93, 96, 98, 95
            ],

            ram: [
                65, 66, 68, 70, 71, 72, 75, 77, 79, 80,
                81, 82, 84, 85, 83, 81, 82, 84, 86, 88,
                87, 86, 89, 90, 91, 92, 90, 91, 93, 94
            ],

            disco: [
                61, 61, 62, 62, 63, 63, 64, 64, 65, 65,
                66, 66, 67, 67, 68, 68, 69, 69, 70, 70,
                71, 71, 72, 72, 73, 73, 74, 74, 75, 75
            ],

            rede: [
                30, 35, 39, 42, 48, 52, 57, 61, 63, 59,
                54, 50, 46, 43, 47, 51, 55, 60, 65, 69,
                71, 67, 63, 59, 55, 51, 48, 45, 42, 39
            ],

            alertas: [
                {
                    severidade: "Crítico",
                    titulo: "CPU acima do limite",
                    descricao: "Uso de CPU superior a 90% durante o período monitorado",
                    data: "15/09/2026",
                    hora: "10:15",
                    id: "EVT-008"
                }
            ]
        },

        {
            id: "FW-EDGE-01",
            empresa: "bradesco",
            categoria: "Firewall",
            modelo: "Cisco ASA 5510",
            status: "Ativo",
            conexao: "Online",
            ultimoAlerta: "Link down — interface WAN",
            dataUltimoAlerta: "14/09/2026",
            severidadeUltimoAlerta: "Crítico",

            cpu: [
                40, 44, 48, 51, 46, 42, 49, 53, 56, 52,
                47, 44, 42, 46, 51, 55, 59, 62, 58, 54,
                49, 46, 51, 57, 61, 64, 59, 55, 52, 48
            ],

            ram: [
                45, 47, 49, 50, 48, 46, 51, 55, 59, 57,
                54, 51, 49, 52, 55, 58, 61, 64, 62, 59,
                56, 53, 55, 58, 62, 66, 63, 59, 56, 54
            ],

            disco: [
                49, 49, 50, 50, 51, 51, 52, 52, 53, 53,
                53, 54, 54, 55, 55, 56, 56, 56, 57, 57,
                58, 58, 59, 59, 60, 60, 61, 61, 62, 62
            ],

            rede: [
                36, 40, 45, 51, 57, 62, 58, 53, 47, 42,
                38, 44, 49, 55, 61, 67, 72, 69, 64, 58,
                53, 49, 55, 61, 68, 74, 79, 72, 63, 57
            ],

            alertas: [
                {
                    severidade: "Crítico",
                    titulo: "Link Down",
                    descricao: "Interface WAN ficou indisponível temporariamente",
                    data: "14/09/2026",
                    hora: "16:30",
                    id: "EVT-009"
                }
            ]
        },

        {
            id: "SW-ACCESS-01",
            empresa: "itau",
            categoria: "Switch",
            modelo: "Cisco Catalyst 2960",
            status: "Ativo",
            conexao: "Online",
            ultimoAlerta: "RAM > 75%",
            dataUltimoAlerta: "19/09/2026",
            severidadeUltimoAlerta: "Atenção",

            cpu: [
                48, 53, 57, 61, 58, 55, 62, 66, 71, 67,
                60, 55, 51, 48, 54, 58, 63, 67, 72, 69,
                64, 59, 55, 61, 66, 71, 75, 70, 65, 61
            ],

            ram: [
                42, 46, 50, 52, 49, 47, 55, 61, 67, 64,
                58, 53, 49, 55, 60, 65, 70, 74, 77, 72,
                68, 63, 59, 65, 70, 75, 78, 73, 69, 64
            ],

            disco: [
                54, 54, 55, 55, 56, 56, 57, 57, 58, 58,
                59, 59, 60, 60, 61, 61, 62, 62, 63, 63,
                64, 64, 65, 65, 66, 66, 67, 67, 68, 68
            ],

            rede: [
                31, 35, 42, 49, 55, 62, 58, 53, 47, 43,
                38, 45, 52, 59, 66, 71, 67, 62, 56, 51,
                46, 53, 61, 68, 74, 78, 72, 65, 58, 52
            ],

            alertas: [
                {
                    severidade: "Atenção",
                    titulo: "Uso de RAM elevado",
                    descricao: "Utilização de memória RAM superior a 75%",
                    data: "19/09/2026",
                    hora: "14:20",
                    id: "EVT-015"
                }
            ]
        },

        {
            id: "SW-ACCESS-02",
            empresa: "itau",
            categoria: "Switch",
            modelo: "Cisco Catalyst 2960",
            status: "Manutenção",
            conexao: "Offline",
            ultimoAlerta: "—",
            dataUltimoAlerta: "—",
            severidadeUltimoAlerta: "Info",

            cpu: [
                58, 63, 67, 72, 69, 64, 70, 76, 81, 86,
                82, 77, 73, 68, 64, 69, 75, 80, 85, 89,
                84, 79, 74, 70, 76, 82, 87, 91, 86, 81
            ],

            ram: [
                30, 36, 43, 48, 51, 46, 54, 61, 67, 63,
                57, 52, 47, 53, 59, 64, 69, 74, 80, 84,
                78, 71, 66, 60, 65, 70, 76, 82, 88, 80
            ],

            disco: [
                49, 50, 50, 51, 51, 52, 52, 53, 53, 54,
                54, 55, 55, 56, 56, 57, 57, 58, 58, 59,
                59, 60, 60, 61, 61, 62, 62, 63, 63, 64
            ],

            rede: [
                35, 39, 45, 52, 58, 64, 59, 54, 49, 44,
                51, 57, 63, 69, 74, 70, 65, 60, 56, 61,
                67, 73, 79, 83, 78, 72, 67, 61, 56, 51
            ],

            alertas: [
                {
                    severidade: "Info",
                    titulo: "Manutenção",
                    descricao: "Dispositivo em janela de manutenção programada",
                    data: "10/09/2026",
                    hora: "22:00",
                    id: "EVT-022"
                }
            ]
        },

        {
            id: "RT-EDGE-01",
            empresa: "santander",
            categoria: "Router",
            modelo: "Cisco ISR 4331",
            status: "Ativo",
            conexao: "Online",
            ultimoAlerta: "Interface instável",
            dataUltimoAlerta: "18/09/2026",
            severidadeUltimoAlerta: "Atenção",

            cpu: [
                35, 39, 43, 47, 44, 41, 48, 52, 56, 53,
                49, 45, 42, 47, 51, 55, 59, 63, 60, 56,
                52, 48, 53, 58, 62, 67, 64, 59, 55, 51
            ],

            ram: [
                38, 42, 46, 49, 47, 45, 51, 55, 59, 56,
                52, 48, 45, 50, 54, 58, 62, 66, 63, 59,
                55, 51, 56, 61, 65, 69, 66, 61, 57, 53
            ],

            disco: [
                45, 45, 46, 46, 47, 47, 48, 48, 49, 49,
                50, 50, 51, 51, 52, 52, 53, 53, 54, 54,
                55, 55, 56, 56, 57, 57, 58, 58, 59, 59
            ],

            rede: [
                42, 48, 53, 59, 64, 68, 61, 55, 49, 44,
                51, 57, 63, 69, 74, 70, 65, 59, 54, 49,
                55, 61, 67, 72, 78, 74, 68, 62, 57, 52
            ],

            alertas: [
                {
                    severidade: "Atenção",
                    titulo: "Interface Instável",
                    descricao: "Oscilação identificada na interface de rede",
                    data: "18/09/2026",
                    hora: "11:35",
                    id: "EVT-025"
                }
            ]
        },

        {
            id: "RT-EDGE-02",
            empresa: "santander",
            categoria: "Router",
            modelo: "Cisco ISR 4331",
            status: "Ativo",
            conexao: "Online",
            ultimoAlerta: "Sem alertas críticos",
            dataUltimoAlerta: "—",
            severidadeUltimoAlerta: "Info",

            cpu: [
                31, 34, 38, 42, 39, 36, 43, 47, 51, 48,
                44, 40, 37, 42, 46, 50, 54, 58, 55, 51,
                47, 43, 48, 53, 57, 61, 58, 53, 49, 45
            ],

            ram: [
                35, 38, 42, 45, 43, 41, 46, 50, 54, 51,
                47, 44, 41, 45, 49, 53, 57, 61, 58, 54,
                50, 47, 51, 55, 59, 63, 60, 55, 51, 48
            ],

            disco: [
                42, 42, 43, 43, 44, 44, 45, 45, 46, 46,
                47, 47, 48, 48, 49, 49, 50, 50, 51, 51,
                52, 52, 53, 53, 54, 54, 55, 55, 56, 56
            ],

            rede: [
                28, 33, 39, 45, 51, 57, 53, 48, 43, 38,
                44, 50, 56, 62, 67, 63, 58, 53, 48, 43,
                49, 55, 61, 67, 72, 68, 63, 58, 53, 48
            ],

            alertas: []
        }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
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

    const pagina = document.body.dataset.page;

    if (pagina === "home") {
        carregarHome();
    }

    if (pagina === "empresa") {
        carregarEmpresa();
    }

    if (pagina === "equipamento") {
        carregarEquipamento();
    }
});

function obterEmpresaPorId(id) {
    return ARGOS_DATA.empresas.find(empresa => empresa.id === id);
}

function obterEquipamentosDaEmpresa(empresaId) {
    return ARGOS_DATA.equipamentos.filter(equipamento => equipamento.empresa === empresaId);
}

function obterEquipamentoPorId(id) {
    return ARGOS_DATA.equipamentos.find(equipamento => equipamento.id === id);
}

function contarEquipamentosOnline() {
    return ARGOS_DATA.equipamentos.filter(equipamento => equipamento.conexao === "Online").length;
}

function contarEquipamentosOffline() {
    return ARGOS_DATA.equipamentos.filter(equipamento => equipamento.conexao === "Offline").length;
}

function contarAlertasCriticos() {
    let total = 0;
    ARGOS_DATA.equipamentos.forEach(equipamento => {
        equipamento.alertas.forEach(alerta => {
            if (alerta.severidade === "Crítico") {
                total++;
            }
        });
    });
    return total;
}

function carregarHome() {
    const total = ARGOS_DATA.equipamentos.length;
    const online = contarEquipamentosOnline();
    const offline = contarEquipamentosOffline();
    const criticos = contarAlertasCriticos();

    const kpiTotal = document.querySelector("#kpi-total");
    const kpiOnline = document.querySelector("#kpi-online");
    const kpiOffline = document.querySelector("#kpi-offline");
    const kpiCriticos = document.querySelector("#kpi-criticos");

    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiOnline) kpiOnline.textContent = online;
    if (kpiOffline) kpiOffline.textContent = offline;
    if (kpiCriticos) kpiCriticos.textContent = criticos;

    const empresasContainer = document.querySelector("#empresas-container");
    if (!empresasContainer) return;

    empresasContainer.innerHTML = ARGOS_DATA.empresas.map(empresa => {
        const equipamentos = obterEquipamentosDaEmpresa(empresa.id);
        const alertasCriticos = equipamentos.reduce((total, equipamento) => {
            return total + equipamento.alertas.filter(alerta => alerta.severidade === "Crítico").length;
        }, 0);

        const possuiCritico = alertasCriticos > 0;

        return `
            <a
                href="empresa.html?empresa=${empresa.id}"
                class="block bg-[#0D1924] border rounded-2xl p-6 transition hover:border-light-blue ${
                    possuiCritico ? "border-red-500/50" : "border-white/10"
                }"
            >
                <h2 class="text-lg font-bold mb-5">${empresa.nome}</h2>
                <div class="flex items-end justify-between">
                    <div>
                        <p class="text-2xl font-bold text-light-blue">${equipamentos.length}</p>
                        <p class="text-xs text-white/50 mt-1">Equipamentos</p>
                    </div>
                    <div class="text-right">
                        ${
                            possuiCritico
                                ? `
                                    <p class="text-sm font-semibold text-red-500">${alertasCriticos}</p>
                                    <p class="text-xs text-red-400">Alerta Crítico</p>
                                `
                                : `
                                    <p class="text-sm font-semibold text-emerald-500">✓ Saudável</p>
                                    <p class="text-xs text-white/50">sem alertas críticos</p>
                                `
                        }
                    </div>
                </div>
            </a>
        `;
    }).join("");
}

function carregarEmpresa() {
    const parametros = new URLSearchParams(window.location.search);
    const empresaId = parametros.get("empresa");
    const empresa = obterEmpresaPorId(empresaId);

    if (!empresa) {
        window.location.href = "home.html";
        return;
    }

    const equipamentos = obterEquipamentosDaEmpresa(empresa.id);

    const tituloEl = document.querySelector("#empresa-titulo");
    const breadcrumbEl = document.querySelector("#empresa-nome-breadcrumb");
    const subtituloEl = document.querySelector("#empresa-subtitulo");

    if (tituloEl) tituloEl.textContent = empresa.nome;
    if (breadcrumbEl) breadcrumbEl.textContent = empresa.nome;
    if (subtituloEl) subtituloEl.textContent = `${equipamentos.length} equipamentos vinculados`;

    const container = document.querySelector("#equipamentos-container");
    if (!container) return;

    container.innerHTML = equipamentos.map(equipamento => {
        const online = equipamento.conexao === "Online";

        return `
            <tr class="border-b border-white/10 hover:bg-white/[0.03] transition-colors cursor-pointer"
                onclick="window.location.href='equipamento.html?empresa=${empresa.id}&equipamento=${equipamento.id}'">
                <td class="py-3 px-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                        <span class="w-2 h-2 rounded-full ${online ? "bg-emerald-500" : "bg-gray-500"}"></span>
                        <span class="text-sm font-semibold text-light-blue">${equipamento.id}</span>
                    </div>
                </td>
                <td class="py-3 px-4 whitespace-nowrap text-xs text-white/70">${equipamento.categoria}</td>
                <td class="py-3 px-4 whitespace-nowrap">
                    <span class="inline-flex px-2.5 py-1 rounded-md bg-light-blue/10 text-light-blue text-xs font-medium">
                        ${equipamento.status}
                    </span>
                </td>
                <td class="py-3 px-4 whitespace-nowrap text-xs ${online ? "text-emerald-500" : "text-gray-400"}">
                    ${equipamento.conexao}
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                    <p class="text-xs text-white/80">${equipamento.ultimoAlerta}</p>
                    ${
                        equipamento.dataUltimoAlerta !== "—"
                            ? `<p class="text-[10px] text-white/50 mt-0.5">${equipamento.dataUltimoAlerta}</p>`
                            : ""
                    }
                </td>
            </tr>
        `;
    }).join("");
}

function carregarEquipamento() {
    const parametros = new URLSearchParams(window.location.search);
    const empresaId = parametros.get("empresa");
    const equipamentoId = parametros.get("equipamento");

    const empresa = obterEmpresaPorId(empresaId);
    const equipamento = obterEquipamentoPorId(equipamentoId);

    if (!empresa || !equipamento) {
        window.location.href = "home.html";
        return;
    }

    const tituloEl = document.querySelector("#equipamento-titulo");
    const breadcrumbEqEl = document.querySelector("#equipamento-breadcrumb");
    const breadcrumbEmpEl = document.querySelector("#empresa-breadcrumb");

    if (tituloEl) tituloEl.textContent = equipamento.id;
    if (breadcrumbEqEl) breadcrumbEqEl.textContent = equipamento.id;
    if (breadcrumbEmpEl) {
        breadcrumbEmpEl.textContent = empresa.nome;
        breadcrumbEmpEl.href = `empresa.html?empresa=${empresa.id}`;
    }

    const online = equipamento.conexao === "Online";
    const statusContainer = document.querySelector("#equipamento-status");
    if (statusContainer) {
        statusContainer.innerHTML = `
            <span class="w-2 h-2 rounded-full ${online ? "bg-emerald-500" : "bg-gray-500"}"></span>
            <span class="${online ? "text-emerald-500" : "text-gray-400"}">${equipamento.conexao}</span>
        `;
    }

    const categoriaEl = document.querySelector("#equipamento-categoria");
    if (categoriaEl) {
        categoriaEl.textContent = `${equipamento.categoria} — ${equipamento.modelo}`;
    }

    configurarFiltrosDePeriodo(equipamento);
    renderizarAlertas(equipamento);
}

function configurarFiltrosDePeriodo(equipamento) {
    const botoes = document.querySelectorAll(".periodo-btn");
    const filtroPersonalizado = document.querySelector("#filtro-personalizado");
    const descricao = document.querySelector("#periodo-descricao");
    const inputInicio = document.querySelector("#data-inicio");
    const inputFim = document.querySelector("#data-fim");
    const botaoAplicar = document.querySelector("#btn-aplicar-data");

    function ativarBotao(botaoSelecionado) {
        botoes.forEach(botao => {
            botao.className = "periodo-btn px-4 py-2 text-xs font-semibold rounded-md border border-white/15 text-white/70 hover:border-white hover:text-white transition-colors cursor-pointer";
        });
        botaoSelecionado.className = "periodo-btn px-4 py-2 text-xs font-semibold rounded-md border border-light-blue bg-light-blue text-main-blue cursor-pointer";
    }

    function renderizar(periodo) {
        let quantidade = equipamento.cpu.length;
        if (periodo === "semana") {
            quantidade = 7;
            if (descricao) descricao.textContent = "Uso diário de recursos — Última semana";
        } else if (periodo === "mes") {
            quantidade = equipamento.cpu.length;
            if (descricao) descricao.textContent = "Uso diário de recursos — Último mês";
        }

        const dados = {
            cpu: equipamento.cpu.slice(-quantidade),
            ram: equipamento.ram.slice(-quantidade),
            disco: equipamento.disco.slice(-quantidade),
            rede: equipamento.rede.slice(-quantidade)
        };

        renderizarGraficos(dados);
    }

    botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            const periodo = botao.dataset.periodo;
            ativarBotao(botao);

            if (periodo === "personalizado") {
                if (filtroPersonalizado) filtroPersonalizado.classList.remove("hidden");
                if (descricao) descricao.textContent = "Uso diário de recursos — Período personalizado";
                return;
            }

            if (filtroPersonalizado) filtroPersonalizado.classList.add("hidden");
            renderizar(periodo);
        });
    });

    if (botaoAplicar) {
        botaoAplicar.addEventListener("click", () => {
            const inicio = inputInicio?.value;
            const fim = inputFim?.value;

            if (!inicio || !fim) {
                alert("Selecione a data inicial e a data final.");
                return;
            }

            if (inicio > fim) {
                alert("A data inicial não pode ser maior que a data final.");
                return;
            }

            const datas = criarDatasMock();
            const indices = datas.map((data, index) => {
                return (data >= inicio && data <= fim) ? index : null;
            }).filter(index => index !== null);

            if (indices.length === 0) {
                ['#grafico-cpu', '#grafico-ram', '#grafico-disco', '#grafico-rede'].forEach(sel => {
                    const el = document.querySelector(sel);
                    if (el) el.innerHTML = "";
                });
                if (descricao) descricao.textContent = "Nenhum registro encontrado para o período selecionado.";
                return;
            }

            const dados = {
                cpu: indices.map(index => equipamento.cpu[index]),
                ram: indices.map(index => equipamento.ram[index]),
                disco: indices.map(index => equipamento.disco[index]),
                rede: indices.map(index => equipamento.rede[index])
            };

            if (descricao) descricao.textContent = `Uso diário de recursos — ${formatarData(inicio)} até ${formatarData(fim)}`;
            renderizarGraficos(dados);
        });
    }

    const botaoMes = document.querySelector("#btn-mes");
    if (botaoMes) {
        ativarBotao(botaoMes);
        renderizar("mes");
    }
}

function criarDatasMock() {
    const datas = [];
    for (let dia = 1; dia <= 30; dia++) {
        const numero = String(dia).padStart(2, "0");
        datas.push(`2026-09-${numero}`);
    }
    return datas;
}

function formatarData(data) {
    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function renderizarGraficos(dados) {
    renderizarGrafico("#grafico-cpu", dados.cpu, "#38BDF8");
    renderizarGrafico("#grafico-ram", dados.ram, "#F59E0B");
    renderizarGrafico("#grafico-disco", dados.disco, "#A78BFA");
    renderizarGrafico("#grafico-rede", dados.rede, "#22C55E");
}

function renderizarGrafico(seletor, valores, cor) {
    const container = document.querySelector(seletor);
    if (!container) return;

    container.innerHTML = "";
    valores.forEach((valor, index) => {
        const coluna = document.createElement("div");
        coluna.className = "flex-1 h-full flex items-end min-w-[3px]";

        const barra = document.createElement("div");
        barra.className = "w-full rounded-t-sm transition-all duration-300";
        barra.style.height = `${Math.max(valor, 3)}%`;
        barra.style.backgroundColor = cor;
        barra.title = `Dia ${index + 1}: ${valor}%`;

        coluna.appendChild(barra);
        container.appendChild(coluna);
    });
}

function renderizarAlertas(equipamento) {
    const container = document.querySelector("#alertas-container");
    if (!container) return;

    if (!equipamento.alertas.length) {
        container.innerHTML = `
            <div class="px-5 py-8 text-center">
                <p class="text-sm text-emerald-400">Nenhum alerta registrado</p>
            </div>
        `;
        return;
    }

    container.innerHTML = equipamento.alertas.map(alerta => {
        let cor = "#38BDF8";
        if (alerta.severidade === "Crítico") cor = "#EF4444";
        if (alerta.severidade === "Atenção") cor = "#F59E0B";

        return `
            <div class="px-5 py-5 border-b border-white/10 last:border-b-0">
                <div class="flex gap-4">
                    <span class="w-2 h-2 rounded-full mt-2 shrink-0" style="background-color: ${cor};"></span>
                    <div class="flex-1">
                        <div class="flex flex-wrap items-center gap-3">
                            <span class="px-2 py-1 rounded text-[10px] font-semibold" style="color: ${cor}; background-color: ${cor}22;">
                                ${alerta.severidade}
                            </span>
                            <span class="text-sm font-semibold">${alerta.titulo}</span>
                        </div>
                        <p class="text-xs text-white/60 mt-2">${alerta.descricao}</p>
                        <p class="text-[10px] text-white/40 mt-2">${alerta.data} às ${alerta.hora}</p>
                    </div>
                    <span class="text-xs text-light-blue">${alerta.id}</span>
                </div>
            </div>
        `;
    }).join("");
}