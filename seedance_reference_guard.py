"""Seedance 2.x reference routing helpers.

Seedance 2.x accepts multimodal image/video/audio references, but BytePlus
blocks raw real-person image/video references. Authorized real-person material
must go through the LAS material/virtual portrait library and be referenced as
asset://<ASSET_ID>. This module keeps that policy explicit for Dola's agent
brain so it never retries a known-blocked raw portrait.
"""

from dataclasses import dataclass
from typing import Iterable, Optional
import re


REAL_PERSON_BLOCK_PATTERNS = (
    "real person",
    "real human",
    "real people",
    "real-person",
    "may contain a real person",
    "真人",
    "真实人物",
)


@dataclass(frozen=True)
class SeedanceReference:
    kind: str
    value: str
    role: str = "reference"


def is_las_asset(value: str) -> bool:
    return value.strip().lower().startswith("asset://")


def is_remote_reference(value: str) -> bool:
    value = value.strip().lower()
    return value.startswith(("http://", "https://", "tos://", "asset://"))


def classify_reference_error(message: str) -> Optional[str]:
    normalized = message.lower()
    if any(pattern in normalized for pattern in REAL_PERSON_BLOCK_PATTERNS):
        return "REAL_PERSON_REFERENCE_REQUIRES_ASSET"
    return None


def validate_seedance_25_references(
    images: Iterable[str] = (),
    video: Optional[str] = None,
    audio: Optional[str] = None,
) -> None:
    images = [x.strip() for x in images if x and x.strip()]
    if len(images) > 30:
        raise ValueError("Seedance 2.5 supports at most 30 reference images.")

    for value in images:
        if not is_remote_reference(value):
            raise ValueError(
                "Image references must be public URLs, TOS paths, or authorized asset:// IDs."
            )

    if video and not is_remote_reference(video):
        raise ValueError(
            "Video references must be public URLs, TOS paths, or authorized asset:// IDs."
        )

    if audio and not is_remote_reference(audio):
        raise ValueError(
            "Audio references must be public URLs, TOS paths, or authorized asset:// IDs."
        )


def build_seedance_content(
    prompt: str,
    images: Iterable[str] = (),
    video: Optional[str] = None,
    audio: Optional[str] = None,
):
    """Build the provider-neutral content array used by the Dola/ModelArk adapter."""
    validate_seedance_25_references(images, video, audio)

    content = [{"type": "text", "text": prompt.strip()}]
    for value in images:
        content.append(
            {
                "type": "image_url",
                "image_url": {"url": value.strip()},
                "role": "reference_image",
            }
        )
    if video:
        content.append(
            {
                "type": "video_url",
                "video_url": {"url": video.strip()},
                "role": "reference_video",
            }
        )
    if audio:
        content.append(
            {
                "type": "audio_url",
                "audio_url": {"url": audio.strip()},
                "role": "reference_audio",
            }
        )
    return content
