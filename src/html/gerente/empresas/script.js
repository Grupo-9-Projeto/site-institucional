// ============================================================
//  EMPRESAS (gerente) - conexão com o back-end
//  Usado pelas 3 páginas: index.html, informacoesEmpresa.html e editarEmpresa.html
// ============================================================

// A comunicação com o back (endereço, token, login, apiFetch) vem do arquivo js/api.js,
// que as páginas carregam antes deste script.

let empresaAtual = null;               // empresa carregada do back (páginas de informações e de edição)
let idEmpresaParaExcluir = null;       // empresa escolhida na lixeira (página da lista)
let indiceEquipamentoParaExcluir = null;


// ===================== FUNÇÕES AUXILIARES =====================

// Faz a chamada para a API usando o apiFetch do api.js (que já manda o token).
// Sempre devolve { ok, status, dados } (nunca "estoura" erro)
async function chamarApi(caminho, metodo, corpo) {
    try {
        return await apiFetch(caminho, {
            method: metodo,
            body: corpo ? JSON.stringify(corpo) : undefined
        });
    } catch (erro) {
        // sessão vencida: o api.js já mandou para o login
        if (erro && erro.sessaoExpirada) {
            return { ok: false, status: 401, dados: null };
        }
        // back desligado, porta errada, sem conexão...
        return { ok: false, status: 0, dados: null };
    }
}

// Mostra a mensagem de erro que veio do back (ou uma mensagem padrão)
function mostrarErro(resposta, mensagemPadrao) {
    if (resposta.status === 401) {
        return; // já está indo para o login
    }

    if (resposta.status === 0) {
        alert("Não foi possível conectar ao servidor. Verifique se o back-end está rodando.");
        return;
    }

    // Erros "esperados" (400, 403, 404, 409) trazem uma mensagem pronta do back
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

// Pega o número do ?id= da URL (ex.: editarEmpresa.html?id=3). Devolve 0 se não tiver
function pegarIdDaUrl() {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    return id || 0;
}

// Busca os dados da empresa do ?id= da URL. Se der erro, volta para a lista.
async function buscarEmpresaDaUrl() {
    const id = pegarIdDaUrl();

    if (!id) {
        window.location.href = "./index.html";
        return null;
    }

    const resposta = await chamarApi("/empresa/informacoes_empresa", "POST", { empresa_id: id });

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

// "ouro" -> "Ouro" (é assim que o valor fica gravado no banco)
function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function escreverTexto(idElemento, texto) {
    const elemento = document.getElementById(idElemento);
    if (elemento) elemento.textContent = texto;
}


// ===================== INÍCIO =====================

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

    inicializarPaginaEmpresas();
});

// Cada função abaixo só faz alguma coisa na página certa
function inicializarPaginaEmpresas() {
    if (!exigirGerente()) return; // sem login de gerente, o api.js manda para o login

    carregarListaEmpresas();  // index.html
    carregarInformacoes();    // informacoesEmpresa.html
    carregarEdicao();         // editarEmpresa.html
}


// ===================== PÁGINA: LISTA (index.html) =====================

// Monta o cartão de uma empresa na lista
function criarCardEmpresa(empresaItem) {
    const card = document.createElement('div');
    card.className = "flex items-center justify-between px-6 py-5 rounded-lg border border-white/10 bg-[#0D1924] w-full hover:border-light-blue/50 transition-element cursor-pointer";
    card.onclick = () => window.location.href = `informacoesEmpresa.html?id=${empresaItem.id_empresa}`;

    card.innerHTML = `
        <span class="text-base font-medium nome-empresa"></span>
        <div class="flex items-center gap-4 text-white/60">
            <a href="./editarEmpresa.html?id=${empresaItem.id_empresa}" class="hover:text-light-blue cursor-pointer transition-element p-1" onclick="event.stopPropagation()">
                <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </a>
            <button type="button" class="hover:text-red-400 cursor-pointer transition-element p-1" onclick="event.stopPropagation(); abrirModalExcluir(${empresaItem.id_empresa});">
                <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
            </button>
        </div>
    `;

    // textContent (e não innerHTML) para o nome nunca ser interpretado como código HTML
    card.querySelector('.nome-empresa').textContent = empresaItem.nome_empresa;

    return card;
}

// Busca as empresas no back e desenha a lista
async function carregarListaEmpresas() {
    const listaContainer = document.getElementById('lista-empresas-container');
    if (!listaContainer) return; // não é a página da lista

    const resposta = await chamarApi("/empresa/listar_empresas", "GET");

    listaContainer.innerHTML = '';

    // 404 = usuário ainda não tem nenhuma empresa (não é erro)
    if (resposta.status === 404) {
        listaContainer.innerHTML = '<p class="text-white/60">Nenhuma empresa cadastrada ainda.</p>';
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

// Botão "Salvar" do modal "Adicionar Empresa"
async function criarEmpresa(evento) {
    evento.preventDefault(); // não deixa o formulário recarregar a página

    const nome = document.getElementById('nome').value.trim();
    const cnpj = document.getElementById('cnpj').value.trim();
    const sla = document.getElementById('SLA').value;
    const limite = document.getElementById('limite').value.trim();
    const status = document.getElementById('status').value;

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


// ===================== PÁGINA: INFORMAÇÕES (informacoesEmpresa.html) =====================

async function carregarInformacoes() {
    const infoNome = document.getElementById('info-nome');
    if (!infoNome) return; // não é a página de informações

    const empresa = await buscarEmpresaDaUrl();
    if (!empresa) return;

    // Os equipamentos ainda não estão ligados ao back-end: a lista fica vazia
    empresaAtual = empresa;
    empresaAtual.id = pegarIdDaUrl();
    empresaAtual.equipamentos = [];

    infoNome.textContent = empresa.nome_empresa;
    escreverTexto('info-cnpj', empresa.cnpj);
    escreverTexto('info-data', `Cadastrado em: ${formatarData(empresa.criacao)}`);
    escreverTexto('info-sla', empresa.nivel_sla || '---');
    escreverTexto('info-limite', empresa.limite_resposta || '---');

    const statusEl = document.getElementById('info-status');
    if (statusEl) {
        statusEl.textContent = empresa.status_sla || '---';
        if (empresa.status_sla) {
            statusEl.className = `font-medium ${empresa.status_sla === 'Ativo' ? 'text-green-500' : 'text-red-500'}`;
        }
    }

    desenharEquipamentos(empresaAtual);
}

// Lista de equipamentos da empresa (código dos equipamentos mantido como estava)
function desenharEquipamentos(empresa) {
    const eqContainer = document.getElementById('info-equipamentos');
    if (!eqContainer) return;

    eqContainer.innerHTML = '';
    empresa.equipamentos.forEach((eq, index) => {
        const isOnline = eq.status === 'Ativo' || eq.status === 'Online';

        const eqCard = document.createElement('div');
        eqCard.className = "relative flex items-center justify-between px-4 py-3.5 rounded-lg border border-white/10 bg-[#0B141D] hover:bg-white/5 transition-element cursor-pointer";
        eqCard.onclick = () => window.location.href = `./equipamentos/informacoesEquipamento.html?empresaId=${empresa.id}&eqId=${index}`;

        eqCard.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="size-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}"></span>
                <span class="text-sm font-medium">${eq.nome}</span>
            </div>

            <div class="flex items-center gap-4">
                <span class="text-xs font-bold ${isOnline ? 'text-green-500' : 'text-red-500'}">${eq.status}</span>

                <div class="flex items-center gap-2 text-white/60">
                    <a href="./equipamentos/editarEquipamento.html?empresaId=${empresa.id}&eqId=${index}" class="hover:text-light-blue cursor-pointer transition-element p-1" onclick="event.stopPropagation()">
                        <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </a>
                    <button type="button" class="btn-lixeira-eq hover:text-red-400 cursor-pointer transition-element p-1">
                        <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
                    </button>
                </div>
            </div>
        `;

        const btnLixeira = eqCard.querySelector('.btn-lixeira-eq');
        btnLixeira.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirModalExcluirEquipamento(index);
        });

        eqContainer.appendChild(eqCard);
    });
}


// ===================== PÁGINA: EDITAR (editarEmpresa.html) =====================

async function carregarEdicao() {
    const editNome = document.getElementById('edit-titulo-nome');
    if (!editNome) return; // não é a página de edição

    const empresa = await buscarEmpresaDaUrl();
    if (!empresa) return;

    editNome.textContent = empresa.nome_empresa;
    escreverTexto('edit-sub-cnpj', empresa.cnpj);
    escreverTexto('edit-data', `Cadastrado em: ${formatarData(empresa.criacao)}`);

    document.getElementById('nome').value = empresa.nome_empresa;
    document.getElementById('cnpj').value = empresa.cnpj;
}

// Botão "Salvar" da página de edição
async function salvarEdicaoEmpresa(evento) {
    evento.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const cnpj = document.getElementById('cnpj').value.trim();

    if (!nome || !cnpj) {
        alert("Preencha o nome e o CNPJ.");
        return;
    }

    const resposta = await chamarApi("/empresa/atualizar_empresa", "POST", {
        id_empresa: pegarIdDaUrl(), // número, não texto
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

let modal = document.getElementById('modal');
let modal_excluir = document.getElementById('modal_excluir');

function abrirModal() {
    if (modal) {
        // limpa o formulário toda vez que abre
        document.getElementById('nome').value = "";
        document.getElementById('cnpj').value = "";
        document.getElementById('SLA').value = "selecione";
        document.getElementById('limite').value = "";
        document.getElementById('status').value = "ativo";

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// Lixeira de uma empresa (página da lista)
function abrirModalExcluir(id) {
    idEmpresaParaExcluir = id;
    if (modal_excluir) {
        modal_excluir.classList.remove('hidden');
        modal_excluir.classList.add('flex');
    }
}

// Lixeira de um equipamento (página de informações)
function abrirModalExcluirEquipamento(index) {
    indiceEquipamentoParaExcluir = index;
    if (modal_excluir) {
        modal_excluir.classList.remove('hidden');
        modal_excluir.classList.add('flex');
    }
}

function fecharModal() {
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
}

function fecharModalExcluir() {
    indiceEquipamentoParaExcluir = null;
    idEmpresaParaExcluir = null;
    if (modal_excluir) {
        modal_excluir.classList.add('hidden');
        modal_excluir.classList.remove('flex');
    }
}

// Botão "Excluir" do modal de confirmação
document.addEventListener('DOMContentLoaded', () => {
    const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
    if (!btnConfirmarExclusao) return;

    btnConfirmarExclusao.addEventListener('click', async () => {
        // Página de informações: exclusão de equipamento (ainda sem ligação com o back)
        if (indiceEquipamentoParaExcluir !== null) {
            if (empresaAtual && empresaAtual.equipamentos) {
                empresaAtual.equipamentos.splice(indiceEquipamentoParaExcluir, 1);
                desenharEquipamentos(empresaAtual);
            }
            fecharModalExcluir();
            return;
        }

        // Página da lista: exclusão de empresa
        if (idEmpresaParaExcluir !== null) {
            const id = idEmpresaParaExcluir; // número (o back compara com número)
            fecharModalExcluir();

            const resposta = await chamarApi("/empresa/deletar_empresa", "DELETE", { id: id });

            if (!resposta.ok) {
                mostrarErro(resposta, "Não foi possível excluir a empresa.");
                return;
            }

            carregarListaEmpresas();
            return;
        }

        fecharModalExcluir();
    });
});

if (modal) modal.addEventListener('click', e => { if (e.target === modal) fecharModal(); });
if (modal_excluir) modal_excluir.addEventListener('click', e => { if (e.target === modal_excluir) fecharModalExcluir(); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { fecharModal(); fecharModalExcluir(); }
});
