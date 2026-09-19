from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """
    Wire format is camelCase to match @fleetflow/shared-types, while Python
    code keeps snake_case. FastAPI serializes responses by alias by default.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
