import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { fixtureDescription } from './resources/fixture';
import { matchDescription } from './resources/match';
import { playerDescription } from './resources/player';
import { statusDescription } from './resources/status';

export class LiveTennisApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Live Tennis API',
		name: 'liveTennisApi',
		icon: {
			light: 'file:../../icons/livetennisapi.svg',
			dark: 'file:../../icons/livetennisapi.dark.svg',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Real-time tennis scores, matches, players and fixtures from the Live Tennis API',
		defaults: {
			name: 'Live Tennis API',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'liveTennisApiApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.livetennisapi.com/api/public/v1',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Fixture',
						value: 'fixture',
					},
					{
						name: 'Match',
						value: 'match',
					},
					{
						name: 'Player',
						value: 'player',
					},
					{
						name: 'Status',
						value: 'status',
					},
				],
				default: 'match',
			},
			...fixtureDescription,
			...matchDescription,
			...playerDescription,
			...statusDescription,
		],
	};
}
