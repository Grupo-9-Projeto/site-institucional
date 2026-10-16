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
    const compId = parseInt(urlParams.get('compId')) || 0;

    const empresa = dadosEmpresas.find(e => e.id === empresaId) || dadosEmpresas[0];
    const equipamento = empresa.equipamentos[eqId] || empresa.equipamentos[0];
    const componente = equipamento && equipamento.componentes ? (equipamento.componentes[compId] || equipamento.componentes[0]) : null;

    const linkVoltar = document.getElementById('link-voltar');
    if (linkVoltar) {
        linkVoltar.href = `../informacoesEquipamento.html?empresaId=${empresaId}&eqId=${eqId}`;
    }

    const linkEditar = document.getElementById('link-editar');
    if (linkEditar) {
        linkEditar.href = `./editarComponente.html?empresaId=${empresaId}&eqId=${eqId}&compId=${compId}`;
    }

    if (componente) {
        const eqNomeEl = document.getElementById('comp-eq-nome');
        if (eqNomeEl) eqNomeEl.textContent = `${equipamento.nome} - Informações`;

        const nomeEl = document.getElementById('comp-nome');
        if (nomeEl) nomeEl.textContent = componente.nome;

        const badgeStatus = document.getElementById('comp-status-badge');
        if (badgeStatus) {
            badgeStatus.textContent = componente.status || 'Ativo';
            const isAtivo = componente.status === 'Ativo';
            badgeStatus.className = `px-3 py-1 rounded-md border text-xs font-bold ${isAtivo ? 'border-light-blue/40 bg-light-blue/10 text-light-blue' : 'border-red-500/40 bg-red-500/10 text-red-500'}`;
        }

        const tipoEl = document.getElementById('comp-tipo');
        if (tipoEl) tipoEl.textContent = componente.tipo || '---';

        const unidadeEl = document.getElementById('comp-unidade');
        if (unidadeEl) unidadeEl.textContent = componente.unidadeMedida || '---';

        const capacidadeEl = document.getElementById('comp-capacidade');
        if (capacidadeEl) capacidadeEl.textContent = componente.capacidade || '---';

        const atencaoEl = document.getElementById('comp-atencao');
        if (atencaoEl) atencaoEl.textContent = componente.limiarAtencao || '---';

        const altoEl = document.getElementById('comp-alto');
        if (altoEl) altoEl.textContent = componente.limiarAlto || '---';

        const criticoEl = document.getElementById('comp-critico');
        if (criticoEl) criticoEl.textContent = componente.limiarCritico || '---';
    }
});