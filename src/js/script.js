
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

function criarUsuario() {
    
    let email = document.getElementById("input_email").value;
    // let token = document.getElementById("input_token").value;

    const verifyFieldParam = { email };

    try {
        verifyFields(verifyFieldParam)    
        console.log("Todos os campos estão válidos!");
    } catch (error) {
        console.error("Erro de validação:", error);
        return;
    }

    fetch("http://localhost:8080/usuarios/cadastrar_gerente", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${obterToken()}`
        },
        body: JSON.stringify({
            email: email,
        })
    }).then(response => {
        if (response.ok) {
            alert("Criação de usuário realizado com sucesso! Um email já foi enviado com o token de acesso.");

        } else {
            alert("Houve um erro ao tentar realizar a criação de usuário. Verifique se o token é válido.");
        }
    }).catch(error => {
        console.error("Erro na requisição: ", error);
    }); 
}