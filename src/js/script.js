
const empresaId = sessionStorage.getItem("EMPRESA_ID")
const gestorId = sessionStorage.getItem("GESTOR_ID");

function exibirMensagemAuth(mensagem) {
    const elErro = document.getElementById("mensagem_erro") || document.getElementById("div_erros_login");
    if (elErro) {
        elErro.textContent = mensagem;
        elErro.classList.remove("hidden");
        return;
    }
    alert(mensagem);
}

function registerUser() {
    let name = document.getElementById("input_nome").value;
    let email = document.getElementById("input_email").value;
    let passwordHash = document.getElementById("input_senha").value;
    let confirmPassword = document.getElementById("input_confirm_senha").value;
    let token = document.getElementById("input_token").value;

    const verifyFieldParam = { name, email, passwordHash, token };

    try {
        verifyFields(verifyFieldParam);
    } catch (error) {
        exibirMensagemAuth(error);
        return false;
    }

    if (passwordHash !== confirmPassword) {
        exibirMensagemAuth("As senhas inseridas não coincidem.");
        return false;
    }

    fetch(`${API_URL}/usuarios/cadastrar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nameServer: name,
            emailServer: email,
            passwordHashServer: passwordHash,
            tokenServer: token
        })
    }).then(async response => {
        const dados = await response.json().catch(() => null);
        if (response.ok) {
            alert("Cadastro realizado com sucesso! Você pode fazer o login.");
            setTimeout(() => {
                window.location = "login.html";
            }, 2000);
        } else {
            const msgServidor = typeof dados === "string" ? dados : dados?.res;
            exibirMensagemAuth(msgServidor || "Houve um erro ao tentar realizar o cadastro. Verifique se o token é válido.");
        }
    }).catch(error => {
        console.error("Erro na requisição: ", error);
        exibirMensagemAuth("Não foi possível conectar ao servidor.");
    });

    return false;
}


function authUser() {
    let email = document.getElementById("input_email").value;
    let passwordHash = document.getElementById("input_senha").value;

    if (!email || email.trim().length === 0 || !passwordHash || passwordHash.trim().length === 0) {
        exibirMensagemAuth("Preencha o e-mail e a senha.");
        return false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.trim())) {
        exibirMensagemAuth("O e-mail inserido é inválido.");
        return false;
    }

    fetch(`${API_URL}/usuarios/autenticar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            emailServer: email,
            passwordHashServer: passwordHash
        })
    }).then(async response => {
        const dados = await response.json().catch(() => null);

        if (!response.ok) {
            let mensagem;
            if (typeof dados === "string") {
                mensagem = dados;
            } else if (dados && dados.res) {
                mensagem = dados.res;
            }
            exibirMensagemAuth(mensagem || "Não foi possível fazer login. Verifique e-mail e senha.");
            return;
        }

        salvarToken(dados.token);
        const infoToken = lerToken();
        window.location = paginaIniciadlDoCargo(infoToken && infoToken.role);
    }).catch(function (erro) {
        console.error(erro);
        exibirMensagemAuth("Não foi possível conectar ao servidor. Verifique se o back-end está rodando.");
    });

    return false;
}


function verifyFields(fieldsObj) {
    for (const [fieldName, fieldValue] of Object.entries(fieldsObj)) {

        if (!fieldValue || String(fieldValue).trim().length === 0) {
            throw `O campo [${fieldName}] não pode estar vazio.`
        }

        const valueStr = String(fieldValue).trim()

        if (fieldName === "email") {
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!regexEmail.test(valueStr)) throw "O email inserido é inválido"
        }

        if (fieldName === "passwordHash") {
            const regexPassword = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).{8,}$/
            if (!regexPassword.test(valueStr)) {
                throw "A senha deve ter pelo menos 8 caracteres, 1 letra maiúscula, 1 número e 1 caractere especial."
            }
        }
    }

    return true
}

function toggleMenu() {
  var menu = document.getElementById('mobileMenu');
  var iconOpen = document.getElementById('iconOpen');
  var iconClose = document.getElementById('iconClose');

  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    iconOpen.classList.add('hidden');
    iconClose.classList.remove('hidden');
  } else {
    menu.classList.add('hidden');
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
  }
}

window.onscroll = function() {
  var total_height = document.body.scrollHeight - window.innerHeight;
  var progress = (window.scrollY / total_height) * 100;
  document.getElementById("scrollBar").style.width = progress + "%";
};

function toggleFaq(pergunta, marcador){
        pergunta.classList.toggle("hidden")
        pergunta.classList.toggle("block")

        if (marcador.innerHTML == "+"){
            marcador.innerHTML = '-'
        } else {
            marcador.innerHTML = '+'
        }
}

function criarUsuario(botaoParam) {
    let email = document.getElementById("input_email").value;
    const botao = botaoParam || document.querySelector('button[onclick*="criarUsuario"]');

    const verifyFieldParam = { email };
    try {
        verifyFields(verifyFieldParam);
    } catch (error) {
        alert(error);
        return false;
    }

    alternarCarregamentoBotao(botao, true, "Enviando token...");

    fetch(`${API_URL}/usuarios/cadastrar_gerente`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${obterToken()}`
        },
        body: JSON.stringify({ email: email })
    }).then(async response => {
        const dados = await response.json().catch(() => null);

        if (response.ok) {
            alert(dados?.res || "Criação de usuário realizada com sucesso! Um email já foi enviado com o token de acesso.");
            document.getElementById("input_email").value = "";
            if (typeof ficha !== "undefined" && ficha.close) ficha.close();
        } else {
            const msg = typeof dados === "string" ? dados : dados?.res;
            alert(msg || "Houve um erro ao tentar realizar a criação de usuário.");
        }
        
    }).catch(error => {
        console.error("Erro na requisição: ", error);
        alert("Não foi possível conectar ao servidor.");
    }).finally(() => {
        alternarCarregamentoBotao(botao, false);
    });

    return false;
}

function alternarCarregamentoBotao(botao, carregando, textoCarregando = "Criando...") {
    if (!botao) return;

    if (carregando) {
        if (!botao.dataset.textoOriginal) {
            botao.dataset.textoOriginal = botao.innerHTML;
        }
        botao.disabled = true;
        botao.classList.add("opacity-60", "cursor-not-allowed", "pointer-events-none");
        botao.innerHTML = `
            <span class="inline-flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>${textoCarregando}</span>
            </span>
        `;
    } else {
        botao.disabled = false;
        botao.classList.remove("opacity-60", "cursor-not-allowed", "pointer-events-none");
        if (botao.dataset.textoOriginal) {
            botao.innerHTML = botao.dataset.textoOriginal;
        }
    }
}