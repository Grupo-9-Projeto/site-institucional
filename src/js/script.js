
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

    fetch("/usuarios/autenticar", {
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

                setTimeout(() => {
                    window.location = "./"
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