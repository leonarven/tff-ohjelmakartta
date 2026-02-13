// Ladataan festivaalidata (tämä korvataan oikealla datalla)
let festivalData = null;
let venuesPerDay = {}; // Tallentaa kunkin päivän sijaintimäärän

const PREDEFINED_TAGS = [
	{ id: 'selected', label: '#selected' },
	{ id: 'interested', label: '#interested' },
	{ id: 'notinterested', label: '#notinterested' },

	// Special tags for "want to watch with special persons". Names anonymized.
	{ id: 'seura-manuli', label: '#manuli' },
	{ id: 'seura-vikunja', label: '#vikunja' },
];

// Record<screening_id, string[]>
let screeningTags = {};

function getTags(screeningId) {
	return screeningTags[screeningId] || [];
}

function setTag(screeningId, tagId) {
	if (!screeningTags[screeningId]) screeningTags[screeningId] = [];
	if (!screeningTags[screeningId].includes(tagId)) {
		screeningTags[screeningId].push(tagId);
	}
}

function removeTag(screeningId, tagId) {
	if (!screeningTags[screeningId]) return;
	screeningTags[screeningId] = screeningTags[screeningId].filter(t => t !== tagId);
	if (screeningTags[screeningId].length === 0) delete screeningTags[screeningId];
}

function toggleTag(screeningId, tagId) {
	if (hasTag(screeningId, tagId)) {
		removeTag(screeningId, tagId);
	} else {
		setTag(screeningId, tagId);
	}
}

function hasTag(screeningId, tagId) {
	return (screeningTags[screeningId] || []).includes(tagId);
}

function getScreeningsWithTag(tagId) {
	return Object.keys(screeningTags).filter(id => hasTag(id, tagId));
}

// Ladataan data ja alustetaan sovellus
async function init() {
	try {
		// Tässä ladattaisiin oikea data
		festivalData = await fetchFestivalData();
		loadFromHash();
		renderSchedule();
		updateStats();
	} catch (error) {
		console.error('Virhe datan lataamisessa:', error);
	}
}

async function fetchFestivalData() {
	const STORAGE_KEY_FESTIVAL_DATA = "tff2026_festival_data";
	
	let data;
	
	try {
		if (!(new URLSearchParams(location.search)).get("reset")) {
			data = JSON.parse( localStorage.getItem( STORAGE_KEY_FESTIVAL_DATA ));
		}
	} catch (error) {
		console.warn( error );
	}
	
	if (!data) {
		data = await (await fetch("/data.json")).json();
		localStorage.setItem( STORAGE_KEY_FESTIVAL_DATA, JSON.stringify( data ) );
	}
	
	if (!data) throw new Error( "Unable to fetch festivalData!" );
	
	return data;
}

function renderSchedule() {
	const container = document.getElementById('schedule-container');
	container.innerHTML = '';
	
	// Ryhmitellään näytökset päivittäin
	const screeningsByDay = groupScreeningsByDay();
	
	// Luodaan legenda
	renderLegend();
	
	// Renderöidään jokaiselle päivälle oma osio
	Object.keys(screeningsByDay).sort().forEach(date => {
		const daySection = document.createElement('div');
		daySection.className = 'day-section';
		
		const dayHeader = document.createElement('div');
		dayHeader.className = 'day-header';
		dayHeader.textContent = formatDate(date);
		daySection.appendChild(dayHeader);
		
		const dayGrid = renderDayGrid(date, screeningsByDay[date]);
		daySection.appendChild(dayGrid);
		
		container.appendChild(daySection);
	});
}

function groupScreeningsByDay() {
	const groups = {};
	
	festivalData.screenings.forEach(screening => {
		const date = screening.datetime_start.split('T')[0];
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(screening);
	});
	
	return groups;
}

function renderDayGrid(date, screenings) {
	const grid = document.createElement('div');
	grid.className = 'schedule-grid';
	
	// Laske kuinka monta sijaintia on käytössä tänä päivänä
	const venuesForDay = getVenuesForDay(screenings);
	venuesPerDay[date] = venuesForDay;
	const venueCount = venuesForDay.length;
	
	// Aseta grid-sarakkeet dynaamisesti: 1 aikasarake + N sijaintia
	grid.style.gridTemplateColumns = `60px repeat(${venueCount}, 1fr)`;
	
	// Renderöi header-rivi
	renderGridHeader(grid, venuesForDay);
	
	// Luo aikaruudukko (9:00 - 24:00)
	const timeSlots = generateTimeSlots();
	
	timeSlots.forEach(time => {
		// Aikasarake
		const timeCell = document.createElement('div');
		timeCell.className = 'time-row';
		timeCell.textContent = time;
		grid.appendChild(timeCell);
		
		// Sijaintisolut
		venuesForDay.forEach(venue => {
			const cell = document.createElement('div');
			cell.className = 'screening-cell';
			cell.dataset.time = time;
			cell.dataset.venue = venue.venue_id;
			cell.dataset.date = date;
			
			// Lisää näytökset jotka alkavat tämän tunnin aikana
			const cellScreenings = getScreeningsForCell(date, venue.venue_id, time, screenings);
			cellScreenings.forEach(screening => {
				const box = createScreeningBox(screening);
				cell.appendChild(box);
			});
			
			grid.appendChild(cell);
		});
	});
	
	return grid;
}

function getVenuesForDay(screenings) {
	// Kerrää uniikit sijainnit jotka ovat käytössä näissä näytöksissä
	const venueIds = [...new Set(screenings.map(s => s.venue_id))];
	return festivalData.venues.filter(v => venueIds.includes(v.venue_id));
}

function renderGridHeader(grid, venues) {
	// Tyhjä kulma-solu
	const corner = document.createElement('div');
	corner.className = 'time-column';
	corner.textContent = '';
	grid.appendChild(corner);
	
	// Sijaintiotsikot
	venues.forEach(venue => {
		const header = document.createElement('div');
		header.className = 'venue-header';
		header.textContent = venue.name.replace('Finnkino Cine Atlas ', 'CA');
		grid.appendChild(header);
	});
}

function generateTimeSlots() {
	const slots = [];
	for (let hour = 9; hour <= 23; hour++) {
		slots.push(`${hour.toString().padStart(2, '0')}:00`);
	}
	return slots;
}

function getScreeningsForCell(date, venueId, timeSlot, screenings) {
	const [hour] = timeSlot.split(':');
	const slotStart = parseInt(hour);
	
	return screenings.filter(s => {
		if (s.venue_id !== venueId) return false;
		
		const startTime = new Date(s.datetime_start);
		const startHour = startTime.getHours();
		
		return startHour === slotStart;
	});
}

function createScreeningBox(screening) {
	const box = document.createElement('div');
	box.className = `screening-box series-${screening.series_id}`;
	
	if (screening.is_free) {
		box.classList.add('free-screening');
	}
	
	const tags = getTags(screening.screening_id);
	if (hasTag(screening.screening_id, 'selected')) box.classList.add('selected');
	tags.forEach(tagId => {
		if (tagId !== 'selected') box.classList.add(`tag-${tagId}`);
	});
	
	const startTime = new Date(screening.datetime_start);
	const minutes = startTime.getMinutes();
	
	const topOffset = (minutes / 60) * 40;
	const heightPx = (screening.duration_minutes / 60) * 40;
	
	box.style.top = `${topOffset}px`;
	box.style.height = `${heightPx}px`;
	box.style.minHeight = `${heightPx}px`;
	
	const tagChipsContainer = document.createElement('div');
	tagChipsContainer.className = 'screening-tag-chips';
	tags.forEach(tagId => {
		const def = PREDEFINED_TAGS.find(t => t.id === tagId);
		if (!def) return;
		const chip = document.createElement('span');
		chip.className = `tag-chip tag-chip-${tagId}`;
		chip.textContent = def.label;
		chip.onclick = (e) => { e.stopPropagation(); toggleTag(screening.screening_id, tagId); refreshAfterTagChange(); };
		tagChipsContainer.appendChild(chip);
	});

	let titleInnerHtml = screening.title;

	if (screening.url) {
		titleInnerHtml += ` <small><a href="${screening.url}" onclick="event.stopPropagation();" target="_blank" class="screening-url-link">Linkki</a></small>`;
	}
	
	box.innerHTML = `
		<div class="screening-title">${titleInnerHtml}</div>
		<div class="screening-time">${formatTime(screening.datetime_start)} - ${formatTime(screening.datetime_end)} (${screening.duration_minutes} min)</div>
		<div class="screening-code">${screening.ticket_code || screening.screening_id}</div>
	`;
	box.appendChild(tagChipsContainer);
	
	const tagMenuBtn = document.createElement('button');
	tagMenuBtn.className = 'tag-menu-btn';
	tagMenuBtn.type = 'button';
	tagMenuBtn.textContent = '⋯';
	tagMenuBtn.title = 'Tagit';
	tagMenuBtn.onclick = (e) => {
		e.stopPropagation();
		openTagMenu(e.target, screening.screening_id);
	};
	box.appendChild(tagMenuBtn);
	
	box.onclick = (e) => {
		if (e.target.closest('.tag-menu-btn') || e.target.closest('.tag-chip')) return;
		toggleTag(screening.screening_id, 'selected');
		refreshAfterTagChange();
	};
	
	return box;
}

function openTagMenu(anchor, screeningId) {
	closeTagMenu();
	const menu = document.createElement('div');
	menu.className = 'tag-menu';
	menu.dataset.screeningId = screeningId;
	PREDEFINED_TAGS.forEach(({ id, label }) => {
		const item = document.createElement('button');
		item.type = 'button';
		item.className = 'tag-menu-item' + (hasTag(screeningId, id) ? ' active' : '');
		item.textContent = hasTag(screeningId, id) ? `${label} ✓` : label;
		item.onclick = (e) => {
			e.stopPropagation();
			toggleTag(screeningId, id);
			refreshAfterTagChange();
			closeTagMenu();
		};
		menu.appendChild(item);
	});
	document.body.appendChild(menu);
	const rect = anchor.getBoundingClientRect();
	menu.style.left = `${rect.left}px`;
	menu.style.top = `${rect.bottom + 4}px`;
	window._tagMenu = menu;
	setTimeout(() => document.addEventListener('click', closeTagMenu), 0);
}

function closeTagMenu() {
	if (window._tagMenu) {
		window._tagMenu.remove();
		window._tagMenu = null;
		document.removeEventListener('click', closeTagMenu);
	}
}

function refreshAfterTagChange() {
	saveToHash();
	renderSchedule();
	updateStats();
	updateSelectedList();
}

function toggleSelectedTag(screeningId) {
	toggleTag(screeningId, 'selected');
	refreshAfterTagChange();
}

function updateStats() {
	const selectedIds = getScreeningsWithTag('selected');
	const selectedCount = selectedIds.length;
	const paidCount = selectedIds.filter(id => {
		const screening = festivalData.screenings.find(s => s.screening_id === id);
		return screening && !screening.is_free;
	}).length;
	
	document.getElementById('selected-count').textContent = selectedCount;
	document.getElementById('paid-count').textContent = paidCount;
	
	const paidCounter = document.getElementById('paid-counter');
	if (paidCount > 10) {
		paidCounter.classList.add('warning');
	} else {
		paidCounter.classList.remove('warning');
	}
	
	const hasConflicts = checkConflicts();
	document.getElementById('conflict-warning').style.display = hasConflicts ? 'block' : 'none';
}

function checkConflicts() {
	const selectedIds = getScreeningsWithTag('selected');
	const selected = selectedIds.map(id =>
		festivalData.screenings.find(s => s.screening_id === id)
	).filter(Boolean);
	
	// First, remove all previous conflict classes
	document.querySelectorAll('.screening-box.conflict').forEach(box => {
		box.classList.remove('conflict');
	});

	let hasConflict = false;
	let conflictTitles = new Set();

	// Gather all conflicts, store all involved titles
	for (let i = 0; i < selected.length; i++) {
		for (let j = i + 1; j < selected.length; j++) {
			if (screeningsOverlap(selected[i], selected[j])) {
				conflictTitles.add(selected[i].title);
				conflictTitles.add(selected[j].title);
				hasConflict = true;
			}
		}
	}

	// Mark all boxes with .conflict if their title is in the conflict set
	if (hasConflict && conflictTitles.size > 0) {
		document.querySelectorAll('.screening-box').forEach(box => {
			const title = box.querySelector('.screening-title')?.textContent;
			if (conflictTitles.has(title)) {
				box.classList.add('conflict');
			}
		});
	}

	return hasConflict;
}


function screeningsOverlap(s1, s2) {
	const start1 = new Date(s1.datetime_start);
	const end1 = new Date(s1.datetime_end);
	const start2 = new Date(s2.datetime_start);
	const end2 = new Date(s2.datetime_end);
	
	return (start1 < end2 && end1 > start2);
}

function updateSelectedList() {
	const container = document.getElementById('selected-screenings');
	container.innerHTML = '';
	
	const selectedIds = getScreeningsWithTag('selected');
	if (selectedIds.length === 0) {
		container.innerHTML = '<p style="opacity: 0.5;">Ei #selected-tagattuja näytöksiä</p>';
		return;
	}
	
	const selected = selectedIds.map(id => festivalData.screenings.find(s => s.screening_id === id)).filter(Boolean).sort((a, b) => new Date(a.datetime_start) - new Date(b.datetime_start));
	
	selected.forEach(screening => {
		const item = document.createElement('div');
		item.className = 'selected-item';
		item.innerHTML = `
				<div>
					<strong>${screening.title}</strong><br>
					<small>${formatDateTime(screening.datetime_start)} - ${formatDateTime(screening.datetime_end)} | ${screening.venue_name} | ${screening.duration_minutes} min ${screening.is_free ? '(ILMAINEN)' : ''}</small>
				</div>
				<button class="remove-btn" onclick="toggleSelectedTag('${screening.screening_id}')">Poista</button>
			`;
		container.appendChild(item);
	});
}

function renderLegend() {
	const legend = document.getElementById('legend');
	const series = [...new Set(festivalData.screenings.map(s => s.series_id))];
	
	legend.innerHTML = series.map(seriesId => {
		const seriesInfo = festivalData.series_definitions?.find(s => s.series_id === seriesId);
		return `
				<div class="legend-item">
					<div class="legend-color series-${seriesId}"></div>
					<span>${seriesInfo?.name || seriesId}</span>
				</div>
			`;
	}).join('');
}

function formatDate(dateString) {
	const date = new Date(dateString);
	const days = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'];
	return `${days[date.getDay()]} ${date.getDate()}.${date.getMonth() + 1}.`;
}

function formatTime(datetimeString) {
	const date = new Date(datetimeString);
	return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function formatDateTime(datetimeString) {
	return `${formatDate(datetimeString.split('T')[0])} ${formatTime(datetimeString)}`;
}

const HASH_PARAM_PREFIX = 'tag[';

function saveToHash() {
	const params = new URLSearchParams();
	PREDEFINED_TAGS.forEach(({ id }) => {
		const ids = getScreeningsWithTag(id);
		if (ids.length) params.set(HASH_PARAM_PREFIX + id + ']', ids.join(','));
	});
	const query = params.toString();
	location.hash = query ? '?' + query : '';
}

function loadFromHash() {
	const hash = location.hash.substring(1);
	if (!hash || !hash.startsWith('?')) return;
	const params = new URLSearchParams(hash);
	screeningTags = {};
	PREDEFINED_TAGS.forEach(({ id }) => {
		const key = HASH_PARAM_PREFIX + id + ']';
		const val = params.get(key);
		if (val) {
			val.split(',').forEach(sid => {
				const tid = sid.trim();
				if (tid) setTag(tid, id);
			});
		}
	});
}

function clearSelection() {
	if (confirm('Haluatko varmasti tyhjentää kaikki tagit?')) {
		screeningTags = {};
		saveToHash();
		renderSchedule();
		updateStats();
		updateSelectedList();
	}
}

// Inline onclick handlers need these on window (script is module)
window.toggleSelectedTag = toggleSelectedTag;
window.clearSelection = clearSelection;

// Käynnistä sovellus
init();