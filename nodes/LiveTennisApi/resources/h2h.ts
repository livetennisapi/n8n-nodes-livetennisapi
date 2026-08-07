import type { INodeProperties } from 'n8n-workflow';
import { handleApiErrors } from './shared';

const showOnlyForH2h = {
	resource: ['h2h'],
};

export const h2hDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForH2h,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a head to head record',
				description:
					'Get the record between two players, assembled from the 1968–2022 results archive and completed matches from 2023 onward. Needs the BASIC tier or any History plan; on ULTRA a per-player stats block adds serve/return/break-point aggregates over the pairing.',
				routing: {
					request: {
						method: 'GET',
						url: '/h2h',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: [handleApiErrors],
					},
				},
			},
		],
		default: 'get',
	},
	{
		displayName: 'Player 1',
		name: 'p1',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Federer',
		description:
			'First player name — a fragment of at least 3 characters. Names are the keys (archive people have no roster IDs); a fragment matching more than one player is refused with the candidate list rather than summing two people into one record.',
		displayOptions: {
			show: showOnlyForH2h,
		},
		routing: {
			request: {
				qs: {
					p1: '={{ $value }}',
				},
			},
		},
	},
	{
		displayName: 'Player 2',
		name: 'p2',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Nadal',
		description: 'Second player name — a fragment of at least 3 characters, same rules as Player 1',
		displayOptions: {
			show: showOnlyForH2h,
		},
		routing: {
			request: {
				qs: {
					p2: '={{ $value }}',
				},
			},
		},
	},
];
