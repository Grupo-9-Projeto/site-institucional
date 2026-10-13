document.addEventListener('DOMContentLoaded', () => {
    const btnHamburguer = document.getElementById('btn-hamburguer');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function toggleMenu() {
        if (!sidebar || !overlay) return;
        
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    }

    if (btnHamburguer && overlay) {
        btnHamburguer.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    }
});

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