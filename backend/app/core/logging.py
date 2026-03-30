"""Structured logging with loguru."""
import sys
from loguru import logger
from app.core.config import settings

def setup_logging():
    logger.remove()
    logger.add(sys.stdout, level=settings.LOG_LEVEL, colorize=True,
               format="<green>{time:HH:mm:ss}</green> | <level>{level}</level> | <cyan>{name}</cyan> - {message}")
    logger.add(settings.LOG_FILE, rotation="10 MB", retention="30 days",
               level="DEBUG", compression="zip")
