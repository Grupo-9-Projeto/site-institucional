const DIAS_DA_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const FAIXAS_HORARIO = ["0–4h", "4–8h", "8–12h", "12–16h", "16–20h", "20–24h"];
const MILISSEGUNDOS_SEMANA = 7 * 24 * 60 * 60 * 1000;

function somarDias(data, dias) {
    const nova = new Date(data);
    nova.setDate(nova.getDate() + dias);
    return nova;
}

function inicioDaSemana(data) {
    const dia = data.getDay();
    const diferenca = dia === 0 ? 6 : dia - 1;
    const segunda = somarDias(data, -diferenca);
    segunda.setHours(0, 0, 0, 0);
    return segunda;
}

function media(lista) {
    if (lista.length === 0) return 0;
    let soma = 0;
    for (let i = 0; i < lista.length; i++) soma += lista[i];
    return soma / lista.length;
}

function regressaoLinear(valores) {
    const n = valores.length;
    if (n < 3) return { a: 0, b: media(valores) };

    const mediaX = (n - 1) / 2;
    const mediaY = media(valores);
    let somaXY = 0;
    let somaXX = 0;

    for (let i = 0; i < n; i++) {
        somaXY += (i - mediaX) * (valores[i] - mediaY);
        somaXX += (i - mediaX) * (i - mediaX);
    }

    const a = somaXX === 0 ? 0 : somaXY / somaXX;
    return { a: a, b: mediaY - a * mediaX };
}

function erroDaReta(valores, reta) {
    if (valores.length < 3) return 0;
    let somaQuadrados = 0;
    for (let i = 0; i < valores.length; i++) {
        const diferenca = valores[i] - (reta.a * i + reta.b);
        somaQuadrados += diferenca * diferenca;
    }
    return Math.sqrt(somaQuadrados / (valores.length - 2));
}

function contarChamadosPorSemana(chamados, primeiraSemana, quantidade, empresa) {
    const contagens = Array(quantidade).fill(0);

    for (let i = 0; i < chamados.length; i++) {
        const chamado = chamados[i];
        if (empresa && chamado.empresa !== empresa) continue;

        const aberto = new Date(chamado.aberto_em);
        const semana = Math.floor((aberto - primeiraSemana) / MILISSEGUNDOS_SEMANA);
        if (semana >= 0 && semana < quantidade) contagens[semana]++;
    }
    return contagens;
}

function contarConcluidosPorSemana(chamados, primeiraSemana, quantidade) {
    const contagens = Array(quantidade).fill(0);
    for (let i = 0; i < chamados.length; i++) {
        if (!chamados[i].concluido_em) continue;
        const concluido = new Date(chamados[i].concluido_em);
        const semana = Math.floor((concluido - primeiraSemana) / MILISSEGUNDOS_SEMANA);
        if (semana >= 0 && semana < quantidade) contagens[semana]++;
    }
    return contagens;
}

function preverSemanas(historico, quantidade) {
    const reta = regressaoLinear(historico);
    const erro = erroDaReta(historico, reta);
    const previsoes = [];

    for (let i = 0; i < quantidade; i++) {
        const valor = Math.max(0, reta.a * (historico.length + i) + reta.b);
        const margem = 2 * erro;
        previsoes.push({
            valor: Math.round(valor),
            minimo: Math.max(0, Math.floor(valor - margem)),
            maximo: Math.ceil(valor + margem)
        });
    }
    return previsoes;
}

function calcularCapacidadeEquipe(concluidosPorSemana, quantidadeAnalistas) {
    const mediaSemanal = media(concluidosPorSemana);
    const porAnalista = quantidadeAnalistas > 0 ? mediaSemanal / quantidadeAnalistas : 0;
    return {
        porAnalista: porAnalista,
        total: porAnalista * quantidadeAnalistas
    };
}

function distribuirPrevisaoPorDiaEHorario(chamados, inicio, fim, totalPrevisto) {
    const matrizHistorica = Array.from({ length: 7 }, () => Array(6).fill(0));
    let totalHistorico = 0;

    for (let i = 0; i < chamados.length; i++) {
        const aberto = new Date(chamados[i].aberto_em);
        if (aberto < inicio || aberto >= fim) continue;
        let dia = aberto.getDay() - 1;
        if (dia < 0) dia = 6;
        const faixa = Math.min(5, Math.floor(aberto.getHours() / 4));
        matrizHistorica[dia][faixa]++;
        totalHistorico++;
    }

    const pesoTotal = totalHistorico || 42;
    const celulas = [];
    let somaArredondada = 0;

    for (let dia = 0; dia < 7; dia++) {
        for (let faixa = 0; faixa < 6; faixa++) {
            const peso = totalHistorico ? matrizHistorica[dia][faixa] : 1;
            const exato = totalPrevisto * peso / pesoTotal;
            const base = Math.floor(exato);
            celulas.push({ dia, faixa, valor: base, resto: exato - base });
            somaArredondada += base;
        }
    }

    celulas.sort((a, b) => b.resto - a.resto);
    for (let i = 0; i < totalPrevisto - somaArredondada; i++) celulas[i].valor++;

    const tabela = Array.from({ length: 7 }, () => Array(6).fill(0));
    let maior = 0;
    let diaMaior = 0;
    let faixaMaior = 0;
    for (let i = 0; i < celulas.length; i++) {
        const celula = celulas[i];
        tabela[celula.dia][celula.faixa] = celula.valor;
        if (celula.valor > maior) {
            maior = celula.valor;
            diaMaior = celula.dia;
            faixaMaior = celula.faixa;
        }
    }

    return { tabela, total: totalPrevisto, maior, diaMaior, faixaMaior, totalHistorico };
}

function calcularTempoMedioResolucao(chamados, inicio, fim, empresa) {
    const duracoes = [];
    for (let i = 0; i < chamados.length; i++) {
        const chamado = chamados[i];
        if (empresa && chamado.empresa !== empresa) continue;
        if (!chamado.concluido_em) continue;

        const aberto = new Date(chamado.aberto_em);
        const concluido = new Date(chamado.concluido_em);
        if (aberto < inicio || aberto >= fim || concluido < aberto) continue;
        duracoes.push((concluido - aberto) / 3600000);
    }
    return media(duracoes);
}

function calcularPrevisoes(dados, agora) {
    const quantidadeSemanasModelo = 8;
    const quantidadeSemanasVisiveis = 4;
    const quantidadeSemanasPrevistas = 3;
    const semanaAtual = inicioDaSemana(agora);
    const inicioHistorico = somarDias(semanaAtual, -7 * quantidadeSemanasModelo);
    const fimHistorico = semanaAtual;
    const proximaSemana = somarDias(semanaAtual, 7);
    const fimProximaSemana = somarDias(proximaSemana, 7);

    const historicoCompleto = contarChamadosPorSemana(
        dados.chamados, inicioHistorico, quantidadeSemanasModelo
    );
    const previsoesFuturas = preverSemanas(historicoCompleto, quantidadeSemanasPrevistas + 1).slice(1);
    const previsao = previsoesFuturas[0];

    const concluidos = contarConcluidosPorSemana(dados.chamados, inicioHistorico, quantidadeSemanasModelo);
    const quantidadeAnalistas = dados.equipe ? dados.equipe.quantidadeAnalistas : 0;
    const capacidade = calcularCapacidadeEquipe(concluidos, quantidadeAnalistas);
    const alertasPorAnalista = quantidadeAnalistas > 0 ? previsao.valor / quantidadeAnalistas : 0;
    const carga = capacidade.total > 0 ? Math.round((previsao.valor / capacidade.total) * 100) : 0;

    const semanaAnterior = historicoCompleto[historicoCompleto.length - 1];
    const variacao = semanaAnterior > 0
        ? Math.round(((previsao.valor - semanaAnterior) / semanaAnterior) * 100)
        : null;

    const semanasGrafico = [];
    const inicioVisivel = quantidadeSemanasModelo - quantidadeSemanasVisiveis;
    for (let i = inicioVisivel; i < quantidadeSemanasModelo; i++) {
        semanasGrafico.push({
            inicio: somarDias(inicioHistorico, 7 * i),
            tipo: "historico",
            valor: historicoCompleto[i]
        });
    }
    for (let i = 0; i < previsoesFuturas.length; i++) {
        semanasGrafico.push({
            inicio: somarDias(proximaSemana, 7 * i),
            tipo: "previsao",
            ...previsoesFuturas[i]
        });
    }

    const empresas = [];
    for (let i = 0; i < dados.contratos.length; i++) {
        const contrato = dados.contratos[i];
        const historicoEmpresa = contarChamadosPorSemana(
            dados.chamados, inicioHistorico, quantidadeSemanasModelo, contrato.empresa
        );
        const estimativa = preverSemanas(historicoEmpresa, 2)[1]; 
        const tempoMedioHoras = calcularTempoMedioResolucao(
            dados.chamados, inicioHistorico, fimHistorico, contrato.empresa
        );
        empresas.push({
            empresa: contrato.empresa,
            prazoHoras: contrato.prazoResolucaoHoras,
            alertasPrevistos: estimativa.valor,
            minimo: estimativa.minimo,
            maximo: estimativa.maximo,
            tempoMedioHoras: tempoMedioHoras,
            esforcoHoras: estimativa.valor * tempoMedioHoras,
            dentroSla: tempoMedioHoras <= contrato.prazoResolucaoHoras
        });
    }

    empresas.sort((a, b) => b.esforcoHoras - a.esforcoHoras);

    return {
        agora,
        inicioHistorico,
        semanaAtual,
        proximaSemana,
        fimProximaSemana,
        historico: historicoCompleto.slice(inicioVisivel),
        previsao,
        previsoesFuturas,
        semanasGrafico,
        semanaAnterior,
        variacao,
        quantidadeAnalistas,
        capacidade,
        alertasPorAnalista,
        carga,
        empresaMaiorEsforco: empresas.length > 0 ? empresas[0] : null,
        empresas,
        calor: distribuirPrevisaoPorDiaEHorario(
            dados.chamados, inicioHistorico, fimHistorico, previsao.valor
        )
    };
}
