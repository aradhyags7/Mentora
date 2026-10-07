"""
NVIDIA NEMOTRON 3 ULTRA PROVIDER

Implements the TeacherModel interface for NVIDIA's Nemotron 3 Ultra (550B)
hosted inference API via NVIDIA NIM / integrate.api.nvidia.com.
"""

import os
import re
import json
import httpx
from pathlib import Path
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional, Type
from pydantic import BaseModel
from .base import TeacherModel, ModelMessage

# Load root .env or .env.local
_root_dir = Path(__file__).resolve().parent.parent.parent.parent
load_dotenv(_root_dir / ".env")
load_dotenv(_root_dir / ".env.local")


class NemotronProvider(TeacherModel):
    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "nvidia/nemotron-3-super-120b-a12b",
        base_url: str = "https://integrate.api.nvidia.com/v1"
    ):
        self.api_key = api_key or os.getenv("NVIDIA_API_KEY", "")
        self.model_name = model_name
        self.base_url = base_url.rstrip("/")
        self.fallback_models = [
            "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
            "meta/llama-3.2-11b-vision-instruct",
        ]

    async def generate(
        self,
        messages: List[ModelMessage],
        response_schema: Optional[Type[BaseModel]] = None,
        context: Optional[Dict[str, Any]] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> str:
        if not self.api_key:
            raise ValueError("NVIDIA_API_KEY is missing from environment. Configure .env file.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        payload_messages = [{"role": m.role, "content": m.content} for m in messages]

        candidate_models = [self.model_name] + self.fallback_models

        async with httpx.AsyncClient(timeout=9.0) as client:
            last_err = None
            for model_id in candidate_models:
                payload = {
                    "model": model_id,
                    "messages": payload_messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                try:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    if response.status_code == 200:
                        data = response.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        last_err = Exception(f"Model {model_id} returned status {response.status_code}: {response.text[:120]}")
                        continue
                except Exception as e:
                    last_err = e
                    continue

            if last_err:
                raise last_err
            raise RuntimeError("All Nemotron model endpoints failed.")
