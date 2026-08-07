import os

DIR = r"W:\KaregaAki\backend\app\api\v1\endpoints"

# credits.py
path = os.path.join(DIR, "credits.py")
with open(path, "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace("return [p.model_dump() for p in await service.get_packages()]", "return [p.model_dump(mode=\"json\") for p in await service.get_packages()]")
with open(path, "w", encoding="utf-8") as f:
    f.write(c)

# products.py
path = os.path.join(DIR, "products.py")
with open(path, "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace('"items": [p.model_dump() for p in products]', '"items": [p.model_dump(mode="json") for p in products]')
c = c.replace("return product.model_dump()", "return product.model_dump(mode=\"json\")")
with open(path, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ Endpoints atualizados com mode='json'")
