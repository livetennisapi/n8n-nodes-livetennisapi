import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { archiveDescription } from './resources/archive';
import { fixtureDescription } from './resources/fixture';
import { h2hDescription } from './resources/h2h';
import { matchDescription } from './resources/match';
import { playerDescription } from './resources/player';
import { rankingDescription } from './resources/ranking';
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
			'Real-time tennis scores, matches, players, fixtures, rankings, head-to-head records and the 1968–2022 results archive from the Live Tennis API',
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
						name: 'Archive',
						value: 'archive',
					},
					{
						name: 'Fixture',
						value: 'fixture',
					},
					{
						name: 'H2H',
						value: 'h2h',
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
						name: 'Ranking',
						value: 'ranking',
					},
					{
						name: 'Status',
						value: 'status',
					},
				],
				default: 'match',
			},
			...archiveDescription,
			...fixtureDescription,
			...h2hDescription,
			...matchDescription,
			...playerDescription,
			...rankingDescription,
			...statusDescription,
		],
	};
}
