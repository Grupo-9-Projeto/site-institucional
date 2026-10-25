// ============================================================
// EQUIPAMENTOS (gerente) - conexão com o back-end
// Segue o mesmo padrão usado no script de empresas.
// Depende do apiFetch() e do exigirGerente() definidos em js/api.js.
// ============================================================

let equipamentoAtual = null;

// ===================== FUNÇÕES AUXILIARES =====================

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
        console.log(erro)

        return { ok: false, status: 0, dados: null };
    }
}

function mostrarErro(resposta, mensagemPadrao) {
    if (resposta.status === 401) return;

    if (resposta.status === 0) {
        alert("Não foi possível conectar ao servidor. Verifique se o back-end está rodando.");
        return;
    }

    if (resposta.status < 500) {
        if (typeof resposta.dados === "string") {
            alert(resposta.dados);
            return;
        }

        if (resposta.dados && typeof resposta.dados.res === "string") {
            alert(resposta.dados.res);
            return;
        }
    }

    alert(mensagemPadrao);
}

function pegarIdsDaUrl() {
    const parametros = new URLSearchParams(window.location.search);

    return {
        empresaId: Number(parametros.get("empresaId")) || 0,
        equipamentoId: parametros.get("eqId") == "null" ? Number(0) : Number(parametros.get("eqId"))
    };
}

function escreverTexto(idElemento, texto) {
    const elemento = document.getElementById(idElemento);
    if (elemento) elemento.textContent = texto ?? "---";
}

function formatarData(data) {
    if (!data) return "--/--/----";

    const dataConvertida = new Date(data);
    if (Number.isNaN(dataConvertida.getTime())) return data;

    return dataConvertida.toLocaleDateString("pt-BR");
}

function primeiroValor(objeto, campos, valorPadrao = "---") {
    for (const campo of campos) {
        const valor = objeto?.[campo];
        if (valor !== undefined && valor !== null && valor !== "") return valor;
    }

    return valorPadrao;
}

// Alguns endpoints retornam { res: [...] } e outros retornam o array diretamente.
function extrairLinhas(resposta) {
    const dados = resposta?.dados;

    if (Array.isArray(dados)) return dados;
    if (Array.isArray(dados?.res)) return dados.res;
    if (Array.isArray(dados?.dados)) return dados.dados;
    if (dados && typeof dados === "object") return [dados];

    return [];
}

// ===================== BUSCA DO EQUIPAMENTO =====================

async function buscarEquipamentoDaUrl() {
    const { empresaId, equipamentoId } = pegarIdsDaUrl();

    if (equipamentoId == 0) {
        return;
    }
    if (!empresaId || !equipamentoId) {
        alert("Não foi possível identificar a empresa ou o equipamento pela URL.");
        return null;
    }

    const resposta = await chamarApi("/dispositivos/listar_informacoes_dispositivo", "POST", {
        dispositivo_id: equipamentoId,
        id_empresa: empresaId
    });


    if (!resposta.ok) {
        mostrarErro(resposta, "Não foi possível carregar as informações do equipamento.");
        return null;
    }

    const linhas = extrairLinhas(resposta);

    if (linhas.length === 0) {
        alert("Nenhuma informação foi encontrada para esse equipamento.");
        return null;
    }
    return linhas;
}

// ===================== RENDERIZAÇÃO =====================

async function carregarInformacoesEquipamento(equipamento) {

    const respostaModelos = await chamarApi("/dispositivos/listar_categorias", "GET");
    let idModelo = equipamento[0].modelo_id;
    let modelo;
    let categoria;

    respostaModelos.dados[1].forEach(item => {
        if (item.id_modelo == idModelo) {
            modelo = item;
        }
    })
    respostaModelos.dados[0].forEach(item => {
        if (item.id_categoria == modelo.categoria_id) {
            categoria = item;
        }
    })
    escreverTexto("edit-eq-nome", equipamento[0].numero_serie);

    const status = equipamento[0].status_dispositivo;
    escreverTexto("edit-eq-status-badge", status);
    escreverTexto("edit-eq-data", formatarData(equipamento[0].criacao));
    escreverTexto("edit-eq-categoria", categoria.nome);
    escreverTexto("edit-eq-modelo", modelo.nome_modelo);
    escreverTexto("edit-eq-ip", equipamento[0].ip);
    escreverTexto("edit-eq-mac", equipamento[0].endereco_mac);
    escreverTexto("edit-eq-serie", equipamento[0].numero_serie);

    const statusEl = document.getElementById("edit-eq-status");
    if (statusEl) {
        statusEl.textContent = status ?? "---";
        const statusNormalizado = String(status ?? "").toLowerCase();
        const estaAtivo = ["ativo", "online", "active"].includes(statusNormalizado);
        statusEl.className = `text-sm font-medium ${estaAtivo ? "text-green-500" : "text-red-500"}`;
    }

    const badgeStatus = document.getElementById("edit-eq-status-badge");
    if (badgeStatus) {
        const statusNormalizado = String(status ?? "").toLowerCase();
        const estaAtivo = ["ativo", "online", "active"].includes(statusNormalizado);
        badgeStatus.className = `px-3 py-1 rounded-md border text-xs font-bold ${estaAtivo
            ? "border-green-500/40 bg-green-500/10 text-green-400"
            : "border-red-500/40 bg-red-500/10 text-red-400"}`;
    }

    carregarComponentes();
}

async function criarNovoEquipamento() {
    const categoriaHtml = document.getElementById("categoria");
    const modeloHtml = document.getElementById("modelo");
    const ipHtml = document.getElementById("ip");
    const macHtml = document.getElementById("mac");
    const serieHtml = document.getElementById("serie");
    const statusHtml = document.getElementById("status");


    console.log(categoriaHtml)

    const formulario = document.getElementById("form-editar-dispositivo");
    const linkVoltar = document.getElementById("link-voltar");
}


async function carregarComponentes() {
    const container = document.getElementById("lista-componentes-container");
    const contador = document.getElementById("componentes-contador");

    if (!container) return;

    container.innerHTML = "";

    const { empresaId, equipamentoId } = pegarIdsDaUrl();

    const resposta = await chamarApi("/componentes/listar_componentes", "POST", {
        idDispositivo: equipamentoId,
        empresa_id: empresaId
    });

    const listaComponentes = resposta?.dados || [];


    if (contador) {
        contador.textContent = `${listaComponentes.length} componente(s) cadastrado(s)`;
    }

    if (listaComponentes.length === 0) {
        container.innerHTML = `
            <p class="text-sm text-white/50 py-3">
                Nenhum componente cadastrado para este equipamento.
            </p>
        `;
        return;
    }

    listaComponentes.forEach((comp, indice) => {
        const nome = primeiroValor(
            comp,
            ["nome_identificador", "nome_componente", "nome", "tipo"],
            "Componente"
        );

        const tipo = primeiroValor(
            comp,
            ["tipo_componente_monitora", "tipo_componente", "tipo"],
            ""
        );

        const unidadeMedida = primeiroValor(
            comp,
            ["unidadeMedida", "unidade_medida", "unidade"],
            ""
        );

        const ativo = comp.ativo;

        const isActive =
            ativo === 1 ||
            ativo === true ||
            ["1", "ativo", "online", "active"].includes(
                String(ativo).toLowerCase()
            );

        const idComponente = primeiroValor(
            comp,
            ["id_componente", "componente_id", "id"],
            null
        );

        const parametros = new URLSearchParams({
            empresaId: empresaId,
            eqId: equipamentoId,
            compId: idComponente
        });

        const urlDetalhes =
            `./componentes/detalhesComponente.html?${parametros.toString()}`;

        const urlEditar =
            `./componentes/editarComponente.html?${parametros.toString()}`;

        const card = document.createElement("div");

        card.className = `
            w-full h-16 border border-white/10 flex items-center
            px-5 rounded-[7px] bg-[#09121B] justify-between
            hover:bg-white/5 outline-none focus:outline-none
            focus:ring-0 cursor-pointer transition-element
        `;

        card.tabIndex = 0;
        card.setAttribute("role", "link");

        card.addEventListener("click", () => {
            window.location.href = urlDetalhes;
        });

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                window.location.href = urlDetalhes;
            }
        });

        card.innerHTML = `
            <div class="flex items-center gap-4 min-w-0">
                <span class="size-2.5 shrink-0 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"
            }"></span>

                <div class="flex flex-col min-w-0">
                    <span class="text-sm font-medium text-white nome-componente"></span>
                    <span class="text-gray-500 text-[11px] tipo-componente"></span>
                </div>
            </div>

            <div class="flex items-center gap-2 text-white/60 shrink-0"
                 onclick="event.stopPropagation()">

                <a href="${urlDetalhes}"
                   class="w-9 h-9 rounded-md flex items-center justify-center hover:text-light-blue outline-none focus:outline-none focus:ring-0 cursor-pointer transition-element"
                   title="Visualizar componente"
                   aria-label="Visualizar componente">

                  
                </a>

                <a href="${urlEditar}"
                   class="w-9 h-9 rounded-md flex items-center justify-center hover:text-light-blue outline-none focus:outline-none focus:ring-0 cursor-pointer transition-element"
                   title="Editar componente"
                   aria-label="Editar componente">

                    <svg class="size-4.5" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor"
                         stroke-width="1.8" stroke-linecap="round"
                         stroke-linejoin="round">
                        <path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/>
                        <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </a>

                <button type="button"
                        class="w-9 h-9 rounded-md flex items-center justify-center hover:text-red-400 outline-none focus:outline-none focus:ring-0 cursor-pointer transition-element"
                        title="Excluir componente"
                        aria-label="Excluir componente">

                    <svg class="size-4.5" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor"
                         stroke-width="1.8" stroke-linecap="round"
                         stroke-linejoin="round">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>
                    </svg>
                </button>
            </div>
        `;

        card.querySelector(".nome-componente").textContent = nome;

        card.querySelector(".tipo-componente").textContent =
            [tipo && tipo !== nome ? tipo : "", unidadeMedida]
                .filter(Boolean)
                .join(" - ");


        const botaoExcluir = card.querySelector("button");

        botaoExcluir.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            // O componente precisa ter um ID real do banco.
            if (
                idComponente === null ||
                idComponente === undefined ||
                idComponente === "" ||
                !Number.isInteger(Number(idComponente)) ||
                Number(idComponente) <= 0
            ) {
                alert("Não foi possível identificar o componente para desativação.");
                return;
            }

            abrirModalExcluir(Number(idComponente));
        });

        card.dataset.componenteId = idComponente;
        card.dataset.empresaId = empresaId;
        card.dataset.equipamentoId = equipamentoId;

        container.appendChild(card);
    });
}



async function carregarEdicao(equipamento) {
    const editEqNome = document.getElementById("edit-eq-nome");
    const editEqStatusBadge = document.getElementById("edit-eq-status-badge");


    const categoriaHtml = document.getElementById("categoria");
    const modeloHtml = document.getElementById("modelo");
    const ip = document.getElementById("ip");
    const mac = document.getElementById("mac");
    const serie = document.getElementById("serie");
    const status = document.getElementById("status");

    const linkVoltar = document.getElementById("link-voltar");

    if (!equipamento || !equipamento[0]) return;

    if (
        !editEqNome ||
        !editEqStatusBadge ||
        !categoriaHtml ||
        !modeloHtml ||
        !ip ||
        !mac ||
        !serie ||
        !status
    ) {
        return;
    }

    const dispositivo = equipamento[0];

    console.log(dispositivo, "alkskjdsalkjasdlkjsdaljk")

    const respostaModelos = await chamarApi(
        "/dispositivos/listar_categorias",
        "GET"
    );

    if (!respostaModelos || !respostaModelos.dados) {
        console.error("Não foi possível carregar modelos e categorias.");
        return;
    }

    const categorias = respostaModelos.dados[0];
    const modelos = respostaModelos.dados[1];

    const modelo = modelos.find(
        item => item.id_modelo == dispositivo.modelo_id
    );

    if (!modelo) {
        console.error("Modelo do dispositivo não encontrado.");
        return;
    }

    const categoria = categorias.find(
        item => item.id_categoria == modelo.categoria_id
    );

    if (!categoria) {
        console.error("Categoria do dispositivo não encontrada.");
        return;
    }

    // Informações principais
    editEqNome.textContent = dispositivo.numero_serie;
    editEqStatusBadge.textContent = dispositivo.status_dispositivo;

    // Informações do dispositivo
    categoriaHtml.value = categoria.nome;
    modeloHtml.value = modelo.nome_modelo;
    ip.value = dispositivo.ip;
    mac.value = dispositivo.endereco_mac;
    serie.value = dispositivo.numero_serie;
    status.value = dispositivo.status_dispositivo;

    // Data de cadastro, caso exista esse elemento no HTML
    escreverTexto(
        "edit-eq-data",
        formatarData(dispositivo.criacao)
    );
}


function novoComponente() {
    const { empresaId, equipamentoId } = pegarIdsDaUrl();

    window.location.href = `./componentes/novoComponente.html?empresaId=${empresaId}&eqId=${equipamentoId}`;
}


// ===================== SALVAR EDIÇÃO DO EQUIPAMENTO =====================

async function salvarEdicaoEmpresa(evento) {
    evento.preventDefault();
    const { empresaId, equipamentoId } = pegarIdsDaUrl();
    const categoriaHtml = document.getElementById("categoria");
    const modeloHtml = document.getElementById("modelo");
    const ip = document.getElementById("ip");
    const mac = document.getElementById("mac");
    const serie = document.getElementById("serie");
    const status = document.getElementById("status");

    if (!categoriaHtml || !modeloHtml || !ip || !mac || !serie || !status) {
        alert("Preencha todos os campos");
        return;
    }
    const resposta = await chamarApi("/dispositivos/editar_dispositivo", "POST", {
        empresa_id: empresaId,
        dispositivo_id: equipamentoId,
        ip: ip.value.trim(),
        endereco_mac: mac.value.trim(),
        numero_serie: serie.value.trim(),
        status_dispositivo: status.value.trim()
    });

    if (!resposta.ok) {
        mostrarErro(resposta, "Não foi possível salvar as alterações.");
        return;
    }

    alert("dispositivo atualizado com sucesso!");
    window.location.href = `../informacoesEmpresa.html?id=${empresaId}`;
}



let modal_excluir = document.getElementById("modal_excluir");
let componenteSelecionadoParaExcluir = null;

function abrirModalExcluir(id) {
    componenteSelecionadoParaExcluir = Number(id);

    if (!modal_excluir) {
        alert("O modal de desativação não foi encontrado.");
        return;
    }

    modal_excluir.classList.remove("hidden");
    modal_excluir.classList.add("flex");
}

function fecharModalExcluir() {
    if (modal_excluir) {
        modal_excluir.classList.add("hidden");
        modal_excluir.classList.remove("flex");
    }

    componenteSelecionadoParaExcluir = null;
}

// Fechar ao clicar fora do modal.
if (modal_excluir) {
    modal_excluir.addEventListener("click", (event) => {
        if (event.target === modal_excluir) {
            fecharModalExcluir();
        }
    });
}

// Fechar ao pressionar Escape.
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        fecharModalExcluir();
    }
});

// ===================== INÍCIO =====================

document.addEventListener("DOMContentLoaded", async () => {
    const btnHamburguer = document.getElementById("btn-hamburguer");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    function toggleMenu() {
        if (!sidebar || !overlay) return;
        sidebar.classList.toggle("-translate-x-full");
        overlay.classList.toggle("hidden");
    }

    if (btnHamburguer && overlay) {
        btnHamburguer.addEventListener("click", toggleMenu);
        overlay.addEventListener("click", toggleMenu);
    }

    // Usa a mesma validação de gerente que o script de empresas, quando disponível.
    if (typeof exigirGerente === "function" && !exigirGerente()) return;

    const { empresaId } = pegarIdsDaUrl();
    const linkVoltar = document.getElementById("link-voltar");
    const linkCancelar = document.querySelector(
        '#form-editar-dispositivo a[href="../informacoesEmpresa.html"]'
    );

    if (empresaId) {
        if (linkVoltar) {
            linkVoltar.href = `../informacoesEmpresa.html?id=${empresaId}`;
        }

        if (linkCancelar) {
            linkCancelar.href = `../informacoesEmpresa.html?id=${empresaId}`;
        }
    }

    equipamentoAtual = await buscarEquipamentoDaUrl();
    carregarInformacoesEquipamento(equipamentoAtual);
    carregarEdicao(equipamentoAtual)

    const formulario = document.getElementById("form-editar-dispositivo");

    if (formulario) {
        formulario.addEventListener("submit", salvarEdicaoEmpresa);
    }
    if (!equipamentoAtual) return;

   const btnConfirmarExclusao = document.getElementById(
    "btn-confirmar-exclusao"
);

if (btnConfirmarExclusao) {
    btnConfirmarExclusao.addEventListener("click", async () => {

        // Verifica se existe um componente selecionado.
        if (componenteSelecionadoParaExcluir === null) {
            alert("Selecione um componente para desativar.");
            return;
        }

        const componenteId = componenteSelecionadoParaExcluir;

        // Recupera os IDs da URL atual.
        const { empresaId, equipamentoId } = pegarIdsDaUrl();

        if (!empresaId || !equipamentoId || !componenteId) {
            alert(
                "Não foi possível identificar a empresa, o equipamento ou o componente."
            );
            return;
        }

        // Evita cliques repetidos durante a requisição.
        btnConfirmarExclusao.disabled = true;

        try {
            const resposta = await chamarApi(
                "/componentes/desativar_componente",
                "DELETE",
                {
                    idDispositivo: Number(equipamentoId),
                    empresa_id: Number(empresaId),
                    componente_id: Number(componenteId)
                }
            );

            if (!resposta.ok) {
                mostrarErro(
                    resposta,
                    "Não foi possível desativar o componente."
                );
                return;
            }

            // Fecha o modal somente após o sucesso.
            fecharModalExcluir();

            alert("Componente desativado com sucesso!");

            // Atualiza a lista sem recarregar a página.
            await carregarComponentes();

        } catch (erro) {
            console.error("Erro ao desativar componente:", erro);

            alert("Ocorreu um erro ao tentar desativar o componente.");

        } finally {
            btnConfirmarExclusao.disabled = false;
        }
    });
}


});