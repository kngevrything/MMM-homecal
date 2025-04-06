
# MMM-homecal

A MagicMirror² module that displays calendar events from the default `calendar` module, with enhanced 
formatting for NBA games and garbage/recycling pickups. Supports team logos, icon-based rendering for 
waste types, and layout grouping by calendar type.
  
## 📦 Features

- Groups events by day with customizable layout sections (top, middle, bottom)
- Displays NBA game matchups with team logos
- Detects and shows icons for garbage, recycling, and battery pickup events
- Fully supports multiple calendar sources
- Clean layout with responsive text wrapping for long titles

---

## 🔧 Installation

Clone this repo into your `MagicMirror/modules/` directory:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/kngevrything/MMM-homecal.git 
```

---

## 📅 Required Calendar Module Setup

This module **depends on the default MagicMirror `calendar` module** to fetch and broadcast events. Even if you're not displaying the calendar visually, it **must be defined** in your `config.js`, and the `broadcastEvents` flag must be enabled.

### ⚙️ How It Works

- The `calendar` module fetches `.ics` feeds and emits `CALENDAR_EVENTS`.
- `MMM-homecal` listens for these events and renders them.
- Each calendar in the default calendar module must:
  - Include a unique `name`
  - Match a calendar config entry in `MMM-homecal`
  - Set `broadcastEvents: true`

### ✅ Default Calendar Module Example

```js
{
  module: "calendar",
  broadcastEvents: true,
  config: {
    maximumNumberOfDays: 7,
    calendars: [
      {
        name: "blazers",
        url: "https://cdn.nba.com/teams/calendars/blazers.ics"
      },
      {
        name: "garbage",
        url: "https://your-waste-service.ics"
      },
    ]
  }
}
```

---

## 🔧 `MMM-homecal` Configuration Format

Each calendar listed in the default calendar module must also be defined in the `MMM-homecal` config using the same `name`.

| Key           | Type    | Description                                               |
|---------------|---------|-----------------------------------------------------------|
| `name`        | string  | Must match the `name` from the default calendar config    |
| `cal_location`| string  | `"top"`, `"middle"` (default), or `"bottom"`              |
| `use_icons`   | boolean | Whether to use icons (true) or just text (false)          |

### ✅ Example: `MMM-homecal` Configuration

```js
{
  module: "MMM-homecal",
  position: "middle_center",
  config: {
    calendars: [
      {
        name: "blazers",
        cal_location: "middle",
        use_icons: false
      },
      {
        name: "garbage",
        cal_location: "bottom",
        use_icons: true
      },
    ]
  }
}
```

---

## ⚠️ Assumptions and Limitations

This module makes several assumptions about input data and configuration in order to function correctly.

### 🔒 Known Limitation: NBA Calendar Feeds Block Node.js Requests

Some external calendars (like the NBA feed) reject requests from non-browser user agents.  
This module assumes the upstream calendar module can fetch the feed successfully. If not, you may need to:
- Modify the user-agent header in your calendar fetcher
- Use a proxy server or forked calendar module with custom headers, or
- Use a purpose-built fetcher module for feeds that require custom headers

Here is a sample of the change for changing the header in the calendar fetcher:
```javascript
const fetchCalendar = () => {
  clearTimeout(reloadTimer);
  reloadTimer = null;
  const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
  let httpsAgent = null;
  let headers = {
    //"User-Agent": `Mozilla/5.0 (Node.js ${nodeVersion}) MagicMirror/${global.version}`
    "User-Agent": "Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
  };

  // ... rest of the method

};
```
  
### 📅 Calendar Event Structure

- Events must be received from the default MagicMirror `calendar` module via the `CALENDAR_EVENTS`
  notification.
- Each event must include the following properties:
  - `calendarName` – used to map events to the matching calendar config.
  - `title` – used to generate text or icons for the event.
  - `startDate` – must be a Unix timestamp in **milliseconds** (string or number).
  - `fullDayEvent` – boolean indicating if the event is all-day.

### 🗓 Calendar Configuration Requirements

- Calendars must be defined in your `config.js` with a unique `name` matching the event’s `calendarName`.
- Optional per-calendar configuration:
  - `cal_location` – where events display for this calendar: `"top"`, `"middle"`, or `"bottom"` (default: `"middle"`).
  - `use_icons` – `true` to enable icon-based rendering, `false` to show text only. (default: false).

### 🏀 NBA Team Logo Mapping

- NBA event titles must be formatted like:  
  ```plaintext
  Away Team @ Home Team
  ```
- Team names must exactly match one of the keys in the `nbaTeams` map:
  ```js
  const nbaTeams = new Map([
    ["LA Lakers", "1610612747"],
    ["Los Angeles Lakers", "1610612747"],
    ["Boston Celtics", "1610612738"],
    // ...and so on
  ]);
  ```
- Variants like `"LA Clippers"` and `"Los Angeles Clippers"` are supported.
- Mismatched or unrecognized team names will result in plain text instead of logos.

### ♻️ Garbage/Recycling Icons

- Event titles are parsed word-by-word for keywords.
- Recognized keywords (case-insensitive) include:
  ```js
  const garbageIconMap = new Map([
    ["garbage", "fas fa-trash"],
    ["trash", "fas fa-trash"],
    ["recycle", "fas fa-recycle"],
    ["recycling", "fas fa-recycle"],
    ["battery", "fas fa-car-battery"],
    ["yard", "fab fa-pagelines"]
  ]);
  ```
- If at least one keyword is found, icons will be shown.
- If no keywords match, the event falls back to a plain text title.

### 🕒 Date Parsing

- `startDate` must be a Unix timestamp in milliseconds (e.g., `1743976800000`).
- Parsing uses:
  ```js
  moment(startDate, "x")
  ```
- If the value isn't a timestamp (or isn’t parsed correctly), the event may display as `"Invalid date"`.

### 🧱 Layout Behavior

- Each day’s content is split into 3 logical regions:
  - `top`, `middle`, and `bottom`
- This is controlled per calendar via `cal_location`.
- Long text (over 50 characters) automatically receives the `team-text-long` class for more graceful wrapping.

### 📦 External Dependencies

- Font Awesome 6.5.0 is loaded from CDN:
  ```html
  https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css
  ```
- `moment.js` is required and used for all date manipulation and formatting.

