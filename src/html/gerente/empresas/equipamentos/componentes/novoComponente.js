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
        console.log(erro, "erro")

        return { ok: false, status: 0, dados: null };
    }
}

function pegarIdsDaUrl() {
    const parametros = new URLSearchParams(window.location.search);

    return {
        empresaId: Number(parametros.get("empresaId")) || 0,
        equipamentoId: Number(parametros.get("eqId")) || 0,
        dispositivoId: Number(parametros.get("compId")) || 0
    };
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


async function criarComponente() {
    // Campos do componente
    const nome = document.getElementById("nome");
    const tipo = document.getElementById("tipo");
    const unidade = document.getElementById("unidade");
    const capacidadeTotal = document.getElementById("Capacidade_total");

    const nomeValor = nome.value.trim();
    const tipoValor = tipo.value;
    const unidadeValor = unidade.value.trim();
    const capacidadeValor = Number(capacidadeTotal.value);

    // Limiares
    const limiarCritico = document.getElementById("limiar_critico");
    const limiarAlto = document.getElementById("limiar_alto");
    const limiarAtencao = document.getElementById("limiar_atencao");

    const limiarCriticoValor = Number(limiarCritico.value);
    const limiarAltoValor = Number(limiarAlto.value);
    const limiarAtencaoValor = Number(limiarAtencao.value);

    // Status
    const {empresaId, equipamentoId} = pegarIdsDaUrl();
   

    // Validação do nome identificador
    if (nomeValor === "") {
        alert("Preencha o nome identificador. Exemplo: CPU Principal.");
        nome.focus();
        return;
    }

    if (nomeValor.length < 3 || nomeValor.length > 100) {
        alert("O nome identificador deve ter entre 3 e 100 caracteres. Exemplo: CPU Principal.");
        nome.focus();
        return;
    }


    // Validação da capacidade total
    if (
        capacidadeTotal.value.trim() === "" ||
        !Number.isFinite(capacidadeValor) ||
        capacidadeValor <= 0
    ) {
        alert("Informe uma capacidade numérica maior que zero. Exemplo: 100.");
        capacidadeTotal.focus();
        return;
    }

    // Validação do limiar crítico
    if (
        limiarCritico.value.trim() === "" ||
        !Number.isFinite(limiarCriticoValor) ||
        limiarCriticoValor < 0
    ) {
        alert("Informe um limiar crítico numérico maior ou igual a zero. Exemplo: 95.");
        limiarCritico.focus();
        return;
    }

    // Validação do limiar alto
    if (
        limiarAlto.value.trim() === "" ||
        !Number.isFinite(limiarAltoValor) ||
        limiarAltoValor < 0
    ) {
        alert("Informe um limiar alto numérico maior ou igual a zero. Exemplo: 85.");
        limiarAlto.focus();
        return;
    }

    // Validação do limiar de atenção
    if (
        limiarAtencao.value.trim() === "" ||
        !Number.isFinite(limiarAtencaoValor) ||
        limiarAtencaoValor < 0
    ) {
        alert("Informe um limiar de atenção numérico maior ou igual a zero. Exemplo: 70.");
        limiarAtencao.focus();
        return;
    } 

   console.log(tipoValor, unidadeValor)
    const resposta = await chamarApi("/componentes/criar_componente", "POST", {
        idDispositivo: equipamentoId,
        empresa_id: empresaId,
        nome_tipo: tipoValor,
        unidade_medida: unidadeValor,
        nome_identificador: nomeValor,
        capacidade: capacidadeValor,
        limiar_atencao: limiarAtencaoValor,
        limiar_alto: limiarAltoValor,
        limiar_critico: limiarCriticoValor
    })

    if(resposta.ok){
        alert("Componente criado com sucesso")
        voltarPagina()
    }else{
        alert("Deu algum erro ao criar o componente")
    }

}


function voltarPagina() {
    const { empresaId, equipamentoId } = pegarIdsDaUrl();
    window.location.href = `../informacoesEquipamento.html?empresaId=${empresaId}&eqId=${equipamentoId}`;
}