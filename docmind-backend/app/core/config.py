from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    DATABASE_URL: str
    CHROMA_PERSIST_DIRECTORY: str
    UPLOAD_DIR: str
    GEMINI_API_KEY: str

    # Official Pydantic v2 way to force loading from the external environment file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
