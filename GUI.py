import tkinter as tk
from tkinter import ttk
from generate import *
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# In both GUI.py and generate.py
import settings

# Use like this
settings.problems_per_row
settings.lines_per_problem
settings.line_height
settings.vertical_margin

def create_gui():
    root = tk.Tk()
    root.title("Math Problem Generator")

    # Addition
    ttk.Label(root, text="Number of Addition Problems:").grid(row=0, column=0)
    num_addition = tk.Spinbox(root, from_=1, to=20)
    num_addition.grid(row=0, column=1)

    ttk.Label(root, text="Addition Difficulty:").grid(row=0, column=2)
    digits_addition = tk.Spinbox(root, from_=1, to=10)
    digits_addition.grid(row=0, column=3)

    # Subtraction
    ttk.Label(root, text="Number of Subtraction Problems:").grid(row=1, column=0)
    num_subtraction = tk.Spinbox(root, from_=1, to=20)
    num_subtraction.grid(row=1, column=1)

    ttk.Label(root, text="Subtraction Difficulty:").grid(row=1, column=2)
    digits_subtraction = tk.Spinbox(root, from_=1, to=10)
    digits_subtraction.grid(row=1, column=3)

    # Multiplication
    ttk.Label(root, text="Number of Multiplication Problems:").grid(row=2, column=0)
    num_multiplication = tk.Spinbox(root, from_=1, to=20)
    num_multiplication.grid(row=2, column=1)

    ttk.Label(root, text="Multiplication Difficulty:").grid(row=2, column=2)
    digits_multiplication = tk.Spinbox(root, from_=1, to=10)
    digits_multiplication.grid(row=2, column=3)

    # Division - Number of Problems
    ttk.Label(root, text="Number of Division Problems:").grid(row=3, column=0)
    num_division = tk.Spinbox(root, from_=1, to=20)
    num_division.grid(row=3, column=1)

    # Division - Overall Difficulty
    ttk.Label(root, text="Division Difficulty:").grid(row=3, column=2)
    digits_division = tk.Spinbox(root, from_=1, to=10)
    digits_division.grid(row=3, column=3)

    # Division - Numerator Difficulty
    ttk.Label(root, text="Division Numerator Difficulty:").grid(row=3, column=4)
    digits_division_num = tk.Spinbox(root, from_=1, to=10)
    digits_division_num.grid(row=3, column=5)

    # Division - Denominator Difficulty
    ttk.Label(root, text="Division Denominator Difficulty:").grid(row=3, column=6)
    digits_division_denom = tk.Spinbox(root, from_=1, to=10)
    digits_division_denom.grid(row=3, column=7)


    generate_btn = ttk.Button(root, text="Generate Worksheet", command=lambda: generate_worksheet(
        num_addition.get(), 
        digits_addition.get(), 
        num_subtraction.get(), 
        digits_subtraction.get(), 
        num_multiplication.get(), 
        digits_multiplication.get(), 
        num_division.get(), 
        digits_division.get(),
        settings.problems_per_row,   # Assuming these are accessed from a settings module
        settings.lines_per_problem,
        settings.line_height,
        settings.vertical_margin,
        digits_division_num.get(), digits_division_denom.get(),
    ))
    generate_btn.grid(row=6, column=0, columnspan=2)

    settings_btn = ttk.Button(root, text="Layout Settings", command=open_settings)
    settings_btn.grid(row=7, column=0, columnspan=4)

    return root




def open_settings():
    settings_window = tk.Toplevel()
    settings_window.title("Layout Settings")

    # Grid layout parameters
    tk.Label(settings_window, text="Problems per Row:").grid(row=0, column=0)
    problems_per_row_var = tk.IntVar(value=4)
    tk.Spinbox(settings_window, from_=1, to=10, textvariable=problems_per_row_var).grid(row=0, column=1)

    tk.Label(settings_window, text="Lines per Problem:").grid(row=1, column=0)
    lines_per_problem_var = tk.IntVar(value=5)
    tk.Spinbox(settings_window, from_=1, to=10, textvariable=lines_per_problem_var).grid(row=1, column=1)

    tk.Label(settings_window, text="Line Height:").grid(row=2, column=0)
    line_height_var = tk.IntVar(value=20)
    tk.Spinbox(settings_window, from_=10, to=30, textvariable=line_height_var).grid(row=2, column=1)

    tk.Label(settings_window, text="Vertical Margin:").grid(row=3, column=0)
    vertical_margin_var = tk.IntVar(value=20)
    tk.Spinbox(settings_window, from_=10, to=50, textvariable=vertical_margin_var).grid(row=3, column=1)

    tk.Button(settings_window, text="Apply", command=lambda: apply_settings(problems_per_row_var.get(), lines_per_problem_var.get(), line_height_var.get(), vertical_margin_var.get())).grid(row=4, column=0, columnspan=2)

def apply_settings(new_problems_per_row, new_lines_per_problem, new_line_height, new_vertical_margin):
    settings.problems_per_row = new_problems_per_row
    settings.lines_per_problem = new_lines_per_problem
    settings.line_height = new_line_height
    settings.vertical_margin = new_vertical_margin




if __name__ == "__main__":
    gui = create_gui()
    gui.mainloop()
