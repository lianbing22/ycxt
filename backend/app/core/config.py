from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "YCXT Analysis Service"
    database_url: str = "sqlite:///./app.db"
    scheduler_interval_seconds: int = 60


settings = Settings()
