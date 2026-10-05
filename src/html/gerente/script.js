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