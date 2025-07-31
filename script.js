const palavras = [ "LIMPA", "REZAR", "SABAO", "SEGUE", "TERCO", "BALDE"]
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
                                texto = "Você venceu! volte amanhã para mais palavras!"
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
                                
                                // Define foco na primeira caixa da nova linha
                                setTimeout(() => {
                                    const newFirstBox = document.querySelector(`#game-board .row:nth-child(${tentativaAtual + 1}) .letter-box:nth-child(1)`);
                                    if (newFirstBox) {
                                        // Remove foco de todas as caixas
                                        document.querySelectorAll('.letter-box').forEach(box => box.classList.remove('focused'));
                                        newFirstBox.classList.add('focused');
                                    }
                                }, 150);
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
    
    if ((key === 'DEL' || key === 'P' && event.ctrlKey || key == 'BACKSPACE') && letraAtual > 0) { 
        letraAtual--;
        currentBoxes[letraAtual].textContent = '';
        currentBoxes[letraAtual].classList.remove('letter-pop');
        
        // Atualiza foco para a caixa anterior
        currentBoxes.forEach(box => box.classList.remove('focused'));
        if (currentBoxes[letraAtual]) {
            currentBoxes[letraAtual].classList.add('focused');
        }
    } else if (key === 'ENTER' && letraAtual === palavraComprimento) {
        verificarPalavra();
    } else if (key.match(/^[A-Z]$/) && key.length === 1) { 
        if (letraAtual < palavraComprimento && currentBoxes[letraAtual]) {
            currentBoxes[letraAtual].textContent = key;

            currentBoxes[letraAtual].classList.add('letter-pop');
            currentBoxes[letraAtual].addEventListener('animationend', function handler() {
                currentBoxes[letraAtual].classList.remove('letter-pop');
                currentBoxes[letraAtual].removeEventListener('animationend', handler);
            });

            letraAtual++;
            
            // Atualiza foco para a próxima caixa
            currentBoxes.forEach(box => box.classList.remove('focused'));
            if (letraAtual < palavraComprimento && currentBoxes[letraAtual]) {
                currentBoxes[letraAtual].classList.add('focused');
            }
        }
    }
}

function handleBoxClick(rowIndex, boxIndex) {
    if (gameOver) return;
    
    // Só permite clicar na linha atual
    if (rowIndex !== tentativaAtual) return;
    
    // Atualiza a posição atual para a caixa clicada
    letraAtual = boxIndex;
    
    // Remove indicação de foco de todas as caixas da linha atual
    const currentBoxes = document.querySelectorAll(`#game-board .row:nth-child(${tentativaAtual + 1}) .letter-box`);
    currentBoxes.forEach(box => box.classList.remove('focused'));
    
    // Adiciona indicação de foco na caixa selecionada
    if (currentBoxes[boxIndex]) {
        currentBoxes[boxIndex].classList.add('focused');
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
            
            // Adiciona event listener para clique na caixa
            box.addEventListener('click', () => handleBoxClick(i, j));
            box.style.cursor = 'pointer'; // Indica que é clicável
            
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
    
    // Define foco na primeira caixa após criar o tabuleiro
    setTimeout(() => {
        const firstBox = document.querySelector(`#game-board .row:nth-child(1) .letter-box:nth-child(1)`);
        if (firstBox) {
            document.querySelectorAll('.letter-box').forEach(box => box.classList.remove('focused'));
            firstBox.classList.add('focused');
        }
    }, 100);
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
