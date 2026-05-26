const SCHEDULE_URL = 'https://cfp.hackerspace.gent/newline-2026/schedule/export/schedule.json';
const SCHEDULE_PAGE = 'https://cfp.hackerspace.gent/newline-2026/schedule/';

// Friday's pretalx data is wrong — skip API sessions for this day and use static entries only.
const SKIP_API_DAYS = new Set(['2026-05-29']);

const STATIC_EXTRAS = {
    '2026-05-29': [
        {
            date: '2026-05-29T20:00:00+02:00',
            start: '20:00',
            room: 'Hallway',
            title: '[PROMPT]',
            persons: [{ public_name: '[PROMPT]' }],
        },
        {
            date: '2026-05-29T20:00:00+02:00',
            start: '20:00',
            room: 'Hallway',
            title: 'Bloemist',
            persons: [{ public_name: 'Bloemist' }],
        },
        {
            date: '2026-05-29T20:00:00+02:00',
            start: '20:00',
            room: 'Hallway',
            title: 'Eptic Lusion',
            persons: [{ public_name: 'Eptic Lusion · Duke of Philberg · Mindrone' }],
        },
        {
            date: '2026-05-29T22:00:00+02:00',
            start: '22:00',
            room: 'Hallway',
            title: 'DJefke',
            persons: [{ public_name: 'DJefke' }],
        },
    ],
};

async function fetchScheduleDays() {
    const r = await fetch(SCHEDULE_URL, { cache: 'no-cache' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    const days = data?.schedule?.conference?.days || [];
    return days.map(day => {
        const sessions = [];
        if (!SKIP_API_DAYS.has(day.date)) {
            for (const room of Object.keys(day.rooms || {})) {
                for (const t of day.rooms[room]) sessions.push(t);
            }
        }
        for (const extra of STATIC_EXTRAS[day.date] || []) sessions.push(extra);
        sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
        return { date: day.date, sessions };
    });
}

function flattenSessions(days) {
    const all = [];
    for (const d of days) all.push(...d.sessions);
    return all;
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

function speakersText(s) {
    return (s.persons || []).map(p => p.public_name).filter(Boolean).join(', ');
}
