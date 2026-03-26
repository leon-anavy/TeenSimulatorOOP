import { useAppStore } from '../../store/useAppStore';
import { AvatarBase } from './AvatarBase';
import './BlueprintView.css';

export function BlueprintView() {
  const classSchema = useAppStore((s) => s.classSchema);
  const parseErrors = useAppStore((s) => s.parseErrors);

  const fields = classSchema?.fields ?? [];
  const methods = classSchema?.methods ?? [];

  return (
    <div className="blueprint-view">
      <div className="blueprint-grid-bg" />

      <div className="blueprint-content">
        <div className="blueprint-header">
          <span className="blueprint-class-name">
            {classSchema ? `class ${classSchema.className}` : 'class Teenager'}
          </span>
          <span className="blueprint-subtitle">שרטוט המחלקה — Blueprint View</span>
        </div>

        <div className="blueprint-main">
          {/* Field annotations left */}
          <div className="blueprint-annotations left">
            {fields.filter((_, i) => i % 2 === 1).map((f) => (
              <div key={f.name} className="annotation">
                <span className="access-badge">{f.accessModifier}</span>
                <span className="field-name">{f.name}</span>
                <span className="field-type">{f.javaType}</span>
              </div>
            ))}
          </div>

          {/* Avatar */}
          <div className="blueprint-avatar-wrap">
            <AvatarBase showBlueprint />
          </div>

          {/* Field annotations right */}
          <div className="blueprint-annotations right">
            {fields.filter((_, i) => i % 2 === 0).map((f) => (
              <div key={f.name} className="annotation">
                <span className="access-badge">{f.accessModifier}</span>
                <span className="field-name">{f.name}</span>
                <span className="field-type">{f.javaType}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Methods */}
        {methods.length > 0 && (
          <div className="blueprint-methods">
            <span className="methods-label">מתודות:</span>
            {methods.map((m) => (
              <div key={m.name} className="method-pill">
                <span className="method-access">{m.accessModifier}</span>
                <span className="method-sig">{m.returnType} {m.name}()</span>
              </div>
            ))}
          </div>
        )}

        {/* Parse errors */}
        {parseErrors.length > 0 && (
          <div className="blueprint-errors">
            {parseErrors.map((e, i) => (
              <div key={i} className="blueprint-error">
                <span>⚠ {e.message}</span>
                {e.suggestion && <span className="error-suggestion">{e.suggestion}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {fields.length === 0 && parseErrors.length === 0 && (
          <div className="blueprint-empty">
            <p>הגדר שדות ב-Teenager.java כדי לראות את השרטוט</p>
            <code>private int energy;</code>
          </div>
        )}
      </div>
    </div>
  );
}
