import type { INodeProperties } from 'n8n-workflow';

const showOnlyForFixtureGetMany = {
	resource: ['fixture'],
	operation: ['getAll'],
};

export const fixtureDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['fixture'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many fixtures',
				description:
					'List upcoming scheduled fixtures, earliest first. Fixtures are name-only: players are not yet resolved to IDs.',
				routing: {
					request: {
						method: 'GET',
						url: '/fixtures',
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
		],
		default: 'getAll',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForFixtureGetMany,
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
						rootProperty: 'data',
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
				...showOnlyForFixtureGetMany,
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
			show: showOnlyForFixtureGetMany,
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
