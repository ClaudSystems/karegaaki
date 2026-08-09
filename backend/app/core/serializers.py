# app/core/serializers.py
from pydantic import BaseModel, ConfigDict, field_serializer, model_validator
from uuid import UUID
from datetime import datetime
from typing import Any


class AppBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    @classmethod
    def convert_types(cls, data: Any) -> Any:
        """Converte UUID e datetime para str antes da validação."""
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, UUID):
                    data[key] = str(value)
                elif isinstance(value, datetime):
                    data[key] = value.isoformat()
        return data

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