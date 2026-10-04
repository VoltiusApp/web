import sys
from PIL import Image
out, cols, *files = sys.argv[1:]
cols = int(cols)
ims = [Image.open(f) for f in files]
w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w + (cols - 1) * 6, rows * h + (rows - 1) * 6), (255, 0, 255))
for i, im in enumerate(ims):
    sheet.paste(im, ((i % cols) * (w + 6), (i // cols) * (h + 6)))
sheet.save(out)
