from PIL import Image, ImageDraw, ImageFont

# Define constants
WIDTH = 400  # Width of the image
HEIGHT = 200  # Height of the image
BG_COLOR = (0, 0, 255)  # Blue color for the background
TEXT_COLOR = (255, 255, 255)  # White color for the text
TEXT = "METRO"  # Text to be displayed
FONT_SIZE = 40  # Font size of the text
FONT_PATH = "arial.ttf"  # Path to the font file
LOGO_RADIUS = 80  # Radius of the logo circle

# Create a new image with blue background
image = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)

# Create a drawing context
draw = ImageDraw.Draw(image)

# Load font
font = ImageFont.truetype(FONT_PATH, FONT_SIZE)

# Calculate the x-coordinate for the text
text_width, _ = font.getsize(TEXT)
text_x = (WIDTH - text_width) // 2

# Draw the text on the image
draw.text((text_x, (HEIGHT - FONT_SIZE) // 2), TEXT, fill=TEXT_COLOR, font=font)

# Draw the circle
circle_x = WIDTH // 2
circle_y = HEIGHT // 2
draw.ellipse((circle_x - LOGO_RADIUS, circle_y - LOGO_RADIUS, circle_x + LOGO_RADIUS, circle_y + LOGO_RADIUS), fill=None, outline=TEXT_COLOR)

# Decrease font size from left to right
for x in range(WIDTH // 2, WIDTH):
    # Calculate new font size based on x-coordinate
    new_font_size = FONT_SIZE * (1 - (x - WIDTH // 2) / (WIDTH // 2))
    font = ImageFont.truetype(FONT_PATH, int(new_font_size))
    # Calculate new text width and position
    text_width, _ = font.getsize(TEXT)
    text_x = x - text_width // 2
    # Draw text
    draw.text((text_x, (HEIGHT - new_font_size) // 2), TEXT, fill=TEXT_COLOR, font=font)

# Save the image
image.save("metro_logo.png")
