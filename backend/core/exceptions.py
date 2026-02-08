from fastapi import HTTPException, status

class BaseAPIException(HTTPException):
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail: str = "Internal Server Error"

    def __init__(self, detail: str = None):
        if detail:
            self.detail = detail
        super().__init__(status_code=self.status_code, detail=self.detail)

class EntityNotFoundException(BaseAPIException):
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Entity not found"

class BadRequestException(BaseAPIException):
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Bad Request"

class UnauthorizedException(BaseAPIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Unauthorized"
    headers = {"WWW-Authenticate": "Bearer"}
    
    def __init__(self, detail: str = None):
        super().__init__(detail)
        # Re-apply headers for 401
        self.headers = {"WWW-Authenticate": "Bearer"}

class ForbiddenException(BaseAPIException):
    status_code = status.HTTP_403_FORBIDDEN
    detail = "Forbidden"

class ConflictException(BaseAPIException):
    status_code = status.HTTP_409_CONFLICT
    detail = "Resource conflict"
