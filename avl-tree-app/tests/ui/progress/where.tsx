import { useLocation } from 'react-router-dom';

/** Shows the current path so a test can see whether a link was followed. */
export function Where() {
  return <output data-testid="where">{useLocation().pathname}</output>;
}
