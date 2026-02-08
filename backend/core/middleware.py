from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import time
import uuid
from .logger import logger
from .exceptions import BaseAPIException

class GlobalExceptionHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        # Inject request ID for tracing (can be accessed in routes too if needed)
        request.state.request_id = request_id
        
        try:
            response = await call_next(request)
            
            process_time = time.time() - start_time
            logger.info(
                f"Request: {request.method} {request.url.path} | "
                f"Status: {response.status_code} | "
                f"Duration: {process_time:.4f}s | "
                f"ID: {request_id}"
            )
            
            return response
            
        except BaseAPIException as exc:
            # Handle known custom exceptions
            logger.warning(
                f"API Exception: {request.method} {request.url.path} | "
                f"Error: {exc.detail} | "
                f"ID: {request_id}"
            )
            return JSONResponse(
                status_code=exc.status_code,
                content={"detail": exc.detail, "request_id": request_id},
                headers=getattr(exc, "headers", None)
            )
            
        except Exception as exc:
            # Handle unhandled server errors
            logger.error(
                f"Unhandled Exception: {request.method} {request.url.path} | "
                f"Error: {str(exc)} | "
                f"ID: {request_id}",
                exc_info=True
            )
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal Server Error", "request_id": request_id}
            )
