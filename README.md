# Koha Simple H5P Quiz (Background xAPI Tracking)

## 🎯 **Overview**

A clean React + Vite wrapper around an H5P personality quiz with **silent background xAPI (Experience API) tracking** and **automatic localStorage persistence**. No analytics UI is shown to learners—only the quiz experience. All tracking is logged to the browser console and stored locally for future migration to a real LRS / database.

## ✨ **Key Features**

### 📊 **Background xAPI Tracking (Silent)**

- ✅ Console-only logging (no on-screen analytics panels)
- ✅ H5P-compliant xAPI statements (attempted, answered, completed, interacted, progressed)
- ✅ Per-question answer detail capture
- ✅ Activity/session metadata with UUID-based session id
- ✅ Standards-aligned structure (extensions for answers where available)

### 💾 **LocalStorage as Temporary Buffer**

- ✅ **Automatic data persistence** for future database migration
- ✅ **Session continuity** across browser restarts
- ✅ **Silent background operation** – no learner distraction
- ✅ **Database-ready JSON** structures for future import
- ✅ **Offline-capable** collection (works without network)

### 🎮 **Clean User Experience Only**

- ✅ H5P personality quiz integration
- ✅ Dark/Light theme toggle
- ✅ Zoom controls for accessibility
- ✅ Responsive design
- 🚫 No analytics / dashboard UI (intentionally removed)

## 🚀 **Quick Start**

### Installation

```bash
npm install
npm run dev
```

### Access

- **Local**: http://localhost:5173/
- **Tracking**: Open DevTools Console → filter for `[xAPI]` logs

## 📁 **LocalStorage Tracking**

### **What Gets Stored (Keys)**

- `xapi_session_data`: Session metadata (id, started, lastUpdated)
- `xapi_statements`: Array of xAPI statements generated so far
- `xapi_answer_tracking`: Per-question accumulated answer details
- `xapi_actor_info`: Actor/identity placeholder (currently anonymous unless extended)

### **Data Management (Developer Use)**

Call helper methods (or manually extract via DevTools):

```js
// In DevTools console (tracker is instantiated within H5PPlayer):
// You can re-run logic similar to below if you expose tracker instance.
// If not globally exposed, just copy localStorage values directly.
JSON.parse(localStorage.getItem('xapi_statements'));
```

### **Privacy First**

- All data stored **locally** in your browser
- **No automatic remote transmission**
- **Complete user control** over data
- **GDPR/Privacy compliant** by design

## 🎯 **xAPI Compliance**

### **Standards Adherence**

### **Tracked Verbs**

- `attempted` – Activity start
- `answered` – Question responses (with choices/outcomes when available)
- `completed` – Activity completion (includes score fields if provided by H5P)
- `interacted` – Generic interactions (fallback)
- `progressed` – Navigation/progress events (if emitted by content type)

## 📊 **Analytics Dashboard**

Removed intentionally. This build is focused on silent background tracking only.

## 🛠️ **Technical Stack**

- **Storage**: Browser localStorage API
- **Styling**: CSS with theme support
- **Build**: Vite with HMR support
- ✅ Responsive design
- ✅ **No analytics UI distractions**

## 🚀 **Quick Start**

### Installation

```bash
npm install
npm run dev
```

### Access

- **Local**: http://localhost:5173/
- **Tracking**: Check browser console for `[xAPI]` logs
- **Data Storage**: Automatic localStorage persistence for future migration

## 🛰️ **Background Data Collection**

### **Core Stored Buckets**

- Session Data
- xAPI Statements
- Answer Tracking
- Actor Info

### **Database Migration Ready**

- Simple JSON arrays and objects
- Session continuity across reloads
- No UI interference
- Export by copying localStorage payloads (or add an export button later)

### **Privacy & Data Control**

- All data stored **locally** in browser localStorage
- **No remote transmission** - ready for your database solution
- **Temporary storage** until database migration
- **Developer-controlled** data management
- [LocalStorage Implementation](docs/LOCALSTORAGE-TRACKING.md)
- [xAPI Integration Guide](docs/xAPI-INTEGRATION.md)

## 🧪 **Testing LocalStorage Manually**

1. Interact with the quiz (answer, navigate, complete)
2. Open DevTools → Console → observe `[xAPI]` logs
3. Open DevTools → Application → Local Storage → inspect keys above
4. Refresh page → confirm data persists
5. Optionally copy `xapi_statements` JSON for analysis

## 🔧 **Development**

### **Available Scripts**

```bash
npm run dev     # Development server
npm run build   # Production build
npm run preview # Preview production build
```

### **Project Structure**

```
src/
├── components/
│   ├── H5PPlayer.jsx           # H5P content renderer + tracker wiring
│   └── (AnswerTrackingDashboard.jsx removed in runtime usage)
├── utils/
│   └── simpleXAPITracker.js    # xAPI + localStorage logic
├── config/
│   └── h5pActivities.js        # H5P content configuration
└── App.jsx                     # Main application
```

## 🎉 **Perfect For**

- 📚 **Educational Platforms**
- 🏢 **Corporate Training**
- 🧠 **Learning Management Systems**
- 📊 **Learning Analytics Research**
- 🔬 **Offline Learning Applications**

---

## 🏆 **Features at a Glance**

| Feature          | Status | Description                            |
| ---------------- | ------ | -------------------------------------- |
| H5P Integration  | ✅     | Personality quiz with full H5P support |
| xAPI Tracking    | ✅     | Standards-compliant learning analytics |
| LocalStorage     | ✅     | Automatic persistence across sessions  |
| Data Export      | ✅     | Download analytics as JSON             |
| Privacy First    | ✅     | Local-only data storage                |
| Real-time UI     | 🚫     | Dashboard intentionally removed        |
| Session Recovery | ✅     | Continues from where you left off      |
| Theme Support    | ✅     | Dark/Light themes                      |
| Responsive       | ✅     | Works on all device sizes              |

**Ready for production use with enterprise-grade localStorage persistence!** 🚀
