"""
Altera BaseModel para AppBaseModel nos schemas.
"""
import os

SCHEMAS_DIR = os.path.join(os.path.dirname(__file__), "..", "app", "schemas")
FILES = ["auth.py", "product.py", "credit.py", "wallet.py", "transaction.py"]


def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Adiciona import
    if "from app.core.serializers import AppBaseModel" not in content:
        content = content.replace(
            "from pydantic import",
            "from pydantic import",
        )
        content = "from app.core.serializers import AppBaseModel\n" + content

    # Substitui BaseModel por AppBaseModel nas classes Response
    # (não substitui nas Request)
    lines = content.split("\n")
    new_lines = []
    for line in lines:
        if "class " in line and "Response" in line and "(BaseModel)" in line:
            line = line.replace("(BaseModel)", "(AppBaseModel)")
        elif "class " in line and "Filter" in line and "(BaseModel)" in line:
            line = line.replace("(BaseModel)", "(AppBaseModel)")
        new_lines.append(line)

    content = "\n".join(new_lines)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"  ✅ Corrigido: {os.path.basename(filepath)}")


def main():
    print("🔧 A corrigir schemas (v3)...\n")
    for filename in FILES:
        filepath = os.path.join(SCHEMAS_DIR, filename)
        if os.path.exists(filepath):
            fix_file(filepath)
    print("\n✅ Concluído!")


if __name__ == "__main__":
    main()