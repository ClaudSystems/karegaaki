from sqlalchemy import Column, String, Integer, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import BaseModel


class SavedCart(BaseModel):
    __tablename__ = "saved_carts"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    items_json = Column(JSONB, nullable=False, default=[])
    # [{"product_id": "uuid", "quantity": 2}, ...]
    total_credits = Column(Numeric(10, 2), default=0)

    def __repr__(self):
        return f"<SavedCart user={self.user_id}>"