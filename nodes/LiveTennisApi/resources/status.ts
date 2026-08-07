import type { INodeProperties } from 'n8n-workflow';
import { handleApiErrors } from './shared';

export const statusDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['status'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get the API status',
				description: 'Check that the Live Tennis API is up (liveness probe)',
				routing: {
					request: {
						method: 'GET',
						url: '/health',
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
];
