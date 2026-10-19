// =====================================================
// Comunicação com o back-end (web-data-viz)
// =====================================================

// Endereço do back. Para trocar de ambiente (ex.: servidor na nuvem), altere só esta linha.
const API_URL = "http://localhost:8080"


const BASE_JS = document.currentScript.src;
const LOGIN_URL = new URL("../html/login.html", BASE_JS).href;

function paginaIniciadlDoCargo(cargo) {
    if(cargo === "super"){
        return new URL("../usuarios.html", BASE_JS).href
    }
    if (cargo === "gerente") {
        return new URL("../html/gerente/home.html", BASE_JS).href
    }
    return new URL("../html/analista/home/home.html", BASE_JS).href;
}

// ---------- Token (JWT) ----------
// Fica no sessionStorage

function salvarToken(token) {
    sessionStorage.setItem("TOKEN", token);
}

function obterToken() {
    return sessionStorage.getItem("TOKEN");
}

function sair() {
    sessionStorage.removeItem("TOKEN");
    window.location.href = LOGIN_URL;
}

// Lê o conteúdo do token (id, role, gestor, empresa, exp) para decidir o que mostrar na tela.
function lerToken() {
    const token = obterToken();
    if (!token) return null;
 
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch (erro) {
        return null;
    }
}

// Para telas exclusivas de gerente: sem token válido (ou sem ser gerente) volta ao login.
function exigirGerente() {
    const infoToken = lerToken();
    const expirado = infoToken && infoToken.exp && infoToken.exp * 1000 < Date.now();
 
    if (!infoToken || infoToken.role !== "gerente" || expirado) {
        sair();
        return false;
    }
    return true;
}

async function apiFetch(caminho, opcoes = {}) {
    const token = obterToken();
 
    if (!token) {
        sair();
        throw semSessao();
    }
 
    const resposta = await fetch(API_URL + caminho, {
        ...opcoes,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            ...(opcoes.headers || {})
        }
    });
 
    // 401 = token ausente, inválido ou expirado: a sessão acabou, volta ao login
    if (resposta.status === 401) {
        sair();
        throw semSessao();
    }
 
    let dados = null;
    try {
        dados = await resposta.json();
    } catch (erro) {

    }
 
    return { ok: resposta.ok, status: resposta.status, dados: dados };
}
 
function semSessao() {
    const erro = new Error("Sessão expirada");
    erro.sessaoExpirada = true;
    return erro;
}