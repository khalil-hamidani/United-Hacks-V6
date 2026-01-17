import requests
from pprint import pprint

BASE_URL = "http://127.0.0.1:8000"

EMAIL = "testuser@example.com"
PASSWORD = "password123"

def print_step(title):
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)

def auth_headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

# 1. Register
print_step("1. Register")
res = requests.post(
    f"{BASE_URL}/auth/register",
    json={"email": EMAIL, "password": PASSWORD},
)
pprint(res.json())

# 2. Login (OAuth2 form)
print_step("2. Login")
res = requests.post(
    f"{BASE_URL}/auth/login",
    data={"username": EMAIL, "password": PASSWORD},
)
login_data = res.json()
pprint(login_data)
TOKEN = login_data["access_token"]

HEADERS = auth_headers(TOKEN)

# 3. Auth Me
print_step("3. Auth Me")
res = requests.get(f"{BASE_URL}/auth/me", headers=HEADERS)
pprint(res.json())

# 4. Create Relationship
print_step("4. Create Relationship")
res = requests.post(
    f"{BASE_URL}/relationships/",
    headers=HEADERS,
    json={
        "name": "Alice",
        "role": "Friend",
        "relationship_state": "UNCLEAR",
        "context_text": "We stopped talking after an argument.",
    },
)
relationship = res.json()
pprint(relationship)
REL_ID = relationship["id"]

# 5. List Relationships
print_step("5. List Relationships")
res = requests.get(f"{BASE_URL}/relationships/", headers=HEADERS)
pprint(res.json())

# 6. Update Relationship
print_step("6. Update Relationship")
res = requests.put(
    f"{BASE_URL}/relationships/{REL_ID}",
    headers=HEADERS,
    json={
        "relationship_state": "TENSE",
        "context_text": "Still unresolved, but I want peace.",
    },
)
pprint(res.json())

# 7. AI Relationship Support
print_step("7. AI Relationship Support")
res = requests.post(
    f"{BASE_URL}/ai/relationship-support",
    headers=HEADERS,
    json={
        "relationship_state": "TENSE",
        "context_text": "Still unresolved, but I want peace.",
    },
)
pprint(res.json())

# 8. Check-in Status
print_step("8. Check-in Status")
res = requests.get(f"{BASE_URL}/checkin/status", headers=HEADERS)
pprint(res.json())

# 9. Confirm Check-in
print_step("9. Confirm Check-in")
res = requests.post(f"{BASE_URL}/checkin/confirm", headers=HEADERS)
pprint(res.json())

# 10. Update Check-in Config
print_step("10. Update Check-in Config")
res = requests.put(
    f"{BASE_URL}/checkin/config",
    headers=HEADERS,
    json={"interval_days": 7},
)
pprint(res.json())

# 11. Create Trusted Recipient
print_step("11. Create Trusted Recipient")
res = requests.post(
    f"{BASE_URL}/legacy/recipient",
    headers=HEADERS,
    json={
        "name": "Bob",
        "email": "bob@example.com",
        "relationship": "Brother",
    },
)
pprint(res.json())

# 12. Create Legacy Item
print_step("12. Create Legacy Item")
res = requests.post(
    f"{BASE_URL}/legacy/",
    headers=HEADERS,
    json={
        "type": "message",
        "content": "If you're reading this, I wanted you to know I care.",
    },
)
legacy_item = res.json()
pprint(legacy_item)

# 13. List Legacy Items
print_step("13. List Legacy Items")
res = requests.get(f"{BASE_URL}/legacy/", headers=HEADERS)
pprint(res.json())

# 14. Simulate Release (may 403 if not overdue)
print_step("14. Simulate Legacy Release")
res = requests.post(
    f"{BASE_URL}/legacy/simulate-release",
    headers=HEADERS,
)
print("Status:", res.status_code)
pprint(res.json())

print_step("ALL TESTS COMPLETED")
