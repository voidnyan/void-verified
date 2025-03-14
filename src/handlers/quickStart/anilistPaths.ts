interface AnilistPath {
	path: string;
	name: string;
}

const username = JSON.parse(localStorage.getItem("auth"))?.name;

export const AnilistPaths: AnilistPath[] = [
	{
		name: "AniList Home",
		path: "/home"
	},
	{
		name: "Notifications",
		path: "/notifications"
	},
	{
		name: "Profile",
		path: `/user/${username}/`
	},
	{
		name: "Favourites",
		path: `/user/${username}/Favorites`
	},
	{
		name: "Social",
		path: `/user/${username}/Social`
	},
	{
		name: `Reviews (${username})`,
		path: `/user/${username}/Reviews`
	},
	{
		name: `Submissions`,
		path: `/user/${username}/submissions`
	},
	{
		name: "Stats: Anime",
		path: `/user/${username}/stats/anime/overview`
	},
	{
		name: "Stats: Anime - Genres",
		path: `/user/${username}/stats/anime/genres`
	},
	{
		name: "Stats: Anime Tags",
		path: `/user/${username}/stats/anime/tags`
	},
	{
		name: "Stats: Anime Voice Actors",
		path: `/user/${username}/stats/anime/tags`
	},
	{
		name: "Stats: Anime Studios",
		path: `/user/${username}/stats/anime/studios`
	},
	{
		name: "Stats: Anime Staff",
		path: `/user/${username}/stats/anime/staff`
	},
	{
		name: "Stats: Manga",
		path: `/user/${username}/stats/manga/overview`
	},
	{
		name: "Stats: Manga - Genres",
		path: `/user/${username}/stats/manga/genres`
	},
	{
		name: "Stats: Manga Tags",
		path: `/user/${username}/stats/manga/tags`
	},
	{
		name: "Stats: Manga Staff",
		path: `/user/${username}/stats/manga/staff`
	},
	{
		name: "Settings: Profile",
		path: "/settings"
	},
	{
		name: "Settings: Account",
		path: "/settings/account"
	},
	{
		name: "Settings: Anime & Manga",
		path: "/settings/media"
	},
	{
		name: "Settings: Lists",
		path: "/settings/lists"
	},
	{
		name: "Settings: Notifications",
		path: "/settings/notifications"
	},
	{
		name: "Settings: VoidVerified",
		path: "/settings/developer"
	},
	{
		name: "Search: Anime",
		path: "/search/anime"
	},
	{
		name: "Search: Manga",
		path: "/search/manga"
	},
	{
		name: "Search: Staff",
		path: "/search/staff"
	},
	{
		name: "Search: Characters",
		path: "/search/characters"
	},
	{
		name: "Browse: Reviews",
		path: "/reviews"
	},
	{
		name: "Browse: Recommendations",
		path: "/recommendations"
	},
	{
		name: "AniList Bugs and Issues",
		path: "/forum/thread/76237"
	},
	{
		name: "Support AniList & AniChart (Donations)",
		path: "/forum/thread/2340"
	},
	{
		name: "AniList Guidelines & Data Submissions ",
		path: "/forum/thread/14"
	},
	{
		name: "Anime",
		path: `/user/${username}/animelist`
	},
	{
		name: "Planning Anime",
		path: `/user/${username}/animelist/Planning`
	},
	{
		name: "Completed Anime",
		path: `/user/${username}/animelist/Completed`
	},
	{
		name: "Watching Anime",
		path: `/user/${username}/animelist/Watching`
	},
	{
		name: "Rewatching Anime",
		path: `/user/${username}/animelist/Rewatching`
	},
	{
		name: "Paused Anime",
		path: `/user/${username}/animelist/Paused`
	},
	{
		name: "Dropped Anime",
		path: `/user/${username}/animelist/Dropped`
	},
	{
		name: "Manga",
		path: `/user/${username}/mangalist`
	},
	{
		name: "Planning Manga",
		path: `/user/${username}/mangalist/Planning`
	},
	{
		name: "Completed Manga",
		path: `/user/${username}/mangalist/Completed`
	},
	{
		name: "Reading Manga",
		path: `/user/${username}/mangalist/Reading`
	},
	{
		name: "Rereading Manga",
		path: `/user/${username}/mangalist/Rereading`
	},
	{
		name: "Paused Manga",
		path: `/user/${username}/mangalist/Paused`
	},
	{
		name: "Paused Manga",
		path: `/user/${username}/mangalist/Paused`
	},
	{
		name: "Dropped Manga",
		path: `/user/${username}/mangalist/Dropped`
	},
	{
		name: "Top 100 Anime",
		path: "/search/anime/top-100"
	},
	{
		name: "Trending Anime",
		path: "/search/anime/trending"
	},
	{
		name: "Top Anime Movies",
		path: "/search/anime/top-movies"
	},
	{
		name: "Top 100 Manga",
		path: "/search/manga/top-100"
	},
	{
		name: "Trending Manga",
		path: "/search/manga/trending"
	},
	{
		name: "Top Manhwa",
		path: "/search/manga/top-manhwa"
	},
	{
		name: "Forum: Overview",
		path: "/forum/overview"
	},
	{
		name: "Forum: Recent",
		path: "/forum/recent"
	},
	{
		name: "Forum: New Threads",
		path: "/forum/new"
	},
	{
		name: "Forum: Subscribed",
		path: "/forum/subscribed"
	},
	{
		name: "Forum: Search",
		path: "/forum/search"
	},
	{
		name: "Community Apps",
		path: "/apps"
	},
	{
		name: "Site Stats",
		path: "/site-stats"
	},
	{
		name: "Moderatos",
		path: "/moderators"
	},
	{
		name: "Terms & Privacy",
		path: "/terms"
	}
];
