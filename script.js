// Accordion functionality
document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
        const accordionItem = button.parentElement;
        accordionItem.classList.toggle('active');
    });
});

// Icon replacement on click
const icons = ['drone.png', '3d.png', 'gamecontroller.png', 'solderiron.png', 'shroom.png'];

function updateDroneAnimation(icon) {
    const currentSrc = icon.src.split('/').pop();
    if (currentSrc === 'drone.png') {
        icon.style.animation = 'droneTurn 10s ease-in-out infinite';
    } else {
        icon.style.animation = '';
    }
}

// Schedule rendering from pretalx
(function renderSchedule() {
    const container = document.getElementById('schedule');
    if (!container) return;

    const url = container.dataset.scheduleUrl;
    const fallbackPage = container.dataset.schedulePage;

    // Extras not (yet) in pretalx, keyed by ISO date
    const staticExtras = {
        '2026-05-29': [
            {
                date: '2026-05-29T20:00:00+02:00',
                start: '20:00',
                duration: '06:00',
                room: 'Hallway',
                title: '(Silent) Disco',
                persons: [{ public_name: 'Eptic Lusion · Duke of Philberg · Mindrone' }],
            },
        ],
    };

    fetch(url, { cache: 'no-cache' })
        .then(r => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(data => {
            const days = data?.schedule?.conference?.days || [];
            const dayCards = days
                .map(buildDayCard)
                .filter(Boolean);
            if (!dayCards.length) {
                renderFallback(container, fallbackPage);
                return;
            }
            container.replaceChildren(...dayCards);
        })
        .catch(() => renderFallback(container, fallbackPage));

    function buildDayCard(day) {
        const sessions = [];
        for (const room of Object.keys(day.rooms || {})) {
            for (const t of day.rooms[room]) sessions.push(t);
        }
        for (const extra of staticExtras[day.date] || []) sessions.push(extra);
        if (!sessions.length) return null;
        sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

        const card = document.createElement('div');
        card.className = 'lineup-group schedule-day';

        const heading = document.createElement('h4');
        heading.className = 'lineup-heading';
        heading.textContent = formatDayLabel(day.date);
        card.appendChild(heading);

        const list = document.createElement('ul');
        list.className = 'lineup-list';
        for (const session of sessions) list.appendChild(buildSessionItem(session));
        card.appendChild(list);

        return card;
    }

    function buildSessionItem(s) {
        const li = document.createElement('li');

        const title = document.createElement('span');
        title.className = 'lineup-title';
        if (s.url) {
            const a = document.createElement('a');
            a.href = s.url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = s.title || 'Untitled';
            title.appendChild(a);
        } else {
            title.textContent = s.title || 'Untitled';
        }
        li.appendChild(title);

        const meta = document.createElement('span');
        meta.className = 'lineup-meta';

        const speakerLine = document.createElement('span');
        speakerLine.className = 'lineup-speaker';
        const parts = [];
        const speakers = (s.persons || []).map(p => p.public_name).filter(Boolean).join(', ');
        if (speakers) parts.push(speakers);
        if (s.start) parts.push(s.start);
        if (s.room) parts.push(s.room);
        speakerLine.textContent = parts.join(' · ');
        meta.appendChild(speakerLine);

        const dur = formatDuration(s.duration);
        if (dur) {
            const chip = document.createElement('span');
            chip.className = 'lineup-duration';
            chip.textContent = dur;
            meta.appendChild(chip);
        }

        li.appendChild(meta);
        return li;
    }

    function formatDayLabel(isoDate) {
        const [y, m, d] = isoDate.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' });
        const dayMonth = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
        return `${dayName} — ${dayMonth}`;
    }

    function formatDuration(hhmm) {
        if (!hhmm) return '';
        const [h, m] = hhmm.split(':').map(Number);
        const mins = h * 60 + m;
        if (mins < 60) return `${mins} min`;
        if (mins % 60 === 0) return `${h} h`;
        return `${h} h ${m} min`;
    }

    function renderFallback(el, page) {
        const p = document.createElement('p');
        p.className = 'schedule-status';
        if (page) {
            p.innerHTML = 'Schedule unavailable right now — see it on the <a href="' + page + '" target="_blank" rel="noopener">CFP site</a>.';
        } else {
            p.textContent = 'Schedule unavailable right now.';
        }
        el.replaceChildren(p);
    }
})();

document.querySelectorAll('.float-icon').forEach((icon, index) => {
    icon.style.cursor = 'pointer';
    icon.style.pointerEvents = 'auto';

    // Initial animation check
    updateDroneAnimation(icon);

    icon.addEventListener('click', (e) => {
        const currentSrc = icon.src.split('/').pop();
        const availableIcons = icons.filter(i => i !== currentSrc);
        const randomIcon = availableIcons[Math.floor(Math.random() * availableIcons.length)];
        icon.src = `img/icons/${randomIcon}`;

        // Update animation after icon change
        updateDroneAnimation(icon);
    });
});
