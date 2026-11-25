import urllib.request, json, io
from PIL import Image

url = "https://admin.pintaara.com/api/products/PD-PD-CS-002"
data = json.loads(urllib.request.urlopen(url).read())["data"]
print("Product:", data["design_code"])
for i, img in enumerate(data["images"]):
    try:
        raw = urllib.request.urlopen(img["url"], timeout=5).read()
        im = Image.open(io.BytesIO(raw)).convert("RGB")
        # Sample non-white pixels
        w, h = im.size
        pts = [(x, y) for y in range(h//3, 2*h//3, 20) for x in range(w//3, 2*w//3, 20) if sum(im.getpixel((x, y))) < 700]
        if pts:
            avg_r = sum(im.getpixel(p)[0] for p in pts) // len(pts)
            avg_g = sum(im.getpixel(p)[1] for p in pts) // len(pts)
            avg_b = sum(im.getpixel(p)[2] for p in pts) // len(pts)
            color = f"R={avg_r} G={avg_g} B={avg_b}"
        else:
            color = "no non-white pixels found"
        print(f"[{i}] finish_key={img.get('finish_key')} primary={img.get('is_primary')} {color} url={img['url'].split('/')[-1]}")
    except Exception as e:
        print(f"[{i}] err: {e}")
