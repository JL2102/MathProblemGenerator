const ALL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CELL_SIZE = 50;

let selectedCells = [];
let firstSelectedCell = null;
let secondSelectedCell = null;
let foundWords = [];
let score = 0;
let timerInterval;
let secondsElapsed = 0;

async function fetchWords() {
    const response = await fetch('words.json');
    return await response.json();
}

async function generatePuzzle() {
    clearInterval(timerInterval);
    secondsElapsed = 0;
    document.getElementById('timer').textContent = formatTime(secondsElapsed);
    startTimer();

    score = 0;
    foundWords = [];
    document.getElementById('score').textContent = score;
    selectedCells = [];
    firstSelectedCell = null;
    secondSelectedCell = null;

    const wordsDictionary = await fetchWords();
    const numWords = parseInt(document.getElementById('numWords').value);
    const gridSize = parseInt(document.getElementById('gridSize').value);

    const selectedWords = selectWords(wordsDictionary, numWords);
    const puzzle = new Generator().gen_word_search(selectedWords, getDirections(), gridSize / selectedWords.length);

    renderPuzzle(puzzle);
    renderWordList(selectedWords);
}

function selectWords(dictionary, count) {
    const selected = [];
    while (selected.length < count) {
        const word = dictionary[Math.floor(Math.random() * dictionary.length)];
        if (!selected.includes(word)) selected.push(word);
    }
    return selected;
}

function renderPuzzle(puzzle) {
    const grid = document.getElementById('puzzleGrid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${puzzle.length}, ${CELL_SIZE}px)`;

    puzzle.forEach((row, rowIndex) => {
        row.forEach((letter, colIndex) => {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.textContent = letter;
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            cell.addEventListener('click', handleCellClick);
            grid.appendChild(cell);
        });
    });
}

function renderWordList(words) {
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = '';

    words.forEach(word => {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        wordList.appendChild(listItem);
    });
}

function handleCellClick(event) {
    const cell = event.target;
    if (!firstSelectedCell) {
        firstSelectedCell = cell;
        cell.classList.add('highlight');
    } else {
        secondSelectedCell = cell;
        highlightCellsBetween(firstSelectedCell, secondSelectedCell);
        processSelection();
        resetSelection();
    }
}

function highlightCellsBetween(startCell, endCell) {
    const startRow = parseInt(startCell.dataset.row);
    const startCol = parseInt(startCell.dataset.col);
    const endRow = parseInt(endCell.dataset.row);
    const endCol = parseInt(endCell.dataset.col);

    const dRow = endRow - startRow;
    const dCol = endCol - startCol;
    const stepRow = dRow !== 0 ? dRow / Math.abs(dRow) : 0;
    const stepCol = dCol !== 0 ? dCol / Math.abs(dCol) : 0;

    let currentRow = startRow;
    let currentCol = startCol;

    while (currentRow !== endRow || currentCol !== endCol) {
        const cell = document.querySelector(`[data-row="${currentRow}"][data-col="${currentCol}"]`);
        if (cell) {
            cell.classList.add('highlight');
            selectedCells.push(cell);
        }
        currentRow += stepRow;
        currentCol += stepCol;
    }

    endCell.classList.add('highlight');
    selectedCells.push(endCell);
}

function resetSelection() {
    selectedCells = [];
    firstSelectedCell = null;
    secondSelectedCell = null;
}

function processSelection() {
    if (selectedCells.length === 0) return;

    let selectedWord = selectedCells.map(cell => cell.textContent).join('');
    let reversedWord = selectedCells.map(cell => cell.textContent).reverse().join('');
    const wordListItems = document.querySelectorAll('.word-list li');
    let wordFound = false;

    wordListItems.forEach(item => {
        if ((item.textContent === selectedWord || item.textContent === reversedWord) && !item.classList.contains('found')) {
            item.classList.add('found');
            selectedCells.forEach(cell => {
                cell.classList.add('found');
                cell.classList.remove('highlight');
            });
            foundWords.push(item.textContent);
            wordFound = true;

            let wordScore = item.textContent.length;
            if (item.textContent === reversedWord) {
                wordScore *= 2;
            } else if (Math.abs(endCell.dataset.row - startCell.dataset.row) === Math.abs(endCell.dataset.col - startCell.dataset.col)) {
                wordScore *= 3;
            }
            score += wordScore;
            document.getElementById('score').textContent = score;
        }
    });

    if (wordFound) {
        drawLineThroughWord(selectedCells);
    }

    checkWinCondition();
}

function drawLineThroughWord(cells) {
    const grid = document.getElementById('puzzleGrid');
    const startX = cells[0].offsetLeft + cells[0].offsetWidth / 2;
    const startY = cells[0].offsetTop + cells[0].offsetHeight / 2;
    const endX = cells[cells.length - 1].offsetLeft + cells[cells.length - 1].offsetWidth / 2;
    const endY = cells[cells.length - 1].offsetTop + cells[cells.length - 1].offsetHeight / 2;

    const line = document.createElement('div');
    line.classList.add('line');
    line.style.width = `${Math.hypot(endX - startX, endY - startY)}px`;
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI}deg)`;
    line.style.transformOrigin = '0 0';
    grid.appendChild(line);
}

function checkWinCondition() {
    const totalWords = document.querySelectorAll('.word-list li').length;
    if (foundWords.length === totalWords) {
        clearInterval(timerInterval);
        alert(`Congratulations! You've found all the words! Your score is ${score}.`);
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        secondsElapsed++;
        document.getElementById('timer').textContent = formatTime(secondsElapsed);
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getDirections() {
    const difficulty = document.getElementById('difficulty').value;
    let directions;

    switch (difficulty) {
        case 'easy':
            directions = [[1, 0], [0, 1]]; // Horizontal and vertical
            break;
        case 'medium':
            directions = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // Backwards and upside-down
            break;
        case 'hard':
            directions = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]; // Diagonals
            break;
        case 'impossible':
            directions = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1],
                          [1, 1], [1, -1], [-1, 1], [-1, -1]]; // Extra diagonals
            break;
        default:
            directions = [[1, 0], [0, 1]]; // Fallback to Easy
            break;
    }

    return directions;
}

class Generator {
    get_puzzle_dim(words, size_fac) {
        let total = 0;
        for (let word of words) {
            total += word.length;
        }
        return Math.max(Math.ceil(Math.sqrt(total * size_fac)), Math.max(...words.map(word => word.length)));
    }

    create_empty_table(dim) {
        return Array.from({ length: dim }, () => Array(dim).fill(" "));
    }

    copy_table(table) {
        return JSON.parse(JSON.stringify(table));
    }

    create_blank_tried_pos(words) {
        const dictionary = {};
        words.forEach(word => dictionary[word] = []);
        return dictionary;
    }

    all_random_coords(dim) {
        const xlist = Array.from({ length: dim }, (_, i) => i).sort(() => Math.random() - 0.5);
        const ylist = Array.from({ length: dim }, (_, i) => i).sort(() => Math.random() - 0.5);
        return [xlist, ylist];
    }

    gen_word_search(words, directions, size_fac = 2) {
        const dim = this.get_puzzle_dim(words, size_fac);
        let table = this.create_empty_table(dim);
        const tried_positions = this.create_blank_tried_pos(words);
        let current_index = 0;

        while (current_index < words.length) {
            const word = words[current_index];
            const table_history = this.copy_table(table);
            const [xlist, ylist] = this.all_random_coords(dim);

            let success = false;

            for (let x of xlist) {
                for (let y of ylist) {
                    const shuffledDirections = this.shuffleArray(directions);
                    for (let dir of shuffledDirections) {
                        const tcopy = this.copy_table(table);
                        let pos = [x, y];
                        success = true;

                        for (let letter of word) {
                            try {
                                if (pos[0] < 0 || pos[1] < 0 || pos[0] >= dim || pos[1] >= dim) throw new Error();
                                tcopy[pos[1]][pos[0]];
                            } catch {
                                success = false;
                                break;
                            }

                            if (tcopy[pos[1]][pos[0]] === " ") {
                                tcopy[pos[1]][pos[0]] = letter;
                            } else if (tcopy[pos[1]][pos[0]] === letter) {
                                continue;
                            } else {
                                success = false;
                                break;
                            }

                            pos = [pos[0] + dir[0], pos[1] + dir[1]];
                        }

                        if (success) {
                            table = this.copy_table(tcopy);
                            tried_positions[word].push([x, y, dir]);
                            current_index++;
                            break;
                        }
                    }
                    if (success) break;
                }
                if (success) break;
            }

            if (!success) {
                current_index--;
                tried_positions[word] = [];
                table = this.copy_table(table_history);
                if (current_index < 0) {
                    table = this.create_empty_table(dim + 1);
                    current_index = 0;
                }
            }
        }

        for (let row of table) {
            for (let i = 0; i < row.length; i++) {
                if (row[i] === " ") row[i] = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
            }
        }

        return table;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

window.onload = generatePuzzle;
