import type { DayColumn, FestivalData, FestivalDataJSON, Screening, Series, Venue } from "./types";

export function festivalDataJSONToFestivalData( data: FestivalDataJSON ): FestivalData {
	const festivalData: FestivalData = {
		days: [ ...data.days.map(( day: FestivalDataJSON['days'][number]) => ({
			date: day.date,
			label: day.label,
			dayOfWeek: day.weekday,
		} as DayColumn)) ],
		venues: [ ...data.venues.map(( venue: FestivalDataJSON['venues'][number], index: number) => ({
			id: venue.venue_id,
			name: venue.name,
			order: index,
		} as Venue)) ],
		screenings: [ ...data.screenings.map(( screening: FestivalDataJSON['screenings'][number]) => {
			let { screening_id, series_id, title, datetime_start, datetime_end, duration_minutes, venue_id, is_free, ticket_code, url } = screening;
			
			return {
				id: screening_id,
				title: title,
				seriesId: series_id,
				venueId: venue_id,
				date: new Date(datetime_start).toISOString().split('T')[0],
				startTime: new Date(datetime_start).toISOString().split('T')[1],
				endTime: new Date(datetime_end).toISOString().split('T')[1],
				durationMinutes: duration_minutes,
				isFree: is_free,
				ticketCode: ticket_code,
				url: url,
			} as Screening;
		}) ],
		series: [ ...data.screenings.reduce(( series: Series[], screening: FestivalDataJSON['screenings'][number]) => {
			if (!series.some((s: Series) => s.id === screening.series_id)) {
				series.push({
					id: screening.series_id,
					name: screening.series_id,
					color: '#000000',
				});
			}
			return series;
		}, [] as Series[]) ],
	}
	
	return festivalData;
}
