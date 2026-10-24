import { useReleaseTour } from '../../hooks/useReleaseTour';
import { FeatureTour } from './FeatureTour';

/** Se monta una sola vez en el área privada: dispara el recorrido de la versión y lo dibuja. */
export function ReleaseTourHost() {
  useReleaseTour();
  return <FeatureTour />;
}
