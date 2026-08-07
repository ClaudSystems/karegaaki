"""
Remove class Config antigo dos schemas.
"""
import os
import re

SCHEMAS_DIR = os.path.join(os.path.dirname(__file__), "..", "app", "schemas")

FILES = ["auth.py", "product.py", "credit.py", "wallet.py", "transaction.py"]


def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove blocos "class Config:" antigos
    content = re.sub(r'\n\s+class Config:\s*\n\s+from_attributes = True\s*', '\n', content)

    # Remove import Optional se não for usado (mantém)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"  ✅ Limpo: {os.path.basename(filepath)}")


def main():
    print("🔧 A limpar schemas...\n")
    for filename in FILES:
        filepath = os.path.join(SCHEMAS_DIR, filename)
        if os.path.exists(filepath):
            fix_file(filepath)
    print("\n✅ Concluído!")


if __name__ == "__main__":
    main()