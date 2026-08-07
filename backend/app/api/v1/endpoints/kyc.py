from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.kyc import CustomerProfile
from pydantic import BaseModel

router = APIRouter(prefix="/kyc", tags=["KYC"])


class KycSubmitRequest(BaseModel):
    document_type: str  # BI, Passaporte
    document_number: str


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
            "credit_score": 0,
            "max_credit_limit": 500,
            "document_verified": False,
            "can_upgrade_to": "verified",
        }

    return {
        "kyc_level": profile.kyc_level,
        "credit_score": float(profile.credit_score),
        "max_credit_limit": float(profile.max_credit_limit),
        "document_verified": profile.document_verified,
        "document_type": profile.document_type,
        "can_upgrade_to": "premium" if profile.kyc_level == "verified" else "verified",
    }


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
    profile.kyc_level = "verified"  # Admin pode rejeitar depois
    profile.document_verified = True
    profile.max_credit_limit = 5000

    # Verificar se pode subir para premium
    if profile.total_transactions >= 50 and profile.credit_score >= 70:
        profile.kyc_level = "premium"
        profile.max_credit_limit = 50000

    await db.flush()
    await db.commit()

    return {
        "message": "KYC submetido com sucesso",
        "kyc_level": profile.kyc_level,
        "max_credit_limit": float(profile.max_credit_limit),
    }


@router.post("/upload-document")
async def upload_document(
        file: UploadFile = File(...),
        doc_type: str = "bi_front",
        current_user=Depends(get_current_user),
):
    # Guardar ficheiro no disco/S3
    # Aqui guardamos localmente para desenvolvimento
    import os
    upload_dir = f"uploads/kyc/{current_user.id}"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = f"{upload_dir}/{doc_type}_{file.filename}"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return {"message": "Documento enviado", "file": file_path}