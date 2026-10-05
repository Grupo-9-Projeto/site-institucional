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