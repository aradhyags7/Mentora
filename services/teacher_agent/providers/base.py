"""
TEACHER MODEL ABSTRACT BASE CLASS (Model Gateway Abstraction)
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Type
from pydantic import BaseModel


class ModelMessage(BaseModel):
    role: str  # 'system', 'user', 'assistant'
    content: str


class TeacherModel(ABC):
    @abstractmethod
    async def generate(
        self,
        messages: List[ModelMessage],
        response_schema: Optional[Type[BaseModel]] = None,
        context: Optional[Dict[str, Any]] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> str:
        """
        Generates completion from foundation model provider.
        Returns the raw model text response.
        """
        pass
