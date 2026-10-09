let modal_excluir = document.getElementById('modal_excluir')

function abrirModalExcluir() {
    modal_excluir.classList.remove('hidden');
    modal_excluir.classList.add('flex');
}

function fecharModalExcluir() {
    modal_excluir.classList.add('hidden');
    modal_excluir.classList.remove('flex');
    window.location.href="../informacoesEmpresa.html"
}

    modal_excluir.addEventListener('click', e => { if (e.target === modal_excluir) fecharModalExcluir()})
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModalExcluir(); });