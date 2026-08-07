from pydantic import BaseModel, ConfigDict, field_serializer
from uuid import UUID
from datetime import datetime


class AppBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    @field_serializer("id", check_fields=False)
    def serialize_uuid(self, value, _info):
        if isinstance(value, UUID):
            return str(value)
        return value

    @field_serializer("*", check_fields=False)
    def serialize_datetime(self, value, _info):
        if isinstance(value, datetime):
            return value.isoformat()
        return value