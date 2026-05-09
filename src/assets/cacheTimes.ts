export class CacheTimes {
	private static readonly minute: number = 60 * 1000;
	private static readonly hour: number = 60 * 60 * 1000;
	private static readonly day: number = 24 * 60 * 60 * 1000;
	private static readonly week: number = 7 * 24 * 60 * 60 * 1000;
	private static readonly month: number = 31 * 24 * 60 * 60 * 1000;


	public static readonly quickAccessUser: number = CacheTimes.day;
	public static readonly notificationTimer: number = 3 * CacheTimes.minute;
	public static readonly miniProfileTimer: number = CacheTimes.week;
	public static readonly miniMediaTimer: number = CacheTimes.month;


}
