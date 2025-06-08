const palavras = ["VOZES", "RITMO", "NOTAS", "CANTO"]
const numTentativas = 6;
const palavraComprimento = 5;

let palavraSecreta = '';
let tentativaAtual = 0;
let letraAtual = 0;
let gameOver = false;
let indicePalavraAtual = 0; 

const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const messageArea = document.getElementById('message-area');
const nextButtonArea = document.getElementById('next-button-area');
const subtitle = document.getElementById('subtitle')

function atualizarTeclado(letra, classe) {
    const keyButton = document.querySelector(`#keyboard .key[data-key="${letra}"]`) ||
                      document.querySelector(`#keyboard .key[data-key="${letra.toLowerCase()}"]`);
    
    if (keyButton) {
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

    let palavraSecretaArray = palavraSecreta.split('');
    let palpiteArray = palpite.split('');
    let acertosNaPosicao = 0;

    currentBoxes.forEach((box, i) => {
        setTimeout(() => {
            box.classList.add('letter-flip');
            box.addEventListener('animationend', function handler() {
                box.classList.remove('letter-flip');

                if (palpiteArray[i] === palavraSecretaArray[i]) {
                    box.classList.add('correct');
                    atualizarTeclado(palpiteArray[i], 'correct-key');
                    palavraSecretaArray[i] = null;
                    acertosNaPosicao++;
                } else if (palavraSecretaArray.includes(palpiteArray[i])) {
                    box.classList.add('present');
                    atualizarTeclado(palpiteArray[i], 'present-key');
                    palavraSecretaArray[palavraSecretaArray.indexOf(palpiteArray[i])] = null;
                } else {
                    box.classList.add('absent');
                    atualizarTeclado(palpiteArray[i], 'absent-key');
                }
                box.removeEventListener('animationend', handler);

                if (i === palavraComprimento - 1) {
                    setTimeout(() => {
                        if (acertosNaPosicao === palavraComprimento) {
                            let texto = `Parabéns, você acertou a palavra!`
                            if ((indicePalavraAtual + 1) == palavras.length ) {
                                texto = "Seja bem vindo à EQUIPE DO CANTO!"
                                subtitle.innerHTML = `${palavras.length}/${palavras.length} concluídas`
                            }
                            mostrarMensagem(texto);
                            gameOver = true;
                        } else {
                            tentativaAtual++;
                            letraAtual = 0; 
                            if (tentativaAtual >= numTentativas) {
                                mostrarMensagem(`Opss! A palavra era: "${palavraSecreta}"`);
                                gameOver = true;
                            } else {
                                const nextRow = document.querySelector(`#game-board .row:nth-child(${tentativaAtual + 1})`);
                                const boxes = nextRow.querySelectorAll('.letter-box');
                                boxes.forEach(box => box.classList.add('active-row'));
                                const currentRow = document.querySelector(`#game-board .row:nth-child(${tentativaAtual})`);
                                currentRow.classList.remove('active-row'); 
                            }
                        }
                    }, 100);
                }
            });
        }, i * 100);
    });
}

function handleKeyPress(event) {
    if (gameOver) return;
    
    const key = event.key.toUpperCase();
    const currentBoxes = document.querySelectorAll(`#game-board .row:nth-child(${tentativaAtual + 1}) .letter-box`);
    
    if (key === 'DEL' || key === 'P' && event.ctrlKey || key == 'BACKSPACE' && letraAtual > 0) { 
        if (letraAtual > 0) {
            letraAtual--;
            currentBoxes[letraAtual].textContent = '';
            currentBoxes[letraAtual].classList.remove('letter-pop');
        }
    } else if (key === 'ENTER') {
        if (letraAtual === palavraComprimento) {
            verificarPalavra();
        }
    } else if (key.match(/^[A-Z]$/) && key.length === 1) { 
        if (letraAtual < palavraComprimento && currentBoxes[letraAtual]) {
            currentBoxes[letraAtual].textContent = key;

            currentBoxes[letraAtual].classList.add('letter-pop');
            currentBoxes[letraAtual].addEventListener('animationend', function handler() {
                currentBoxes[letraAtual].classList.remove('letter-pop');
                currentBoxes[letraAtual].removeEventListener('animationend', handler);
            });

            letraAtual++;
        }
    }
}

function criarTeclado() {
    keyboard.innerHTML = ''; 
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
            button.setAttribute('data-key', key.toUpperCase());
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

function inicializarJogo(referenciaPalavra = 0) {
    palavraSecreta = palavras[referenciaPalavra];
    tentativaAtual = 0;
    letraAtual = 0;
    gameOver = false;
    
    messageArea.textContent = '';
    
    limparTabuleiro();
    criarTabuleiro();
    criarTeclado();

    subtitle.innerHTML = `0/${palavras.length} concluídas`
    document.addEventListener('keydown', handleKeyPress);
}

function mostrarMensagem(msg) {
    messageArea.classList.remove('hidden');
    if((indicePalavraAtual + 1) != palavras.length) nextButtonArea.classList.remove('hidden');
    keyboard.classList.add('hidden'); 

    messageArea.textContent = msg;
}

function nextWord(){
    messageArea.classList.add('hidden');
    nextButtonArea.classList.add('hidden');
    keyboard.classList.remove('hidden'); 

    indicePalavraAtual += 1
    inicializarJogo(indicePalavraAtual);

    subtitle.innerHTML = `${indicePalavraAtual}/${palavras.length} concluídas`
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarJogo();
});
