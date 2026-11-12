import { STRUCTURES } from '../../content/modules/structures'
import { compareCopy } from '../../content/modules/compare'
import { STRUCTURE_IDS, type StructureRecord } from '../../modules/compare'

const copy = compareCopy.table

/** The four structures side by side, every cell from the record (add-module-c8-choosing). */
export function ComparisonTable({ record = STRUCTURES }: { record?: StructureRecord }) {
  return (
    <div className="compare-scroll" role="region" aria-label={copy.caption} tabIndex={0}>
      <table className="compare-table">
        <caption>{copy.caption}</caption>
        <thead>
          <tr>
            <th scope="col">{copy.structure}</th>
            <th scope="col">{copy.searchTypical}</th>
            <th scope="col">{copy.searchWorst}</th>
            <th scope="col">{copy.insertTypical}</th>
            <th scope="col">{copy.insertWorst}</th>
            <th scope="col">{copy.inOrder}</th>
          </tr>
        </thead>
        <tbody>
          {STRUCTURE_IDS.map((id) => {
            const s = record[id]
            return (
              <tr key={id}>
                <th scope="row">{s.name}</th>
                <td>{s.search.typical}</td>
                <td>{s.search.worst}</td>
                <td>{s.insert.typical}</td>
                <td>{s.insert.worst}</td>
                <td>{s.inOrder ? copy.yes : copy.no}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
