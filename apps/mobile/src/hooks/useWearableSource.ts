import {
  createGarminProvisioningRequest,
  provisionWearableSourceForCurrentUser,
} from '../../wearableSourceProvisioning';
import type {
  ResolveWearableSourceOptions,
  ResolveWearableSourceRequest,
  ResolveWearableSourceResponse,
} from '../../wearableSourceProvisioning';

export const WearableConnectState = {
  Idle: 'Idle',
  Loading: 'Loading',
  Success: 'Success',
  AlreadyLinked: 'AlreadyLinked',
  Error: 'Error',
} as const;

export type WearableConnectStateValue =
  (typeof WearableConnectState)[keyof typeof WearableConnectState];

export type WearableConnectResult = {
  wearable_source_id: string;
  created: boolean;
};

export type WearableConnectStateProps = {
  state: WearableConnectStateValue | null;
  error?: string;
  result?: WearableConnectResult;
};

function toConnectResult(response: ResolveWearableSourceResponse): WearableConnectResult {
  return {
    wearable_source_id: response.wearable_source_id,
    created: response.created,
  };
}

export async function fetchWearableSource(
  request: ResolveWearableSourceRequest,
  options?: ResolveWearableSourceOptions,
): Promise<WearableConnectResult> {
  return toConnectResult(await provisionWearableSourceForCurrentUser(request, options));
}

export async function fetchGarminWearableSource(
  appInstallId: string,
  options?: ResolveWearableSourceOptions,
): Promise<WearableConnectResult> {
  return fetchWearableSource(createGarminProvisioningRequest({ app_install_id: appInstallId }), options);
}
