const dadosEmpresas = [
    {
        id: 1,
        nome: "Tech Solutions Ltda",
        cnpj: "12.345.678/0001-90",
        cadastradoEm: "15/03/2024",
        sla: "Ouro",
        limiteResposta: "2 horas",
        status: "Ativo",
        equipamentos: [
            {
                id: 1,
                nome: "FW-CORE-02",
                categoria: "Firewall",
                modelo: "Cisco ASA 5505",
                ip: "192.168.1.2",
                mac: "AA:BB:CC:DD:EE:02",
                serie: "SN-0002-FW",
                status: "Ativo",
                cadastradoEm: "15/03/2024",
                componentes: [
                    {
                        id: 1,
                        nome: "CPU Principal",
                        tipo: "CPU",
                        unidadeMedida: "%",
                        capacidade: "100",
                        limiarAtencao: "70",
                        limiarAlto: "85",
                        limiarCritico: "95",
                        status: "Ativo"
                    },
                    {
                        id: 2,
                        nome: "Memória RAM",
                        tipo: "Memória",
                        unidadeMedida: "%",
                        capacidade: "16 GB",
                        limiarAtencao: "75",
                        limiarAlto: "85",
                        limiarCritico: "95",
                        status: "Ativo"
                    }
                ]
            },
            {
                id: 2,
                nome: "Switch Core 24 Portas",
                categoria: "Switch",
                modelo: "Catalyst 2960",
                ip: "192.168.1.10",
                mac: "11:22:33:44:55:66",
                serie: "SN-SW-9988",
                status: "Ativo",
                cadastradoEm: "15/03/2024",
                componentes: [
                    {
                        id: 1,
                        nome: "Uso de Banda (Porta 1)",
                        tipo: "Rede",
                        unidadeMedida: "Mbps",
                        capacidade: "1000",
                        limiarAtencao: "600",
                        limiarAlto: "800",
                        limiarCritico: "950",
                        status: "Ativo"
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        nome: "Inovação & Sistemas S.A.",
        cnpj: "98.765.432/0001-12",
        cadastradoEm: "20/05/2024",
        sla: "Prata",
        limiteResposta: "4 horas",
        status: "Ativo",
        equipamentos: [
            {
                id: 1,
                nome: "Firewall de Borda",
                categoria: "Firewall",
                modelo: "Fortinet FortiGate 60F",
                ip: "10.0.0.1",
                mac: "DE:AD:BE:EF:12:34",
                serie: "FG60FTK21000",
                status: "Ativo",
                cadastradoEm: "20/05/2024",
                componentes: [
                    {
                        id: 1,
                        nome: "CPU Firewall",
                        tipo: "CPU",
                        unidadeMedida: "%",
                        capacidade: "100",
                        limiarAtencao: "70",
                        limiarAlto: "85",
                        limiarCritico: "95",
                        status: "Ativo"
                    },
                    {
                        id: 2,
                        nome: "Disco SSD Principal",
                        tipo: "Disco",
                        unidadeMedida: "GB",
                        capacidade: "128",
                        limiarAtencao: "80",
                        limiarAlto: "90",
                        limiarCritico: "95",
                        status: "Ativo"
                    }
                ]
            }
        ]
    },
    {
        id: 3,
        nome: "Logística Global Express",
        cnpj: "45.678.123/0001-55",
        cadastradoEm: "10/01/2025",
        sla: "Bronze",
        limiteResposta: "8 horas",
        status: "Inativo",
        equipamentos: [
            {
                id: 1,
                nome: "Terminal de Consulta 01",
                categoria: "Totem",
                modelo: "Dell OptiPlex 3080",
                ip: "172.16.0.50",
                mac: "55:44:33:22:11:00",
                serie: "DL-OPT-3080",
                status: "Offline",
                cadastradoEm: "10/01/2025",
                componentes: [
                    {
                        id: 1,
                        nome: "Processador Terminal",
                        tipo: "CPU",
                        unidadeMedida: "%",
                        capacidade: "100",
                        limiarAtencao: "75",
                        limiarAlto: "90",
                        limiarCritico: "98",
                        status: "Inativo"
                    }
                ]
            }
        ]
    },
    {
        id: 4,
        nome: "Alpha Engenharia e Consultoria",
        cnpj: "11.222.333/0001-44",
        cadastradoEm: "05/08/2025",
        sla: "Ouro",
        limiteResposta: "1 hora",
        status: "Ativo",
        equipamentos: [
            {
                id: 1,
                nome: "Workstation CAD Principal",
                categoria: "Servidor",
                modelo: "HP Z Workstation",
                ip: "192.168.10.15",
                mac: "77:88:99:AA:BB:CC",
                serie: "HP-Z4-2025",
                status: "Ativo",
                cadastradoEm: "05/08/2025",
                componentes: [
                    {
                        id: 1,
                        nome: "CPU Xeon Workstation",
                        tipo: "CPU",
                        unidadeMedida: "%",
                        capacidade: "100",
                        limiarAtencao: "70",
                        limiarAlto: "85",
                        limiarCritico: "95",
                        status: "Ativo"
                    },
                    {
                        id: 2,
                        nome: "Memória RAM ECC",
                        tipo: "Memória",
                        unidadeMedida: "%",
                        capacidade: "64 GB",
                        limiarAtencao: "80",
                        limiarAlto: "90",
                        limiarCritico: "95",
                        status: "Ativo"
                    },
                    {
                        id: 3,
                        nome: "NVMe 1TB (Sistema)",
                        tipo: "Disco",
                        unidadeMedida: "%",
                        capacidade: "1000",
                        limiarAtencao: "80",
                        limiarAlto: "90",
                        limiarCritico: "95",
                        status: "Ativo"
                    }
                ]
            },
            {
                id: 2,
                nome: "No-break Torre 3kVA",
                categoria: "Energia",
                modelo: "APC Smart-UPS",
                ip: "192.168.10.20",
                mac: "CC:BB:AA:99:88:77",
                serie: "APC-3KVA-01",
                status: "Ativo",
                cadastradoEm: "05/08/2025",
                componentes: [
                    {
                        id: 1,
                        nome: "Carga de Bateria",
                        tipo: "Bateria",
                        unidadeMedida: "%",
                        capacidade: "100",
                        limiarAtencao: "40",
                        limiarAlto: "25",
                        limiarCritico: "15",
                        status: "Ativo"
                    }
                ]
            }
        ]
    },
    {
        id: 5,
        nome: "Nexus Digital Hub",
        cnpj: "77.889.900/0001-21",
        cadastradoEm: "12/11/2025",
        sla: "Prata",
        limiteResposta: "4 horas",
        status: "Ativo",
        equipamentos: [
            {
                id: 1,
                nome: "Roteador Wi-Fi Corporativo",
                categoria: "Roteador",
                modelo: "Ubiquiti UniFi 6",
                ip: "192.168.100.1",
                mac: "FC:EC:DA:12:34:56",
                serie: "UNI-U6-PRO",
                status: "Ativo",
                cadastradoEm: "12/11/2025",
                componentes: [
                    {
                        id: 1,
                        nome: "Uso de Banda Wireless",
                        tipo: "Rede",
                        unidadeMedida: "Mbps",
                        capacidade: "1200",
                        limiarAtencao: "800",
                        limiarAlto: "1000",
                        limiarCritico: "1150",
                        status: "Ativo"
                    }
                ]
            }
        ]
    }
];

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

    const urlParams = new URLSearchParams(window.location.search);
    const empresaId = parseInt(urlParams.get('empresaId')) || 1;
    const eqId = parseInt(urlParams.get('eqId')) || 0;

    const empresa = dadosEmpresas.find(e => e.id === empresaId) || dadosEmpresas[0];
    const equipamento = empresa && empresa.equipamentos ? (empresa.equipamentos[eqId] || empresa.equipamentos[0]) : null;

    const linkVoltar = document.getElementById('link-voltar') || document.querySelector('a[href*="informacoesEmpresa.html"]');
    if (linkVoltar) {
        linkVoltar.href = `../informacoesEmpresa.html?id=${empresaId}`;
    }

    if (equipamento) {
        const editEqNome = document.getElementById('edit-eq-nome');
        if (editEqNome) editEqNome.textContent = equipamento.nome;

        const badgeStatus = document.getElementById('edit-eq-status-badge');
        if (badgeStatus) badgeStatus.textContent = equipamento.status;

        const dataEl = document.getElementById('edit-eq-data');
        if (dataEl) dataEl.textContent = equipamento.cadastradoEm || '--/--/----';

        const catEl = document.getElementById('edit-eq-categoria');
        if (catEl) catEl.textContent = equipamento.categoria || '---';

        const modEl = document.getElementById('edit-eq-modelo');
        if (modEl) modEl.textContent = equipamento.modelo || '---';

        const ipEl = document.getElementById('edit-eq-ip');
        if (ipEl) ipEl.textContent = equipamento.ip || '---';

        const macEl = document.getElementById('edit-eq-mac');
        if (macEl) macEl.textContent = equipamento.mac || '---';

        const serieEl = document.getElementById('edit-eq-serie');
        if (serieEl) serieEl.textContent = equipamento.serie || '---';

        const statusEl = document.getElementById('edit-eq-status');
        if (statusEl) {
            statusEl.textContent = equipamento.status || '---';
            const isAtivo = equipamento.status === 'Ativo' || equipamento.status === 'Online';
            statusEl.className = `text-sm font-medium ${isAtivo ? 'text-green-500' : 'text-red-500'}`;
        }

        const compContainer = document.getElementById('lista-componentes-container');
        const compContador = document.getElementById('componentes-contador');

        if (compContainer && equipamento.componentes) {
            if (compContador) compContador.textContent = `${equipamento.componentes.length} componente(s) cadastrado(s)`;
            compContainer.innerHTML = '';

            equipamento.componentes.forEach((comp, compIndex) => {
                const isActive = comp.status === 'Ativo';
                compContainer.innerHTML += `
                    <div onclick="window.location.href='./componentes/detalhesComponente.html?empresaId=${empresa.id}&eqId=${eqId}&compId=${compIndex}'" class="w-full h-16 border border-white/10 flex items-center px-5 rounded-[7px] bg-[#09121B] justify-between hover:bg-white/5 outline-none focus:outline-none focus:ring-0 cursor-pointer transition-element">
                        <div class="flex items-center gap-4">
                            <span class="size-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}"></span>
                            <div class="flex flex-col">
                                <span class="text-sm font-medium text-white">${comp.nome}</span>
                                <span class="text-gray-500 text-[11px]">${comp.tipo} - ${comp.unidadeMedida || ''}</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 text-white/60" onclick="event.stopPropagation()">
                            <a href="./componentes/detalhesComponente.html?empresaId=${empresa.id}&eqId=${eqId}&compId=${compIndex}" class="w-9 h-9 rounded-md flex items-center justify-center hover:text-light-blue outline-none focus:outline-none focus:ring-0 cursor-pointer transition-element">
                                <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </a>
                            <a href="./componentes/editarComponente.html?empresaId=${empresa.id}&eqId=${eqId}&compId=${compIndex}" class="w-9 h-9 rounded-md flex items-center justify-center hover:text-light-blue outline-none focus:outline-none focus:ring-0 cursor-pointer transition-element">
                                <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </a>
                            <button type="button" class="w-9 h-9 rounded-md flex items-center justify-center hover:text-red-400 outline-none focus:outline-none focus:ring-0 cursor-pointer transition-element" onclick="abrirModalExcluir(${comp.id});">
                                <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
    }
});

let modal_excluir = document.getElementById('modal_excluir');

function abrirModalExcluir(id) {
    if (modal_excluir) {
        modal_excluir.classList.remove('hidden');
        modal_excluir.classList.add('flex');
    }
}

function fecharModalExcluir() {
    if (modal_excluir) {
        modal_excluir.classList.add('hidden');
        modal_excluir.classList.remove('flex');
    }
}

if (modal_excluir) {
    modal_excluir.addEventListener('click', e => { 
        if (e.target === modal_excluir) fecharModalExcluir(); 
    });
}

document.addEventListener('keydown', e => { 
    if (e.key === 'Escape') fecharModalExcluir(); 
});