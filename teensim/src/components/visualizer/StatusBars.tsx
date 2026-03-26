import type { TeenagerState } from '../../constants/methodEffects';
import { useAppStore } from '../../store/useAppStore';
import './StatusBars.css';

interface Props {
  state: TeenagerState;
}

function Bar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="status-bar">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="bar-value">{typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}</span>
    </div>
  );
}

export function StatusBars({ state }: Props) {
  const classSchema = useAppStore((s) => s.classSchema);
  const defined = new Set(classSchema?.fields.map((f) => f.name) ?? []);
  const show = (name: string) => defined.size === 0 || defined.has(name);

  return (
    <div className="status-bars">
      {show('energy') && <Bar label="⚡ אנרגיה" value={state.energy} color="#a6e3a1" />}
      {show('happiness') && <Bar label="😊 אושר" value={state.happiness} color="#f9e2af" />}
      {show('phoneBattery') && <Bar label="🔋 פלאפון" value={state.phoneBattery} color="#89b4fa" />}
      {show('gpa') && (
        <div className="status-bar gpa-row">
          <span className="bar-label">📚 ממוצע</span>
          <span className="gpa-value">{state.gpa.toFixed(1)}</span>
        </div>
      )}
      {show('isHungry') && (
        <div className="status-bar hungry-row">
          <span className="bar-label">🍕 רעב</span>
          <span className={`hungry-badge ${state.isHungry ? 'hungry' : 'full'}`}>
            {state.isHungry ? 'כן' : 'לא'}
          </span>
        </div>
      )}
    </div>
  );
}
