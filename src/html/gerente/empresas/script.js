
 // ============================================================
 //  EMPRESAS (gerente) - conexão com o back-end
 //  Usado pelas 3 páginas: index.html, informacoesEmpresa.html e editarEmpresa.html
 // ============================================================

// A comunicação com o back (endereço, token, login, apiFetch) vem do arquivo js/api.js,
// que as páginas carregam antes deste script.

let empresaAtual = null;
let idEmpresaParaExcluir = null;
let indiceEquipamentoParaExcluir = null;
let dispositivoIdParaExcluir = null;


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
        return { ok: false, status: 0, dados: null };
    }
}

function mostrarErro(resposta, mensagemPadrao) {
    if (resposta.status === 401) {
        return;
    }

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


function pegarIdDaUrl() {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    return id || 0;
}

function novoEquipamento(){
    const id = pegarIdDaUrl();

    window.location.href = `./equipamentos/novoEquipamento.html?empresaId=${id}&eqId=null`;
}

async function buscarEmpresaDaUrl() {
    const id = pegarIdDaUrl();

    if (!id) {
        window.location.href = "./index.html";
        return null;
    }

    const resposta = await chamarApi(
        "/empresa/informacoes_empresa",
        "POST",
        { empresa_id: id }
    );

    if (!resposta.ok) {
        mostrarErro(resposta, "Não foi possível carregar a empresa.");

        if (resposta.status !== 401) {
            window.location.href = "./index.html";
        }

        return null;
    }

    return resposta.dados.res[0];
}

function formatarData(data) {
    return new Date(data).toLocaleDateString("pt-BR");
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function escreverTexto(idElemento, texto) {
    const elemento = document.getElementById(idElemento);
    if (elemento) elemento.textContent = texto;
}


// ===================== INÍCIO =====================

document.addEventListener("DOMContentLoaded", () => {
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

    inicializarPaginaEmpresas();
});

function inicializarPaginaEmpresas() {
    if (!exigirGerente()) return;

    carregarListaEmpresas();
    carregarInformacoes();
    carregarEdicao();
}


// ===================== PÁGINA: LISTA (index.html) =====================

function criarCardEmpresa(empresaItem) {
    const card = document.createElement("div");

    card.className = "flex items-center justify-between px-6 py-5 rounded-lg border border-white/10 bg-[#0D1924] w-full hover:border-light-blue/50 transition-element cursor-pointer";

    card.onclick = () => {
        window.location.href = `informacoesEmpresa.html?id=${empresaItem.id_empresa}`;
    };

    card.innerHTML = `
        <span class="text-base font-medium nome-empresa"></span>

        <div class="flex items-center gap-4 text-white/60">
            <a href="./editarEmpresa.html?id=${empresaItem.id_empresa}"
               class="hover:text-light-blue cursor-pointer transition-element p-1"
               onclick="event.stopPropagation()">

                <svg class="size-4.5" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" />
                    <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            </a>

            <button type="button"
                    class="hover:text-red-400 cursor-pointer transition-element p-1"
                    onclick="event.stopPropagation(); abrirModalExcluir(${empresaItem.id_empresa});">

                <svg class="size-4.5" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                </svg>
            </button>
        </div>
    `;

    card.querySelector(".nome-empresa").textContent = empresaItem.nome_empresa;

    return card;
}

async function carregarListaEmpresas() {
    const listaContainer = document.getElementById("lista-empresas-container");

    if (!listaContainer) return;

    const resposta = await chamarApi("/empresa/listar_empresas", "GET");

    listaContainer.innerHTML = "";

    if (resposta.status === 404) {
        listaContainer.innerHTML =
            '<p class="text-white/60">Nenhuma empresa cadastrada ainda.</p>';
        return;
    }

    if (!resposta.ok) {
        mostrarErro(resposta, "Não foi possível carregar as empresas.");
        return;
    }

    resposta.dados.forEach(empresaItem => {
        listaContainer.appendChild(criarCardEmpresa(empresaItem));
    });
}


// ===================== CRIAR EMPRESA =====================

async function criarEmpresa(evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const cnpj = document.getElementById("cnpj").value.trim();
    const sla = document.getElementById("SLA").value;
    const limite = document.getElementById("limite").value.trim();
    const status = document.getElementById("status").value;

    if (!nome || !cnpj) {
        alert("Preencha o nome e o CNPJ.");
        return;
    }

    if (sla === "selecione") {
        alert("Selecione o nível do SLA.");
        return;
    }

    if (!limite) {
        alert("Informe o limite de resposta do SLA.");
        return;
    }

    const resposta = await chamarApi("/empresa/criar_empresa", "POST", {
        nome_empresa: nome,
        cnpj: cnpj,
        nivel_sla: capitalizar(sla),
        limite_resposta: limite,
        status_sla: capitalizar(status)
    });

    if (!resposta.ok) {
        mostrarErro(resposta, "Não foi possível criar a empresa.");
        return;
    }

    fecharModal();
    carregarListaEmpresas();
}


// ===================== PÁGINA: INFORMAÇÕES =====================

async function carregarInformacoes() {
    const infoNome = document.getElementById("info-nome");

    if (!infoNome) return;

    const empresa = await buscarEmpresaDaUrl();

    if (!empresa) return;

    empresaAtual = empresa;
    empresaAtual.id = pegarIdDaUrl();
    empresaAtual.equipamentos = [];

    infoNome.textContent = empresa.nome_empresa;

    escreverTexto("info-cnpj", empresa.cnpj);
    escreverTexto("info-data", `Cadastrado em: ${formatarData(empresa.criacao)}`);
    escreverTexto("info-sla", empresa.nivel_sla || "---");
    escreverTexto("info-limite", empresa.limite_resposta || "---");

    const statusEl = document.getElementById("info-status");

    if (statusEl) {
        statusEl.textContent = empresa.status_sla || "---";

        if (empresa.status_sla) {
            statusEl.className =
                `font-medium ${empresa.status_sla === "ativo"
                    ? "text-green-500"
                    : "text-red-500"}`;
        }
    }

    await desenharEquipamentos(empresaAtual);
}


// ===================== LISTAR EQUIPAMENTOS =====================

async function desenharEquipamentos(empresa) {
    const idEmpresa = pegarIdDaUrl();

    const eqContainer = document.getElementById("info-equipamentos");

    if (!eqContainer) return;

    const resposta = await chamarApi(
        "/dispositivos/listar_dispositivos",
        "POST",
        {
            idEmpresa: idEmpresa
        }
    );

    if (!resposta.ok) {
        mostrarErro(resposta, "Não foi possível carregar os equipamentos.");
        return;
    }

    console.log(resposta.dados);

    eqContainer.innerHTML = "";

    if (!Array.isArray(resposta.dados)) {
        mostrarErro(
            { status: 500, dados: null },
            "O servidor retornou uma lista de equipamentos inválida."
        );
        return;
    }

    resposta.dados.forEach((eq) => {
        const isOnline =
            eq.status_dispositivo === "ativo"? true: false;
            // eq.status_dispositivo === "desativado";

        const eqCard = document.createElement("div");

        eqCard.className =
            "relative flex items-center justify-between px-4 py-3.5 rounded-lg border border-white/10 bg-[#0B141D] hover:bg-white/5 transition-element cursor-pointer";

        eqCard.onclick = () => {
            window.location.href =
                `./equipamentos/informacoesEquipamento.html?empresaId=${idEmpresa}&eqId=${eq.id_dispositivo}`;
        };

        eqCard.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="size-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-500"}"></span>
                <span class="text-sm font-medium"></span>
            </div>

            <div class="flex items-center gap-4">
                <span class="status-equipamento text-xs font-bold ${isOnline ? "text-green-500" : "text-gray-500"}"></span>

                <div class="flex items-center gap-2 text-white/60">
                    <a href="./equipamentos/editarEquipamento.html?empresaId=${idEmpresa}&eqId=${eq.id_dispositivo}"
                       class="hover:text-light-blue cursor-pointer transition-element p-1"
                       onclick="event.stopPropagation()">

                        <svg class="size-4.5" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="1.8"
                             stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/>
                            <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </a>

                    <button type="button"
                            class="btn-lixeira-eq hover:text-red-400 cursor-pointer transition-element p-1">

                        <svg class="size-4.5" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="1.8"
                             stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                        </svg>
                    </button>
                </div>
            </div>
        `;

        eqCard.querySelector(".flex.items-center.gap-3 span:last-child").textContent =
            eq.nome || "Equipamento sem nome";

        eqCard.querySelector(".status-equipamento").textContent =
            eq.status_dispositivo || "---";

        const btnLixeira = eqCard.querySelector(".btn-lixeira-eq");

        btnLixeira.addEventListener("click", (e) => {
            e.stopPropagation();
            abrirModalExcluirEquipamento(eq.id_dispositivo);
        });

        eqContainer.appendChild(eqCard);
    });
}


// ===================== PÁGINA: EDITAR EMPRESA =====================

async function carregarEdicao() {
    const editNome = document.getElementById("edit-titulo-nome");

    if (!editNome) return;

    const empresa = await buscarEmpresaDaUrl();

    if (!empresa) return;

    editNome.textContent = empresa.nome_empresa;

    escreverTexto("edit-sub-cnpj", empresa.cnpj);
    escreverTexto("edit-data", `Cadastrado em: ${formatarData(empresa.criacao)}`);

    document.getElementById("nome").value = empresa.nome_empresa;
    document.getElementById("cnpj").value = empresa.cnpj;
}


// ===================== SALVAR EDIÇÃO DA EMPRESA =====================

async function salvarEdicaoEmpresa(evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const cnpj = document.getElementById("cnpj").value.trim();

    if (!nome || !cnpj) {
        alert("Preencha o nome e o CNPJ.");
        return;
    }

    const resposta = await chamarApi("/empresa/atualizar_empresa", "POST", {
        id_empresa: pegarIdDaUrl(),
        nome_empresa: nome,
        cnpj: cnpj
    });

    if (!resposta.ok) {
        mostrarErro(resposta, "Não foi possível salvar as alterações.");
        return;
    }

    alert("Empresa atualizada com sucesso!");
    window.location.href = "./index.html";
}


// ===================== MODAIS =====================

let modal = document.getElementById("modal");
let modal_excluir = document.getElementById("modal_excluir");

function abrirModal() {
    if (!modal) return;

    const nome = document.getElementById("nome");
    const cnpj = document.getElementById("cnpj");
    const sla = document.getElementById("SLA");
    const limite = document.getElementById("limite");
    const status = document.getElementById("status");

    if (nome) nome.value = "";
    if (cnpj) cnpj.value = "";
    if (sla) sla.value = "selecione";
    if (limite) limite.value = "";
    if (status) status.value = "ativo";

    modal.classList.remove("hidden");
    modal.classList.add("flex");
}


// Lixeira de uma empresa
function abrirModalExcluir(id) {
    fecharModalExcluir();

    idEmpresaParaExcluir = id;

    if (modal_excluir) {
        modal_excluir.classList.remove("hidden");
        modal_excluir.classList.add("flex");
    }
}


// Lixeira de um equipamento
function abrirModalExcluirEquipamento(dispositivoId) {
    fecharModalExcluir();

    dispositivoIdParaExcluir = Number(dispositivoId);

    if (modal_excluir) {
        modal_excluir.classList.remove("hidden");
        modal_excluir.classList.add("flex");
    }
}

function fecharModal() {
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

function fecharModalExcluir() {
    indiceEquipamentoParaExcluir = null;
    idEmpresaParaExcluir = null;
    dispositivoIdParaExcluir = null;

    if (modal_excluir) {
        modal_excluir.classList.add("hidden");
        modal_excluir.classList.remove("flex");
    }
}


// ===================== CONFIRMAR EXCLUSÃO =====================

document.addEventListener("DOMContentLoaded", () => {
    const btnConfirmarExclusao =
        document.getElementById("btn-confirmar-exclusao");

    if (!btnConfirmarExclusao) return;

    btnConfirmarExclusao.addEventListener("click", async () => {

        // Excluir/desativar equipamento pelo back-end
        if (dispositivoIdParaExcluir !== null) {
            const dispositivoId = dispositivoIdParaExcluir;
            const empresaId = pegarIdDaUrl();

            if (!dispositivoId || !empresaId) {
                alert("Não foi possível identificar o equipamento ou a empresa.");
                return;
            }

            const resposta = await chamarApi(
                "/dispositivos/desativar_dispositivo",
                "DELETE",
                {
                    dispositivo_id: Number(dispositivoId),
                    empresa_id: Number(empresaId)
                }
            );

            if (!resposta.ok) {
                mostrarErro(
                    resposta,
                    "Não foi possível excluir o equipamento."
                );
                return;
            }

            fecharModalExcluir();

            await desenharEquipamentos(empresaAtual);

            return;
        }


        // Excluir empresa pelo back-end
        if (idEmpresaParaExcluir !== null) {
            const id = idEmpresaParaExcluir;

            fecharModalExcluir();

            const resposta = await chamarApi(
                "/empresa/deletar_empresa",
                "DELETE",
                { id: id }
            );

            if (!resposta.ok) {
                mostrarErro(
                    resposta,
                    "Não foi possível excluir a empresa."
                );
                return;
            }

            await carregarListaEmpresas();

            return;
        }

        fecharModalExcluir();
    });
});


// ===================== FECHAR MODAIS =====================

if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });
}

if (modal_excluir) {
    modal_excluir.addEventListener("click", (e) => {
        if (e.target === modal_excluir) {
            fecharModalExcluir();
        }
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        fecharModal();
        fecharModalExcluir();
    }
});
