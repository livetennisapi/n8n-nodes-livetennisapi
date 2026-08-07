import type { INodeProperties } from 'n8n-workflow';
import { handleApiErrors } from './shared';

const showOnlyForRankings = {
	resource: ['ranking'],
};

const showOnlyForRankingGetMany = {
	resource: ['ranking'],
	operation: ['getAll'],
};

export const rankingDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForRankings,
		},
		options: [
			{
				name: 'Get for Player',
				value: 'getForPlayer',
				action: 'Get rankings for a player',
				description:
					"Point-in-time ranking records for one player: per ranking system, the newest record effective on or before As Of — never one dated after it. The point-in-time answer where everything else in the API joins today's rank. Needs the ULTRA tier.",
				routing: {
					request: {
						method: 'GET',
						url: '/rankings',
						qs: {
							player: '={{ $parameter.playerId }}',
						},
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
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many ranking records',
				description:
					'The full published table in rank order for one ranking system — the newest week at or before As Of. Rows carry the published player name, with a null player ID for players outside the roster, so the table has no silent holes. Needs the PRO tier.',
				routing: {
					request: {
						method: 'GET',
						url: '/rankings',
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
		default: 'getAll',
	},

	// ── Get Many (listing, PRO) ───────────────────────────────────────────────
	{
		displayName: 'System',
		name: 'system',
		type: 'options',
		required: true,
		options: [
			{
				name: 'ATP',
				value: 'atp',
			},
			{
				name: 'ITF Juniors',
				value: 'itf_jt',
			},
			{
				name: 'ITF Men',
				value: 'itf_mt',
			},
			{
				name: 'ITF Women',
				value: 'itf_wt',
			},
			{
				name: 'WTA',
				value: 'wta',
			},
		],
		default: 'atp',
		description:
			'The ranking system to list. Exactly one system per listing; systems are never collapsed into a single rank. UTR has no listing (it is a rating, not a ranking) — read it per player. ITF history begins 2026-07-29 and cannot be reconstructed earlier.',
		displayOptions: {
			show: showOnlyForRankingGetMany,
		},
		routing: {
			request: {
				qs: {
					system: '={{ $value }}',
				},
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForRankingGetMany,
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
				...showOnlyForRankingGetMany,
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

	// ── Get for Player (ULTRA) ────────────────────────────────────────────────
	{
		displayName: 'Player ID',
		name: 'playerId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric roster ID of the player, as returned by Player → Search',
		displayOptions: {
			show: {
				resource: ['ranking'],
				operation: ['getForPlayer'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: {
				resource: ['ranking'],
				operation: ['getForPlayer'],
			},
		},
		options: [
			{
				displayName: 'As Of',
				name: 'asOf',
				type: 'string',
				default: '',
				placeholder: 'e.g. 2026-06-01',
				description:
					'YYYY-MM-DD — returns the newest record effective on or before this date. Omit for the latest known record. ITF and UTR history begins 2026-07-29.',
				routing: {
					request: {
						qs: {
							as_of: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'System',
				name: 'system',
				type: 'options',
				options: [
					{
						name: 'ATP',
						value: 'atp',
					},
					{
						name: 'ITF Juniors',
						value: 'itf_jt',
					},
					{
						name: 'ITF Men',
						value: 'itf_mt',
					},
					{
						name: 'ITF Women',
						value: 'itf_wt',
					},
					{
						name: 'UTR',
						value: 'utr',
					},
					{
						name: 'WTA',
						value: 'wta',
					},
				],
				default: 'atp',
				description:
					'Restrict to one ranking system. Omit for all systems the player appears in. ATP/WTA and the ITF circuits carry rank and points; UTR carries a rating with null rank and points.',
				routing: {
					request: {
						qs: {
							system: '={{ $value }}',
						},
					},
				},
			},
		],
	},

	// ── As Of for the listing mode ────────────────────────────────────────────
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: showOnlyForRankingGetMany,
		},
		options: [
			{
				displayName: 'As Of',
				name: 'asOf',
				type: 'string',
				default: '',
				placeholder: 'e.g. 2026-06-01',
				description:
					'YYYY-MM-DD — returns the newest published week at or before this date. Omit for the latest table.',
				routing: {
					request: {
						qs: {
							as_of: '={{ $value }}',
						},
					},
				},
			},
		],
	},
];
