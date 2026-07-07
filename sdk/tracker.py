rom __future__ import annotations

from contextlib import ContextDecorator
import json
import os
import threading
from time import perf_counter
from typing import Any
from urllib import request as urllib_request

from .clients import extract_token_usage


class CostTracker(ContextDecorator):
    def __init__(
        self,
        api_secret: str | None = None,
        server_url: str | None = None,
        provider: str = "unknown",
        model: str = "unknown",
        model_type: str = "CLOUD",
        project_id: str | None = None,
        project_name: str | None = None,
        agent_name: str | None = None,
        agent_id: str | None = None,
        tags: list[str] | tuple[str, ...] | None = None,
        request_name: str | None = None,
        timeout: float = 0.25,
        enabled: bool = True,
        fail_silently: bool = True,
    ):
        self.api_secret = api_secret or os.getenv("COSTAI_API_SECRET", "")
        self.server_url = server_url or os.getenv(
            "COSTAI_SERVER_URL", "http://localhost:3000/api/telemetry"
        )
        self.provider = provider
        self.model = model
        self.model_type = model_type.upper()
        self.project_id = project_id
        self.project_name = project_name
        self.agent_name = agent_name
        self.agent_id = agent_id
        self.tags = self._clean_tags(tags)
        self.request_name = request_name
        self.timeout = timeout
        self.enabled = enabled
        self.fail_silently = fail_silently

        self.prompt_tokens = 0
        self.completion_tokens = 0
        self.ttft_ms: int | None = None
        self.metadata: dict[str, Any] = {}
        self._started_at = 0.0

    def __enter__(self) -> "CostTracker":
        self._started_at = perf_counter()
        return self

    def record_tokens(
        self, prompt_tokens: int | None = 0, completion_tokens: int | None = 0
    ) -> None:
        self.prompt_tokens += int(prompt_tokens or 0)
        self.completion_tokens += int(completion_tokens or 0)

    def record_response(self, response: Any) -> Any:
        prompt_tokens, completion_tokens = extract_token_usage(response)
        self.record_tokens(prompt_tokens, completion_tokens)
        return response

    def record_ttft(self) -> None:
        if self.ttft_ms is None and self._started_at:
            self.ttft_ms = int((perf_counter() - self._started_at) * 1000)

    def add_metadata(self, **metadata: Any) -> None:
        self.metadata.update(metadata)

    def _clean_tags(self, tags: list[str] | tuple[str, ...] | None) -> list[str]:
        if not tags:
            return []

        cleaned: list[str] = []
        seen: set[str] = set()

        for tag in tags:
            value = str(tag).strip()[:64]
            if value and value not in seen:
                cleaned.append(value)
                seen.add(value)

        return cleaned[:24]

    def __exit__(self, exc_type: Any, exc: Any, tb: Any) -> bool:
        if not self.enabled or not self.api_secret:
            return False

        latency_ms = int((perf_counter() - self._started_at) * 1000)
        total_tokens = self.prompt_tokens + self.completion_tokens
        tps = total_tokens / (latency_ms / 1000) if latency_ms > 0 else 0

        payload = {
            "api_secret": self.api_secret,
            "provider": self.provider,
            "model": self.model,
            "model_type": self.model_type,
            "project_id": self.project_id,
            "project_name": self.project_name,
            "agent_name": self.agent_name,
            "agent_id": self.agent_id,
            "tags": self.tags,
            "request_name": self.request_name,
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "ttft_ms": self.ttft_ms,
            "latency_ms": latency_ms,
            "tps": tps,
            "metadata": self.metadata or None,
        }

        thread = threading.Thread(target=self._send_safely, args=(payload,), daemon=True)
        thread.start()

        return False

    def _send_safely(self, payload: dict[str, Any]) -> None:
        try:
            body = json.dumps({k: v for k, v in payload.items() if v is not None}).encode(
                "utf-8"
            )
            req = urllib_request.Request(
                self.server_url,
                data=body,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_secret}",
                },
                method="POST",
            )
            urllib_request.urlopen(req, timeout=self.timeout).close()
        except Exception:
            if not self.fail_silently:
                raise
