"""Application-wide dependency providers."""
from __future__ import annotations

from functools import lru_cache

from .services.importer import Importer, SimpleAnalysis
from .storage import UploadStorage, create_default_storage


@lru_cache
def get_storage() -> UploadStorage:
    return create_default_storage()


@lru_cache
def get_importer() -> Importer:
    storage = get_storage()
    return Importer(storage, SimpleAnalysis())
