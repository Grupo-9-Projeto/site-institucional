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
});

const CHAVE_PERFIL = "argos-gerente-perfil";
const CHAVE_NOTIFICACOES = "argos-gerente-notificacoes";
const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;

let perfil = { nome: "Vivian Silva", foto: "" };
let notificacoes = { alertasCriticos: true, violacoesSla: true, resumoDiario: false };



function porId(id) {
    return document.getElementById(id);
}

function ler(chave, padrao) {
    try {
        return { ...padrao, ...JSON.parse(localStorage.getItem(chave)) };
    } catch (erro) {
        return padrao;
    }
}

function salvar(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch (erro) {
        console.warn("Não foi possível salvar no navegador:", erro);
    }
}

function mostrarMensagem(id, texto) {
    const elemento = porId(id);
    elemento.textContent = texto;
    elemento.classList.toggle("hidden", !texto);
}



function renderizarPerfil() {
    porId("nome-card").textContent = perfil.nome;
    porId("input-nome").value = perfil.nome;
    porId("nome-sidebar").textContent = perfil.nome.split(" ")[0];

   
    document.querySelectorAll("[data-avatar-foto]").forEach(imagem => {
        if (perfil.foto) imagem.src = perfil.foto;
        imagem.classList.toggle("hidden", !perfil.foto);
    });
    document.querySelectorAll("[data-avatar-letra]").forEach(letra => {
        letra.classList.toggle("hidden", Boolean(perfil.foto));
    });
}

function abrirModalNome() {
    porId("novo-nome").value = perfil.nome;
    mostrarMensagem("erro-nome", "");
    porId("modal-nome").showModal();
    porId("novo-nome").focus();
}

function salvarNome(evento) {
    evento.preventDefault();
    const nome = porId("novo-nome").value.trim();

    if (nome === "") {
        mostrarMensagem("erro-nome", "O nome não pode ficar vazio.");
        return;
    }

    perfil.nome = nome;
    salvar(CHAVE_PERFIL, perfil);
    renderizarPerfil();
    porId("modal-nome").close();
}


function reduzirImagem(arquivo, callback) {
    const leitor = new FileReader();

    leitor.onload = () => {
        const imagem = new Image();

        imagem.onload = () => {
            const lado = Math.min(imagem.width, imagem.height);
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 256;
            canvas.getContext("2d").drawImage(
                imagem,
                (imagem.width - lado) / 2, (imagem.height - lado) / 2, lado, lado,
                0, 0, 256, 256
            );
            callback(canvas.toDataURL("image/jpeg", 0.85));
        };

        imagem.onerror = () => mostrarMensagem("erro-foto", "Não foi possível ler essa imagem.");
        imagem.src = leitor.result;
    };

    leitor.readAsDataURL(arquivo);
}

function escolherFoto() {
    const campo = porId("arquivo-foto");
    const arquivo = campo.files[0];

    if (!arquivo) return; 

    if (!arquivo.type.startsWith("image/")) {
        mostrarMensagem("erro-foto", "Escolha um arquivo de imagem.");
    } else if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
        mostrarMensagem("erro-foto", "A imagem deve ter no máximo 5 MB.");
    } else {
        mostrarMensagem("erro-foto", "");
        reduzirImagem(arquivo, foto => {
            perfil.foto = foto;
            salvar(CHAVE_PERFIL, perfil);
            renderizarPerfil();
        });
    }

    campo.value = ""; 
}


function abrirModalSenha() {
    porId("form-senha").reset();
    mostrarMensagem("erro-senha", "");
    mostrarMensagem("aviso-senha", "");
    alternarVisibilidadeSenhas();
    porId("modal-senha").showModal();
    porId("senha-atual").focus();
}

function alternarVisibilidadeSenhas() {
    const tipo = porId("mostrar-senhas").checked ? "text" : "password";
    ["senha-atual", "senha-nova", "senha-confirmacao"].forEach(id => porId(id).type = tipo);
}

function alterarSenha(evento) {
    evento.preventDefault();
    const atual = porId("senha-atual").value;
    const nova = porId("senha-nova").value;
    const confirmacao = porId("senha-confirmacao").value;

    mostrarMensagem("aviso-senha", "");

    if (!atual || !nova || !confirmacao) {
        mostrarMensagem("erro-senha", "Preencha todos os campos.");
    } else if (nova.length < 8) {
        mostrarMensagem("erro-senha", "A nova senha deve ter pelo menos 8 caracteres.");
    } else if (nova !== confirmacao) {
        mostrarMensagem("erro-senha", "A confirmação não é igual à nova senha.");
    } else if (nova === atual) {
        mostrarMensagem("erro-senha", "A nova senha deve ser diferente da atual.");
    } else {
        
        mostrarMensagem("erro-senha", "");
        mostrarMensagem("aviso-senha", "Campos validados, mas a senha NÃO foi alterada: a troca real exige integração com o backend.");
        porId("form-senha").reset();
        alternarVisibilidadeSenhas();
    }
}


function renderizarNotificacoes() {
    document.querySelectorAll("[data-notificacao]").forEach(botao => {
        botao.setAttribute("aria-checked", notificacoes[botao.dataset.notificacao]);
    });
}

function alternarNotificacao(botao) {
    const chave = botao.dataset.notificacao;
    notificacoes[chave] = !notificacoes[chave];
    salvar(CHAVE_NOTIFICACOES, notificacoes); // só preferência local: nenhum e-mail é enviado ou bloqueado
    renderizarNotificacoes();
}


function abrirModalDesativar() {
    mostrarMensagem("aviso-desativar", "");
    porId("modal-desativar").showModal();
}

function confirmarDesativacao() {
    mostrarMensagem("aviso-desativar", "A conta NÃO foi desativada: essa ação exige integração com o backend.");
}


function configurarEventos() {
    porId("botao-foto").addEventListener("click", () => porId("arquivo-foto").click());
    porId("icone-editar-foto").addEventListener("click", () => porId("arquivo-foto").click());
    porId("arquivo-foto").addEventListener("change", escolherFoto);

    porId("botao-alterar-nome").addEventListener("click", abrirModalNome);
    porId("form-nome").addEventListener("submit", salvarNome);

    porId("botao-alterar-senha").addEventListener("click", abrirModalSenha);
    porId("form-senha").addEventListener("submit", alterarSenha);
    porId("mostrar-senhas").addEventListener("change", alternarVisibilidadeSenhas);

    porId("botao-desativar").addEventListener("click", abrirModalDesativar);
    porId("confirmar-desativar").addEventListener("click", confirmarDesativacao);

    document.querySelectorAll("[data-notificacao]").forEach(botao => {
        botao.addEventListener("click", () => alternarNotificacao(botao));
    });


    document.querySelectorAll("[data-fechar]").forEach(botao => {
        botao.addEventListener("click", () => botao.closest("dialog").close());
    });
}

function iniciar() {
    perfil = ler(CHAVE_PERFIL, perfil);
    notificacoes = ler(CHAVE_NOTIFICACOES, notificacoes);

    renderizarPerfil();
    renderizarNotificacoes();
    configurarEventos();
}

iniciar();