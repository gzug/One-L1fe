-- ============================================================================
-- wearable_source_identity_guards
-- Adds minimal identity uniqueness guards for owned wearable source provisioning.
-- ============================================================================

-- One app install id should map to at most one active source per profile + source kind.
create unique index if not exists wearable_sources_profile_kind_app_install_unique_idx
  on public.wearable_sources (profile_id, source_kind, app_install_id)
  where app_install_id is not null;

-- One hardware identifier should map to at most one active source per profile + source kind.
create unique index if not exists wearable_sources_profile_kind_device_hardware_unique_idx
  on public.wearable_sources (profile_id, source_kind, device_hardware_id)
  where device_hardware_id is not null;
