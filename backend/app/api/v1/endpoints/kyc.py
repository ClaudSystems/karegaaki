from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.kyc import CustomerProfile
from pydantic import BaseModel
from typing import Optional
import os
import uuid
from datetime import datetime

router = APIRouter(prefix="/kyc", tags=["KYC"])

# Diretório de uploads
UPLOAD_DIR = "uploads/kyc"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Formatos permitidos
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "application/pdf"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"]
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_VIDEO_SIZE = 20 * 1024 * 1024  # 20MB


class KycSubmitRequest(BaseModel):
    document_type: str  # BI, Passaporte
    document_number: str


# ==================== STATUS ====================

@router.get("/status")
async def get_kyc_status(
        current_user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CustomerProfile).where(CustomerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        return {
            "kyc_level": "basic",
            "credit_score": 0.0,
            "max_credit_limit": 500.0,
            "document_verified": False,
            "document_type": None,
            "bi_document_uploaded": False,
            "selfie_video_uploaded": False,
            "bi_document_status": None,
            "selfie_video_status": None,
            "can_upgrade_to": "verified",
        }

    return {
        "kyc_level": profile.kyc_level,
        "credit_score": float(profile.credit_score),
        "max_credit_limit": float(profile.max_credit_limit),
        "document_verified": profile.document_verified,
        "document_type": profile.document_type,
        "document_number": profile.document_number,
        "bi_document_uploaded": profile.bi_document_uploaded,
        "selfie_video_uploaded": profile.selfie_video_uploaded,
        "bi_document_status": profile.bi_document_status,
        "selfie_video_status": profile.selfie_video_status,
        "can_upgrade_to": "premium" if profile.kyc_level == "verified" else "verified",
    }


# ==================== SUBMETER DADOS ====================

@router.post("/submit")
async def submit_kyc(
        data: KycSubmitRequest,
        current_user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CustomerProfile).where(CustomerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        profile = CustomerProfile(user_id=current_user.id)
        db.add(profile)

    profile.document_type = data.document_type
    profile.document_number = data.document_number
    profile.document_verified = False  # Aguarda verificação

    await db.flush()
    await db.commit()

    return {
        "message": "Dados submetidos com sucesso",
        "document_type": profile.document_type,
        "document_number": profile.document_number,
    }


# ==================== UPLOAD DOCUMENTO ====================

@router.post("/upload-document")
async def upload_document(
        document_type: str = Form(...),  # "bi_document" ou "selfie_video"
        file: UploadFile = File(...),
        current_user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    # Validar tipo de documento
    if document_type not in ["bi_document", "selfie_video"]:
        raise HTTPException(400, "Tipo de documento inválido. Use 'bi_document' ou 'selfie_video'.")

    # Validar formato
    if document_type == "bi_document":
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(400, f"Formato não permitido. Use: {', '.join(ALLOWED_IMAGE_TYPES)}")
        max_size = MAX_IMAGE_SIZE
    else:
        if file.content_type not in ALLOWED_VIDEO_TYPES:
            raise HTTPException(400, f"Formato não permitido. Use: {', '.join(ALLOWED_VIDEO_TYPES)}")
        max_size = MAX_VIDEO_SIZE

    # Validar tamanho
    content = await file.read()
    if len(content) > max_size:
        max_mb = max_size / (1024 * 1024)
        raise HTTPException(400, f"Ficheiro muito grande. Máximo: {max_mb:.0f}MB")

    # Criar diretório do utilizador
    user_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_dir, exist_ok=True)

    # Gerar nome único
    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "bin"
    filename = f"{document_type}_{uuid.uuid4().hex[:8]}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.{ext}"
    filepath = os.path.join(user_dir, filename)

    # Guardar ficheiro
    with open(filepath, "wb") as f:
        f.write(content)

    # Atualizar perfil
    result = await db.execute(
        select(CustomerProfile).where(CustomerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        profile = CustomerProfile(user_id=current_user.id)
        db.add(profile)

    if document_type == "bi_document":
        profile.bi_document_uploaded = True
        profile.bi_document_path = filepath
        profile.bi_document_status = "pending_review"
    else:
        profile.selfie_video_uploaded = True
        profile.selfie_video_path = filepath
        profile.selfie_video_status = "pending_review"

    # Se ambos os documentos foram enviados, atualizar KYC
    if profile.bi_document_uploaded and profile.selfie_video_uploaded:
        if profile.document_verified:
            profile.kyc_level = "verified"
            profile.max_credit_limit = 5000.0

    await db.flush()
    await db.commit()

    return {
        "message": "Documento enviado com sucesso",
        "document_type": document_type,
        "filename": filename,
        "status": "pending_review",
        "uploaded_at": datetime.utcnow().isoformat(),
    }