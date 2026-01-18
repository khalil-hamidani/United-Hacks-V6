"""
Database migration to remove unique constraint from trusted_recipients.user_id
Run this with: python -m app.migrate_recipients
"""

import asyncio
from sqlalchemy import text
from app.db.session import async_session_maker


async def migrate():
    async with async_session_maker() as session:
        try:
            print("Connected to database")

            # Drop the unique index
            print("Dropping unique index ix_trusted_recipients_user_id...")
            await session.execute(
                text("DROP INDEX IF EXISTS ix_trusted_recipients_user_id;")
            )
            print("✓ Dropped unique index")

            # Recreate as non-unique index
            print("Creating non-unique index...")
            await session.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_trusted_recipients_user_id ON trusted_recipients(user_id);"
                )
            )
            print("✓ Created non-unique index")

            await session.commit()

            print("\n✅ Migration completed successfully!")
            print("Users can now have multiple trusted recipients.")

        except Exception as e:
            print(f"❌ Migration failed: {e}")
            await session.rollback()


if __name__ == "__main__":
    asyncio.run(migrate())
