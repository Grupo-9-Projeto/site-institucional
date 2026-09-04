
const empresaId = sessionStorage.getItem("EMPRESA_ID")

function registerUser() {
    let name = document.getElementById("input_nome").value;
    let email = document.getElementById("input_email").value;
    let passwordHash = document.getElementById("input_senha").value;
    let confirmPassword = document.getElementById("input_confirm_senha").value;
    let token = document.getElementById("input_token").value;

    const verifyFieldParam = { name, email, passwordHash, token };

    try {
        verifyFields(verifyFieldParam)    
        console.log("Todos os campos estão válidos!");
    } catch (error) {
        console.error("Erro de validação:", error);
        return;
    }

    if (passwordHash !== confirmPassword) {
        console.error("Senhas diferentes!");
        return;
    }

    fetch("http://localhost:8080/usuarios/cadastrar", {
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
    }).then(response => {
        if (response.ok) {
            alert("Cadastro realizado com sucesso! Você já pode fazer o login.");
            setTimeout(() => {
                window.location = "login.html";
            }, 2000);
        } else {
            alert("Houve um erro ao tentar realizar o cadastro. Verifique se o token é válido.");
        }
    }).catch(error => {
        console.error("Erro na requisição: ", error);
    });
}


function authUser() {
    let email = document.getElementById("input_email").value;
    let passwordHash = document.getElementById("input_senha").value;

    const verifyFieldParam = { email, passwordHash }

    try {
        verifyFields(verifyFieldParam)
        console.log("Todos os campos estão válidos!");
    } catch (error) {
        console.error("Erro de validação:", error);
        return false;
    }

    fetch("http://localhost:8080/usuarios/autenticar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            emailServer: email,
            passwordHashServer: passwordHash
        })
    }).then(response => {
        if (response.ok) {
            response.json().then(json => {
                sessionStorage.EMAIL = json.email;
                sessionStorage.NAME = json.name;
                sessionStorage.ID = json.id;
                sessionStorage.CARGO = json.cargo;
                sessionStorage.EMPRESA_ID = json.empresa_id;
                sessionStorage.GESTOR_ID = json.gestor_id;

                setTimeout(() => {
                    window.location = "../html/monitor.html"
                })
            })
        } else {
            console.error("Houve um erro ao tentar realizar o login!, Erro: ", error);
        }
    }).catch(function (erro) {
        console.error(erro);
    })

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
    let name = document.getElementById("input_name").value;
    let cargo = document.getElementById("input_cargo").value;
    let gestorId = sessionStorage.getItem("GESTOR_ID");
    // let token = document.getElementById("input_token").value;

    const verifyFieldParam = { name, email, empresaId };

    try {
        verifyFields(verifyFieldParam)    
        console.log("Todos os campos estão válidos!");
    } catch (error) {
        console.error("Erro de validação:", error);
        return;
    }

    fetch("http://localhost:3333/usuarios/criar-usuario", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nameServer: name,
            emailServer: email,
            empresaIdServer: empresaId,
            cargoServer: cargo,
            gestorIdServer: gestorId
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