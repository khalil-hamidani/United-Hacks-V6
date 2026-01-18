"""
Schemas for email notification system
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class DemoReleaseRequest(BaseModel):
    """Request to trigger demo release"""

    pass  # No parameters needed, uses current user


class RecipientNotification(BaseModel):
    """Details of notification sent to a recipient"""

    recipient_id: str
    recipient_name: str
    recipient_email: str
    messages_count: int
    status: str  # 'sent' or 'failed'
    error: Optional[str] = None


class DemoReleaseResponse(BaseModel):
    """Response from demo release"""

    success: bool
    release_event_id: str
    days_overdue: int
    recipients_notified: int
    notifications: List[RecipientNotification]
    message: str


class NotificationLogResponse(BaseModel):
    """Response for notification log"""

    id: str
    recipient_email: str
    email_type: str
    status: str
    is_demo: bool
    sent_at: datetime
    error_message: Optional[str]

    class Config:
        from_attributes = True
