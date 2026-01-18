from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    LEGACY_ENCRYPTION_KEY: str
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Featherless AI
    FEATHERLESS_API_KEY: str = ""
    FEATHERLESS_MODEL: str = "mistralai/Mistral-7B-Instruct-v0.2"
    FEATHERLESS_API_URL: str = "https://api.featherless.ai/v1/chat/completions"

    # Email Configuration
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
