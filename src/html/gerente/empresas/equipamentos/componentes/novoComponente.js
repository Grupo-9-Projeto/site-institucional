async function chamarApi(caminho, metodo, corpo) {
    try {
        return await apiFetch(caminho, {
            method: metodo,
            body: corpo ? JSON.stringify(corpo) : undefined
        });
    } catch (erro) {
        console.error("Erro na API:", erro);

        return {
            ok: false,
            status: erro?.sessaoExpirada ? 401 : 0,
            dados: null
        };
    }
}
async function carregarInformacoesUsuario() {
    const nome = document.getElementById("nome_title");
    const foto = document.getElementById("foto_usuario");

    const resposta = await chamarApi(
        "/usuarios/informacoes_usuario",
        "GET"
    );

    if (!resposta.ok || !resposta.dados?.[0]) return;

    const usuario = resposta.dados[0];

    if (nome) nome.textContent = usuario.nome;
    if (foto) foto.textContent = usuario.nome?.[0] || "";
}

// ============================================================
// IDENTIFICADORES DA URL
// ============================================================

function pegarIdsDaUrl() {
    const parametros = new URLSearchParams(window.location.search);

    return {
        empresaId: Number(parametros.get("empresaId")) || 0,
        equipamentoId: Number(parametros.get("eqId")) || 0
    };
}

// MENSAGENS DE ERRO
function obterMensagemErro(resposta) {
    if (resposta.status === 0) {
        return "Não foi possível conectar ao servidor.";
    }

    if (typeof resposta.dados === "string") {
        return resposta.dados;
    }

    return resposta.dados?.res ||
        resposta.dados?.mensagem ||
        resposta.dados?.Resposta ||
        "Não foi possível cadastrar o componente.";
}


// CADASTRAR COMPONENTE
async function criarComponente() {

    const botao = document.querySelector(
        'button[onclick="criarComponente()"]'
    );

    if (botao?.disabled) return;

    const nome = document.getElementById("nome");
    const unidade = document.getElementById("unidade");
    const capacidade = document.getElementById("Capacidade_total");

    const limiarCritico = document.getElementById("limiar_critico");
    const limiarAlto = document.getElementById("limiar_alto");
    const limiarAtencao = document.getElementById("limiar_atencao");

    // Recupera todos os tipos selecionados
    const tiposSelecionados = Array.from(
        document.querySelectorAll(
            'input[type="checkbox"]:checked'
        )
    ).map(input => input.value);

    const { empresaId, equipamentoId } = pegarIdsDaUrl();

    // VALIDAÇÕES
    if (!empresaId || !equipamentoId) {
        alert("Não foi possível identificar a empresa ou o equipamento.");
        return;
    }

    if (!nome.value.trim()) {
        alert("Informe o nome identificador.");
        nome.focus();
        return;
    }

    if (nome.value.trim().length < 3) {
        alert("O nome deve possuir pelo menos 3 caracteres.");
        nome.focus();
        return;
    }

    if (tiposSelecionados.length === 0) {
        alert("Selecione pelo menos um tipo de componente.");
        return;
    }

    if (!unidade.value.trim()) {
        alert("Informe a unidade de medida.");
        unidade.focus();
        return;
    }

    const capacidadeValor = Number(capacidade.value);
    const criticoValor = Number(limiarCritico.value);
    const altoValor = Number(limiarAlto.value);
    const atencaoValor = Number(limiarAtencao.value);

    if (!Number.isFinite(capacidadeValor) || capacidadeValor <= 0) {
        alert("Informe uma capacidade válida.");
        capacidade.focus();
        return;
    }

    if (
        !Number.isFinite(criticoValor) || criticoValor < 0 ||
        !Number.isFinite(altoValor) || altoValor < 0 ||
        !Number.isFinite(atencaoValor) || atencaoValor < 0
    ) {
        alert("Informe valores válidos para os limiares.");
        return;
    }

    // ENVIO PARA O BACKEND
    if (botao) {
        botao.disabled = true;
        botao.textContent = "Salvando...";
    }

    let cadastrados = 0;
    let erros = [];

    try {

        // Cada tipo selecionado gera um cadastro individual
        for (const tipo of tiposSelecionados) {

            const dadosComponente = {
                idDispositivo: equipamentoId,
                empresa_id: empresaId,
                nome_tipo: tipo,
                unidade_medida: unidade.value.trim(),
                nome_identificador: nome.value.trim(),
                capacidade: capacidadeValor,
                limiar_atencao: atencaoValor,
                limiar_alto: altoValor,
                limiar_critico: criticoValor
            };

            console.log("Enviando componente:", dadosComponente);

            const resposta = await chamarApi(
                "/componentes/criar_componente",
                "POST",
                dadosComponente
            );

            if (resposta.ok) {
                cadastrados++;
            } else {
                erros.push({
                    tipo: tipo,
                    mensagem: obterMensagemErro(resposta)
                });
            }
        }

        // RESULTADO
        if (erros.length === 0) {
            alert(`${cadastrados} componente(s) cadastrado(s) com sucesso!`);
            voltarPagina();
            return;
        }

        if (cadastrados > 0) {
            alert(
                `${cadastrados} componente(s) foram cadastrados.\n\n` +
                erros.map(e => `${e.tipo}: ${e.mensagem}`).join("\n")
            );

            voltarPagina();
            return;
        }

        alert(
            "Não foi possível cadastrar os componentes:\n\n" +
            erros.map(e => `${e.tipo}: ${e.mensagem}`).join("\n")
        );

    } catch (erro) {
        console.error("Erro no cadastro:", erro);
        alert("Ocorreu um erro inesperado ao cadastrar os componentes.");

    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent = "Salvar";
        }
    }
}

// VOLTAR PARA O EQUIPAMENTO
function voltarPagina() {
    const { empresaId, equipamentoId } = pegarIdsDaUrl();

    window.location.href =
        `../informacoesEquipamento.html?empresaId=${empresaId}&eqId=${equipamentoId}`;
}


document.addEventListener("DOMContentLoaded", () => {
    carregarInformacoesUsuario();
});
