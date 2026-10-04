let modal = document.getElementById('modal');

function abrirModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function fecharModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

    document.getElementById('abrir_modal').addEventListener('click', abrirModal);
    modal.addEventListener('click', e => { if (e.target === modal) fecharModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });