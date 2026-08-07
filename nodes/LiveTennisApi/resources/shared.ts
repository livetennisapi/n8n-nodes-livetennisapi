import type {
	IDataObject,
	IExecuteSingleFunctions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Turn the Live Tennis API's machine-readable error bodies into actionable
 * n8n errors instead of a bare HTTP status.
 *
 * Every operation sets `ignoreHttpStatusErrors: true` and runs this as the
 * first postReceive action, so the declarative engine hands us the full
 * response and we can read the body the API sends alongside 4xx/5xx:
 *
 * - 429 `abuse_throttled` — a 24-hour block for keys that kept hammering the
 *   API after their daily cap was spent. Carries `retry_at_epoch`.
 * - 429 `rate_limited` with `scope: "day"` — the daily allowance is spent.
 *   Carries `limit_per_day` and `resets_at` (an absolute ISO instant).
 * - 429 `rate_limited` (no day scope) — the per-minute limit. `Retry-After`
 *   header says how long to wait.
 * - 403 `upgrade_required` — the operation needs a higher plan tier.
 */
export async function handleApiErrors(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const statusCode = response.statusCode;
	if (statusCode < 400) {
		return items;
	}

	const body = (response.body ?? {}) as IDataObject;
	const errorCode = typeof body.error === 'string' ? body.error : '';
	const detail = typeof body.detail === 'string' ? body.detail : '';
	const httpCode = String(statusCode);

	if (statusCode === 429 && errorCode === 'abuse_throttled') {
		const retryAtIso =
			typeof body.retry_at_epoch === 'number'
				? new Date(body.retry_at_epoch * 1000).toISOString()
				: null;
		throw new NodeApiError(this.getNode(), body as JsonObject, {
			httpCode,
			message: `API key throttled for repeated over-quota traffic${retryAtIso ? ` — retry after ${retryAtIso}` : ''}`,
			description:
				'This key massively exceeded its daily cap (rejected requests count too) and is blocked for 24 hours. ' +
				'Fix the client retry loop — add a Wait node and back off when a 429 arrives — then resume after ' +
				(retryAtIso ?? 'the retry_at_epoch instant in the error data') +
				'.',
		});
	}

	if (statusCode === 429 && body.scope === 'day') {
		const resetsAt = typeof body.resets_at === 'string' ? body.resets_at : null;
		const limitPerDay = typeof body.limit_per_day === 'number' ? body.limit_per_day : null;
		const upgradeUrl = typeof body.upgrade_url === 'string' ? body.upgrade_url : null;
		throw new NodeApiError(this.getNode(), body as JsonObject, {
			httpCode,
			message: `Daily request allowance spent${limitPerDay ? ` (${limitPerDay.toLocaleString('en-US')}/day)` : ''}${resetsAt ? ` — resets at ${resetsAt}` : ''}`,
			description:
				(detail ? `${detail}. ` : '') +
				(upgradeUrl ? `A higher tier lifts the cap: ${upgradeUrl}` : 'A higher tier lifts the cap.'),
		});
	}

	if (statusCode === 429) {
		const retryAfter = response.headers?.['retry-after'];
		throw new NodeApiError(this.getNode(), body as JsonObject, {
			httpCode,
			message: `Per-minute rate limit hit${retryAfter ? ` — retry in ${String(retryAfter)}s` : ''}`,
			description:
				(detail ? `${detail}. ` : '') +
				'Space out requests (a Wait node between pages helps) or upgrade for a higher per-minute limit.',
		});
	}

	if (statusCode === 403 && errorCode === 'upgrade_required') {
		const tier = typeof body.upgrade_tier === 'string' ? body.upgrade_tier.toUpperCase() : null;
		const upgradeUrl = typeof body.upgrade_url === 'string' ? body.upgrade_url : null;
		const onRapidApi = body.upgrade_channel === 'rapidapi';
		throw new NodeApiError(this.getNode(), body as JsonObject, {
			httpCode,
			message: `This operation needs a higher plan${tier ? ` (${tier})` : ''}`,
			description:
				(detail ? `${detail}. ` : '') +
				(onRapidApi
					? 'Upgrade on the RapidAPI listing where you subscribed.'
					: `Upgrade at ${upgradeUrl ?? 'https://livetennisapi.com/subscribe/upgrade'}.`),
		});
	}

	throw new NodeApiError(this.getNode(), body as JsonObject, {
		httpCode,
		...(detail ? { message: detail } : {}),
	});
}
