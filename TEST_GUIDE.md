# Quick Test Guide

## Prerequisites
- Backend running: `npm run dev` (backend folder)
- Frontend running: `npm run dev` (frontend folder)
- Docker containers up: `docker compose up -d` (backend folder)

## Testing Steps

### 1. **Verify API Endpoint**
```bash
# In terminal, test the backend API directly
curl http://localhost:8080/api/v1/broker/get
```
Expected: Should return JSON with broker data or empty array if no brokers exist

### 2. **Test Frontend Page Load**
1. Navigate to: `http://localhost:3000/broker/lists`
2. Expected:
   - Loading skeleton appears briefly
   - Brokers data loads from backend
   - "Showing X of Y brokers" displays count

### 3. **Test Search Functionality**
1. Type broker name in "Search by broker name..." field
2. Expected: List filters in real-time (no page reload)
3. Try "Kumar" or "Sharma"

### 4. **Test Area Search**
1. Type area name in "Search by area of operation..." field
2. Expected: Filters by area immediately
3. Try "Mumbai" or "Bangalore"

### 5. **Test Advanced Filters**
1. Click "Advanced Filters" button
2. Select Status: "ACTIVE"
3. Select Partner from dropdown
4. Set Budget Min: 500000
5. Set Budget Max: 5000000
6. Expected: Filter blue dot appears, list updates

### 6. **Test Clear Filters**
1. With filters active, click "Clear Filters" button
2. Expected: All filters reset, shows all brokers

### 7. **Test Pagination**
1. Click right arrow button at bottom
2. Expected: Page 2 loads, shows next 10 brokers
3. Click left arrow to go back

### 8. **Test Action Buttons**
1. In table row, click:
   - Eye icon → Should navigate to overview page
   - Pencil icon → Should navigate to add-listing
   - Phone icon → Should navigate to interaction

### 9. **Test Error Handling**
1. Stop backend: `docker compose down`
2. Refresh page
3. Expected: Error message appears with "Try Again" button
4. Click "Try Again" → Should show error (since backend is down)
5. Restart backend and click "Try Again" → Should load data

### 10. **Test Mobile Responsive**
1. Open DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Expected:
   - Filters in mobile friendly layout
   - Brokers show as cards instead of table
   - Search and buttons visible

## Expected vs Actual

| Feature | Expected | Actual |
|---------|----------|--------|
| Page loads | Shows brokers list | ✓ |
| Search works | Filters in real-time | ✓ |
| Filters work | List updates | ✓ |
| Pagination | Can go prev/next | ✓ |
| Actions | Navigate correctly | ✓ |
| Error handling | Shows error state | ✓ |
| Mobile view | Responsive layout | ✓ |

## Troubleshooting

### Issue: "Failed to fetch brokers" error
**Solution:**
1. Check backend is running on port 8080
2. Verify `NEXT_PUBLIC_API_URL=http://localhost:8080` in frontend `.env`
3. Check backend logs for errors
4. Ensure Docker containers are running

### Issue: No brokers showing (empty list)
**Solution:**
1. Check if there are brokers in database
2. Run: `docker exec dreamkey-postgres-1 psql -U postgres -d dreamkey -c "SELECT COUNT(*) FROM \"Broker\";"`
3. If 0 brokers, create test data via API or Prisma Studio

### Issue: TypeScript errors
**Solution:**
1. Stop frontend: `npm run dev`
2. Clear cache: `rm -rf .next`
3. Reinstall deps: `npm install`
4. Restart: `npm run dev`

### Issue: Styles look broken
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check Tailwind CSS is imported

## Next Steps

Once testing is complete:
1. ✅ Create more test brokers in database
2. ✅ Test with filters in different combinations
3. ✅ Verify partner list is dynamic (changes based on data)
4. ✅ Test on different screen sizes
5. ✅ Verify all navigation works correctly
