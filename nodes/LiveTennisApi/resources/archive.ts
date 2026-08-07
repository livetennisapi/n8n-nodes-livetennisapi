import type { INodeProperties } from 'n8n-workflow';
import { handleApiErrors } from './shared';

const showOnlyForArchive = {
	resource: ['archive'],
};

const showOnlyForArchiveMatchGetMany = {
	resource: ['archive'],
	operation: ['getAllMatches'],
};

const showOnlyForArchivePlayerGetMany = {
	resource: ['archive'],
	operation: ['getAllPlayers'],
};

const paginationRouting: INodeProperties['routing'] = {
	send: {
		paginate: '={{ $value }}',
	},
	operations: {
		pagination: {
			type: 'offset',
			properties: {
				limitParameter: 'limit',
				offsetParameter: 'offset',
				pageSize: 200,
				type: 'query',
			},
		},
	},
};

export const archiveDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForArchive,
		},
		options: [
			{
				name: 'Get Career',
				value: 'getCareer',
				action: 'Get an archive career',
				description:
					"One player's whole archive career in one response: W-L record (overall, by surface, by level, by year), titles, and summed serve statistics. Serve stats are recorded from 1991 only — the coverage is stated, never guessed.",
				routing: {
					request: {
						method: 'GET',
						url: '/history/archive/career',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: [handleApiErrors],
					},
				},
			},
			{
				name: 'Get Match',
				value: 'getMatch',
				action: 'Get an archive match',
				description:
					'One archive result by its archive ID, with per-match serve statistics where the era recorded them (stats is null on most pre-1991 rows — never synthesised)',
				routing: {
					request: {
						method: 'GET',
						url: '=/history/archive/matches/{{$parameter.archiveId}}',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: [handleApiErrors],
					},
				},
			},
			{
				name: 'Get Many Matches',
				value: 'getAllMatches',
				action: 'Get many archive matches',
				description:
					'Deep historical results, 1968 through 2022 — ATP and WTA main draws, qualifying, challengers and futures. Winner/loser records with final score, round, seeds and the ranks at the time. A separate ID space from live matches; the archive ends where point-by-point coverage begins (2023).',
				routing: {
					request: {
						method: 'GET',
						url: '/history/archive/matches',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: [
							handleApiErrors,
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Many Players',
				value: 'getAllPlayers',
				action: 'Get many archive players',
				description:
					'Archive player bios — hand, date of birth, country, height, career-high rank. Archive people live in their own ID space, scoped per tour; null fields are the era\'s silence, never guessed.',
				routing: {
					request: {
						method: 'GET',
						url: '/history/archive/players',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: [
							handleApiErrors,
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
		],
		default: 'getAllMatches',
	},

	// ── Get Career ────────────────────────────────────────────────────────────
	{
		displayName: 'Player Name',
		name: 'careerName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Graf',
		description:
			'Player name — a fragment of at least 3 characters that must resolve to exactly one person. Ambiguous fragments are refused with the candidate list.',
		displayOptions: {
			show: {
				resource: ['archive'],
				operation: ['getCareer'],
			},
		},
		routing: {
			request: {
				qs: {
					name: '={{ $value }}',
				},
			},
		},
	},

	// ── Get Match ─────────────────────────────────────────────────────────────
	{
		displayName: 'Archive Match ID',
		name: 'archiveId',
		type: 'number',
		required: true,
		default: 0,
		description:
			'The numeric archive ID of the result, as returned by Get Many Matches (not a live-match ID — the archive is a separate ID space)',
		displayOptions: {
			show: {
				resource: ['archive'],
				operation: ['getMatch'],
			},
		},
	},

	// ── Get Many Matches ──────────────────────────────────────────────────────
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForArchiveMatchGetMany,
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		routing: paginationRouting,
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForArchiveMatchGetMany,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 200,
		},
		default: 50,
		description: 'Max number of results to return',
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
			output: {
				maxResults: '={{ $value }}',
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: showOnlyForArchiveMatchGetMany,
		},
		options: [
			{
				displayName: 'From Date',
				name: 'from',
				type: 'string',
				default: '',
				placeholder: 'e.g. 1980-01-01',
				description:
					'Earliest tournament start date (YYYY-MM-DD). Archive records carry the tournament start date — the only date results of this era have.',
				routing: {
					request: {
						qs: {
							from: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Level',
				name: 'level',
				type: 'string',
				default: '',
				placeholder: 'e.g. G',
				description:
					'Source tier code: G=grand slam, M=masters, A=tour, F=finals, D=davis cup, C=challenger, O=olympics; futures tiers carry their category codes (e.g. 15, 25) as published',
				routing: {
					request: {
						qs: {
							level: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Player Name',
				name: 'name',
				type: 'string',
				default: '',
				placeholder: 'e.g. Borg',
				description: "Case-insensitive substring match on either player's name (min 3 characters)",
				routing: {
					request: {
						qs: {
							name: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Round',
				name: 'round',
				type: 'options',
				options: [
					{ name: 'BR', value: 'BR' },
					{ name: 'ER', value: 'ER' },
					{ name: 'F', value: 'F' },
					{ name: 'Q1', value: 'Q1' },
					{ name: 'Q2', value: 'Q2' },
					{ name: 'Q3', value: 'Q3' },
					{ name: 'Q4', value: 'Q4' },
					{ name: 'QF', value: 'QF' },
					{ name: 'R128', value: 'R128' },
					{ name: 'R16', value: 'R16' },
					{ name: 'R32', value: 'R32' },
					{ name: 'R64', value: 'R64' },
					{ name: 'RR', value: 'RR' },
					{ name: 'SF', value: 'SF' },
				],
				default: 'F',
				description:
					'Round code as published: F=final, SF/QF=semi/quarter, R16–R128=main-draw rounds, RR=round robin, BR=bronze, Q1–Q4=qualifying, ER=early rounds',
				routing: {
					request: {
						qs: {
							round: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'To Date',
				name: 'to',
				type: 'string',
				default: '',
				placeholder: 'e.g. 1989-12-31',
				description: 'Latest tournament start date (YYYY-MM-DD)',
				routing: {
					request: {
						qs: {
							to: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Tour',
				name: 'tour',
				type: 'options',
				options: [
					{
						name: 'ATP',
						value: 'atp',
					},
					{
						name: 'WTA',
						value: 'wta',
					},
				],
				default: 'atp',
				description: 'The archive corpus covers the ATP and WTA tours only',
				routing: {
					request: {
						qs: {
							tour: '={{ $value }}',
						},
					},
				},
			},
		],
	},

	// ── Get Many Players ──────────────────────────────────────────────────────
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForArchivePlayerGetMany,
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		routing: paginationRouting,
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForArchivePlayerGetMany,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 200,
		},
		default: 50,
		description: 'Max number of results to return',
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
			output: {
				maxResults: '={{ $value }}',
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: showOnlyForArchivePlayerGetMany,
		},
		options: [
			{
				displayName: 'Player Name',
				name: 'name',
				type: 'string',
				default: '',
				placeholder: 'e.g. Navratilova',
				description: 'Case-insensitive substring filter (min 3 characters)',
				routing: {
					request: {
						qs: {
							name: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Tour',
				name: 'tour',
				type: 'options',
				options: [
					{
						name: 'ATP',
						value: 'atp',
					},
					{
						name: 'WTA',
						value: 'wta',
					},
				],
				default: 'atp',
				description: 'The archive corpus covers the ATP and WTA tours only',
				routing: {
					request: {
						qs: {
							tour: '={{ $value }}',
						},
					},
				},
			},
		],
	},
];
