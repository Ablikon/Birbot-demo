#!/bin/bash

echo "=========================================="
echo "1. POST /api/auth/login"
echo "=========================================="
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"123456"}')
echo "$LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "ERROR: No access_token found. Aborting."
  exit 1
fi
echo ""
echo "TOKEN: $TOKEN"

echo ""
echo "=========================================="
echo "2. GET /api/profile"
echo "=========================================="
curl -s -X GET http://localhost:8081/api/profile \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "=========================================="
echo "3. GET /api/store (before test store)"
echo "=========================================="
curl -s -X GET http://localhost:8081/api/store \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "=========================================="
echo "4. POST /api/store/test (create test store)"
echo "=========================================="
curl -s -X POST http://localhost:8081/api/store/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "=========================================="
echo "5. GET /api/store (after test store)"
echo "=========================================="
STORE_RESPONSE=$(curl -s -X GET http://localhost:8081/api/store \
  -H "Authorization: Bearer $TOKEN")
echo "$STORE_RESPONSE"

# Extract first storeId
STORE_ID=$(echo "$STORE_RESPONSE" | python3 -c "
import sys,json
data = json.load(sys.stdin)
if isinstance(data, list) and len(data) > 0:
    store = data[0]
    print(store.get('_id', store.get('id', '')))
elif isinstance(data, dict):
    stores = data.get('stores', data.get('data', []))
    if isinstance(stores, list) and len(stores) > 0:
        print(stores[0].get('_id', stores[0].get('id', '')))
    else:
        print(data.get('_id', data.get('id', '')))
" 2>/dev/null)

echo ""
echo "STORE_ID: $STORE_ID"

if [ -z "$STORE_ID" ]; then
  echo "ERROR: No storeId found. Aborting product tests."
  exit 1
fi

echo ""
echo "=========================================="
echo "6. GET /api/product/{storeId} (stats)"
echo "=========================================="
curl -s -X GET "http://localhost:8081/api/product/$STORE_ID" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo ""
echo "=========================================="
echo "7. POST /api/product/{storeId}?filter=all&page=1&limit=5 (product list)"
echo "=========================================="
curl -s -X POST "http://localhost:8081/api/product/$STORE_ID?filter=all&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "=========================================="
echo "DONE"
echo "=========================================="
