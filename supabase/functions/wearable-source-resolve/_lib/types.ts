export type WearableSourceKind =
  | 'apple_health'
  | 'health_connect'
  | 'vendor_api'
  | 'manual_import';

export interface WearableSourceResolveRequest {
  source_kind: WearableSourceKind;
  vendor_name: string;
  source_app_id?: string | null;
  source_app_name?: string | null;
  device_hardware_id?: string | null;
  device_label?: string | null;
  app_install_id?: string | null;
}

export interface WearableSourceResolveResponse {
  wearable_source_id: string;
  profile_id: string;
  source_kind: WearableSourceKind;
  vendor_name: string;
  created: boolean;
}
