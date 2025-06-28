from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class ReadmeTemplate(BaseModel):
    id: str
    name: str
    description: str
    style: str
    sections: List[str]
    preview: str
    is_premium: bool = False


class ReadmeSection(BaseModel):
    id: str
    name: str
    description: str
    template: str
    is_required: bool = False
    order: int = 0


class StyleConfig(BaseModel):
    name: str
    description: str
    sections: List[ReadmeSection]
    badges: bool = True
    table_of_contents: bool = True
    installation_section: bool = True
    usage_section: bool = True
    contributing_section: bool = True
    license_section: bool = True


class TemplateListResponse(BaseModel):
    templates: List[ReadmeTemplate]
    styles: List[StyleConfig]
    total: int
