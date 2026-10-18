let funcionarioAtual = null;
let funcionarioParaExcluir = null;
let empresasDoFuncionario = [];

function mensagemDoBack(dados, padrao) {
    if (typeof dados === "string") return dados;
    if (dados && typeof dados.res === "string") return dados.res;
    return padrao;
}

function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function tratarErroDeRede(erro) {
    if (erro && erro.sessaoExpirada) return;
    console.error(erro);
    alert("Não foi possível conectar ao servidor. Verifique se o back-end está rodando.");
}

function mostrarMensagemNaLista(texto) {
    const container = document.getElementById("lista-funcionarios-container");
    if (!container) return;

    container.innerHTML = "";
    const p = document.createElement("p");
    p.className = "text-white/40 text-sm text-center py-4"
    p.textContent = texto;
    container.appendChild(p);
}

// ---------- TELA DE LISTA: GET /funcionarios/listar_funcionarios ----------

function renderizarFuncionarios(lista) {
    const container = document.getElementById("lista-funcionarios-container");
    if (!container) return;
 
    container.innerHTML = "";
 
    if (lista.length === 0) {
        mostrarMensagemNaLista("Nenhum funcionário cadastrado.");
        return;
    }
 
    lista.forEach((funcionario) => {
        const id = Number(funcionario.id);
        const nome = funcionario.nome || "Funcionário";
 
        const card = document.createElement("div");
        card.className = "flex items-center justify-between px-6 py-5 rounded-xl border border-white/10 bg-[#0D1924]";

        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div data-campo="avatar" class="size-12 rounded-full grid place-items-center bg-main-purple border-2 border-[#2d3a6b] text-light-blue text-xl font-bold"></div>
                <span data-campo="nome" class="text-base"></span>
            </div>
            <div class="flex items-center gap-4 text-white/60">
                <a href="./editarFuncionario.html?id=${id}" class="hover:text-light-blue cursor-pointer transition-element outline-none focus:outline-none focus:ring-0">
                    <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </a>
                <button type="button" class="hover:text-red-400 cursor-pointer transition-element outline-none focus:outline-none focus:ring-0" onclick="confirmarExclusao(${id})">
                    <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                </button>
            </div>
        `;
 
        card.querySelector('[data-campo="avatar"]').textContent = nome.charAt(0).toUpperCase();
        card.querySelector('[data-campo="nome"]').textContent = nome;
 
        container.appendChild(card);
    });
}

async function carregarFuncionarios() {
    if (!document.getElementById("lista-funcionarios-container")) return;

    mostrarMensagemNaLista("Carregando...");

    try {
        const { ok, status, dados } = await apiFetch("/funcionarios/listar_funcionarios");

        if (status === 404) {
            renderizarFuncionarios([]);
            return;
        }

        if (status === 403) {
            mostrarMensagemNaLista("Acesso restrito a gerentes.")
            return;
        }

        if (!ok) {
            mostrarMensagemNaLista("Não foi possível carregar os funcionários.")
            return;
        }

        renderizarFuncionarios(dados);
    } catch (erro) {
        tratarErroDeRede(erro);
        mostrarMensagemNaLista("Não foi possível carregar os funcionários.");
    }
}

// ---------- TELA DE LISTA: POST /funcionarios/criar_funcionario (convite por e-mail) ----------

async function enviarConvite() {
    const input = document.getElementById("email");
    const email = input ? input.value.trim() : "";

    if (!emailValido(email)) {
        alert("Informe um e-mail válido.");
        return;
    }

    try {
        const { ok, status, dados } = await apiFetch("/funcionarios/criar_funcionario", {
            method: "POST",
            body: JSON.stringify({ email })
        });

        if (ok) {
            input.value = "";
            fecharModal();
            alert("Convite enviado! O funcionário aparecerá na lista quando concluir o cadastro.");
            return;
        }

        if (status === 403) {
            alert("Apenas gerentes podem convidar funcionários.");
        } else {
            alert(mensagemDoBack(dados, "Não foi possível enviar o convite."));
        }
    } catch (erro) {
        tratarErroDeRede(erro);
    }
}

// ---------- TELA DE LISTA: DELETE /funcionarios/deletar_funcionario (desativar) ----------

function confirmarExclusao(id) {
    funcionarioParaExcluir = id;
    if (modal_excluir) {
        modal_excluir.classList.remove("hidden");
        modal_excluir.classList.add("flex");
    }
}

function fecharModalExcluir() {
    funcionarioParaExcluir = null;
    if (modal_excluir) {
        modal_excluir.classList.add('hidden');
        modal_excluir.classList.remove('flex');
    }
}

async function executarExclusao() {
    if (funcionarioParaExcluir === null) return;

    const id = funcionarioParaExcluir;
    fecharModalExcluir();

    try {
        const { ok, dados } = await apiFetch("/funcionarios/deletar_funcionario", {
            method: "DELETE",
            body: JSON.stringify({ id })
        });

        if (ok) {
            carregarFuncionarios();
        } else {
            alert(mensagemDoBack(dados, "Não foi possível desativar o funcionário."));
        }
    } catch (erro) {
        tratarErroDeRede(erro);
    }
}

// ---------- TELA DE EDIÇÃO: POST /funcionarios/listar_funcionario (um funcionário pelo id) ----------

async function inicializarEdicaoFuncionario() {
    const elNome = document.getElementById("nome-funcionario");
    if (!elNome) return;

    const id = parseInt(new URLSearchParams(window.location.search).get("id"));
    if (!id) {
        window.location.href = "inmdex.html";
        return;
    }

    try {
        const { ok, dados } = await apiFetch ("/funcionarios/listar_funcionario", {
            method: "POST",
            body: JSON.stringify({ id })
        });

        if (!ok || !dados || !dados.informacoes || !dados.informacoes.length === 0) {
            alert(mensagemDoBack(dados, "Não foi possível carregar este funcionário."));
            window.location.href = "index.html";
            return;
        }

        funcionarioAtual = dados.informacoes[0];
 
        const nome = funcionarioAtual.nome || "Funcionário";
        elNome.textContent = nome;
        document.getElementById("avatar-inicial").textContent = nome.charAt(0).toUpperCase();
        document.getElementById("email").value = funcionarioAtual.email || "";
    } catch (erro) {
        tratarErroDeRede(erro);
    }
}

// ---------- TELA DE EDIÇÃO: POST /funcionarios/atualizar_funcionario ----------

async function salvarAlteracoes() {
    if (!funcionarioAtual) return;
 
    const email = document.getElementById("email").value.trim();
 
    if (!emailValido(email)) {
        alert("Informe um e-mail válido.");
        return;
    }
 
    try {
        const { ok, status, dados } = await apiFetch("/funcionarios/atualizar_funcionario", {
            method: "POST",
            body: JSON.stringify({
                id: funcionarioAtual.id,
                nome: funcionarioAtual.nome,
                email: email
            })
        });
 
        if (ok) {
            window.location.href = "index.html";
        } else if (status === 500) {
            alert("Não foi possível salvar. Verifique se o e-mail já não está em uso por outra conta.");
        } else {
            alert(mensagemDoBack(dados, "Não foi possível salvar as alterações."));
        }
    } catch (erro) {
        tratarErroDeRede(erro);
    }
}

// ---------- TELA DE EDIÇÃO: DELETE /funcionarios/deletar_funcionario ----------

async function desativarFuncionario() {
    if (!funcionarioAtual) return;
 
    if (!confirm("Deseja desativar " + (funcionarioAtual.nome || "este funcionário") + "?")) return;
 
    try {
        const { ok, dados } = await apiFetch("/funcionarios/deletar_funcionario", {
            method: "DELETE",
            body: JSON.stringify({ id: funcionarioAtual.id })
        });
 
        if (ok) {
            window.location.href = "index.html";
        } else {
            alert(mensagemDoBack(dados, "Não foi possível desativar o funcionário."));
        }
    } catch (erro) {
        tratarErroDeRede(erro);
    }
}

// ---------- TELA DE EDIÇÃO: empresas do funcionário ----------
// POST /funcionarios/listar_empresas_funcionario

async function carregarEmpresasDoFuncionario() {
    if (!funcionarioAtual) return;
 
    try {
        const { ok, dados } = await apiFetch("/funcionarios/listar_empresas_funcionario", {
            method: "POST",
            body: JSON.stringify({ id: funcionarioAtual.id })
        });
 
        if (!ok) {
            alert(mensagemDoBack(dados, "Não foi possível carregar as empresas do funcionário."));
        }
 
        empresasDoFuncionario = (ok && dados && dados.empresas) ? dados.empresas : [];
        renderizarEmpresasEdicao();
    } catch (erro) {
        tratarErroDeRede(erro);
    }
}

function renderizarEmpresasEdicao() {
    const listaContainer = document.getElementById("lista-empresas-vinculadas");
    if (!listaContainer) return;
 
    listaContainer.innerHTML = "";
 
    if (empresasDoFuncionario.length === 0) {
        listaContainer.innerHTML = `<li class="px-4 py-3.5 text-sm text-white/40 text-center">Nenhuma empresa vinculada</li>`;
        return;
    }
 
    empresasDoFuncionario.forEach((empresa) => {
        const li = document.createElement("li");
        li.className = "flex items-center justify-between px-4 py-3.5 text-sm border-b border-white/10 last:border-b-0";
        li.innerHTML = `
            <span data-campo="nome"></span>
            <button type="button" onclick="removerEmpresa(${Number(empresa.id_empresa)})" class="text-white/40 hover:text-red-400 cursor-pointer transition-element">
                <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
        `;
        li.querySelector('[data-campo="nome"]').textContent = empresa.nome_empresa;
 
        listaContainer.appendChild(li);
    });
}


// GET /empresa/listar_empresas

async function abrirModalEmpresa() {
    if (!funcionarioAtual) return;
 
    try {
        const { ok, status, dados } = await apiFetch("/empresa/listar_empresas");
 
        // 404 = o gerente não tem empresas cadastradas
        if (!ok && status !== 404) {
            alert(mensagemDoBack(dados, "Não foi possível carregar as empresas."));
            return;
        }
 
        const empresasDoGerente = ok ? dados : [];
        const jaVinculadas = new Set(empresasDoFuncionario.map((e) => e.id_empresa));
        const disponiveis = empresasDoGerente.filter((e) => !jaVinculadas.has(e.id_empresa));
 
        if (disponiveis.length === 0) {
            alert("Não há outras empresas disponíveis para vincular a este funcionário.");
            return;
        }
 
        const select = document.getElementById("select-nova-empresa");
        select.innerHTML = "";
        disponiveis.forEach((empresa) => {
            const opcao = document.createElement("option");
            opcao.value = empresa.id_empresa;
            opcao.textContent = empresa.nome_empresa;
            select.appendChild(opcao);
        });
 
        abrirModal();
    } catch (erro) {
        tratarErroDeRede(erro);
    }
}


// POST /funcionarios/adicionar_empresa_funcionario

async function adicionarEmpresa() {
    const select = document.getElementById("select-nova-empresa");
    const empresaId = select ? parseInt(select.value) : NaN;
 
    if (!funcionarioAtual || !empresaId) return;
 
    try {
        const { ok, dados } = await apiFetch("/funcionarios/adicionar_empresa_funcionario", {
            method: "POST",
            body: JSON.stringify({ id: funcionarioAtual.id, empresa_id: empresaId })
        });
 
        if (!ok) {
            alert(mensagemDoBack(dados, "Não foi possível vincular a empresa."));
            return;
        }
 
        fecharModal();
        await carregarEmpresasDoFuncionario();
    } catch (erro) {
        tratarErroDeRede(erro);
    }
}

// DELETE /funcionarios/remover_empresa_funcionario
async function removerEmpresa(empresaId) {
    if (!funcionarioAtual) return;
 
    if (!confirm("Remover o acesso do funcionário a esta empresa?")) return;
 
    try {
        const { ok, dados } = await apiFetch("/funcionarios/remover_empresa_funcionario", {
            method: "DELETE",
            body: JSON.stringify({ id: funcionarioAtual.id, empresa_id: empresaId })
        });
 
        if (!ok) {
            alert(mensagemDoBack(dados, "Não foi possível remover a empresa."));
            return;
        }
 
        await carregarEmpresasDoFuncionario();
    } catch (erro) {
        tratarErroDeRede(erro);
    }
}

// ---------- modais (tela de lista) ----------

let modal = document.getElementById('modal');
let modal_excluir = document.getElementById('modal_excluir');
 
function abrirModal() {
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}
 
function fecharModal() {
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}
 
if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal) fecharModal(); });
}
if (modal_excluir) {
    modal_excluir.addEventListener('click', e => { if (e.target === modal_excluir) fecharModalExcluir(); });
}
 
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        fecharModal();
        fecharModalExcluir();
    }
});

// ---------- inicialização ----------

document.addEventListener('DOMContentLoaded', () => {
    // sem login de gerente a página nem tenta buscar dados
    if (!exigirGerente()) return;
 
    carregarFuncionarios();
    inicializarEdicaoFuncionario();
 
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
});