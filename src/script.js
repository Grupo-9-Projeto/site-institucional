
function registerUser() {
    let name;
    let email;
    let passwordHash;
    let token;
    
    const verifyFieldParam = { name, email, passwordHash, token }

    try {
        verifyField(verifyFieldParam)    
        console.log("Todos os campos estão válidos!");
    } catch {
         console.error("Erro de validação:", error);
    }

    fetch("/usuario/cadastrar", {
        method: "POST"  ,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            nameServer: name,
            emailServer: email,
            passwordHashServer: passwordHash,
            tokenServer: authCode
        })
    }).then(response => {
        if (response.ok) {
            setTimeout(() => {
                // window.location = "login.html";
                return
            }, "2000");
            
        }
        throw "Houve um erro ao tentar realizar o cadastro!";
    }).catch(error => {
        console.error("Erro ao realizar cadastro! Erro: ", error)
    })
}

function authUser() {
    
}

function verifyField(fieldsObj) {
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