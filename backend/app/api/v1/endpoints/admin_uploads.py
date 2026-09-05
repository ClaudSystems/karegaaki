from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_admin
import os
import uuid

router = APIRouter(prefix="/admin/uploads", tags=["Admin - Uploads"])

UPLOAD_DIR = "uploads/products"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/product-image")
async def upload_product_image(
        file: UploadFile = File(...),
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    # Validar tipo de arquivo
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        return {"error": "Formato de imagem não suportado. Use JPEG, PNG, WEBP ou GIF."}, 400

    # Validar tamanho (máx 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        return {"error": "Imagem muito grande. Máximo 5MB."}, 400

    # Gerar nome único
    extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{uuid.uuid4().hex}.{extension}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    # Salvar arquivo
    with open(filepath, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/products/{filename}"

    return {
        "image_url": image_url,
        "filename": filename,
        "message": "Imagem enviada com sucesso"
    }