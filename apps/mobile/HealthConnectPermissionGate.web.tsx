import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function HealthConnectPermissionGate({
  children,
}: Props): React.JSX.Element {
  return <>{children}</>;
}
