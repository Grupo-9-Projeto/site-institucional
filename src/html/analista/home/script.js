document.addEventListener("DOMContentLoaded", () => {

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

    return ARGOS_DATA.empresas.find(
        empresa => empresa.id === id
    );

}


function obterEquipamentosDaEmpresa(empresaId) {

    return ARGOS_DATA.equipamentos.filter(
        equipamento => equipamento.empresa === empresaId
    );

}


function obterEquipamentoPorId(id) {

    return ARGOS_DATA.equipamentos.find(
        equipamento => equipamento.id === id
    );

}


function contarEquipamentosOnline() {

    return ARGOS_DATA.equipamentos.filter(
        equipamento => equipamento.conexao === "Online"
    ).length;

}


function contarEquipamentosOffline() {

    return ARGOS_DATA.equipamentos.filter(
        equipamento => equipamento.conexao === "Offline"
    ).length;

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

    document.querySelector("#kpi-total").textContent = total;
    document.querySelector("#kpi-online").textContent = online;
    document.querySelector("#kpi-offline").textContent = offline;
    document.querySelector("#kpi-criticos").textContent = criticos;

    document.querySelector("#empresas-container").innerHTML =
        ARGOS_DATA.empresas.map(empresa => {

            const equipamentos =
                obterEquipamentosDaEmpresa(empresa.id);

            const alertasCriticos = equipamentos.reduce(
                (total, equipamento) => {

                    return total +
                        equipamento.alertas.filter(
                            alerta => alerta.severidade === "Crítico"
                        ).length;

                },
                0
            );

            const possuiCritico = alertasCriticos > 0;

            return `
                <a
                    href="empresa.html?empresa=${empresa.id}"
                    class="
                        block
                        bg-[#101923]
                        border
                        rounded-lg
                        p-6
                        transition
                        hover:bg-[#141F2D]
                        hover:border-[#38BDF8]
                        ${possuiCritico
                            ? "border-[#6B2A35]"
                            : "border-[#202D3C]"
                        }
                    "
                >

                    <h2 class="text-lg font-bold mb-5">
                        ${empresa.nome}
                    </h2>

                    <div class="flex items-end justify-between">

                        <div>

                            <p class="text-2xl font-bold text-[#38BDF8]">
                                ${equipamentos.length}
                            </p>

                            <p class="text-xs text-[#64748B] mt-1">
                                Equipamentos
                            </p>

                        </div>

                        <div class="text-right">

                            ${
                                possuiCritico
                                    ? `
                                        <p class="text-sm font-semibold text-[#EF4444]">
                                            ${alertasCriticos}
                                        </p>

                                        <p class="text-xs text-[#EF4444]">
                                            Alerta Crítico
                                        </p>
                                    `
                                    : `
                                        <p class="text-sm font-semibold text-[#22C55E]">
                                            ✓ Saudável
                                        </p>

                                        <p class="text-xs text-[#64748B]">
                                            sem alertas críticos
                                        </p>
                                    `
                            }

                        </div>

                    </div>

                </a>
            `;

        }).join("");

}



function carregarEmpresa() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    const empresaId = parametros.get("empresa");

    const empresa = obterEmpresaPorId(empresaId);

    if (!empresa) {

        window.location.href = "home.html";
        return;

    }

    const equipamentos =
        obterEquipamentosDaEmpresa(empresa.id);

    document.querySelector("#empresa-titulo").textContent =
        empresa.nome;

    document.querySelector("#empresa-nome-breadcrumb").textContent =
        empresa.nome;

    document.querySelector("#empresa-subtitulo").textContent =
        `${equipamentos.length} equipamentos vinculados`;

    const container =
        document.querySelector("#equipamentos-container");

    container.innerHTML = equipamentos.map(equipamento => {

        const online =
            equipamento.conexao === "Online";

        return `
            <a
                href="equipamento.html?empresa=${empresa.id}&equipamento=${equipamento.id}"
                class="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr_1.5fr] px-6 py-5 border-b border-[#202D3C] last:border-b-0 hover:bg-[#141F2D] transition items-center"
            >

                <div class="flex items-center gap-4">

                    <span
                        class="w-2 h-2 rounded-full ${
                            online
                                ? "bg-[#22C55E]"
                                : "bg-[#64748B]"
                        }"
                    ></span>

                    <span class="text-sm font-semibold text-[#38BDF8]">
                        ${equipamento.id}
                    </span>

                </div>


                <span class="text-xs text-[#94A3B8]">
                    ${equipamento.categoria}
                </span>


                <span>

                    <span
                        class="inline-flex px-3 py-1 rounded bg-[#183044] text-[#38BDF8] text-xs"
                    >
                        ${equipamento.status}
                    </span>

                </span>


                <span
                    class="text-xs ${
                        online
                            ? "text-[#22C55E]"
                            : "text-[#64748B]"
                    }"
                >
                    ${equipamento.conexao}
                </span>


                <div>

                    <p class="text-xs text-[#CBD5E1]">
                        ${equipamento.ultimoAlerta}
                    </p>

                    ${
                        equipamento.dataUltimoAlerta !== "—"
                            ? `
                                <p class="text-[10px] text-[#64748B] mt-1">
                                    ${equipamento.dataUltimoAlerta}
                                </p>
                            `
                            : ""
                    }

                </div>

            </a>
        `;

    }).join("");

}



function carregarEquipamento() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    const empresaId = parametros.get("empresa");
    const equipamentoId = parametros.get("equipamento");

    const empresa = obterEmpresaPorId(empresaId);
    const equipamento = obterEquipamentoPorId(equipamentoId);

    if (!empresa || !equipamento) {

        window.location.href = "home.html";
        return;

    }



    document.querySelector("#equipamento-titulo").textContent =
        equipamento.id;

    document.querySelector("#equipamento-breadcrumb").textContent =
        equipamento.id;

    document.querySelector("#empresa-breadcrumb").textContent =
        empresa.nome;

    document.querySelector("#empresa-breadcrumb").href =
        `empresa.html?empresa=${empresa.id}`;




    const online =
        equipamento.conexao === "Online";

    document.querySelector("#equipamento-status").innerHTML = `
        <span
            class="w-2 h-2 rounded-full ${
                online
                    ? "bg-[#22C55E]"
                    : "bg-[#64748B]"
            }"
        ></span>

        <span
            class="${
                online
                    ? "text-[#22C55E]"
                    : "text-[#64748B]"
            }"
        >
            ${equipamento.conexao}
        </span>
    `;


    document.querySelector("#equipamento-categoria").textContent =
        `${equipamento.categoria} — ${equipamento.modelo}`;




    configurarFiltrosDePeriodo(equipamento);



    renderizarAlertas(equipamento);

}



function configurarFiltrosDePeriodo(equipamento) {

    const botoes =
        document.querySelectorAll(".periodo-btn");

    const filtroPersonalizado =
        document.querySelector("#filtro-personalizado");

    const descricao =
        document.querySelector("#periodo-descricao");

    const inputInicio =
        document.querySelector("#data-inicio");

    const inputFim =
        document.querySelector("#data-fim");

    const botaoAplicar =
        document.querySelector("#btn-aplicar-data");


    function ativarBotao(botaoSelecionado) {

        botoes.forEach(botao => {

            botao.classList.remove(
                "bg-[#38BDF8]",
                "text-[#07111A]",
                "border-[#38BDF8]"
            );

            botao.classList.add(
                "text-[#94A3B8]"
            );

        });

        botaoSelecionado.classList.remove(
            "text-[#94A3B8]"
        );

        botaoSelecionado.classList.add(
            "bg-[#38BDF8]",
            "text-[#07111A]",
            "border-[#38BDF8]"
        );

    }


    function renderizar(periodo) {

        let quantidade = equipamento.cpu.length;

        if (periodo === "semana") {
            quantidade = 7;
            descricao.textContent =
                "Uso diário de recursos — Última semana";
        }

        if (periodo === "mes") {
            quantidade = equipamento.cpu.length;
            descricao.textContent =
                "Uso diário de recursos — Último mês";
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

            const periodo =
                botao.dataset.periodo;

            ativarBotao(botao);

            if (periodo === "personalizado") {

                filtroPersonalizado.classList.remove("hidden");

                descricao.textContent =
                    "Uso diário de recursos — Período personalizado";

                return;

            }

            filtroPersonalizado.classList.add("hidden");

            renderizar(periodo);

        });

    });


    botaoAplicar.addEventListener("click", () => {

        const inicio = inputInicio.value;
        const fim = inputFim.value;

        if (!inicio || !fim) {

            alert("Selecione a data inicial e a data final.");
            return;

        }

        if (inicio > fim) {

            alert("A data inicial não pode ser maior que a data final.");
            return;

        }


        const datas = criarDatasMock();

        const indices = datas
            .map((data, index) => {

                if (data >= inicio && data <= fim) {
                    return index;
                }

                return null;

            })
            .filter(index => index !== null);


        if (indices.length === 0) {

            document.querySelector("#grafico-cpu").innerHTML = "";
            document.querySelector("#grafico-ram").innerHTML = "";
            document.querySelector("#grafico-disco").innerHTML = "";
            document.querySelector("#grafico-rede").innerHTML = "";

            descricao.textContent =
                "Nenhum registro encontrado para o período selecionado.";

            return;

        }


        const dados = {

            cpu: indices.map(index =>
                equipamento.cpu[index]
            ),

            ram: indices.map(index =>
                equipamento.ram[index]
            ),

            disco: indices.map(index =>
                equipamento.disco[index]
            ),

            rede: indices.map(index =>
                equipamento.rede[index]
            )

        };


        descricao.textContent =
            `Uso diário de recursos — ${formatarData(inicio)} até ${formatarData(fim)}`;

        renderizarGraficos(dados);

    });



    const botaoMes =
        document.querySelector("#btn-mes");

    ativarBotao(botaoMes);

    renderizar("mes");

}



function criarDatasMock() {

    const datas = [];

    for (let dia = 1; dia <= 30; dia++) {

        const numero =
            String(dia).padStart(2, "0");

        datas.push(
            `2026-09-${numero}`
        );

    }

    return datas;

}


function formatarData(data) {

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}



function renderizarGraficos(dados) {

    renderizarGrafico(
        "#grafico-cpu",
        dados.cpu,
        "#38BDF8"
    );

    renderizarGrafico(
        "#grafico-ram",
        dados.ram,
        "#F59E0B"
    );

    renderizarGrafico(
        "#grafico-disco",
        dados.disco,
        "#A78BFA"
    );

    renderizarGrafico(
        "#grafico-rede",
        dados.rede,
        "#22C55E"
    );

}


function renderizarGrafico(seletor, valores, cor) {

    const container =
        document.querySelector(seletor);

    if (!container) {
        return;
    }

    container.innerHTML = "";

    valores.forEach((valor, index) => {

        const coluna =
            document.createElement("div");

        coluna.className =
            "flex-1 h-full flex items-end min-w-[3px]";

        const barra =
            document.createElement("div");

        barra.className =
            "w-full rounded-t-sm transition-all duration-300";

        barra.style.height =
            `${Math.max(valor, 3)}%`;

        barra.style.backgroundColor =
            cor;

        barra.title =
            `Dia ${index + 1}: ${valor}%`;

        coluna.appendChild(barra);

        container.appendChild(coluna);

    });

}



function renderizarAlertas(equipamento) {

    const container =
        document.querySelector("#alertas-container");

    if (!container) {
        return;
    }


    if (!equipamento.alertas.length) {

        container.innerHTML = `
            <div class="px-5 py-8 text-center">

                <p class="text-sm text-[#22C55E]">
                    Nenhum alerta registrado
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        equipamento.alertas.map(alerta => {

            let cor = "#38BDF8";

            if (alerta.severidade === "Crítico") {
                cor = "#EF4444";
            }

            if (alerta.severidade === "Atenção") {
                cor = "#F59E0B";
            }


            return `
                <div
                    class="px-5 py-5 border-b border-[#202D3C] last:border-b-0"
                >

                    <div class="flex gap-4">

                        <span
                            class="w-2 h-2 rounded-full mt-2 shrink-0"
                            style="background-color: ${cor};"
                        ></span>

                        <div class="flex-1">

                            <div class="flex flex-wrap items-center gap-3">

                                <span
                                    class="px-2 py-1 rounded text-[10px] font-semibold"
                                    style="
                                        color: ${cor};
                                        background-color: ${cor}22;
                                    "
                                >
                                    ${alerta.severidade}
                                </span>

                                <span class="text-sm font-semibold">
                                    ${alerta.titulo}
                                </span>

                            </div>

                            <p class="text-xs text-[#94A3B8] mt-2">
                                ${alerta.descricao}
                            </p>

                            <p class="text-[10px] text-[#64748B] mt-2">
                                ${alerta.data} às ${alerta.hora}
                            </p>

                        </div>

                        <span class="text-xs text-[#38BDF8]">
                            ${alerta.id}
                        </span>

                    </div>

                </div>
            `;

        }).join("");

}