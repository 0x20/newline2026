// Accordion functionality
document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
        button.parentElement.classList.toggle('active');
    });
});

// Icon replacement on click
const icons = ['drone.png', '3d.png', 'gamecontroller.png', 'solderiron.png', 'shroom.png'];

function updateDroneAnimation(icon) {
    const currentSrc = icon.src.split('/').pop();
    icon.style.animation = currentSrc === 'drone.png' ? 'droneTurn 10s ease-in-out infinite' : '';
}

document.querySelectorAll('.float-icon').forEach((icon) => {
    icon.style.cursor = 'pointer';
    icon.style.pointerEvents = 'auto';
    updateDroneAnimation(icon);

    icon.addEventListener('click', () => {
        const currentSrc = icon.src.split('/').pop();
        const availableIcons = icons.filter(i => i !== currentSrc);
        icon.src = `img/icons/${availableIcons[Math.floor(Math.random() * availableIcons.length)]}`;
        updateDroneAnimation(icon);
    });
});

// Schedule rendering from pretalx
(function renderSchedule() {
    const container = document.getElementById('schedule');
    if (!container) return;
    const fallbackPage = container.dataset.schedulePage;

    fetchScheduleDays()
        .then(days => {
            const cards = days.map(buildDayCard).filter(Boolean);
            if (!cards.length) {
                renderFallback(container, fallbackPage);
                return;
            }
            container.replaceChildren(...cards);
        })
        .catch(() => renderFallback(container, fallbackPage));

    function buildDayCard(day) {
        if (!day.sessions.length) return null;

        const card = document.createElement('div');
        card.className = 'lineup-group schedule-day';

        const heading = document.createElement('h4');
        heading.className = 'lineup-heading';
        heading.textContent = formatDayLabel(day.date);
        card.appendChild(heading);

        const list = document.createElement('ul');
        list.className = 'lineup-list';
        for (const session of day.sessions) list.appendChild(buildSessionItem(session));
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
        const speakers = speakersText(s);
        if (speakers) parts.push(speakers);
        if (s.room) parts.push(s.room);
        speakerLine.textContent = parts.join(' · ');
        meta.appendChild(speakerLine);

        if (s.start) {
            const timeChip = document.createElement('span');
            timeChip.className = 'lineup-time';
            timeChip.textContent = s.start;
            meta.appendChild(timeChip);
        }

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
