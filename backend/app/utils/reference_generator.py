from datetime import datetime
import random


def generate_reference(prefix: str) -> str:
    """Gera referência única: PREFIX-YYYYMMDD-XXX"""
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_num = random.randint(1, 999)
    return f"#{prefix}-{date_str}-{random_num:03d}"