(function () {
    const PAPER_START_HOUR = 8;
    const PAPER_START_MINUTE = 30;

    // Compulsory Part Paper 1 start, Hong Kong Time.
    const OFFICIAL_STARTS = {
        2024: '2024-04-10T08:30:00+08:00',
        2025: '2025-04-16T08:30:00+08:00'
    };

    const pad = (value) => String(value).padStart(2, '0');

    function easterSunday(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return utcHktDate(year, month, day);
    }

    function chingMingDay(year) {
        const known = { 2025: 4, 2026: 5, 2027: 5, 2028: 4, 2029: 4, 2030: 5, 2031: 5, 2032: 4 };
        return known[year] || 4;
    }

    function utcHktDate(year, month, day) {
        return Date.UTC(year, month - 1, day);
    }

    function toStartMs(year, month, day) {
        return Date.parse(
            `${year}-${pad(month)}-${pad(day)}T${pad(PAPER_START_HOUR)}:${pad(PAPER_START_MINUTE)}:00+08:00`
        );
    }

    function isBlocked(year, month, day) {
        const exam = utcHktDate(year, month, day);
        const easter = easterSunday(year);
        const goodFriday = easter - 2 * 86400000;
        const easterMonday = easter + 86400000;
        if (exam >= goodFriday && exam <= easterMonday) {
            return true;
        }

        const chingMing = utcHktDate(year, 4, chingMingDay(year));
        const chingMingWeekday = new Date(chingMing).getUTCDay();
        let observed = chingMing;
        if (chingMingWeekday === 0) observed += 86400000;
        if (chingMingWeekday === 6) observed += 2 * 86400000;
        return exam === chingMing || exam === observed;
    }

    function estimateStart(year) {
        const base = new Date(Date.UTC(year, 3, 12));
        const weekday = base.getUTCDay();
        const offset = [-3, -2, -1, 0, 1, 2, 3][weekday];
        let day = 14 + offset;

        while (isBlocked(year, 4, day)) {
            day += 1;
        }

        return toStartMs(year, 4, day);
    }

    function sittingForYear(year) {
        if (OFFICIAL_STARTS[year]) {
            return {
                year,
                startMs: Date.parse(OFFICIAL_STARTS[year]),
                official: true
            };
        }
        return {
            year,
            startMs: estimateStart(year),
            official: false
        };
    }

    function nextFiveSittings(now) {
        const currentYear = new Date(now).getFullYear();
        const sittings = [];
        for (let year = currentYear; sittings.length < 5 && year < currentYear + 8; year += 1) {
            const sitting = sittingForYear(year);
            if (sitting.startMs > now) {
                sittings.push(sitting);
            }
        }
        return sittings;
    }

    function formatHkt(ms) {
        return new Intl.DateTimeFormat('en-HK', {
            timeZone: 'Asia/Hong_Kong',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date(ms));
    }

    function remainingParts(ms, now) {
        const diff = Math.max(0, ms - now);
        const totalSeconds = Math.floor(diff / 1000);
        return {
            days: Math.floor(totalSeconds / 86400),
            hours: Math.floor((totalSeconds % 86400) / 3600),
            minutes: Math.floor((totalSeconds % 3600) / 60),
            seconds: totalSeconds % 60,
            done: diff === 0
        };
    }

    const sittings = nextFiveSittings(Date.now());
    if (!sittings.length) {
        return;
    }

    let selectedYear = sittings[0].year;
    const switcher = document.getElementById('yearSwitcher');
    const grid = document.getElementById('yearGrid');

    function selectedSitting() {
        return sittings.find((item) => item.year === selectedYear) || sittings[0];
    }

    function renderStatic() {
        switcher.innerHTML = '';
        grid.innerHTML = '';

        sittings.forEach((sitting) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'year-chip' + (sitting.year === selectedYear ? ' is-active' : '');
            chip.textContent = sitting.year;
            chip.addEventListener('click', () => {
                selectedYear = sitting.year;
                renderStatic();
                tick();
            });
            switcher.appendChild(chip);

            const card = document.createElement('article');
            card.className = 'year-card' + (sitting.year === selectedYear ? ' is-active' : '');
            card.innerHTML =
                '<h3>' + sitting.year + '</h3>' +
                '<p>' + formatHkt(sitting.startMs) + ' HKT</p>' +
                '<span class="badge ' + (sitting.official ? 'official' : 'estimated') + '">' +
                (sitting.official ? 'Official' : 'Estimated') +
                '</span>';
            card.addEventListener('click', () => {
                selectedYear = sitting.year;
                renderStatic();
                tick();
            });
            grid.appendChild(card);
        });
    }

    function tick() {
        const sitting = selectedSitting();
        const now = Date.now();
        const parts = remainingParts(sitting.startMs, now);
        document.getElementById('cdDays').textContent = pad(parts.days);
        document.getElementById('cdHours').textContent = pad(parts.hours);
        document.getElementById('cdMinutes').textContent = pad(parts.minutes);
        document.getElementById('cdSeconds').textContent = pad(parts.seconds);
        document.getElementById('heroTitle').textContent = sitting.year + ' HKDSE Mathematics';
        document.getElementById('heroDate').textContent = formatHkt(sitting.startMs) + ' HKT · Paper 1';
        document.getElementById('heroStatus').textContent = parts.done
            ? 'This sitting has started.'
            : (sitting.official ? 'Official start time' : 'Estimated start time') +
              ' · Hong Kong Time · Compulsory Part Paper 1';
    }

    renderStatic();
    tick();
    setInterval(tick, 1000);
})();
