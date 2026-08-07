import type { INodeProperties } from 'n8n-workflow';
import { handleApiErrors } from './shared';

const showOnlyForPlayers = {
	resource: ['player'],
};

const showOnlyForPlayerSearch = {
	resource: ['player'],
	operation: ['search'],
};

export const playerDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForPlayers,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a player',
				description: "Get one player's bio, ranking and cached stats",
				routing: {
					request: {
						method: 'GET',
						url: '=/players/{{$parameter.playerId}}',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: [handleApiErrors],
					},
				},
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search players',
				description: 'Search players by name, ranked players first',
				routing: {
					request: {
						method: 'GET',
						url: '/players',
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
		default: 'search',
	},
	{
		displayName: 'Player ID',
		name: 'playerId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The numeric ID of the player, as returned by Search or in match payloads',
		displayOptions: {
			show: {
				resource: ['player'],
				operation: ['get'],
			},
		},
	},
	{
		displayName: 'Search Term',
		name: 'search',
		type: 'string',
		default: '',
		placeholder: 'e.g. Alcaraz',
		description: 'Name (or part of a name) to search for. Leave empty to list players.',
		displayOptions: {
			show: showOnlyForPlayerSearch,
		},
		routing: {
			request: {
				qs: {
					search: '={{ $value }}',
				},
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForPlayerSearch,
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
				...showOnlyForPlayerSearch,
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
];
