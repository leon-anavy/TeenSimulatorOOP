import { useAppStore } from '../../store/useAppStore';
import './ObjectInspector.css';

export function ObjectInspector() {
  const instances = useAppStore((s) => s.instances);
  const classSchema = useAppStore((s) => s.classSchema);
  const instanceList = Object.values(instances).sort((a, b) => a.createdAt - b.createdAt);

  if (instanceList.length === 0) return null;

  const definedFields = new Set(classSchema?.fields.map((f) => f.name) ?? []);

  return (
    <div className="object-inspector">
      <div className="inspector-header">
        <span>🧠 תצוגת זיכרון</span>
        <span className="inspector-count">{instanceList.length} אובייקט{instanceList.length > 1 ? 'ים' : ''}</span>
      </div>
      <div className="inspector-instances">
        {instanceList.map((inst) => (
          <div key={inst.id} className="inspector-instance">
            <div className="instance-header">
              <span className="instance-type">Teenager</span>
              <span className="instance-id">{inst.id}</span>
            </div>
            <div className="instance-fields">
              {Object.entries(inst.state)
                .filter(([key]) => definedFields.size === 0 || definedFields.has(key))
                .map(([key, value]) => (
                  <div key={key} className="field-row">
                    <span className="field-key">{key}</span>
                    <span className="field-colon">:</span>
                    <span className={`field-val ${typeof value}`}>
                      {typeof value === 'boolean' ? String(value) :
                       typeof value === 'number' && !Number.isInteger(value) ?
                       value.toFixed(1) : String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
