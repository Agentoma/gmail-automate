# Gmail Auto-Labeler

Local AI-powered Gmail automation extension. HARPA-style email labeling, prioritization & auto-reply - 100% browser-based, no API costs, full privacy.

## Features

- **Automatic Email Labeling**: Intelligently labels emails based on content analysis
- **Content-Based Rules**: Analyzes sender, subject, and email snippet to determine appropriate labels
- **Scheduled Processing**: Runs hourly to keep your inbox organized
- **Local Processing**: All automation runs in your browser - no external APIs or data sharing
- **Easy Configuration**: Simple Chrome extension with popup interface

## Default Label Rules

- **Banking**: RBC emails, bank transactions, account notifications
- **Marketing**: Promotional emails, sales offers, discounts
- **Important**: Security alerts, password resets, 2FA notifications

## Installation

### 1. Download the Extension

Clone or download this repository:

```bash
git clone https://github.com/Agentoma/gmail-automate.git
cd gmail-automate
```

### 2. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `gmail-automate` folder

### 3. Set Up Gmail Labels

Make sure you have the following labels created in Gmail:
- Banking
- Marketing  
- Important (or Notification if Important is reserved)

## Usage

### Automatic Processing

Once installed, the extension will:
- Process your inbox automatically every hour
- Apply labels based on email content
- Track processing in the console (visible in Chrome DevTools)

### Manual Processing

1. Click the extension icon in Chrome toolbar
2. Click "Process Inbox Now" button
3. The extension will analyze and label your inbox emails

### Monitoring

- Open Gmail and press F12 to open Developer Console
- Look for "Gmail Auto-Labeler" logs showing processed emails
- The extension popup shows last check time and status

## How It Works

### Architecture

1. **Service Worker** (`background/service-worker.js`)
   - Manages scheduled tasks via Chrome Alarms API
   - Stores label rules in local storage
   - Coordinates with content scripts

2. **Content Script** (`content/gmail-injector.js`)
   - Injects into Gmail interface
   - Extracts email information from DOM
   - Applies labels using Gmail's UI controls

3. **Popup Interface** (`popup.html`)
   - Shows extension status
   - Manual trigger for processing
   - Displays active label rules

### Processing Flow

1. Extension checks for Gmail tab
2. Content script reads email rows in inbox
3. For each email:
   - Extracts sender, subject, snippet
   - Checks against label rules
   - Applies matching label via Gmail UI
4. Logs activity to console

## Customization

### Adding New Labels

Edit `background/service-worker.js` and modify the `LABEL_RULES` object:

```javascript
const LABEL_RULES = {
  'YourLabel': ['keyword1', 'keyword2', 'keyword3'],
  'Banking': ['rbc', 'bank', 'account'],
  // ... add more labels
};
```

### Changing Schedule

Modify the alarm period in `background/service-worker.js`:

```javascript
chrome.alarms.create('checkEmails', {
  periodInMinutes: 30  // Change from 60 to desired interval
});
```

## Troubleshooting

### Extension Not Working

1. Check that Gmail tab is open
2. Verify labels exist in Gmail
3. Open DevTools console for error messages
4. Try manual processing from popup

### Labels Not Applying

1. Ensure label names match exactly (case-sensitive)
2. Check if emails already have the label
3. Gmail's "Important" label may be reserved - use "Notification" instead
4. Verify Gmail UI selectors haven't changed (check console for errors)

### Performance Issues

- Extension processes with 200ms delay between emails
- Large inboxes may take a few minutes
- Check browser performance in Task Manager

## Development

### Project Structure

```
gmail-automate/
├── manifest.json              # Extension configuration
├── background/
│   └── service-worker.js     # Background service worker
├── content/
│   └── gmail-injector.js     # Gmail content script
├── popup.html                # Extension popup UI
├── icons/                    # Extension icons (add your own)
└── README.md                 # This file
```

### Testing

1. Make changes to code
2. Go to `chrome://extensions/`
3. Click refresh icon on gmail-automate extension
4. Test in Gmail

## Privacy & Security

- **100% Local**: All processing happens in your browser
- **No External Calls**: No API requests to external services
- **No Data Collection**: Extension doesn't collect or transmit data
- **Open Source**: Full code available for audit
- **Permissions**: Only requests access to `mail.google.com`

## Comparison with Other Tools

| Feature | Gmail Auto-Labeler | HARPA.AI | Gmail API Scripts |
|---------|-------------------|----------|-------------------|
| Local Processing | ✅ Yes | ✅ Yes | ❌ Server-side |
| No API Costs | ✅ Free | 💰 Paid AI | ✅ Free |
| Setup Difficulty | ⚡ Easy | ⚡ Easy | 🔧 Technical |
| Customizable | ✅ Yes | Limited | ✅ Yes |
| Runs Scheduled | ✅ Hourly | ✅ Custom | ✅ Custom |

## Future Enhancements

- [ ] Add popup configuration UI for label rules
- [ ] Integration with local AI models for smarter categorization
- [ ] Priority scoring and inbox management
- [ ] Auto-reply functionality
- [ ] Email archiving based on rules
- [ ] Statistics and analytics dashboard
- [ ] Export/import rule configurations

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review console logs for debugging

## Acknowledgments

Inspired by HARPA.AI's local-first automation approach and built to provide free, privacy-focused email automation.

---

**Note**: This extension automates Gmail using UI interactions. Gmail UI changes may require updates to selectors in the content script.
