# STUDY_SYNC - Quick Task Creator Chrome Extension

🚀 Quickly create tasks from anywhere on the web!

## Features

✅ **Quick Task Creation** - Add tasks without leaving your current page
✅ **Capture URLs** - Attach the current page URL to tasks
✅ **Priority Levels** - Set task priority (Low, Medium, High)
✅ **Due Dates** - Schedule tasks with due dates
✅ **Categories** - Organize tasks by subject/category
✅ **Recent Tasks** - View your last 5 created tasks
✅ **Context Menu** - Right-click to create tasks from selected text
✅ **Auto-sync** - Syncs with your STUDY_SYNC account

---

## Installation & Setup

### Step 1: Prepare the Extension

1. Make sure all files are in place:
   ```
   chrome-extension/
   ├── manifest.json
   ├── popup.html
   ├── popup.js
   ├── background.js
   ├── styles.css
   └── images/
       ├── icon-16.png
       ├── icon-48.png
       └── icon-128.png
   ```

### Step 2: Create Extension Icons

You need to create icons in these sizes:
- **16x16** (icon-16.png)
- **48x48** (icon-48.png)
- **128x128** (icon-128.png)

**Quick Option:** Use online tool
- Go to: https://icon.kitchen/
- Upload your logo
- Download and place in `images/` folder

### Step 3: Configure Backend URL

Edit `popup.js` and update:

```javascript
const API_URL = 'http://localhost:5000'; // Change to your backend URL
```

And also update the app URL:
```javascript
chrome.tabs.create({ url: 'http://localhost:5173' }); // Change to your app URL
```

### Step 4: Install Extension in Chrome

1. Open Chrome → Go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder
5. ✅ Extension installed!

---

## Usage

### Method 1: Click Extension Icon
1. Click the STUDY_SYNC icon in Chrome toolbar
2. Fill in task details
3. Click "Create Task"

### Method 2: Right-Click Context Menu
1. Select text on any webpage
2. Right-click → **Create STUDY_SYNC Task**
3. Extension opens with selected text pre-filled

### Method 3: Capture Page URL
1. Open extension popup
2. Check "Attach current page URL"
3. Create task
4. Page URL is saved as reference

---

## Configuration

### API Integration

The extension connects to your STUDY_SYNC backend:

**Endpoint:** `POST /api/tasks`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {authToken}
```

**Payload:**
```json
{
  "taskName": "Study Math",
  "description": "Review chapters 5-7",
  "date": "2026-01-10",
  "priority": "High",
  "category": "Math",
  "status": "Pending",
  "reference": "https://example.com"
}
```

### Update Host Permissions

Edit `manifest.json` to allow your domain:

```json
"host_permissions": [
  "http://localhost/*",
  "https://your-domain.com/*"
]
```

---

## Authentication

The extension stores auth token in Chrome's sync storage:

```javascript
chrome.storage.sync.get('studySync_authToken', (result) => {
  const token = result.studySync_authToken;
});
```

**Token is set by:**
1. User logs in to main STUDY_SYNC app
2. Main app stores token in sync storage
3. Extension reads the stored token

---

## Features Explained

### 1. Task Form
- **Task Name** (required) - What needs to be done
- **Description** - Additional details
- **Due Date** - When it's due (defaults to tomorrow)
- **Priority** - Low/Medium/High
- **Category** - Subject or project name
- **Capture URL** - Attach current page link

### 2. Recent Tasks
- Shows last 5 created tasks
- Displays priority and category
- Helps track what you've added recently

### 3. Status Messages
- ✅ Success - Task created
- ❌ Error - Something went wrong
- ⚠️ Warning - Login required

---

## Troubleshooting

### Extension not appearing?
- Go to `chrome://extensions/`
- Make sure extension is **enabled**
- Try reloading: Click reload icon next to extension

### "Not logged in" message?
- Open main STUDY_SYNC app
- Log in to your account
- Try extension again

### Tasks not saving?
- Check if backend is running
- Verify API URL in `popup.js`
- Check browser console (F12) for errors
- Make sure you're logged in

### Icons not showing?
- Create icon files in `images/` folder
- Sizes: 16x16, 48x48, 128x128
- Format: PNG files
- Reload extension

---

## Keyboard Shortcuts (Optional)

You can add keyboard shortcuts in `manifest.json`:

```json
"commands": {
  "open-popup": {
    "suggested_key": {
      "default": "Ctrl+Shift+T",
      "mac": "MacCtrl+Shift+T"
    },
    "description": "Open Quick Task Creator"
  }
}
```

---

## Data Privacy

- ✅ Tasks sent securely via HTTPS
- ✅ Auth token stored locally in Chrome
- ✅ No data sent to third parties
- ✅ Recent tasks stored in Chrome sync storage

---

## Development

### Debugging
1. Open `chrome://extensions/`
2. Find "STUDY_SYNC - Quick Task Creator"
3. Click **Inspect views: background page** (for service worker)
4. Or check popup: Right-click extension → **Inspect popup**

### Local Testing
```bash
# Make sure backend is running
npm run dev    # Start STUDY_SYNC frontend
npm run server # Start STUDY_SYNC backend
```

---

## Deployment to Chrome Web Store

When ready to publish:

1. Create a zip file of `chrome-extension` folder
2. Go to https://chrome.google.com/webstore/developer/dashboard
3. Upload zip file
4. Fill in details and screenshots
5. Submit for review

---

## Future Features

- 📅 Calendar sync
- 🔔 Deadline reminders
- 📊 Quick stats view
- 🏷️ Tag support
- 💾 Offline sync
- 🎨 Theme customization

---

## Support

If you encounter issues:

1. Check console for errors (F12)
2. Verify backend is running
3. Check auth token is stored
4. Review API endpoint configuration

---

## License

Part of STUDY_SYNC - A comprehensive task management platform.

Made with ❤️ for students and professionals.
