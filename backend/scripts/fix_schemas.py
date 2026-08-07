"""
Script para adicionar model_config em todos os schemas de resposta.
Executar: python scripts/fix_schemas.py
"""
import os
import re

SCHEMAS_DIR = os.path.join(os.path.dirname(__file__), "..", "app", "schemas")

FILES_TO_FIX = [
    "auth.py",
    "product.py",
    "credit.py",
    "wallet.py",
    "transaction.py",
]


def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Verificar se já tem model_config
    if "model_config = ConfigDict(from_attributes=True)" in content:
        print(f"  ✅ Já corrigido: {os.path.basename(filepath)}")
        return

    # Adicionar import ConfigDict se não existir
    if "from pydantic import" in content and "ConfigDict" not in content:
        content = content.replace(
            "from pydantic import",
            "from pydantic import ConfigDict,",
        )

    # Adicionar model_config em classes Response (não em Request)
    # Encontra classes que têm "class" e "Response" no nome
    lines = content.split("\n")
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        new_lines.append(line)

        # Deteta classe Response
        if line.strip().startswith("class ") and ("Response" in line or "Filter" in line):
            # Encontra a linha seguinte que não seja vazia
            j = i + 1
            while j < len(lines) and lines[j].strip() == "":
                new_lines.append(lines[j])
                j += 1

            # Adiciona model_config se não existir
            if j < len(lines) and "model_config" not in lines[j]:
                indent = "    "
                new_lines.append(f"{indent}model_config = ConfigDict(from_attributes=True)")
                print(f"  + model_config em: {line.strip()}")

            i = j
        else:
            i += 1

    content = "\n".join(new_lines)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"  ✅ Corrigido: {os.path.basename(filepath)}")


def main():
    print("🔧 A corrigir schemas...\n")
    for filename in FILES_TO_FIX:
        filepath = os.path.join(SCHEMAS_DIR, filename)
        if os.path.exists(filepath):
            fix_file(filepath)
        else:
            print(f"  ⚠️  Não encontrado: {filename}")
    print("\n✅ Concluído!")


if __name__ == "__main__":
    main()