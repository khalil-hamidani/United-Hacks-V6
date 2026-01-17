from cryptography.fernet import Fernet

from app.core.config import settings


def get_fernet() -> Fernet:
    return Fernet(settings.LEGACY_ENCRYPTION_KEY.encode())


def encrypt_content(content: str) -> str:
    f = get_fernet()
    return f.encrypt(content.encode()).decode()


def decrypt_content(encrypted_content: str) -> str:
    f = get_fernet()
    return f.decrypt(encrypted_content.encode()).decode()
