const ALL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CELL_SIZE = 50;
let selectedCells = [];
let isMouseDown = false;
let isTouchActive = false;
let foundWords = [];
let score = 0;
let timerInterval;
let secondsElapsed = 0;
let initialDirection = null; // Track initial direction
let highlightQueue = [];
let highlightTimer;
let selectionGuide;
let touchPlayEnabled = false; // Track touch play state

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
    initialDirection = null; // Reset direction

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

            // Add event listeners based on touch play state
            cell.addEventListener('mousedown', startSelection);
            cell.addEventListener('mouseover', continueSelection);
            cell.addEventListener('mouseup', endSelection);

            if (touchPlayEnabled) {
                cell.addEventListener('touchstart', startTouchSelection);
                cell.addEventListener('touchmove', continueTouchSelection);
                cell.addEventListener('touchend', endTouchSelection);
            } else {
                cell.removeEventListener('touchstart', startTouchSelection);
                cell.removeEventListener('touchmove', continueTouchSelection);
                cell.removeEventListener('touchend', endTouchSelection);
            }

            grid.appendChild(cell);
        });
    });
}

// Toggle touch play state based on checkbox
function toggleTouchPlay() {
    touchPlayEnabled = document.getElementById('touchPlay').checked;
    generatePuzzle(); // Re-generate puzzle to apply event listeners
}

// Touch event handlers
function startTouchSelection(event) {
    if (!touchPlayEnabled) return;
    event.preventDefault();
    isTouchActive = true;
    addCellToHighlightQueue(event.touches[0].clientX, event.touches[0].clientY);
}

function continueTouchSelection(event) {
    if (!isTouchActive || !touchPlayEnabled) return;
    event.preventDefault();
    addCellToHighlightQueue(event.touches[0].clientX, event.touches[0].clientY);
}

function endTouchSelection() {
    if (!touchPlayEnabled) return;
    isTouchActive = false;
    processHighlightQueue();
    checkSelection();
}

// Mouse event handlers
function startSelection(event) {
    event.preventDefault(); // Prevent default behavior
    isMouseDown = true;
    addCellToHighlightQueue(event.clientX, event.clientY);
}

function continueSelection(event) {
    if (isMouseDown) {
        addCellToHighlightQueue(event.clientX, event.clientY);
    }
}

function endSelection() {
    isMouseDown = false;
    processHighlightQueue();
    checkSelection();
    initialDirection = null; // Reset the direction
}

// Optimize highlighting by using a queue and debouncing
function addCellToHighlightQueue(x, y) {
    const targetCell = document.elementFromPoint(x, y);
    if (targetCell && targetCell.classList.contains('grid-cell')) {
        if (!initialDirection && selectedCells.length > 0) {
            initialDirection = determineDirection(selectedCells[0], targetCell);
        }

        if (isCellInDirection(targetCell, initialDirection)) {
            toggleCellHighlight(targetCell);
        }
    }
    if (!highlightTimer) {
        highlightTimer = setTimeout(processHighlightQueue, 50);
    }
}

function processHighlightQueue() {
    highlightQueue = [];
    highlightTimer = null;
}

// Determine the direction of movement based on two cells
function determineDirection(cell1, cell2) {
    const row1 = parseInt(cell1.dataset.row, 10);
    const col1 = parseInt(cell1.dataset.col, 10);
    const row2 = parseInt(cell2.dataset.row, 10);
    const col2 = parseInt(cell2.dataset.col, 10);

    if (row1 === row2) {
        return 'horizontal';
    } else if (col1 === col2) {
        return 'vertical';
    } else if (Math.abs(row1 - row2) === Math.abs(col1 - col2)) {
        return 'diagonal';
    }
    return null;
}

// Check if a cell is in the same direction as the initial selection
function isCellInDirection(cell, direction) {
    if (!direction) return true;

    const lastCell = selectedCells[selectedCells.length - 1];
    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);
    const lastRow = parseInt(lastCell.dataset.row, 10);
    const lastCol = parseInt(lastCell.dataset.col, 10);

    switch (direction) {
        case 'horizontal':
            return lastRow === row;
        case 'vertical':
            return lastCol === col;
        case 'diagonal':
            return Math.abs(lastRow - row) === Math.abs(lastCol - col);
        default:
            return false;
    }
}

// Toggle cell highlight and manage selected cells
function toggleCellHighlight(cell) {
    if (cell.classList.contains('highlight')) {
        cell.classList.remove('highlight');
        selectedCells = selectedCells.filter(selectedCell => selectedCell !== cell);
    } else {
        cell.classList.add('highlight');
        selectedCells.push(cell);
    }
}

// Check if selected cells form a correct word
function checkSelection() {
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

            // Determine score based on word type
            if (item.textContent === reversedWord) {
                // Backwards word: 2 points per letter
                score += item.textContent.length * 2;
            } else if (initialDirection === 'diagonal') {
                // Diagonal word: 3 points per letter
                score += item.textContent.length * 3;
            } else {
                // Normal word: 1 point per letter
                score += item.textContent.length;
            }

            document.getElementById('score').textContent = score;
        }
    });

    if (wordFound) {
        drawLineThroughWord(selectedCells);
    }

    selectedCells = [];
    checkWinCondition();
}

// Draw a line through the found word
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

// Check if all words are found
function checkWinCondition() {
    const totalWords = document.querySelectorAll('.word-list li').length;
    if (foundWords.length === totalWords) {
        clearInterval(timerInterval);
        alert(`Congratulations! You've found all the words! Your score is ${score}.`);
    }
}

// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        secondsElapsed++;
        document.getElementById('timer').textContent = formatTime(secondsElapsed);
    }, 1000);
}

// Format time for the timer
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Give a hint by highlighting the first letter of a word
function giveHint() {
    const wordListItems = document.querySelectorAll('.word-list li');
    for (let item of wordListItems) {
        if (!item.classList.contains('found')) {
            highlightFirstLetter(item.textContent);
            break;
        }
    }
}

// Highlight the first letter of a word in the grid
function highlightFirstLetter(word) {
    const gridCells = document.querySelectorAll('.grid-cell');
    for (let cell of gridCells) {
        if (cell.textContent === word[0] && !cell.classList.contains('found')) {
            cell.classList.add('highlight');
            setTimeout(() => cell.classList.remove('highlight'), 2000);
            break;
        }
    }
}

// Highlight all words in the list and grid
function highlightAllWords() {
    const wordListItems = document.querySelectorAll('.word-list li');
    wordListItems.forEach(item => {
        if (!item.classList.contains('found')) {
            item.classList.add('found');
        }
    });

    const gridCells = document.querySelectorAll('.grid-cell');
    gridCells.forEach(cell => {
        if (cell.classList.contains('found')) {
            cell.classList.add('highlight');
        }
    });
}

// Get directions for placing words in the grid, with a higher probability for diagonal directions
function getDirections() {
    const directions = [
        [1, 0], [0, 1], // Horizontal and vertical
        [1, 1], [-1, 1], [1, -1], [-1, -1], // Diagonals
        [1, 1], [-1, 1], [1, -1], [-1, -1], // Extra diagonals to increase probability
        [0, -1] // Vertical (upwards)
    ];
    return directions;
}

// Show selection guides for easier selection of words
function showSelectionGuides(x, y) {
    if (!selectionGuide) {
        selectionGuide = document.createElement('div');
        selectionGuide.classList.add('selection-guide');
        document.querySelector('.grid').appendChild(selectionGuide);
    }

    // Position and size the guide based on cursor position
    selectionGuide.style.left = `${x}px`;
    selectionGuide.style.top = `${y}px`;
}

// Hide selection guides
function hideSelectionGuides() {
    if (selectionGuide) {
        selectionGuide.remove();
        selectionGuide = null;
    }
}

// Generator class to create the word search puzzle
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
                    // Randomize directions for each word placement to ensure variety
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

    // Utility function to shuffle an array
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

window.onload = generatePuzzle;
