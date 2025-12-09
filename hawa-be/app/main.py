from typing import Union
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.db.postgres import Base, engine
from app.db.models import user as user_models  # noqa: F401  # ensure model is registered
from app.db.models import weather_knowledge as weather_knowledge_models  # noqa: F401  # ensure model is registered
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.weather import router as weather_router
from app.services.weather.scheduler import start_default_scheduler
from app.core.rate_limit import (
    iot_data_limiter,
    ai_recommendation_limiter,
    get_rate_limit_exception
)
from app.core.config import get_settings

# Load environment variables from .env explicitly from project root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env", override=False)

app = FastAPI()

# CORS configuration to allow frontend (Vite) to call this API
# Include all common localhost variations for development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # React default
    "http://127.0.0.1:3000",
    "http://localhost:5174",  # Alternative Vite port
    "http://127.0.0.1:5174",
]

# CORS Middleware configuration
# Note: Cannot use allow_origins=["*"] with allow_credentials=True
# So we include common localhost variations for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # All common localhost ports
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Rate Limiting Middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """
    Rate limiting middleware for IoT data and AI recommendations
    """
    path = str(request.url.path)
    
    # Skip rate limiting for health check and auth endpoints
    if path in ["/health", "/docs", "/openapi.json", "/redoc"] or path.startswith("/auth"):
        return await call_next(request)
    
    # Get settings for dynamic rate limits
    settings = get_settings()
    
    # Update limiters with config from settings
    iot_data_limiter.max_requests = settings.iot_data_rate_limit
    ai_recommendation_limiter.max_requests = settings.ai_recommendation_rate_limit
    
    # Get client identifier (IP address or user_id if authenticated)
    client_ip = request.client.host if request.client else "unknown"
    client_key = f"ip_{client_ip}"
    
    # Check rate limit for AI recommendation endpoints
    if "/weather/recommendation" in path:
        is_allowed, retry_after = ai_recommendation_limiter.check_rate_limit(client_key)
        if not is_allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Too many AI recommendation requests. Please wait.",
                    "retry_after": retry_after,
                    "limit": ai_recommendation_limiter.max_requests,
                    "window_seconds": ai_recommendation_limiter.window_seconds
                },
                headers={"Retry-After": str(retry_after)}
            )
    
    # Check rate limit for IoT data endpoints
    elif "/weather/heatmap" in path or "/admin/spreadsheet" in path or "/weather/realtime" in path:
        is_allowed, retry_after = iot_data_limiter.check_rate_limit(client_key)
        if not is_allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Too many IoT data requests. Please wait.",
                    "retry_after": retry_after,
                    "limit": iot_data_limiter.max_requests,
                    "window_seconds": iot_data_limiter.window_seconds
                },
                headers={"Retry-After": str(retry_after)}
            )
    
    return await call_next(request)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Custom handler for validation errors - provides clearer error messages"""
    errors = exc.errors()
    error_messages = []
    
    for error in errors:
        field = " -> ".join(str(loc) for loc in error.get("loc", []))
        message = error.get("msg", "Validation error")
        error_messages.append(f"{field}: {message}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "; ".join(error_messages),
            "errors": errors,
            "expected_format": {
                "spreadsheet_id": "string (required)",
                "worksheet_name": "string (optional, default: 'Sheet1')",
                "notification": "object or null (optional)"
            }
        }
    )


@app.on_event("startup")
def on_startup() -> None:
    """
    Initialize database schema.

    Base.metadata.create_all is idempotent: it will create tables only if they
    do not exist yet, and will not drop or modify existing ones.
    """
    Base.metadata.create_all(bind=engine)

    # Include routers
    app.include_router(auth_router)
    app.include_router(admin_router)  # Admin routes - protected by get_current_admin
    app.include_router(weather_router)  # Weather routes - protected by get_current_user
    
    # Import and include realtime router (lazy import to avoid circular deps)
    from app.api.weather_realtime import router as realtime_router
    app.include_router(realtime_router)  # Realtime warnings routes

    # Start weather notification scheduler (06:00 daily, 12:00 if AQI bad)
    start_default_scheduler()
