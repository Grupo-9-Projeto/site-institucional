var SEMANAS_VISIVEIS = 4; 

function media(lista) {
    if (lista.length == 0) return 0;

    var soma = 0;
    for (var i = 0; i < lista.length; i++) {
        soma += lista[i];
    }
    return soma / lista.length;
}

function somarListas(listas, tamanho) {
    var total = new Array(tamanho).fill(0);

    for (var i = 0; i < listas.length; i++) {
        for (var j = 0; j < tamanho; j++) {
            total[j] += listas[i][j];
        }
    }
    return total;
}

function regressaoLinear(valores) {
    var n = valores.length;
    if (n < 3) return { a: 0, b: media(valores) };

    var mediaX = (n - 1) / 2;
    var mediaY = media(valores);
    var somaXY = 0;
    var somaXX = 0;

    for (var i = 0; i < n; i++) {
        somaXY += (i - mediaX) * (valores[i] - mediaY);
        somaXX += (i - mediaX) * (i - mediaX);
    }

    var a = somaXX == 0 ? 0 : somaXY / somaXX;
    var b = mediaY - a * mediaX;
    return { a: a, b: b };
}

function erroDaReta(valores, reta) {
    if (valores.length < 3) return 0;

    var somaQuadrados = 0;
    for (var i = 0; i < valores.length; i++) {
        var diferenca = valores[i] - (reta.a * i + reta.b);
        somaQuadrados += diferenca * diferenca;
    }
    return Math.sqrt(somaQuadrados / (valores.length - 2));
}

function preverSemanas(historico, quantidade) {
    var reta = regressaoLinear(historico);
    var erro = erroDaReta(historico, reta);
    var previsoes = [];

    for (var i = 0; i < quantidade; i++) {
        var valor = Math.max(0, reta.a * (historico.length + i) + reta.b);
        var margem = 2 * erro;
        previsoes.push({
            valor: Math.round(valor),
            minimo: Math.max(0, Math.floor(valor - margem)),
            maximo: Math.ceil(valor + margem)
        });
    }
    return previsoes;
}

function distribuirPorDiaEHorario(calorHistorico, totalPrevisto) {
    var totalHistorico = 0;
    for (var dia = 0; dia < 7; dia++) {
        for (var faixa = 0; faixa < 6; faixa++) {
            totalHistorico += calorHistorico[dia][faixa];
        }
    }

    var pesoTotal = totalHistorico > 0 ? totalHistorico : 42;
    var celulas = [];
    var somaBase = 0;

    for (var d = 0; d < 7; d++) {
        for (var f = 0; f < 6; f++) {
            var peso = totalHistorico > 0 ? calorHistorico[d][f] : 1;
            var exato = totalPrevisto * peso / pesoTotal;
            var base = Math.floor(exato);
            celulas.push({ dia: d, faixa: f, valor: base, resto: exato - base });
            somaBase += base;
        }
    }

    celulas.sort(function (a, b) { return b.resto - a.resto; });
    for (var i = 0; i < totalPrevisto - somaBase; i++) {
        celulas[i].valor += 1;
    }

    var tabela = [];
    for (var linha = 0; linha < 7; linha++) {
        tabela.push([0, 0, 0, 0, 0, 0]);
    }

    var maior = 0;
    var diaMaior = 0;
    var faixaMaior = 0;

    for (var k = 0; k < celulas.length; k++) {
        tabela[celulas[k].dia][celulas[k].faixa] = celulas[k].valor;
        if (celulas[k].valor > maior) {
            maior = celulas[k].valor;
            diaMaior = celulas[k].dia;
            faixaMaior = celulas[k].faixa;
        }
    }

    return { tabela: tabela, total: totalPrevisto, maior: maior, diaMaior: diaMaior, faixaMaior: faixaMaior };
}

function converterPrazoEmHoras(texto) {
    var numero = parseFloat(String(texto || "").replace(",", "."));
    if (isNaN(numero) || numero <= 0) return 8;

    var minusculo = String(texto).toLowerCase();
    if (minusculo.indexOf("min") != -1) return numero / 60;
    if (minusculo.indexOf("dia") != -1) return numero * 24;
    return numero;
}

function somarDispositivos(dadosEtl, macs, campo) {
    var listas = [];
    for (var i = 0; i < macs.length; i++) {
        var dispositivo = dadosEtl.dispositivos[macs[i]];
        if (dispositivo) listas.push(dispositivo[campo]);
    }
    return listas;
}

function somarCalor(dadosEtl, macs) {
    var calor = [];
    for (var dia = 0; dia < 7; dia++) {
        calor.push([0, 0, 0, 0, 0, 0]);
    }

    for (var i = 0; i < macs.length; i++) {
        var dispositivo = dadosEtl.dispositivos[macs[i]];
        if (!dispositivo) continue;

        for (var d = 0; d < 7; d++) {
            for (var f = 0; f < 6; f++) {
                calor[d][f] += dispositivo.calor[d][f];
            }
        }
    }
    return calor;
}

function calcularPrevisoes(dadosEtl, empresasDoGerente, quantidadeAnalistas) {
    var semanas = dadosEtl.semanasHistorico.length;

    var todosOsMacs = [];
    for (var i = 0; i < empresasDoGerente.length; i++) {
        todosOsMacs = todosOsMacs.concat(empresasDoGerente[i].macs);
    }

    var historico = somarListas(somarDispositivos(dadosEtl, todosOsMacs, "chamadosPorSemana"), semanas);

    var previsoesFuturas = preverSemanas(historico, dadosEtl.semanasPrevistas.length + 1).slice(1);
    var previsao = previsoesFuturas[0];

    var concluidos = somarListas(somarDispositivos(dadosEtl, todosOsMacs, "concluidosPorSemana"), semanas);
    var capacidadeTotal = quantidadeAnalistas > 0 ? media(concluidos) : 0;
    var capacidadePorAnalista = quantidadeAnalistas > 0 ? capacidadeTotal / quantidadeAnalistas : 0;
    var alertasPorAnalista = quantidadeAnalistas > 0 ? previsao.valor / quantidadeAnalistas : 0;
    var carga = capacidadeTotal > 0 ? Math.round(previsao.valor / capacidadeTotal * 100) : 0;

    var semanaAnterior = historico[historico.length - 1];
    var variacao = null;
    if (semanaAnterior > 0) {
        variacao = Math.round((previsao.valor - semanaAnterior) / semanaAnterior * 100);
    }

    var semanasGrafico = [];
    for (var s = semanas - SEMANAS_VISIVEIS; s < semanas; s++) {
        semanasGrafico.push({ rotulo: dadosEtl.semanasHistorico[s], tipo: "historico", valor: historico[s] });
    }
    for (var p = 0; p < previsoesFuturas.length; p++) {
        semanasGrafico.push({
            rotulo: dadosEtl.semanasPrevistas[p],
            tipo: "previsao",
            valor: previsoesFuturas[p].valor,
            minimo: previsoesFuturas[p].minimo,
            maximo: previsoesFuturas[p].maximo
        });
    }

    var empresas = [];
    for (var e = 0; e < empresasDoGerente.length; e++) {
        var empresa = empresasDoGerente[e];
        var prazoHoras = converterPrazoEmHoras(empresa.limiteResposta);

        var historicoEmpresa = somarListas(somarDispositivos(dadosEtl, empresa.macs, "chamadosPorSemana"), semanas);
        var estimativa = preverSemanas(historicoEmpresa, 2)[1]; 

        var horas = 0;
        var resolvidos = 0;
        for (var m = 0; m < empresa.macs.length; m++) {
            var dispositivo = dadosEtl.dispositivos[empresa.macs[m]];
            if (!dispositivo) continue;
            horas += dispositivo.resolvidos.horas;
            resolvidos += dispositivo.resolvidos.quantidade;
        }
        var tempoMedio = resolvidos > 0 ? horas / resolvidos : 0;

        empresas.push({
            empresa: empresa.empresa,
            prazoHoras: Math.round(prazoHoras * 100) / 100,
            alertasPrevistos: estimativa.valor,
            minimo: estimativa.minimo,
            maximo: estimativa.maximo,
            tempoMedioHoras: Math.round(tempoMedio * 100) / 100,
            dentroSla: tempoMedio <= prazoHoras
        });
    }
    empresas.sort(function (a, b) { return b.alertasPrevistos - a.alertasPrevistos; });

    return {
        geradoEm: dadosEtl.geradoEm,
        proximaSemana: dadosEtl.proximaSemana,
        previsao: previsao,
        variacao: variacao,
        quantidadeAnalistas: quantidadeAnalistas,
        capacidadePorAnalista: Math.round(capacidadePorAnalista),
        alertasPorAnalista: Math.round(alertasPorAnalista * 10) / 10,
        carga: carga,
        semanasGrafico: semanasGrafico,
        calor: distribuirPorDiaEHorario(somarCalor(dadosEtl, todosOsMacs), previsao.valor),
        empresas: empresas
    };
}
