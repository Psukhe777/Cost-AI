from __future__ import annotations

import hashlib
import json
import os
from time import perf_counter
from typing import Any
from urllib import request as urllib_request

_MISSING = object()


def _read_attr_or_key(value: Any, name: str, default: Any = None) -> Any:
    if value is None:
        return default
    if isinstance(value, dict):
        return value.get(name, default)
    return getattr(value, name, default)


def _first_present(*values: Any) -> Any:
    for value in values:
        if value is not _MISSING and value is not None:
            return value
    return 0


def _clean_text(value: Any, fallback: str = "unknown", max_length: int = 200) -> str:
    if value is None:
        return fallback
    cleaned = str(value).strip()
    if not cleaned:
        return fallback
    return cleaned[:max_length]


def _optional_text(value: Any, max_length: int = 200) -> str | None:
    if value is None:
        return None
    cleaned = str(value).strip()
    return cleaned[:max_length] or None


def _clean_tags(tags: list[str] | tuple[str, ...] | None) -> list[str]:
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


def _estimate_tokens_from_text(value: str) -> int:
    cleaned = value.strip()
    if not cleaned:
        return 0
    return max(1, (len(cleaned) + 3) // 4)


def _message_text(messages: list[dict[str, Any]] | None) -> str:
    if not messages:
        return ""
    parts: list[str] = []
    for message in messages:
        content = message.get("content")
        if isinstance(content, str):
            parts.append(content)
        elif isinstance(content, list):
            parts.extend(str(item.get("text", "")) for item in content if isinstance(item, dict))
    return "\n".join(part for part in parts if part)


def extract_token_usage(response: Any) -> tuple[int, int]:
    """Extract prompt and completion tokens from common cloud and local responses."""
    usage = _read_attr_or_key(response, "usage", response)

    prompt = _first_present(
        _read_attr_or_key(usage, "prompt_tokens", _MISSING),
        _read_attr_or_key(usage, "input_tokens", _MISSING),
        _read_attr_or_key(response, "prompt_eval_count", _MISSING),
    )
    completion = _first_present(
        _read_attr_or_key(usage, "completion_tokens", _MISSING),
        _read_attr_or_key(usage, "output_tokens", _MISSING),
        _read_attr_or_key(response, "eval_count", _MISSING),
    )

    return int(prompt), int(completion)


class CostAIClient:
    def __init__(
        self,
        api_secret: str | None = None,
        server_url: str | None = None,
        provider: str = "openai",
        model: str = "gpt-4o",
        model_type: str = "CLOUD",
        gateway_url: str | None = None,
        external_api_key: str | None = None,
        timeout: float = 5.0,
        mock_mode: bool = False,
        fail_silently: bool = True,
    ):
        self.api_secret = api_secret or os.getenv("COSTAI_API_SECRET", "")
        self.server_url = server_url or os.getenv(
            "COSTAI_SERVER_URL", "http://localhost:3000/api/telemetry"
        )
        self.provider = _clean_text(provider)
        self.model = _clean_text(model)
        self.model_type = _clean_text(model_type, "CLOUD").upper()
        self.gateway_url = gateway_url
        self.external_api_key = external_api_key
        self.timeout = timeout
        self.mock_mode = mock_mode
        self.fail_silently = fail_silently

    def track_request(
        self,
        prompt: str = "",
        *,
        messages: list[dict[str, Any]] | None = None,
        provider: str | None = None,
        model: str | None = None,
        model_type: str | None = None,
        project_id: str | None = None,
        project_name: str | None = None,
        agent_name: str | None = None,
        agent_id: str | None = None,
        tags: list[str] | tuple[str, ...] | None = None,
        request_name: str | None = None,
        metadata: dict[str, Any] | None = None,
        prompt_tokens: int | None = None,
        completion_tokens: int | None = None,
        external_payload: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        provider_name = _clean_text(provider, self.provider)
        model_name = _clean_text(model, self.model)
        normalized_model_type = _clean_text(model_type, self.model_type).upper()

        started_at = perf_counter()
        if self.mock_mode:
            response = self._mock_response(
                prompt=prompt,
                messages=messages,
                model=model_name,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
            )
        else:
            response = self._call_external_gateway(
                prompt=prompt,
                messages=messages,
                model=model_name,
                external_payload=external_payload,
            )

        detected_prompt_tokens, detected_completion_tokens = extract_token_usage(response)
        final_prompt_tokens = int(
            prompt_tokens if prompt_tokens is not None else detected_prompt_tokens
        )
        final_completion_tokens = int(
            completion_tokens
            if completion_tokens is not None
            else detected_completion_tokens
        )
        latency_ms = int((perf_counter() - started_at) * 1000)
        total_tokens = final_prompt_tokens + final_completion_tokens
        tps = total_tokens / (latency_ms / 1000) if latency_ms > 0 else 0

        self._send_telemetry(
            {
                "api_secret": self.api_secret,
                "provider": provider_name,
                "model": model_name,
                "model_type": "LOCAL" if normalized_model_type == "LOCAL" else "CLOUD",
                "project_id": _optional_text(project_id),
                "project_name": _optional_text(project_name),
                "agent_name": _optional_text(agent_name),
                "agent_id": _optional_text(agent_id),
                "tags": _clean_tags(tags),
                "request_name": _optional_text(request_name),
                "prompt_tokens": final_prompt_tokens,
                "completion_tokens": final_completion_tokens,
                "latency_ms": latency_ms,
                "tps": tps,
                "metadata": metadata or None,
            }
        )

        return response

    def _mock_response(
        self,
        *,
        prompt: str,
        messages: list[dict[str, Any]] | None,
        model: str,
        prompt_tokens: int | None,
        completion_tokens: int | None,
    ) -> dict[str, Any]:
        source_text = "\n".join(part for part in [prompt, _message_text(messages)] if part)
        stable_hash = hashlib.sha256(source_text.encode("utf-8")).hexdigest()
        final_prompt_tokens = (
            int(prompt_tokens)
            if prompt_tokens is not None
            else _estimate_tokens_from_text(source_text)
        )
        final_completion_tokens = (
            int(completion_tokens)
            if completion_tokens is not None
            else max(8, min(128, final_prompt_tokens // 2 + 8))
        )
        content = {
            "ok": True,
            "mock": True,
            "id": stable_hash[:16],
            "summary": "Cost AI mock response",
        }

        return {
            "id": f"costai-mock-{stable_hash[:24]}",
            "object": "chat.completion",
            "model": model,
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": json.dumps(content, sort_keys=True),
                    },
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": final_prompt_tokens,
                "completion_tokens": final_completion_tokens,
                "total_tokens": final_prompt_tokens + final_completion_tokens,
            },
        }

    def _call_external_gateway(
        self,
        *,
        prompt: str,
        messages: list[dict[str, Any]] | None,
        model: str,
        external_payload: dict[str, Any] | None,
    ) -> dict[str, Any]:
        if not self.gateway_url:
            raise ValueError("gateway_url is required when mock_mode is False")

        payload = external_payload or {
            "model": model,
            "messages": messages or [{"role": "user", "content": prompt}],
        }
        headers = {"Content-Type": "application/json"}
        if self.external_api_key:
            headers["Authorization"] = f"Bearer {self.external_api_key}"

        body = json.dumps(payload).encode("utf-8")
        req = urllib_request.Request(
            self.gateway_url,
            data=body,
            headers=headers,
            method="POST",
        )

        with urllib_request.urlopen(req, timeout=self.timeout) as response:
            response_body = response.read().decode("utf-8")
            return json.loads(response_body)

    def _send_telemetry(self, payload: dict[str, Any]) -> None:
        if not self.api_secret:
            return

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
