
document.addEventListener("DOMContentLoaded", () => {
    // Verifica se o usuário está autenticado como gerente.
    if (typeof exigirGerente === "function" && !exigirGerente()) {
        return;
    }

    const parametros = new URLSearchParams(window.location.search);
    const empresaId = Number(parametros.get("empresaId"));

    const formulario = document.getElementById("form-novo-equipamento");
    const categoriaHtml = document.getElementById("categoria");
    const linkVoltar = document.getElementById("link-voltar");
    const linkCancelar = document.getElementById("link-cancelar");

    // O cadastro precisa estar associado a uma empresa válida.
    if (!empresaId || !Number.isInteger(empresaId) || empresaId <= 0) {
        alert("Não foi possível identificar a empresa.");
        window.location.href = "../index.html";
        return;
    }

    // Mantém os links associados à empresa de origem.
    const urlEmpresa = `../informacoesEmpresa.html?id=${empresaId}`;

    if (linkVoltar) {
        linkVoltar.href = urlEmpresa;
    }

    if (linkCancelar) {
        linkCancelar.href = urlEmpresa;
    }

    // Carrega as categorias cadastradas no banco.
    async function carregarCategorias() {
        try {
            const resposta = await apiFetch(
                "/dispositivos/listar_categorias",
                { method: "GET" }
            );

            if (!resposta.ok) {
                alert("Não foi possível carregar as categorias.");
                console.error(resposta.dados);
                return;
            }

            // O endpoint retorna as categorias na primeira posição.
            const dados = resposta.dados;
            const categorias = Array.isArray(dados)
                ? dados[0]
                : dados?.res?.[0];

            if (!Array.isArray(categorias)) {
                console.error("Formato inesperado das categorias:", dados);
                alert("O servidor retornou as categorias em um formato inesperado.");
                return;
            }

            categoriaHtml.innerHTML = `
                <option value="" disabled selected>
                    Selecione uma categoria
                </option>
            `;

            categorias.forEach(categoria => {
                const opcao = document.createElement("option");

                // O back-end precisa receber o ID numérico da categoria.
                opcao.value = categoria.id_categoria;
                opcao.textContent = categoria.nome;

                categoriaHtml.appendChild(opcao);
            });

        } catch (erro) {
            console.error("Erro ao carregar categorias:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    }

    // Cadastra o equipamento na empresa identificada pela URL.
    async function criarNovoEquipamento(evento) {
        evento.preventDefault();

        const nomeHtml = document.getElementById("nome");
        const modeloHtml = document.getElementById("modelo");
        const ipHtml = document.getElementById("ip");
        const macHtml = document.getElementById("mac");
        const serieHtml = document.getElementById("serie");

        const nomeModelo = modeloHtml.value.trim();
        const categoriaId = Number(categoriaHtml.value);
        const ip = ipHtml.value.trim();
        const enderecoMac = macHtml.value.trim();
        const numeroSerie = serieHtml.value.trim();

        if (
            !nomeHtml.value.trim() ||
            !nomeModelo ||
            !categoriaId ||
            !ip ||
            !enderecoMac ||
            !numeroSerie
        ) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        // Evita dois cadastros simultâneos pelo mesmo clique.
        const botaoSalvar = formulario.querySelector(
            'button[type="submit"]'
        );

        if (botaoSalvar.disabled) return;

        botaoSalvar.disabled = true;
        botaoSalvar.textContent = "Salvando...";

        try {
            const resposta = await apiFetch("/dispositivos/criar_dispositivo", {
                method: "POST",
                body: JSON.stringify({
                    nomeModelo: nomeModelo,
                    categoria_id: categoriaId,
                    empresa_id: empresaId,
                    ip: ip,
                    endereco_mac: enderecoMac,
                    numero_serie: numeroSerie
                })
            });

            if (!resposta.ok) {
                console.error("Erro no cadastro:", resposta.status, resposta.dados);

                const mensagem =
                    typeof resposta.dados === "string"
                        ? resposta.dados
                        : resposta.dados?.res ||
                          resposta.dados?.Resposta ||
                          "Não foi possível cadastrar o equipamento.";

                alert(mensagem);
                return;
            }

            alert("Equipamento cadastrado com sucesso!");

            // Retorna à empresa em que o equipamento foi criado.
            window.location.href = urlEmpresa;

        } catch (erro) {
            console.error("Erro ao cadastrar equipamento:", erro);
            alert("Não foi possível conectar ao servidor.");
        } finally {
            botaoSalvar.disabled = false;
            botaoSalvar.textContent = "Salvar";
        }
    }

    formulario.addEventListener("submit", criarNovoEquipamento);

    carregarCategorias();
});
