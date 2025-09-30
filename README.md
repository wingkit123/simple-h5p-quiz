# H5P Simple Quiz with Background xAPI Tracking

## 🎯 **Overview**

A clean React-based H5P personality quiz application with **background xAPI (Experience API) learning analytics** and **localStorage persistence**. Tracks user interactions silently for future database migration while providing a distraction-free quiz experience.

## ✨ **Key Features**

### 📊 **Background xAPI Tracking**

- ✅ Silent learning analytics tracking (console logs only)
- ✅ H5P-compliant xAPI statements
- ✅ Detailed question/answer tracking
- ✅ Activity completion monitoring
- ✅ Standards-compliant implementation

### 💾 **LocalStorage as Temporary Storage**

- ✅ **Automatic data persistence** for future database migration
- ✅ **Session continuity** across browser restarts
- ✅ **Silent background operation** - no UI interference
- ✅ **Database-ready format** for easy migration
- ✅ **Offline-capable** analytics collection

### 🎮 **Clean User Experience**

- ✅ H5P personality quiz integration
- ✅ Dark/Light theme toggle
- ✅ Zoom controls for accessibility
- ✅ Responsive design

## 🚀 **Quick Start**

### Installation

```bash
npm install
npm run dev
```

### Access

- **Local**: http://localhost:5173/
- **xAPI Panel**: Click "xAPI: ON" button to view analytics
- **Answer Dashboard**: Click "📊 Answers" for detailed tracking

## 📁 **LocalStorage Tracking**

### **What Gets Stored**

- 🗂️ **Session Data**: Session ID, status, timestamps
- 📋 **xAPI Statements**: Complete learning analytics
- ✅ **Answer Tracking**: Detailed question responses
- 👤 **Actor Info**: User information and preferences

### **Data Management**

- **📥 Export Data**: Download complete analytics as JSON
- **🗑️ Clear Data**: Remove tracking data (keep session)
- **🔄 Reset All**: Full reset including new session

### **Privacy First**

- All data stored **locally** in your browser
- **No automatic remote transmission**
- **Complete user control** over data
- **GDPR/Privacy compliant** by design

## 🎯 **xAPI Compliance**

### **Standards Adherence**

### **Tracked Events**

- `attempted` - Activity started
- `answered` - Question responses with detailed data
- `completed` - Activity completion with scores
- `interacted` - General UI interactions
- `progressed` - H5P navigation events

## 📊 **Analytics Dashboard**

### **Real-time Tracking**

- Storage usage statistics
- xAPI statement counts

### **Data Visualization**

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
- **xAPI Tracking**: Check browser console for activity logs
- **Data Storage**: Automatic localStorage persistence for database migration

## � **Background Data Collection**

### **What Gets Stored Silently**

- 🗂️ **Session Data**: Session ID, status, timestamps
- 📋 **xAPI Statements**: Complete learning analytics
- ✅ **Answer Tracking**: Detailed question responses
- 👤 **Actor Info**: User information and preferences

### **Database Migration Ready**

- **localStorage format**: JSON structures ready for database import
- **Session continuity**: Maintains data across browser sessions
- **Silent operation**: No user interface interference
- **Easy extraction**: `xapiTracker.getAllTrackingData()` method

### **Privacy & Data Control**

- All data stored **locally** in browser localStorage
- **No remote transmission** - ready for your database solution
- **Temporary storage** until database migration
- **Developer-controlled** data management
- [LocalStorage Implementation](docs/LOCALSTORAGE-TRACKING.md)
- [xAPI Integration Guide](docs/xAPI-INTEGRATION.md)

## 🧪 **Testing LocalStorage**

1. **Interact with Quiz**: Answer questions, complete activities
2. **Check xAPI Panel**: Click "xAPI: ON" → View localStorage status
3. **Test Persistence**: Refresh page → Verify data remains
4. **Export Test**: Use "📥 Export Data" → Download JSON file
5. **DevTools**: Application → Local Storage → View xAPI keys

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
│   ├── H5PPlayer.jsx           # H5P content renderer
│   └── AnswerTrackingDashboard.jsx # Analytics UI
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
| Real-time UI     | ✅     | Live tracking dashboard                |
| Session Recovery | ✅     | Continues from where you left off      |
| Theme Support    | ✅     | Dark/Light themes                      |
| Responsive       | ✅     | Works on all device sizes              |

**Ready for production use with enterprise-grade localStorage persistence!** 🚀
