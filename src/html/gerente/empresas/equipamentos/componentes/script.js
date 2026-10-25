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
        equipamentoId: Number(parametros.get("eqId")) || 0,
        dispositivoId: Number(parametros.get("compId")) || 0
    };
}




async function carregarInformacoes() {
    const linkVoltar = document.getElementById("link-voltar");
    const linkEditar = document.getElementById("link-editar");


    const compEqNome = document.getElementById("comp-eq-nome");
    const compNome = document.getElementById("comp-nome");
    const compStatusBadge = document.getElementById("comp-status-badge");

    const compTipo = document.getElementById("comp-tipo");
    const compUnidade = document.getElementById("comp-unidade");
    const compCapacidade = document.getElementById("comp-capacidade");
    const compCritico = document.getElementById("comp-critico");
    const compAlto = document.getElementById("comp-alto");
    const compAtencao = document.getElementById("comp-atencao");

    const { empresaId, equipamentoId, dispositivoId } = pegarIdsDaUrl();
    
    const resposta = await chamarApi("/componentes/listar_componente", "POST", {
        idDispositivo: equipamentoId,
        empresa_id: empresaId,
        componente_id: dispositivoId
    });;
    console.log(resposta.dados, "askljdkljsdakjladskljsad")
    const respostaDispositivo = await chamarApi("/dispositivos/listar_informacoes_dispositivo", "POST", {
        dispositivo_id: equipamentoId,
        id_empresa: empresaId
    })
    console.log(respostaDispositivo.dados, "lkasdkjlasdkljskjlad")
    const tipoComponentes = resposta.dados[1][0];
    const informacoesComponente = resposta.dados[0];
    let nomeComponente = tipoComponentes.nome;
    let unidadeComponente = tipoComponentes.unidade_medida;

    

    compEqNome.textContent = respostaDispositivo.dados[0].numero_serie
    compTipo.textContent = nomeComponente;
    compUnidade.textContent = unidadeComponente;
    compCapacidade.textContent = informacoesComponente[0].capacidade;
    compCritico.textContent = informacoesComponente[0].limiar_atencao;
    compAlto.textContent = informacoesComponente[0].limiar_alto;
    compAtencao.textContent = informacoesComponente[0].limiar_critico;
    compNome.textContent = informacoesComponente[0].nome_identificador;
    compStatusBadge.textContent = informacoesComponente[0].ativo === 1 ? "Ativo" : "Desativado";
}

async function carregarInformacoesParaEditar() {
    const nome = document.getElementById("nome");

    const tipo = document.getElementById("tipo");
    const unidade = document.getElementById("unidade");
    const capacidadeTotal = document.getElementById("Capacidade_total");
    const limiarCritico = document.getElementById("limiar_critico");
    const limiarAlto = document.getElementById("limiar_alto");
    const limiarAtencao = document.getElementById("limiar_atencao");
    const status = document.getElementById("status");

    const { empresaId, equipamentoId, dispositivoId } = pegarIdsDaUrl();

    const resposta = await chamarApi("/componentes/listar_componente", "POST", {
        idDispositivo: equipamentoId,
        empresa_id: empresaId,
        componente_id: dispositivoId
    });;

    const tipoComponentes = resposta.dados[1];
    const informacoesComponente = resposta.dados[0];
    let unidadeComponente;

    tipoComponentes.forEach(element => {

        const opcao = document.createElement("option");

        opcao.value = element.id_tipo;
        opcao.textContent = element.nome;
        opcao.className = "bg-main-blue text-white";

        tipo.appendChild(opcao);
        if (element.id_tipo == informacoesComponente[0].id_componente) {
            unidadeComponente = element.unidade_medida;
        }
    });

    unidade.value = unidadeComponente;
    nome.value = informacoesComponente[0].nome_identificador;

    capacidadeTotal.value = informacoesComponente[0].capacidade;
    limiarCritico.value = informacoesComponente[0].limiar_atencao;
    limiarAlto.value = informacoesComponente[0].limiar_alto;
    limiarAtencao.value = informacoesComponente[0].limiar_critico;
    nome.textCovaluentent = informacoesComponente[0].nome_identificador;

    const valorStatus = informacoesComponente[0].ativo === 1 ? "Ativado" : "Desativado";
    let valores = ["Desativado", "Ativado"]

    for (let i = 0; i < 2; i++) {
        const opcaoStatus = document.createElement("option");

        opcaoStatus.value = i;
        opcaoStatus.textContent = valores[i];
        opcaoStatus.className = "bg-main-blue text-white";
        status.appendChild(opcaoStatus);
    }
    status.value = valorStatus;
    tipo.value = valorStatus;
}

function voltarPagina() {
    const { empresaId, equipamentoId, dispositivoId } = pegarIdsDaUrl();
    window.location.href = `../informacoesEquipamento.html?empresaId=${empresaId}&eqId=${equipamentoId}`;
}

async function editarComponente(){
    const nome = document.getElementById("nome");
    const tipo = document.getElementById("tipo");
    const capacidadeTotal = document.getElementById("Capacidade_total");
    const limiarCritico = document.getElementById("limiar_critico");
    const limiarAlto = document.getElementById("limiar_alto");
    const limiarAtencao = document.getElementById("limiar_atencao");
    const status = document.getElementById("status");
    const { empresaId, equipamentoId, dispositivoId } = pegarIdsDaUrl();
    console.log(typeof tipo.value)
 
    if(!nome.value || !tipo.value || !capacidadeTotal.value || !limiarCritico.value || !limiarAlto.value || !limiarAtencao.value || !status.value){
        alert("Os campos não podem ser branco")
        return;
    }
     const resposta = await chamarApi("/componentes/editar_componente", "POST", {
        idDispositivo: equipamentoId,
        empresa_id: empresaId,
        componente_id: dispositivoId,
        tipo_id:tipo.value,
        nome_identificador:nome.value,
        capacidade:capacidadeTotal.value,
        limiar_atencao:limiarAtencao.value,
        limiar_alto:limiarAlto.value,
        limiar_critico:limiarCritico.value,
        status: status.value
    });;

    if(resposta.ok){
        alert("Componente editado com sucesso")
        voltarPagina();
    }else{
        alert("Deu algum erro na edição")
    }

}



document.addEventListener("DOMContentLoaded", async () => {
    carregarInformacoes();
    carregarInformacoesParaEditar();
});