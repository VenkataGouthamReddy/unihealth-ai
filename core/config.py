from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "UniHealth AI API"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "unihealth"
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # Email config
    MAIL_USERNAME: str = "noreply@unihealth.ai"
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@unihealth.ai"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: str = "UniHealth AI"

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }


settings = Settings()
