from tkinter import *
import numpy as np

class Dots_and_Boxes():
    def __init__(self):
        self.window = Tk()
        self.window.title('Dots_and_Boxes')
        
        # Create input fields and button to set the board size
        self.size_label = Label(self.window, text="Enter board size:")
        self.size_label.pack()
        self.size_entry = Entry(self.window)
        self.size_entry.pack()
        self.set_size_button = Button(self.window, text="Set Size", command=self.set_board_size)
        self.set_size_button.pack()
        
        # Create a frame for the bottom widgets
        self.bottom_frame = Frame(self.window)
        self.bottom_frame.pack(side=BOTTOM, fill=X)

        # Scoreboard
        self.scoreboard_label = Label(self.bottom_frame, text="Scores - Blue: 0, Red: 0", font=("Arial", 14))
        self.scoreboard_label.pack(side=LEFT, padx=10, pady=10)

        # Next turn text
        self.turntext_handle = Label(self.bottom_frame, text="", font=("Arial", 14))
        self.turntext_handle.pack(side=RIGHT, padx=10, pady=10)

        self.window.mainloop()
    
    def set_board_size(self):
        try:
            self.number_of_dots = int(self.size_entry.get())
            if self.number_of_dots < 3:  # Minimum size constraint
                self.number_of_dots = 3
            self.initialize_game()
        except ValueError:
            self.number_of_dots = 6
            self.initialize_game()

    def initialize_game(self):
        self.size_of_board = 600
        self.symbol_size = (self.size_of_board / 3 - self.size_of_board / 8) / 2
        self.symbol_thickness = 50
        self.dot_color = '#7BC043'
        self.player1_color = '#0492CF'
        self.player1_color_light = '#67B0CF'
        self.player2_color = '#EE4035'
        self.player2_color_light = '#EE7E77'
        self.Green_color = '#7BC043'
        self.dot_width = 0.25*self.size_of_board/self.number_of_dots
        self.edge_width = 0.1*self.size_of_board/self.number_of_dots
        self.distance_between_dots = self.size_of_board / self.number_of_dots

        # Create the canvas for the game
        self.canvas = Canvas(self.window, width=self.size_of_board, height=self.size_of_board)
        self.canvas.pack()
        self.canvas.bind('<Button-1>', self.click)

        self.play_again()

    def play_again(self):
        self.refresh_board()
        self.board_status = np.zeros(shape=(self.number_of_dots - 1, self.number_of_dots - 1))
        self.row_status = np.zeros(shape=(self.number_of_dots, self.number_of_dots - 1))
        self.col_status = np.zeros(shape=(self.number_of_dots - 1, self.number_of_dots))
        
        self.player1_starts = True
        self.player1_turn = True
        self.reset_board = False

        self.already_marked_boxes = []
        self.update_scoreboard()
        self.display_turn_text()

    def mainloop(self):
        self.window.mainloop()

    def is_grid_occupied(self, logical_position, type):
        r = logical_position[0]
        c = logical_position[1]
        occupied = True

        if type == 'row' and self.row_status[c][r] == 0:
            occupied = False
        if type == 'col' and self.col_status[c][r] == 0:
            occupied = False

        return occupied

    def convert_grid_to_logical_position(self, grid_position):
        grid_position = np.array(grid_position)
        position = (grid_position-self.distance_between_dots/4)//(self.distance_between_dots/2)

        type = False
        logical_position = []
        if position[1] % 2 == 0 and (position[0] - 1) % 2 == 0:
            r = int((position[0]-1)//2)
            c = int(position[1]//2)
            logical_position = [r, c]
            type = 'row'
        elif position[0] % 2 == 0 and (position[1] - 1) % 2 == 0:
            c = int((position[1] - 1) // 2)
            r = int(position[0] // 2)
            logical_position = [r, c]
            type = 'col'

        return logical_position, type

    def mark_box(self):
        box_completed = False
        for box in np.ndindex(self.board_status.shape):
            if self.board_status[box] == 4:
                if list(box) not in self.already_marked_boxes:
                    self.already_marked_boxes.append(list(box))
                    if self.player1_turn:
                        color = self.player1_color_light
                    else:
                        color = self.player2_color_light
                    self.shade_box(box, color)
                    # Mark box ownership for scoring
                    self.board_status[box] = 4 if self.player1_turn else -4
                    box_completed = True
        if box_completed:
            self.update_scoreboard()

    def update_scoreboard(self):
        player1_score = np.sum(self.board_status == 4)
        player2_score = np.sum(self.board_status == -4)
        self.scoreboard_label.config(text=f"Scores - Blue: {player1_score}, Red: {player2_score}")

    def update_board(self, type, logical_position):
        r = logical_position[0]
        c = logical_position[1]
        if c < (self.number_of_dots - 1) and r < (self.number_of_dots - 1):
            self.board_status[c][r] += 1

        if type == 'row':
            self.row_status[c][r] = 1
            if c >= 1:
                self.board_status[c - 1][r] += 1

        elif type == 'col':
            self.col_status[c][r] = 1
            if r >= 1:
                self.board_status[c][r - 1] += 1

    def is_gameover(self):
        return (self.row_status == 1).all() and (self.col_status == 1).all()

    def make_edge(self, type, logical_position):
        if type == 'row':
            start_x = self.distance_between_dots/2 + logical_position[0]*self.distance_between_dots
            end_x = start_x+self.distance_between_dots
            start_y = self.distance_between_dots/2 + logical_position[1]*self.distance_between_dots
            end_y = start_y
        elif type == 'col':
            start_y = self.distance_between_dots / 2 + logical_position[1] * self.distance_between_dots
            end_y = start_y + self.distance_between_dots
            start_x = self.distance_between_dots / 2 + logical_position[0] * self.distance_between_dots
            end_x = start_x

        if self.player1_turn:
            color = self.player1_color
        else:
            color = self.player2_color
        self.canvas.create_line(start_x, start_y, end_x, end_y, fill=color, width=self.edge_width)

    def display_gameover(self):
        # Count scores based on marked boxes
        player1_score = np.sum(self.board_status == 4)
        player2_score = np.sum(self.board_status == -4)

        if player1_score > player2_score:
            text = 'Winner: Player 1 '
            color = self.player1_color
        elif player2_score > player1_score:
            text = 'Winner: Player 2 '
            color = self.player2_color
        else:
            text = 'It\'s a tie'
            color = 'gray'

        self.canvas.delete("all")
        self.canvas.create_text(self.size_of_board / 2, self.size_of_board / 3, font="cmr 60 bold", fill=color, text=text)

        score_text = f'Scores\nPlayer 1: {player1_score}\nPlayer 2: {player2_score}'
        self.canvas.create_text(self.size_of_board / 2, 5 * self.size_of_board / 8, font="cmr 40 bold", fill=self.Green_color, text=score_text)

        self.reset_board = True

        self.canvas.create_text(self.size_of_board / 2, 15 * self.size_of_board / 16, font="cmr 20 bold", fill="gray", text='Click to play again')

    def refresh_board(self):
        for i in range(self.number_of_dots):
            x = i*self.distance_between_dots+self.distance_between_dots/2
            self.canvas.create_line(x, self.distance_between_dots/2, x, self.size_of_board-self.distance_between_dots/2, fill='gray', dash=(2, 2))
            self.canvas.create_line(self.distance_between_dots/2, x, self.size_of_board-self.distance_between_dots/2, x, fill='gray', dash=(2, 2))

        for i in range(self.number_of_dots):
            for j in range(self.number_of_dots):
                start_x = i*self.distance_between_dots+self.distance_between_dots/2
                end_x = j*self.distance_between_dots+self.distance_between_dots/2
                self.canvas.create_oval(start_x-self.dot_width/2, end_x-self.dot_width/2, start_x+self.dot_width/2, end_x+self.dot_width/2, fill=self.dot_color, outline=self.dot_color)

    def display_turn_text(self):
        text = 'Next turn: Player 1' if self.player1_turn else 'Next turn: Player 2'
        color = self.player1_color if self.player1_turn else self.player2_color

        self.turntext_handle.config(text=text, fg=color)

    def shade_box(self, box, color):
        start_x = self.distance_between_dots / 2 + box[1] * self.distance_between_dots + self.edge_width/2
        start_y = self.distance_between_dots / 2 + box[0] * self.distance_between_dots + self.edge_width/2
        end_x = start_x + self.distance_between_dots - self.edge_width
        end_y = start_y + self.distance_between_dots - self.edge_width
        self.canvas.create_rectangle(start_x, start_y, end_x, end_y, fill=color, outline='')

    def click(self, event):
        if not self.reset_board:
            grid_position = [event.x, event.y]
            logical_position, valid_input = self.convert_grid_to_logical_position(grid_position)
            if valid_input and not self.is_grid_occupied(logical_position, valid_input):
                self.update_board(valid_input, logical_position)
                self.make_edge(valid_input, logical_position)
                self.mark_box()
                self.refresh_board()
                self.player1_turn = not self.player1_turn  # Switch turns after every move
                if self.is_gameover():
                    self.display_gameover()
                else:
                    self.display_turn_text()
        else:
            self.canvas.delete("all")
            self.play_again()
            self.reset_board = False

game_instance = Dots_and_Boxes()
