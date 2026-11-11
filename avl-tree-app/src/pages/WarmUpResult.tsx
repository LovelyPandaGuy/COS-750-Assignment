import { Link } from 'react-router-dom'
import { SkeletonScreen } from '../components/SkeletonScreen'
import { screenCopy } from '../content/screens'
import { paths } from '../routes'

/** Wireframe 1d. The refresher stays reachable whatever the result (FR-DIA-04). */
export function WarmUpResult() {
  return (
    <SkeletonScreen heading={screenCopy.headings.warmUpResult}>
      <Link className="screen-link" to={paths.activity('C1', 'refresher')}>
        {screenCopy.links.toRefresher}
      </Link>
      <Link className="screen-link" to={paths.activity('C1', 'check')}>
        {screenCopy.links.toWarmUp}
      </Link>
    </SkeletonScreen>
  )
}
