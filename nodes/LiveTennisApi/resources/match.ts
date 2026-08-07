import type { INodeProperties } from 'n8n-workflow';
import { handleApiErrors } from './shared';

const showOnlyForMatches = {
	resource: ['match'],
};

const showOnlyForMatchGetMany = {
	resource: ['match'],
	operation: ['getAll'],
};

export const matchDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForMatches,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a match',
				description:
					'Get full detail for one match (includes market data on PRO plans and model analysis on ULTRA plans)',
				routing: {
					request: {
						method: 'GET',
						url: '=/matches/{{$parameter.matchId}}',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: [handleApiErrors],
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many matches',
				description: 'List matches by lifecycle status, with their latest score',
				routing: {
					request: {
						method: 'GET',
						url: '/matches',
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
				name: 'Get Score',
				value: 'getScore',
				action: 'Get a match score',
				description: 'Get the current score only — the lowest-latency REST read',
				routing: {
					request: {
						method: 'GET',
						url: '=/matches/{{$parameter.matchId}}/score',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: [handleApiErrors],
					},
				},
			},
			{
				name: 'Get Statistics',
				value: 'getStatistics',
				action: 'Get match statistics',
				description:
					'Get in-play statistics for one match — aces, double faults, serve split, hold/break percentages, break points, service and return points. Works on live and completed matches. Needs the ULTRA tier (403 upgrade_required below it).',
				routing: {
					request: {
						method: 'GET',
						url: '=/matches/{{$parameter.matchId}}/statistics',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: [handleApiErrors],
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Match ID',
		name: 'matchId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the match, as returned by Get Many',
		displayOptions: {
			show: {
				resource: ['match'],
				operation: ['get', 'getScore', 'getStatistics'],
			},
		},
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: showOnlyForMatchGetMany,
		},
		options: [
			{
				name: 'Completed',
				value: 'completed',
				description:
						'Matches that have finished — bulk completed listings need the BASIC tier or any History plan (403 on a FREE key)',
			},
			{
				name: 'Live',
				value: 'live',
				description: 'Matches in progress right now',
			},
			{
				name: 'Upcoming',
				value: 'upcoming',
				description: 'Matches not yet started',
			},
		],
		default: 'live',
		description: 'Which lifecycle bucket of matches to list',
		routing: {
			request: {
				qs: {
					status: '={{ $value }}',
				},
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForMatchGetMany,
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		routing: {
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
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForMatchGetMany,
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
			show: showOnlyForMatchGetMany,
		},
		options: [
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				placeholder: 'e.g. sui',
				description:
					'Only matches where either player\'s country equals this lowercase 3-letter IOC-style code (e.g. ned, sui, gre — the same vocabulary the Player object returns, not ISO-3166). Players with no recorded country never match. Anything that is not 3 letters is a 400.',
				routing: {
					request: {
						qs: {
							country: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'From Date',
				name: 'from',
				type: 'string',
				default: '',
				placeholder: 'e.g. 2026-08-01',
				description:
					'Earliest play date — YYYY-MM-DD or an ISO-8601 UTC datetime (400 if unparseable). A bare date is a UTC day boundary. Applies to every status.',
				routing: {
					request: {
						qs: {
							from: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Player ID',
				name: 'player',
				type: 'number',
				default: 0,
				description:
					'Only matches where this player ID is either participant. An unknown ID returns an empty list, not an error.',
				routing: {
					request: {
						qs: {
							player: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'To Date',
				name: 'to',
				type: 'string',
				default: '',
				placeholder: 'e.g. 2026-08-07',
				description:
					'Latest play date (a bare date includes the whole UTC day); must not be before From Date',
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
						name: 'Challenger',
						value: 'challenger',
					},
					{
						name: 'ITF',
						value: 'itf',
					},
					{
						name: 'Juniors',
						value: 'juniors',
					},
					{
						name: 'WTA',
						value: 'wta',
					},
				],
				default: 'atp',
				description:
					'Restrict results to one tour. Each value covers its singles and doubles draws. An unknown value is a 400, never silently ignored. Note the tour field on returned records uses a different, more granular vocabulary.',
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
