const logoUrl = "https://cdn.nba.com/logos/nba/{0}/primary/L/logo.svg";

const nbaTeams = new Map([
  ["Atlanta Hawks", "1610612737"],
  ["Boston Celtics", "1610612738"],
  ["Brooklyn Nets", "1610612751"],
  ["Charlotte Hornets", "1610612766"],
  ["Chicago Bulls", "1610612741"],
  ["Cleveland Cavaliers", "1610612739"],
  ["Dallas Mavericks", "1610612742"],
  ["Denver Nuggets", "1610612743"],
  ["Detroit Pistons", "1610612765"],
  ["Golden State Warriors", "1610612744"],
  ["Houston Rockets", "1610612745"],
  ["Indiana Pacers", "1610612754"],
  ["LA Clippers", "1610612746"],
  ["Los Angeles Clippers", "1610612746"],
  ["LA Lakers", "1610612747"],
  ["Los Angeles Lakers", "1610612747"],
  ["Memphis Grizzlies", "1610612763"],
  ["Miami Heat", "1610612748"],
  ["Milwaukee Bucks", "1610612749"],
  ["Minnesota Timberwolves", "1610612750"],
  ["New Orleans Pelicans", "1610612740"],
  ["New York Knicks", "1610612752"],
  ["Oklahoma City Thunder", "1610612760"],
  ["Orlando Magic", "1610612753"],
  ["Philadelphia 76ers", "1610612755"],
  ["Phoenix Suns", "1610612756"],
  ["Portland Trail Blazers", "1610612757"],
  ["Sacramento Kings", "1610612758"],
  ["San Antonio Spurs", "1610612759"],
  ["Toronto Raptors", "1610612761"],
  ["Utah Jazz", "1610612762"],
  ["Washington Wizards", "1610612764"]
]);

const garbageIconMap = new Map([
  ["garbage", "fas fa-trash"],
  ["trash", "fas fa-trash"],
  ["recycle", "fas fa-recycle"],
  ["recycling", "fas fa-recycle"],
  ["battery", "fas fa-car-battery"],
  ["yard", "fab fa-pagelines"]
]);

maximumNumberOfDays = 1;

Module.register("MMM-homecal", {
    // Default module config.
    defaults: {
      maximumNumberOfDays: 1,
      calendars: [],

    },
    
    calendarEvents: {},

    /**
     * Generates the DOM structure for the module.
     * Loops through days up to maximumNumberOfDays, builds a day block for each,
     * and appends it to the main container.
     *
     * @returns {HTMLElement} - The root DOM element to be rendered.
     */
    getDom() {
      const container = document.createElement('div');
      container.className = "calendar-container";

      const today = moment().startOf('day');
      
      for (let i = 0; i < maximumNumberOfDays; i++)
      {
        const curr_date = moment(today).add(i, 'days');
        const events = this.getEventsForDate(curr_date);
        container.appendChild(this.createDayBlock(curr_date, events));
      }

      return container;
    },
    
    /**
     * Returns a list of calendar events that occur on the given date.
     *
     * @param {moment.Moment} date - The day to search for events.
     * @returns {Array<Object>} - A flat array of event objects for that date.
     */
    getEventsForDate(date) {
      const us_formatted_date = date.format('L');

      return Object.values(this.calendarEvents).flat().filter(event => moment(event.startDate, "x").format('L') === us_formatted_date);
    },

    /**
     * Creates a DOM block for a specific day and its associated events.
     *
     * @param {moment.Moment} date - The date to create the block for.
     * @param {Array<Object>} events - Array of event objects for that day.
     * @returns {HTMLElement} - A DOM element representing that day's event block.
     */
    createDayBlock(date, events) {
      const dayBlock = document.createElement('div');
      dayBlock.className = "calendar-day";

      const header = this.createElement('div', 'shaded-header', date.format('dddd'));
      const body = this.createElement('div', 'body');
      body.appendChild(this.createElement('div', 'day-of-month', date.format('D')));
      
      // top div
      const top_section = this.createElement('div', 'content-top');
      body.append(top_section);

      // middle div
      const middle_section = this.createElement('div', 'content-middle');
      body.append(middle_section);

      // bottom div
      const bottom_section = this.createElement('div', 'content-bottom');
      body.append(bottom_section);

      events.forEach(event => {

        // set where this event's calendar is configured to place events
        let event_div; 
        switch (event.cal_location) {
          case 'bottom':
            event_div = bottom_section;
            break;
          case 'top':
            event_div = top_section;
            break;
          default:
            event_div = middle_section;
        }

        if (event.fullDayEvent) {
          // Garbage comes as full day events but aren't always garbage pickup
          let garbage_icons;
          let have_icons = false;
          // Check that the event text matches known pickup icons
          if (event.use_icons) {
            garbage_icons = this.getGarbageIcons(event.title);
          }

          // check the configuration to see if icons exist, otherwise use text
          have_icons = garbage_icons.querySelectorAll('i').length > 0;
                    
          if (event.use_icons && have_icons) {
            event_div.appendChild(garbage_icons);
          } else {
            event_div.appendChild(this.createElement('span', event.title.length > 50 ? 'team-text-long' : 'team-text', event.title));
          }
        } else {

          const [home, away] = event.title.split('@').map(t => t.trim());
          
          let homeTeam;
          let awayTeam;

          // check the configuration to see if icons are desired
          if (event.use_icons) {
            homeTeam = this.getTeamLogo(home, 'team-logo');
            awayTeam = this.getTeamLogo(away, 'team-logo');
          }
          else {
            homeTeam = this.createElement('span', 'team-text', home);
            awayTeam = this.createElement('span', 'team-text', away);
          }
          
          const matchup_container = this.createElement('div', 'game-logos');
          matchup_container.append(homeTeam, this.createElement('div', 'vs', 'vs'), awayTeam);

          event_div.appendChild(matchup_container);
          event_div.appendChild(this.createElement('div', 'game-info', moment(event.startDate, 'X').format('h:mm a')));
        }

      });

      dayBlock.append(header,body);
      
      return dayBlock;
    },
    
    /**
     * Creates and returns a DOM element with the given tag, class, and optional text content.
     *
     * @param {string} tag - The HTML tag to create (e.g., 'div', 'span').
     * @param {string} className - The CSS class to assign to the element.
     * @param {string} [text=""] - Optional text content to set.
     * @returns {HTMLElement} - The constructed DOM element.
     */
    createElement(tag, className, text = "") {
      const element = document.createElement(tag);
      element.className = className;

      if (text !== "") {
        element.textContent = text;
      }
      return element;
    },

    /**
     * Creates and returns an <img> element for the given NBA team's logo.
     *
     * @param {string} teamName - The NBA team's name (used to look up team ID).
     * @param {string} className - The CSS class to apply to the image.
     * @returns {HTMLImageElement} - The image element for the team logo.
     */
    getTeamLogo: function (teamName, className) {
      const teamId = nbaTeams.get(teamName);
      let img = this.createElement('img', className);
      img.src = logoUrl.replace("{0}", teamId);
      img.alt = `${teamName} Logo`;
      return img;
    },

    /**
     * Parses the input text and returns a <div> containing icon elements
     * for each unique matching garbage/recycling keyword.
     *
     * @param {string} text - Input text to search for keywords.
     * @returns {HTMLDivElement} - A container <div> with icon <i> elements.
     */
    getGarbageIcons(text) {
      const words = text.toLowerCase().split(/\W+/);
      const icons_set = new Set();
      
      const container = this.createElement('div');

      words.forEach((word, index) => {
        if (garbageIconMap.has(word) && !icons_set.has(word)) {
          const icon = document.createElement('i');
          icon.className = garbageIconMap.get(word) + " icon";
          container.appendChild(icon);
          icons_set.add(word);
        }
      });

      return container;
    },

    /**
     * Returns an array of stylesheet URLs to be loaded by the module.
     *
     * @returns {string[]} - List of CSS file paths or URLs.
     */
    getStyles: function() {
      return ["MMM-homecal.css",
              "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      ];
    },

    /**
     * Parses various calendar date formats into a Moment object.
     * Handles UNIX timestamps (ms), basic YYYYMMDD, or falls back to Moment's parser.
     *
     * @param {string} dateString - The date string to parse.
     * @returns {moment.Moment} - A Moment.js object representing the date.
     */
    parseCalendarDates(dateString) {
      if (typeof dateString === "string" && /^\d{13}$/.test(dateString)) {
        return moment(Number(dateString)); // Unix ms timestamp as string
      }
    
      if (/^\d{8}$/.test(dateString)) {
        return moment(dateString, "YYYYMMDD", true);
      }
      
      // Fallback to Moment's guess (may trigger warning in dev)
      return moment(dateString); 
    },

    /**
     * Receives calendar event notifications, filters events from the default calendar module,
     * expands metadata (like location and icon usage), and triggers a DOM update.
     *
     * @param {string} notification - The notification type received.
     * @param {*} payload - The event data.
     * @param {object} sender - The sender module info.
     */
    notificationReceived(notification, payload, sender){
      if (notification === "CALENDAR_EVENTS" && sender?.name === "calendar") {
        maximumNumberOfDays = sender.config.maximumNumberOfDays;
        this.calendarEvents = payload.reduce((acc, event) => {
          acc[event.calendarName] = acc[event.calendarName] || [];
          const cal = sender.config.calendars.find(cal => cal.name === event.calendarName);
        
          const expand_event = {
            ...event,
            cal_location: Object.prototype.hasOwnProperty.call(cal, 'cal_location') ? cal.cal_location : "middle",
            use_icons:  Object.prototype.hasOwnProperty.call(cal, 'use_icons') ? cal.use_icons : false,
          };

          acc[event.calendarName].push(expand_event);

          return acc;
        }, {});
        this.updateDom();
      }

    },
  
  });