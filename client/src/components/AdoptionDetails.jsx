import { columnsOf, labelFor } from '../format.js';
import Value from './Value.jsx';

// One adoption shown as a description list (label / value pairs).
export default function AdoptionDetails({ adoption }) {
  return (
    <article className="details" aria-labelledby="details-title">
      <h3 id="details-title">Adoption #{adoption.AdoptionID}</h3>
      <dl>
        {columnsOf([adoption]).map((key) => (
          <div key={key} className="details-row">
            <dt>{labelFor(key)}</dt>
            <dd><Value field={key} value={adoption[key]} /></dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
