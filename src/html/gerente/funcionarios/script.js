let modal = document.getElementById('modal');
let modal_excluir = document.getElementById('modal_excluir')

function abrirModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function abrirModalExcluir() {
    modal_excluir.classList.remove('hidden');
    modal_excluir.classList.add('flex');
}

function fecharModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function fecharModalExcluir() {
    modal_excluir.classList.add('hidden');
    modal_excluir.classList.remove('flex');
}

    modal.addEventListener('click', e => { if (e.target === modal) fecharModal(); });
    modal_excluir.addEventListener('click', e => { if (e.target === modal_excluir) fecharModalExcluir()})
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); fecharModalExcluir(); });