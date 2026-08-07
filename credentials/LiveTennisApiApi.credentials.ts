import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class LiveTennisApiApi implements ICredentialType {
	name = 'liveTennisApiApi';

	displayName = 'Live Tennis API';

	icon: Icon = {
		light: 'file:../icons/livetennisapi.svg',
		dark: 'file:../icons/livetennisapi.dark.svg',
	};

	documentationUrl = 'https://docs.livetennisapi.com';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Your Live Tennis API key. Get a free key (100 requests/day) at https://livetennisapi.com/subscribe/free.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.livetennisapi.com/api/public/v1',
			url: '/matches',
			method: 'GET',
			qs: {
				limit: 1,
			},
		},
	};
}
