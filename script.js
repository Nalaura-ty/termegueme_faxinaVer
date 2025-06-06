const palavras = ["VOZES", "RITMO", "NOTAS", "CANTO"]
const numTentativas = 6;
const palavraComprimento = 5;

let palavraSecreta = '';
let tentativaAtual = 0;
let letraAtual = 0;
let gameOver = false;

const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const messageArea = document.getElementById('message-area');

function atualizarTeclado(letra, classe) {
    const keyButton = document.querySelector(`#keyboard .key[data-key="${letra}"]`) ||
                      document.querySelector(`#keyboard .key[data-key="${letra.toLowerCase()}"]`);
    
    if (keyButton) {
        // Regra: se já for verde, não muda. Se for amarela, não muda para cinza.
        if (keyButton.classList.contains('correct-key')) {
            return;
        }
        if (keyButton.classList.contains('present-key') && classe === 'absent-key') {
            return;
        }
        keyButton.classList.add(classe);
    }
}

function verificarPalavra() {
    const currentBoxes = document.querySelectorAll(`#game-board .row:nth-child(${tentativaAtual + 1}) .letter-box`);
    let palpite = '';
    currentBoxes.forEach(box => {
        palpite += box.textContent;
    });
    console.log(`Palpite: ${palpite}`);

    let palavraSecretaArray = palavraSecreta.split('');
    let palpiteArray = palpite.split('');
    let acertosNaPosicao = 0;

    for (let i = 0; i < palavraComprimento; i++) {
        if (palpiteArray[i] === palavraSecretaArray[i]) {
            currentBoxes[i].classList.add('correct');
            atualizarTeclado(palpiteArray[i], 'correct-key');
            palavraSecretaArray[i] = null; // Marca como usada
            acertosNaPosicao++;
        }
    }

    for (let i = 0; i < palavraComprimento; i++) {
        if (currentBoxes[i].classList.contains('correct')) continue;
        
        const indexInSecret = palavraSecretaArray.indexOf(palpiteArray[i]);
       
        if (indexInSecret !== -1) {
            currentBoxes[i].classList.add('present');
            atualizarTeclado(palpiteArray[i], 'present-key');
            palavraSecretaArray[indexInSecret] = null; // Marca como usada
        } else {
            currentBoxes[i].classList.add('absent');
            atualizarTeclado(palpiteArray[i], 'absent-key');
        }
    }
    
    if (acertosNaPosicao === palavraComprimento) {
        mostrarMensagem(`Parabéns! Você acertou a palavra "${palavraSecreta}"!`);
        gameOver = true;
        // Opcional: Adicionar um botão de "Jogar Novamente"
    } else {
        tentativaAtual++;
        letraAtual = 0; 
        if (tentativaAtual >= numTentativas) {
            mostrarMensagem(`Fim de jogo! A palavra era: "${palavraSecreta}"`);
            gameOver = true;
            // Opcional: Adicionar um botão de "Jogar Novamente"
        } else {
            const nextRow = document.querySelector(`#game-board .row:nth-child(${tentativaAtual + 1})`);
            // as letras dentro da linha devem ficar com active-row 
            const boxes = nextRow.querySelectorAll('.letter-box');
            boxes.forEach(box => box.classList.add('active-row'));

            const currentRow = document.querySelector(`#game-board .row:nth-child(${tentativaAtual})`);
            currentRow.classList.remove('active-row'); // Remove destaque da linha atual
        }
    }
}

function handleKeyPress(event) {
    if (gameOver) return;
    
    const key = event.key.toUpperCase();
    const currentBoxes = document.querySelectorAll(`#game-board .row:nth-child(${tentativaAtual + 1}) .letter-box`);
    
    if (key === 'DEL' || key === 'P' && event.ctrlKey) { // Ctrl+P para backspace no teclado
        if (letraAtual > 0) {
            letraAtual--;
            currentBoxes[letraAtual].textContent = '';
        }
    } else if (key === 'ENTER') {
        if (letraAtual === palavraComprimento) {
            verificarPalavra();
        } else {
            mostrarMensagem('A palavra não tem 5 letras!');
        }
    } else if (key.match(/^[A-Z]$/) && key.length === 1) { // Verifica se é uma única letra
        if (letraAtual < palavraComprimento) {
            currentBoxes[letraAtual].textContent = key;
            letraAtual++;
        }
    }
}

function criarTeclado() {
    keyboard.innerHTML = ''; // Limpa teclado anterior
    const keyboardLayout = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'DEL'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER']
    ];

    keyboardLayout.forEach(rowKeys => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        rowKeys.forEach(key => {
            const button = document.createElement('button');
            button.classList.add('key');
            button.textContent = key;
            if (key === 'ENTER') {
                button.classList.add('large');
            }
            if (key === 'DEL') {
                button.innerHTML = '<i class="fa-solid fa-delete-left"></i>';
            }
            button.addEventListener('click', () => handleKeyPress({ key: key }));
            rowDiv.appendChild(button);
        });
        keyboard.appendChild(rowDiv);
    });
}

function criarTabuleiro() {
    for (let i = 0; i < numTentativas; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        for (let j = 0; j < palavraComprimento; j++) {
            const box = document.createElement('div');
            box.classList.add('letter-box');
            if (i === 0) box.classList.add('active-row'); // Destaque para a primeira linha
            row.appendChild(box);
        }
        gameBoard.appendChild(row);
    }
}

function limparTabuleiro() {
    gameBoard.innerHTML = '';
    // Limpar estados do teclado também
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.classList.remove('correct-key', 'present-key', 'absent-key');
    });
}

function inicializarJogo() {
    palavraSecreta = palavras[0];
    tentativaAtual = 0;
    letraAtual = 0;
    gameOver = false;
    messageArea.textContent = '';
    limparTabuleiro();
    criarTabuleiro();
    criarTeclado();
    document.addEventListener('keydown', handleKeyPress);
}

function mostrarMensagem(msg) {
    messageArea.textContent = msg;
}

document.addEventListener('DOMContentLoaded', () => {
    
    inicializarJogo();
    document.querySelectorAll('.key').forEach(button => {
        button.setAttribute('data-key', button.textContent.toUpperCase());
    });
});
