
function registerUser() {
    const name;
    const email;
    const passwordHash;
    const token;
    

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