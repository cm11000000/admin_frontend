# Setup Local Domain for admin.sabpaisa.in

This guide will help you configure your local machine to access the application via `admin.sabpaisa.in` instead of `localhost`. This makes API requests appear as if they're coming from the production domain.

---

## ✅ Changes Already Applied

**API Client Headers Updated:**
All API requests now automatically include:
- `Origin: https://admin.sabpaisa.in`
- `Referer: https://admin.sabpaisa.in/`

This makes the backend servers think requests are coming from the production domain.

---

## 🔧 Setup Instructions

### Step 1: Update Your `/etc/hosts` File

You need to map `admin.sabpaisa.in` to your local machine.

**For macOS/Linux:**

1. Open Terminal
2. Run this command:
   ```bash
   sudo nano /etc/hosts
   ```

3. Add this line at the end:
   ```
   127.0.0.1 admin.sabpaisa.in
   ```

4. Save and exit:
   - Press `Ctrl + O` (save)
   - Press `Enter` (confirm)
   - Press `Ctrl + X` (exit)

5. Flush DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Linux
   sudo systemctl restart systemd-resolved
   ```

**For Windows:**

1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add this line at the end:
   ```
   127.0.0.1 admin.sabpaisa.in
   ```
4. Save the file
5. Flush DNS cache:
   ```cmd
   ipconfig /flushdns
   ```

---

### Step 2: Access the Application

Once the hosts file is updated, you can access the application at:

**🌐 http://admin.sabpaisa.in:3002**

Instead of:
~~http://localhost:3002~~

---

## 🧪 Verify Setup

### 1. Check Hosts File
```bash
# macOS/Linux
cat /etc/hosts | grep sabpaisa

# Windows
type C:\Windows\System32\drivers\etc\hosts | findstr sabpaisa
```

You should see:
```
127.0.0.1 admin.sabpaisa.in
```

### 2. Test DNS Resolution
```bash
ping admin.sabpaisa.in
```

You should see responses from `127.0.0.1`

### 3. Test Application
1. Open browser
2. Go to: http://admin.sabpaisa.in:3002
3. You should see the login page
4. Open Developer Tools → Network tab
5. Make a login request
6. Check the request headers - you should see:
   - `Origin: https://admin.sabpaisa.in`
   - `Referer: https://admin.sabpaisa.in/`

---

## 🔍 What This Does

### API Request Headers
All API requests now include:
```http
Origin: https://admin.sabpaisa.in
Referer: https://admin.sabpaisa.in/
Content-Type: application/json
```

### Backend Perspective
The backend API servers will see requests as if they're coming from:
- **Domain**: `admin.sabpaisa.in`
- **Origin**: `https://admin.sabpaisa.in`

This bypasses any CORS restrictions or domain-based security checks.

---

## 🚨 Troubleshooting

### Issue: "Cannot connect to admin.sabpaisa.in"

**Solution 1:** Check if dev server is running
```bash
# Navigate to project directory
cd /Users/chaitanyamalik/Desktop/admin_full_proper_v2/sabpaisa_admin_v5

# Check if server is running
lsof -i :3002

# If not running, start it
npm run dev
```

**Solution 2:** Verify hosts file entry
```bash
cat /etc/hosts | grep admin.sabpaisa.in
```

Should return:
```
127.0.0.1 admin.sabpaisa.in
```

**Solution 3:** Clear browser cache
- Chrome: `Cmd/Ctrl + Shift + Delete`
- Clear cookies and cached files
- Restart browser

**Solution 4:** Try different port
If port 3002 is in use, the dev server may have started on a different port. Check the terminal output.

---

### Issue: "CORS Error" or "Origin Not Allowed"

This means the backend is still blocking requests. Possible solutions:

**Solution 1:** Check request headers in Network tab
Ensure you see:
- `Origin: https://admin.sabpaisa.in`
- `Referer: https://admin.sabpaisa.in/`

**Solution 2:** Hard refresh the page
- Chrome/Edge: `Cmd/Ctrl + Shift + R`
- Firefox: `Cmd/Ctrl + F5`

**Solution 3:** Clear browser cache completely
Old JavaScript files may be cached with the old headers.

---

### Issue: DNS Not Resolving

**macOS:**
```bash
# Flush DNS cache
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Restart network interface
sudo ifconfig en0 down
sudo ifconfig en0 up
```

**Linux:**
```bash
# Flush DNS cache
sudo systemctl restart systemd-resolved

# Or use this if above doesn't work
sudo /etc/init.d/nscd restart
```

**Windows:**
```cmd
# Flush DNS cache
ipconfig /flushdns

# Reset Winsock
netsh winsock reset

# Restart DNS client
net stop dnscache
net start dnscache
```

---

## 🔙 Reverting Changes

If you want to revert to using `localhost`:

### 1. Remove Hosts Entry
```bash
# macOS/Linux
sudo nano /etc/hosts
# Delete the line: 127.0.0.1 admin.sabpaisa.in

# Windows
# Open: C:\Windows\System32\drivers\etc\hosts as Administrator
# Delete the line: 127.0.0.1 admin.sabpaisa.in
```

### 2. Flush DNS Cache
```bash
# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Linux
sudo systemctl restart systemd-resolved

# Windows
ipconfig /flushdns
```

### 3. Access via localhost
Go back to using: http://localhost:3002

**Note:** The API headers (Origin/Referer) will still be set to `admin.sabpaisa.in` even when accessing via localhost.

---

## 📝 Quick Commands

### Check if hosts entry exists:
```bash
grep "admin.sabpaisa.in" /etc/hosts
```

### Check if port 3002 is in use:
```bash
lsof -i :3002
```

### Restart dev server:
```bash
# Kill existing server
lsof -i :3002 | grep LISTEN | awk '{print $2}' | xargs kill

# Start fresh
npm run dev
```

### Test with curl:
```bash
curl -H "Origin: https://admin.sabpaisa.in" \
     -H "Referer: https://admin.sabpaisa.in/" \
     http://admin.sabpaisa.in:3002
```

---

## ✅ Summary

1. ✅ API client headers updated (already done)
2. ⚠️ Update `/etc/hosts` file (requires manual step)
3. 🌐 Access via: http://admin.sabpaisa.in:3002
4. 🧪 Verify headers in browser DevTools

---

**Status:** Headers configured ✅ | Hosts file pending ⚠️
