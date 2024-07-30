import pygame
import random

# Initialize Pygame
pygame.init()

# Constants
SCREEN_WIDTH, SCREEN_HEIGHT = 800, 600
GRID_SIZE = 10
CELL_SIZE = 40
PADDING = 20
FONT_SIZE = 24
BACKGROUND_COLOR = (240, 240, 240)
LINE_COLOR = (255, 0, 0)
HIGHLIGHT_COLOR = (255, 255, 0)
FOUND_COLOR = (0, 255, 0)
FONT_COLOR = (0, 0, 0)

# Words to find
WORDS = [
    "APPLE", "ORANGE", "BANANA", "GRAPE", "PEAR", "CHERRY", "LEMON", "LIME", "PLUM", "MANGO",
    "STRAWBERRY", "BLUEBERRY", "PINEAPPLE", "KIWI", "WATERMELON", "PEACH", "APRICOT", "BLACKBERRY",
    "CRANBERRY", "FIG", "PAPAYA", "PASSIONFRUIT", "POMEGRANATE", "RASPBERRY", "TANGERINE", "CLEMENTINE",
    "AVOCADO", "DRAGONFRUIT", "LYCHEE", "NECTARINE", "PERSIMMON", "QUINCE", "GRAPEFRUIT", "COCONUT",
    "GUAVA", "JACKFRUIT", "KUMQUAT", "MULBERRY", "OLIVE", "POMELO", "RHUBARB", "STARFRUIT", "UGLI",
    "LOQUAT", "DURIAN", "MANGOSTEEN", "SAPODILLA", "SUGARAPPLE", "TAMARIND", "FIG", "BOYSENBERRY",
    "ELDERBERRY", "GOOSEBERRY", "HUCKLEBERRY", "SASKATOON", "SALMONBERRY", "SERVICEBERRY", "SEA BUCKTHORN",
    "SORREL", "TAYBERRY", "YOUNGBERRY", "ACAI", "GOJI", "MAQUI", "NONI", "BREADFRUIT", "CARAMBOLA",
    "CANTALOUPE", "HONEYDEW", "SQUASH", "PUMPKIN", "ZUCCHINI", "EGGPLANT", "CUCUMBER", "TOMATO", "PEPPER",
    "CHILI", "JALAPENO", "HABANERO", "PEPINO", "CHERIMOYA", "SANTOL", "SALAK", "LONGAN", "RAMBUTAN",
    "LANGSAT", "MAFUREIRA", "MARULA", "MUNGBEAN", "TAMARILLO", "YAM", "SWEETPOTATO", "TARO", "ARROWROOT",
    "BREADNUT", "CHESTNUT", "PECAN", "WALNUT", "ALMOND", "CASHEW"
]

# Directions for placing words
DIRECTIONS = [(1, 0), (0, 1), (1, 1), (-1, 1)]

# Setup screen
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Word Search Game")

# Fonts
font = pygame.font.SysFont('Arial', FONT_SIZE)

# Game state
grid = []
found_words = []
selected_cells = []
is_mouse_down = False

# Functions
def create_grid():
    global grid
    grid = [['' for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
    for word in random.sample(WORDS, GRID_SIZE):
        place_word(word)

def place_word(word):
    global grid
    placed = False
    while not placed:
        direction = random.choice(DIRECTIONS)
        start_x = random.randint(0, GRID_SIZE - 1)
        start_y = random.randint(0, GRID_SIZE - 1)
        if can_place_word(word, start_x, start_y, direction):
            place_word_in_grid(word, start_x, start_y, direction)
            placed = True

def can_place_word(word, x, y, direction):
    dx, dy = direction
    for i, char in enumerate(word):
        new_x = x + i * dx
        new_y = y + i * dy
        if new_x < 0 or new_x >= GRID_SIZE or new_y < 0 or new_y >= GRID_SIZE:
            return False
        if grid[new_y][new_x] not in ('', char):
            return False
    return True

def place_word_in_grid(word, x, y, direction):
    dx, dy = direction
    for i, char in enumerate(word):
        grid[y + i * dy][x + i * dx] = char

def fill_grid():
    for y in range(GRID_SIZE):
        for x in range(GRID_SIZE):
            if grid[y][x] == '':
                grid[y][x] = chr(random.randint(65, 90))  # Random uppercase letter

def draw_grid():
    for y in range(GRID_SIZE):
        for x in range(GRID_SIZE):
            rect = pygame.Rect(x * CELL_SIZE + PADDING, y * CELL_SIZE + PADDING, CELL_SIZE, CELL_SIZE)
            pygame.draw.rect(screen, FONT_COLOR, rect, 2)
            text = font.render(grid[y][x], True, FONT_COLOR)
            screen.blit(text, (x * CELL_SIZE + PADDING + 10, y * CELL_SIZE + PADDING + 5))

def draw_highlights():
    for cell in selected_cells:
        x, y = cell
        rect = pygame.Rect(x * CELL_SIZE + PADDING, y * CELL_SIZE + PADDING, CELL_SIZE, CELL_SIZE)
        pygame.draw.rect(screen, HIGHLIGHT_COLOR, rect)

def draw_found_words():
    for word, cells in found_words:
        for cell in cells:
            x, y = cell
            rect = pygame.Rect(x * CELL_SIZE + PADDING, y * CELL_SIZE + PADDING, CELL_SIZE, CELL_SIZE)
            pygame.draw.rect(screen, FOUND_COLOR, rect)

def check_word_selection():
    global found_words
    selected_word = ''.join(grid[y][x] for x, y in selected_cells)
    if selected_word in WORDS and selected_word not in [word for word, _ in found_words]:
        found_words.append((selected_word, selected_cells.copy()))

def main():
    global is_mouse_down, selected_cells
    create_grid()
    fill_grid()

    running = True
    while running:
        screen.fill(BACKGROUND_COLOR)
        draw_grid()
        draw_highlights()
        draw_found_words()
        pygame.display.flip()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.MOUSEBUTTONDOWN:
                is_mouse_down = True
                x, y = event.pos
                x = (x - PADDING) // CELL_SIZE
                y = (y - PADDING) // CELL_SIZE
                if 0 <= x < GRID_SIZE and 0 <= y < GRID_SIZE:
                    selected_cells = [(x, y)]
            elif event.type == pygame.MOUSEMOTION and is_mouse_down:
                x, y = event.pos
                x = (x - PADDING) // CELL_SIZE
                y = (y - PADDING) // CELL_SIZE
                if 0 <= x < GRID_SIZE and 0 <= y < GRID_SIZE:
                    if (x, y) not in selected_cells:
                        selected_cells.append((x, y))
            elif event.type == pygame.MOUSEBUTTONUP:
                is_mouse_down = False
                check_word_selection()
                selected_cells = []

    pygame.quit()

if __name__ == "__main__":
    main()
