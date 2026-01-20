
# 1. Get Code
echo "Requesting Code..."
CODE_RES=$(curl -s -X POST http://localhost:3000/api/device/code \
  -H "Content-Type: application/json" \
  -d '{"roku_serial": "TEST_SERIAL_123", "device_name": "Test Roku"}')
echo "Response: $CODE_RES"

CODE=$(echo $CODE_RES | grep -o '"code":"[^"]*' | cut -d'"' -f4)
echo "Got Code: $CODE"

# 2. Check Status (Should be pending)
echo -e "\nChecking Status (Pending)..."
curl -s "http://localhost:3000/api/device/status?code=$CODE"

# 3. Activate
echo -e "\nActivating..."
curl -s -X POST http://localhost:3000/api/device/activate \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"$CODE\", \"user_id\": \"123e4567-e89b-12d3-a456-426614174000\"}"

# 4. Check Status (Should be linked)
echo -e "\nChecking Status (Linked)..."
curl -s "http://localhost:3000/api/device/status?code=$CODE"
