"""
Database migration to remove unique constraint from trusted_recipients.user_id
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()


async def migrate():
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL not found in environment")
        return

    # Connect to database
    conn = await asyncpg.connect(database_url)

    try:
        print("Connected to database")

        # Drop the unique index
        print("Dropping unique index ix_trusted_recipients_user_id...")
        await conn.execute("DROP INDEX IF EXISTS ix_trusted_recipients_user_id;")
        print("✓ Dropped unique index")

        # Recreate as non-unique index
        print("Creating non-unique index...")
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS ix_trusted_recipients_user_id ON trusted_recipients(user_id);"
        )
        print("✓ Created non-unique index")

        print("\n✅ Migration completed successfully!")
        print("Users can now have multiple trusted recipients.")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(migrate())
