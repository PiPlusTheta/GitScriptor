from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from cryptography.fernet import Fernet
import os
import base64
import secrets

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

# Encryption settings
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    # Generate a key for development (in production, this should be set in environment)
    ENCRYPTION_KEY = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode()

# Initialize Fernet cipher
try:
    fernet = Fernet(
        ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY
    )
except Exception:
    # Fallback for development
    fernet = Fernet(Fernet.generate_key())


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def encrypt_token(token: str) -> str:
    """Encrypt a token for secure storage."""
    try:
        encrypted_token = fernet.encrypt(token.encode())
        return base64.urlsafe_b64encode(encrypted_token).decode()
    except Exception as e:
        # Fallback to basic encoding for development
        return base64.urlsafe_b64encode(token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    """Decrypt a stored token."""
    try:
        encrypted_bytes = base64.urlsafe_b64decode(encrypted_token.encode())
        decrypted_token = fernet.decrypt(encrypted_bytes)
        return decrypted_token.decode()
    except Exception as e:
        # Fallback to basic decoding for development
        try:
            return base64.urlsafe_b64decode(encrypted_token.encode()).decode()
        except Exception:
            # If all else fails, return as-is (for development only)
            return encrypted_token
