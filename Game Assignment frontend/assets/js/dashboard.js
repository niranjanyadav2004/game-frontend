document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('jwtToken');
  const username = localStorage.getItem('username');
  const playerId = localStorage.getItem('player_id');

  const navUsername = document.getElementById('navUsername');
  const alertEl = document.getElementById('dashAlert');

  const homeSection = document.getElementById('homeSection');
  const leaderboardSection = document.getElementById('leaderboardSection');
  const eventsSection = document.getElementById('eventsSection');

  const tileLevel = document.getElementById('tileLevel');
  const tileGold = document.getElementById('tileGold');
  const tileCash = document.getElementById('tileCash');
  const tileGem = document.getElementById('tileGem');
  const progressMeta = document.getElementById('progressMeta');

  const navHome = document.getElementById('navHome');
  const navLeaderboard = document.getElementById('navLeaderboard');
  const navEvents = document.getElementById('navEvents');
  const logoutBtn = document.getElementById('logoutBtn');

  const addGameBtn = document.getElementById('addGameBtn');
  const gamesContainer = document.getElementById('gamesContainer');
  const addGameForm = document.getElementById('addGameForm');
  const submitGameBtn = document.getElementById('submitGameBtn');
  const addGameAlert = document.getElementById('addGameAlert');
  const addGameModal = new bootstrap.Modal(document.getElementById('addGameModal'));

  const saveProgressBtn = document.getElementById('saveProgressBtn');
  const saveProgressForm = document.getElementById('saveProgressForm');
  const submitProgressBtn = document.getElementById('submitProgressBtn');
  const saveProgressAlert = document.getElementById('saveProgressAlert');
  const progressGameId = document.getElementById('progressGameId');
  const saveProgressModal = new bootstrap.Modal(document.getElementById('saveProgressModal'));

  const submitScoreBtn = document.getElementById('submitScoreBtn');
  const submitScoreForm = document.getElementById('submitScoreForm');
  const submitScoreSubmitBtn = document.getElementById('submitScoreSubmitBtn');
  const submitScoreAlert = document.getElementById('submitScoreAlert');
  const scoreGameId = document.getElementById('scoreGameId');
  const submitScoreModal = new bootstrap.Modal(document.getElementById('submitScoreModal'));

  const leaderboardGameId = document.getElementById('leaderboardGameId');
  const leaderboardCountrySelect = document.getElementById('leaderboardCountrySelect');
  const leaderboardAlert = document.getElementById('leaderboardAlert');
  const leaderboardBody = document.getElementById('leaderboardBody');

  const createEventBtn = document.getElementById('createEventBtn');
  const eventForm = document.getElementById('eventForm');
  const submitEventBtn = document.getElementById('submitEventBtn');
  const eventAlert = document.getElementById('eventAlert');
  const eventGameId = document.getElementById('eventGameId');
  const eventsContainer = document.getElementById('eventsContainer');
  const eventsAlert = document.getElementById('eventsAlert');
  const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));

  let games = []; // store games for dropdown and use
  let userCountry = localStorage.getItem('userCountry') || 'Unknown';
  let editingEventId = null;

  if (!token || !playerId) {
    window.location.href = 'login.html';
    return;
  }

  navUsername.textContent = username ? `Signed in as ${username}` : '';

  function showSection(section) {
    homeSection.style.display = (section === 'home') ? '' : 'none';
    leaderboardSection.style.display = (section === 'leaderboard') ? '' : 'none';
    eventsSection.style.display = (section === 'events') ? '' : 'none';
    navHome.classList.toggle('active', section === 'home');
    navLeaderboard.classList.toggle('active', section === 'leaderboard');
    navEvents.classList.toggle('active', section === 'events');
  }

  navHome.addEventListener('click', (e) => { e.preventDefault(); showSection('home'); fetchProgression(); fetchGames(); });
  navLeaderboard.addEventListener('click', (e) => { e.preventDefault(); showSection('leaderboard'); });
  navEvents.addEventListener('click', (e) => { e.preventDefault(); showSection('events'); });

  async function fetchProgression() {
    progressMeta.textContent = '';
    tileLevel.textContent = '...'; tileGold.textContent = '...'; tileCash.textContent = '...'; tileGem.textContent = '...';

    try {
      const res = await fetch(`http://localhost:8080/api/progression/${playerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        tileLevel.textContent = data.level ?? '—';
        tileGold.textContent = data.gold ?? '—';
        tileCash.textContent = data.cash ?? '—';
        tileGem.textContent = data.gem ?? '—';
      } else if (res.status === 401) {
        alertEl.innerHTML = '<div class="alert alert-warning">Session expired, please login again.</div>';
        setTimeout(() => { localStorage.removeItem('jwtToken'); window.location.href = 'login.html'; }, 1200);
      } else if (res.status === 404) {
        // No progression data yet, just show dashes
        tileLevel.textContent = '—';
        tileGold.textContent = '—';
        tileCash.textContent = '—';
        tileGem.textContent = '—';
      } else {
        alertEl.innerHTML = `<div class="alert alert-danger">Unable to fetch progression (status ${res.status}).</div>`;
        tileLevel.textContent = '—'; tileGold.textContent = '—'; tileCash.textContent = '—'; tileGem.textContent = '—';
      }
    } catch (err) {
      alertEl.innerHTML = '<div class="alert alert-danger">Network error while fetching progression.</div>';
      console.error(err);
      tileLevel.textContent = '—'; tileGold.textContent = '—'; tileCash.textContent = '—'; tileGem.textContent = '—';
    }
  }

  async function fetchGames() {
    gamesContainer.innerHTML = '<p class="text-muted">Loading games...</p>';
    try {
      const res = await fetch('http://localhost:8080/api/games/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        games = await res.json();
        if (Array.isArray(games) && games.length > 0) {
          gamesContainer.innerHTML = '';
          games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'col-md-6 col-lg-4';
            gameCard.innerHTML = `
              <div class="card game-card">
                <div class="card-body">
                  <h5 class="card-title">${game.name}</h5>
                  <p class="card-text text-muted">${game.description}</p>
                </div>
              </div>
            `;
            gamesContainer.appendChild(gameCard);
          });
          // populate game dropdown
          populateGameDropdown();
          populateScoreGameDropdown();
        } else {
          gamesContainer.innerHTML = '<p class="text-muted">No games available. Click "Add Game" to create one.</p>';
        }
      } else if (res.status === 401) {
        alertEl.innerHTML = '<div class="alert alert-warning">Session expired, please login again.</div>';
        setTimeout(() => { localStorage.removeItem('jwtToken'); window.location.href = 'login.html'; }, 1200);
      } else {
        gamesContainer.innerHTML = `<p class="text-danger">Unable to fetch games (status ${res.status}).</p>`;
      }
    } catch (err) {
      gamesContainer.innerHTML = '<p class="text-danger">Network error while fetching games.</p>';
      console.error(err);
    }
  }

  function populateGameDropdown() {
    progressGameId.innerHTML = '<option value="">Select a game...</option>';
    games.forEach(game => {
      const option = document.createElement('option');
      option.value = game.id;
      option.textContent = game.name;
      progressGameId.appendChild(option);
    });
  }

  function populateScoreGameDropdown() {
    scoreGameId.innerHTML = '<option value="">Select a game...</option>';
    leaderboardGameId.innerHTML = '<option value="">Select a game...</option>';
    eventGameId.innerHTML = '<option value="">Select a game...</option>';
    games.forEach(game => {
      const option1 = document.createElement('option');
      option1.value = game.id;
      option1.textContent = game.name;
      scoreGameId.appendChild(option1);

      const option2 = document.createElement('option');
      option2.value = game.id;
      option2.textContent = game.name;
      leaderboardGameId.appendChild(option2);

      const option3 = document.createElement('option');
      option3.value = game.id;
      option3.textContent = game.name;
      eventGameId.appendChild(option3);
    });
  }

  function populateCountriesDropdown() {
    const countries = [
      'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
      'Spain', 'Italy', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Denmark',
      'Poland', 'Czech Republic', 'Hungary', 'Austria', 'Switzerland', 'Ireland',
      'Portugal', 'Greece', 'Turkey', 'Russia', 'Ukraine', 'Japan', 'South Korea',
      'China', 'India', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia',
      'Peru', 'Venezuela', 'New Zealand', 'Singapore', 'Malaysia', 'Thailand',
      'Vietnam', 'Philippines', 'Indonesia', 'South Africa', 'Egypt', 'Nigeria',
      'Kenya', 'Ethiopia', 'Saudi Arabia', 'United Arab Emirates', 'Israel',
      'Pakistan', 'Bangladesh', 'Sri Lanka', 'Hong Kong', 'Taiwan'
    ];
    
    leaderboardCountrySelect.innerHTML = '<option value="">Global (All Countries)</option>';
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      leaderboardCountrySelect.appendChild(option);
    });
  }

  addGameBtn.addEventListener('click', () => {
    addGameForm.reset();
    addGameAlert.innerHTML = '';
    addGameModal.show();
  });

  submitGameBtn.addEventListener('click', async () => {
    const name = document.getElementById('gameName').value.trim();
    const description = document.getElementById('gameDescription').value.trim();
    addGameAlert.innerHTML = '';

    if (!name || !description) {
      addGameAlert.innerHTML = '<div class="alert alert-warning">Please fill all fields.</div>';
      return;
    }

    submitGameBtn.disabled = true;
    submitGameBtn.textContent = 'Adding...';

    try {
      const res = await fetch('http://localhost:8080/api/games/add', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });

      if (res.ok) {
        addGameAlert.innerHTML = '<div class="alert alert-success">Game added successfully!</div>';
        setTimeout(() => {
          addGameModal.hide();
          fetchGames();
        }, 800);
      } else if (res.status === 401) {
        addGameAlert.innerHTML = '<div class="alert alert-warning">Session expired.</div>';
      } else {
        const err = await res.json().catch(() => ({}));
        addGameAlert.innerHTML = `<div class="alert alert-danger">${err.message || 'Failed to add game.'}</div>`;
      }
    } catch (err) {
      addGameAlert.innerHTML = '<div class="alert alert-danger">Network error while adding game.</div>';
      console.error(err);
    } finally {
      submitGameBtn.disabled = false;
      submitGameBtn.textContent = 'Add Game';
    }
  });

  saveProgressBtn.addEventListener('click', () => {
    saveProgressForm.reset();
    saveProgressAlert.innerHTML = '';
    saveProgressModal.show();
  });

  submitProgressBtn.addEventListener('click', async () => {
    const gameId = parseInt(progressGameId.value);
    const level = parseInt(document.getElementById('progressLevel').value);
    const gold = parseInt(document.getElementById('progressGold').value);
    const cash = parseInt(document.getElementById('progressCash').value);
    const gem = parseInt(document.getElementById('progressGem').value);
    const rewardsText = document.getElementById('progressRewards').value.trim();

    saveProgressAlert.innerHTML = '';

    if (!gameId || !level || gold === null || cash === null || gem === null) {
      saveProgressAlert.innerHTML = '<div class="alert alert-warning">Please fill all required fields.</div>';
      return;
    }

    // Parse rewards if provided
    let rewards = rewardsText || null;
    if (rewardsText) {
      try {
        JSON.parse(rewardsText);
      } catch (e) {
        saveProgressAlert.innerHTML = '<div class="alert alert-warning">Rewards must be valid JSON format.</div>';
        return;
      }
    }

    submitProgressBtn.disabled = true;
    submitProgressBtn.textContent = 'Saving...';

    try {
      const res = await fetch('http://localhost:8080/api/progression/save', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, gameId, level, gold, cash, gem, rewards })
      });

      if (res.ok) {
        saveProgressAlert.innerHTML = '<div class="alert alert-success">Progress saved successfully!</div>';
        setTimeout(() => {
          saveProgressModal.hide();
          fetchProgression();
        }, 800);
      } else if (res.status === 401) {
        saveProgressAlert.innerHTML = '<div class="alert alert-warning">Session expired.</div>';
      } else {
        const err = await res.json().catch(() => ({}));
        saveProgressAlert.innerHTML = `<div class="alert alert-danger">${err.message || 'Failed to save progress.'}</div>`;
      }
    } catch (err) {
      saveProgressAlert.innerHTML = '<div class="alert alert-danger">Network error while saving progress.</div>';
      console.error(err);
    } finally {
      submitProgressBtn.disabled = false;
      submitProgressBtn.textContent = 'Save Progress';
    }
  });

  submitScoreBtn.addEventListener('click', () => {
    submitScoreForm.reset();
    submitScoreAlert.innerHTML = '';
    submitScoreModal.show();
  });

  submitScoreSubmitBtn.addEventListener('click', async () => {
    const gameId = parseInt(scoreGameId.value);
    const score = parseInt(document.getElementById('scoreValue').value);

    submitScoreAlert.innerHTML = '';

    if (!gameId || score === null || score < 0) {
      submitScoreAlert.innerHTML = '<div class="alert alert-warning">Please fill all fields with valid values.</div>';
      return;
    }

    submitScoreSubmitBtn.disabled = true;
    submitScoreSubmitBtn.textContent = 'Submitting...';

    try {
      const res = await fetch('http://localhost:8080/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, gameId, score })
      });

      if (res.ok) {
        submitScoreAlert.innerHTML = '<div class="alert alert-success">Score submitted successfully!</div>';
        setTimeout(() => {
          submitScoreModal.hide();
          fetchLeaderboard();
        }, 800);
      } else if (res.status === 401) {
        submitScoreAlert.innerHTML = '<div class="alert alert-warning">Session expired.</div>';
      } else {
        const err = await res.json().catch(() => ({}));
        submitScoreAlert.innerHTML = `<div class="alert alert-danger">${err.message || 'Failed to submit score.'}</div>`;
      }
    } catch (err) {
      submitScoreAlert.innerHTML = '<div class="alert alert-danger">Network error while submitting score.</div>';
      console.error(err);
    } finally {
      submitScoreSubmitBtn.disabled = false;
      submitScoreSubmitBtn.textContent = 'Submit Score';
    }
  });

  async function fetchLeaderboard() {
    const gameId = parseInt(leaderboardGameId.value);
    const selectedCountry = leaderboardCountrySelect.value;

    leaderboardAlert.innerHTML = '';
    leaderboardBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Loading...</td></tr>';

    if (!gameId) {
      leaderboardBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Select a game to view leaderboard</td></tr>';
      return;
    }

    try {
      let url;
      if (!selectedCountry || selectedCountry === '') {
        url = `http://localhost:8080/api/leaderboard/top/global/${gameId}`;
      } else {
        url = `http://localhost:8080/api/leaderboard/top/country/${gameId}?country=${encodeURIComponent(selectedCountry)}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const leaderboard = await res.json();
        if (Array.isArray(leaderboard) && leaderboard.length > 0) {
          leaderboardBody.innerHTML = '';
          leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td><strong>${index + 1}</strong></td>
              <td>${entry.player.username}</td>
              <td>${entry.country}</td>
              <td><strong>${entry.score}</strong></td>
              <td>${new Date(entry.playeAt).toLocaleDateString()}</td>
            `;
            leaderboardBody.appendChild(row);
          });
        } else {
          leaderboardBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No scores yet for this game.</td></tr>';
        }
      } else if (res.status === 401) {
        leaderboardAlert.innerHTML = '<div class="alert alert-warning">Session expired, please login again.</div>';
      } else {
        leaderboardAlert.innerHTML = `<div class="alert alert-danger">Unable to fetch leaderboard (status ${res.status}).</div>`;
        leaderboardBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading leaderboard</td></tr>';
      }
    } catch (err) {
      leaderboardAlert.innerHTML = '<div class="alert alert-danger">Network error while fetching leaderboard.</div>';
      leaderboardBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Network error</td></tr>';
      console.error(err);
    }
  }

  leaderboardGameId.addEventListener('change', fetchLeaderboard);
  leaderboardCountrySelect.addEventListener('change', fetchLeaderboard);

  // EVENT MANAGEMENT FUNCTIONS
  async function fetchEvents() {
    eventsContainer.innerHTML = '<p class="text-muted">Loading events...</p>';
    eventsAlert.innerHTML = '';

    try {
      const res = await fetch('http://localhost:8080/api/events/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const events = await res.json();
        if (Array.isArray(events) && events.length > 0) {
          eventsContainer.innerHTML = '';
          events.forEach(event => {
            // Format times in 24-hour format (HH:MM)
            const startDate = new Date(event.startTime);
            const endDate = new Date(event.endTime);
            
            const formatTime24 = (date) => {
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}/${month}/${year} ${hours}:${minutes}`;
            };
            
            const startFormatted = formatTime24(startDate);
            const endFormatted = formatTime24(endDate);
            const statusColor = event.status === 'SCHEDULED' ? 'info' : event.status === 'FINISHED' ? 'success' : 'warning';
            
            const eventConfig = JSON.parse(event.eventConfig || '{}');
            
            const eventCard = document.createElement('div');
            eventCard.className = 'col-md-6 col-lg-4';
            eventCard.innerHTML = `
              <div class="card h-100 event-card">
                <div class="card-header bg-${statusColor} text-white">
                  <h5 class="card-title mb-0">${event.name}</h5>
                  <small>${event.game.name}</small>
                </div>
                <div class="card-body">
                  <p class="mb-2"><strong>Start:</strong> ${startFormatted}</p>
                  <p class="mb-2"><strong>End:</strong> ${endFormatted}</p>
                  <p class="mb-2"><strong>Status:</strong> <span class="badge bg-${statusColor}">${event.status}</span></p>
                  <p class="mb-2"><strong>Max Score:</strong> ${eventConfig.maxScore || 'N/A'}</p>
                  <p class="mb-0"><strong>Reward:</strong> ${eventConfig.reward || 'N/A'}</p>
                </div>
                ${event.status !== 'FINISHED' ? `
                <div class="card-footer bg-light">
                  <button class="btn btn-sm btn-warning edit-event-btn w-100" data-event-id="${event.id}">Edit Event</button>
                </div>
                ` : ''}
              </div>
            `;
            eventsContainer.appendChild(eventCard);
          });

          // Add event listeners for edit buttons
          document.querySelectorAll('.edit-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openEditEventModal(parseInt(e.target.dataset.eventId)));
          });
        } else {
          eventsContainer.innerHTML = '<div class="col-12"><p class="text-center text-muted">No events available. Create one now!</p></div>';
        }
      } else if (res.status === 401) {
        eventsAlert.innerHTML = '';
      } else {
        eventsAlert.innerHTML = `<div class="alert alert-danger">Unable to fetch events (status ${res.status}).</div>`;
      }
    } catch (err) {
      eventsAlert.innerHTML = '<div class="alert alert-danger">Network error while fetching events.</div>';
      eventsContainer.innerHTML = '<div class="col-12"><p class="text-center text-danger">Network error</p></div>';
      console.error(err);
    }
  }

  function openCreateEventModal() {
    editingEventId = null;
    eventForm.reset();
    eventAlert.innerHTML = '';
    document.getElementById('eventModalLabel').textContent = 'Create Event';
    submitEventBtn.textContent = 'Create Event';
    eventModal.show();
  }

  function openEditEventModal(eventId) {
    editingEventId = eventId;
    eventForm.reset();
    eventAlert.innerHTML = '';
    document.getElementById('eventModalLabel').textContent = 'Edit Event';
    submitEventBtn.textContent = 'Update Event';
    
    // Fetch event details from backend and populate form
    fetch(`http://localhost:8080/api/events/${eventId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(event => {
        document.getElementById('eventName').value = event.name;
        document.getElementById('eventGameId').value = event.game.id;
        
        // Convert ISO datetime to local datetime format for input
        // Remove the Z and milliseconds to format for datetime-local input
        const startTimeFormatted = event.startTime.split('.')[0]; // Remove milliseconds
        const endTimeFormatted = event.endTime.split('.')[0]; // Remove milliseconds
        
        document.getElementById('eventStartDate').value = startTimeFormatted;
        document.getElementById('eventEndDate').value = endTimeFormatted;
        
        const eventConfig = JSON.parse(event.eventConfig || '{}');
        document.getElementById('eventMaxScore').value = eventConfig.maxScore || 100;
        document.getElementById('eventReward').value = eventConfig.reward || '';
        
        eventModal.show();
      })
      .catch(err => {
        eventAlert.innerHTML = '<div class="alert alert-danger">Unable to load event details.</div>';
        console.error(err);
      });
  }

  createEventBtn.addEventListener('click', openCreateEventModal);

  submitEventBtn.addEventListener('click', async () => {
    const gameId = parseInt(eventGameId.value);
    const eventName = document.getElementById('eventName').value.trim();
    const startDateInput = document.getElementById('eventStartDate').value;
    const endDateInput = document.getElementById('eventEndDate').value;
    const maxScore = document.getElementById('eventMaxScore').value;
    const reward = document.getElementById('eventReward').value.trim();

    eventAlert.innerHTML = '';

    if (!gameId || !eventName || !startDateInput || !endDateInput || !maxScore || !reward) {
      eventAlert.innerHTML = '<div class="alert alert-warning">Please fill all fields.</div>';
      return;
    }

    // Convert datetime-local to ISO format (already in correct local time)
    // datetime-local format is YYYY-MM-DDTHH:mm, we need to add seconds
    const startTime = startDateInput + ':00';
    const endTime = endDateInput + ':00';

    const eventConfig = JSON.stringify({ maxScore: parseInt(maxScore), reward });

    submitEventBtn.disabled = true;
    submitEventBtn.textContent = editingEventId ? 'Updating...' : 'Creating...';

    try {
      let url = 'http://localhost:8080/api/events/create';
      let method = 'POST';
      let body = JSON.stringify({ gameId, name: eventName, startTime, endTime, eventConfig });

      if (editingEventId) {
        url = `http://localhost:8080/api/events/${editingEventId}`;
        method = 'PUT';
        body = JSON.stringify({ gameId, name: eventName, startTime, endTime, eventConfig });
      }

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body
      });

      if (res.ok) {
        eventAlert.innerHTML = `<div class="alert alert-success">Event ${editingEventId ? 'updated' : 'created'} successfully!</div>`;
        setTimeout(() => {
          eventModal.hide();
          fetchEvents();
        }, 800);
      } else if (res.status === 401) {
        eventAlert.innerHTML = '<div class="alert alert-warning">Session expired.</div>';
      } else {
        const err = await res.json().catch(() => ({}));
        eventAlert.innerHTML = `<div class="alert alert-danger">${err.message || 'Failed to save event.'}</div>`;
      }
    } catch (err) {
      eventAlert.innerHTML = '<div class="alert alert-danger">Network error while saving event.</div>';
      console.error(err);
    } finally {
      submitEventBtn.disabled = false;
      submitEventBtn.textContent = editingEventId ? 'Update Event' : 'Create Event';
    }
  });

  // Populate event game dropdown when games load
  navLeaderboard.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('leaderboard');
  });

  navEvents.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('events');
    fetchEvents();
  });

  showSection('home');
  populateCountriesDropdown();
  fetchProgression();
  fetchGames();

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('player_id');
    localStorage.removeItem('userCountry');
    window.location.href = 'index.html';
  });
});