/**
 * Openingsuren-logica.
 *
 * Werkt zowel bij het bouwen (voor JSON-LD) als in de browser (voor het
 * "Nu open" bolleke). Alles wordt altijd omgerekend naar de klok van Gent
 * (Europe/Brussels), ook als de bezoeker in een andere tijdzone zit.
 *
 * Sluitingsuren na middernacht ("02:00") worden correct behandeld: die horen
 * bij de avond ervoor.
 */

export const TIMEZONE = 'Europe/Brussels';

export const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export type DayKey = (typeof DAY_KEYS)[number];

/** Maandag eerst, zoals een Belg een week leest. */
export const WEEK_ORDER: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_LABELS_NL: Record<DayKey, string> = {
  monday: 'Maandag',
  tuesday: 'Dinsdag',
  wednesday: 'Woensdag',
  thursday: 'Donderdag',
  friday: 'Vrijdag',
  saturday: 'Zaterdag',
  sunday: 'Zondag',
};

export const DAY_LABELS_EN: Record<DayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

/** schema.org-namen, voor de JSON-LD. */
export const DAY_SCHEMA: Record<DayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export interface DayRule {
  open?: string;
  close?: string;
  closed?: boolean;
}

export interface HoursException extends DayRule {
  date: string;
  label?: string;
}

export interface HoursConfig {
  week: Record<DayKey, DayRule>;
  exceptions?: HoursException[];
  note?: string;
}

/* ------------------------------------------------------------------ */
/* Tijd-helpers                                                        */
/* ------------------------------------------------------------------ */

/** "14:30" -> 870 minuten na middernacht. */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((n) => Number.parseInt(n, 10));
  return h * 60 + (m || 0);
}

/** 870 -> "14:30" */
export function fromMinutes(total: number): string {
  const wrapped = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface BrusselsNow {
  year: number;
  month: number;
  day: number;
  /** 0 = zondag */
  weekday: number;
  minutes: number;
  /** YYYY-MM-DD */
  isoDate: string;
}

/**
 * Zet een moment om naar de wandklok van Gent, onafhankelijk van de tijdzone
 * van de bezoeker.
 */
export function brusselsNow(now: Date): BrusselsNow {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  });

  const parts = Object.fromEntries(
    fmt.formatToParts(now).map((p) => [p.type, p.value]),
  ) as Record<string, string>;

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const year = Number.parseInt(parts.year, 10);
  const month = Number.parseInt(parts.month, 10);
  const day = Number.parseInt(parts.day, 10);
  // Intl geeft 24 terug voor middernacht in en-GB h23/h24 randgevallen.
  const hour = Number.parseInt(parts.hour, 10) % 24;
  const minute = Number.parseInt(parts.minute, 10);

  return {
    year,
    month,
    day,
    weekday: weekdayMap[parts.weekday] ?? 0,
    minutes: hour * 60 + minute,
    isoDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
}

/** Schuift een YYYY-MM-DD een aantal dagen op, zonder tijdzone-gedoe. */
export function shiftIsoDate(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map((n) => Number.parseInt(n, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** Weekdag-index (0 = zondag) van een YYYY-MM-DD. */
export function isoDateWeekday(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map((n) => Number.parseInt(n, 10));
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/* ------------------------------------------------------------------ */
/* De regels voor één dag                                              */
/* ------------------------------------------------------------------ */

export interface ResolvedDay {
  isoDate: string;
  dayKey: DayKey;
  closed: boolean;
  open?: string;
  close?: string;
  /** Minuten na middernacht. Sluit hij na middernacht, dan > 1440. */
  openMin?: number;
  closeMin?: number;
  /** Naam van de uitzondering, bv. "Kerstavond". */
  exceptionLabel?: string;
  isException: boolean;
}

/** Wat gelden de uren op een bepaalde datum? Uitzondering wint van de vaste week. */
export function resolveDay(config: HoursConfig, isoDate: string): ResolvedDay {
  const dayKey = DAY_KEYS[isoDateWeekday(isoDate)];
  const exception = config.exceptions?.find((e) => e.date === isoDate);
  const rule: DayRule = exception ?? config.week[dayKey] ?? { closed: true };

  if (rule.closed || !rule.open || !rule.close) {
    return {
      isoDate,
      dayKey,
      closed: true,
      exceptionLabel: exception?.label,
      isException: Boolean(exception),
    };
  }

  const openMin = toMinutes(rule.open);
  let closeMin = toMinutes(rule.close);
  // Sluit hij op of voor het openingsuur, dan is het de volgende ochtend.
  if (closeMin <= openMin) closeMin += 1440;

  return {
    isoDate,
    dayKey,
    closed: false,
    open: rule.open,
    close: rule.close,
    openMin,
    closeMin,
    exceptionLabel: exception?.label,
    isException: Boolean(exception),
  };
}

/* ------------------------------------------------------------------ */
/* Status: open of toe?                                                */
/* ------------------------------------------------------------------ */

export interface OpenStatus {
  isOpen: boolean;
  /** "Nu open", "Opent om 14:00", "Vandaag gesloten" ... */
  label: string;
  /** Korte variant voor het bolleke: "Open" / "Toe". */
  short: string;
  /** Sluit- of openingsuur waar we naartoe werken, bv. "02:00". */
  nextChange?: string;
  /** Dag waarop dat gebeurt, als het niet vandaag is. */
  nextChangeDay?: DayKey;
  /** Waarschuwing als het bijna sluitingstijd is. */
  closingSoon: boolean;
  /** De uren van vandaag, om te tonen in de "Vandaag" strook. */
  today: ResolvedDay;
  exceptionLabel?: string;
}

export interface StatusLabels {
  openNow: string;
  closingSoon: (time: string) => string;
  opensAt: (time: string) => string;
  opensOn: (day: string, time: string) => string;
  closedToday: string;
  open: string;
  closed: string;
  untilLate: string;
}

export const LABELS_NL: StatusLabels = {
  openNow: 'Nu open',
  closingSoon: (t) => `Nog even open, tot ${t}`,
  opensAt: (t) => `Opent om ${t}`,
  opensOn: (d, t) => `Opent ${d.toLowerCase()} om ${t}`,
  closedToday: 'Vandaag gesloten',
  open: 'Open',
  closed: 'Toe',
  untilLate: 'tot laat',
};

export const LABELS_EN: StatusLabels = {
  openNow: 'Open now',
  closingSoon: (t) => `Closing soon, at ${t}`,
  opensAt: (t) => `Opens at ${t}`,
  opensOn: (d, t) => `Opens ${d.toLowerCase()} at ${t}`,
  closedToday: 'Closed today',
  open: 'Open',
  closed: 'Closed',
  untilLate: 'until late',
};

const CLOSING_SOON_MINUTES = 45;

export function getStatus(
  config: HoursConfig,
  now: Date,
  lang: 'nl' | 'en' = 'nl',
): OpenStatus {
  const labels = lang === 'en' ? LABELS_EN : LABELS_NL;
  const dayNames = lang === 'en' ? DAY_LABELS_EN : DAY_LABELS_NL;
  const b = brusselsNow(now);

  const today = resolveDay(config, b.isoDate);
  const yesterday = resolveDay(config, shiftIsoDate(b.isoDate, -1));

  // 1. Loopt de sessie van gisteren nog door? (bv. nu 01:00, gisteren tot 02:00)
  if (!yesterday.closed && yesterday.closeMin! > 1440) {
    const spillEnd = yesterday.closeMin! - 1440;
    if (b.minutes < spillEnd) {
      const remaining = spillEnd - b.minutes;
      return {
        isOpen: true,
        label:
          remaining <= CLOSING_SOON_MINUTES
            ? labels.closingSoon(yesterday.close!)
            : labels.openNow,
        short: labels.open,
        nextChange: yesterday.close,
        closingSoon: remaining <= CLOSING_SOON_MINUTES,
        today,
        exceptionLabel: yesterday.exceptionLabel,
      };
    }
  }

  // 2. Is de sessie van vandaag bezig?
  if (!today.closed && b.minutes >= today.openMin! && b.minutes < today.closeMin!) {
    const remaining = today.closeMin! - b.minutes;
    return {
      isOpen: true,
      label:
        remaining <= CLOSING_SOON_MINUTES
          ? labels.closingSoon(today.close!)
          : labels.openNow,
      short: labels.open,
      nextChange: today.close,
      closingSoon: remaining <= CLOSING_SOON_MINUTES,
      today,
      exceptionLabel: today.exceptionLabel,
    };
  }

  // 3. Toe. Wanneer gaat hij weer open?
  if (!today.closed && b.minutes < today.openMin!) {
    return {
      isOpen: false,
      label: labels.opensAt(today.open!),
      short: labels.closed,
      nextChange: today.open,
      closingSoon: false,
      today,
      exceptionLabel: today.exceptionLabel,
    };
  }

  for (let i = 1; i <= 8; i++) {
    const candidate = resolveDay(config, shiftIsoDate(b.isoDate, i));
    if (!candidate.closed) {
      return {
        isOpen: false,
        label: labels.opensOn(dayNames[candidate.dayKey], candidate.open!),
        short: labels.closed,
        nextChange: candidate.open,
        nextChangeDay: candidate.dayKey,
        closingSoon: false,
        today,
        exceptionLabel: today.exceptionLabel,
      };
    }
  }

  return {
    isOpen: false,
    label: labels.closedToday,
    short: labels.closed,
    closingSoon: false,
    today,
    exceptionLabel: today.exceptionLabel,
  };
}

/* ------------------------------------------------------------------ */
/* Weergave                                                            */
/* ------------------------------------------------------------------ */

export interface WeekRow {
  dayKey: DayKey;
  label: string;
  closed: boolean;
  open?: string;
  close?: string;
  isToday: boolean;
}

export function getWeekRows(
  config: HoursConfig,
  now: Date,
  lang: 'nl' | 'en' = 'nl',
): WeekRow[] {
  const dayNames = lang === 'en' ? DAY_LABELS_EN : DAY_LABELS_NL;
  const b = brusselsNow(now);
  const todayKey = DAY_KEYS[b.weekday];

  return WEEK_ORDER.map((dayKey) => {
    const rule = config.week[dayKey];
    const closed = Boolean(rule?.closed || !rule?.open || !rule?.close);
    return {
      dayKey,
      label: dayNames[dayKey],
      closed,
      open: rule?.open,
      close: rule?.close,
      isToday: dayKey === todayKey,
    };
  });
}

/** Uitzonderingen die nog moeten komen, gesorteerd. */
export function getUpcomingExceptions(
  config: HoursConfig,
  now: Date,
  limit = 6,
): HoursException[] {
  const b = brusselsNow(now);
  return (config.exceptions ?? [])
    .filter((e) => e.date >= b.isoDate)
    .sort((a, z) => a.date.localeCompare(z.date))
    .slice(0, limit);
}

/**
 * openingHoursSpecification voor schema.org.
 * Dagen met dezelfde uren worden samengevoegd.
 */
export function toSchemaOpeningHours(config: HoursConfig) {
  const groups = new Map<string, DayKey[]>();

  for (const dayKey of WEEK_ORDER) {
    const rule = config.week[dayKey];
    if (!rule || rule.closed || !rule.open || !rule.close) continue;
    const key = `${rule.open}-${rule.close}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(dayKey);
  }

  return [...groups.entries()].map(([key, days]) => {
    const [opens, closes] = key.split('-');
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days.map((d) => DAY_SCHEMA[d]),
      opens,
      closes,
    };
  });
}
