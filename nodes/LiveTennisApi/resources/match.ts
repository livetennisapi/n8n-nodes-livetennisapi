import type { INodeProperties } from 'n8n-workflow';

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
					},
					output: {
						postReceive: [
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
				operation: ['get', 'getScore'],
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
					'Restrict results to one tour. Each value covers its singles and doubles draws. Note the tour field on returned records uses a different, more granular vocabulary.',
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
