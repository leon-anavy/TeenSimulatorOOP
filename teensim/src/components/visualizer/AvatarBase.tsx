import type { TeenagerState } from '../../constants/methodEffects';
import './AvatarBase.css';

interface Props {
  state?: TeenagerState;
  showBlueprint?: boolean;
}

function getFaceExpression(happiness: number) {
  if (happiness >= 80) return 'M 35 55 Q 40 63 45 55'; // big smile
  if (happiness >= 50) return 'M 36 57 Q 40 61 44 57'; // small smile
  if (happiness >= 30) return 'M 36 59 L 44 59';       // neutral
  return 'M 36 57 Q 40 53 44 57';                       // frown
}

function getEyeColor(energy: number) {
  if (energy > 50) return '#1e1e2e';
  if (energy > 20) return '#45475a';
  return '#7f849c'; // tired
}

export function AvatarBase({ state, showBlueprint = false }: Props) {
  const happiness = state?.happiness ?? 80;
  const energy = state?.energy ?? 100;
  const isHungry = state?.isHungry ?? false;
  const phoneBattery = state?.phoneBattery ?? 50;

  const faceD = getFaceExpression(happiness);
  const eyeColor = getEyeColor(energy);

  // Sleepy eyes when energy < 30
  const eyeOpen = energy > 30;

  return (
    <svg
      viewBox="0 0 80 130"
      xmlns="http://www.w3.org/2000/svg"
      className={`avatar-svg ${showBlueprint ? 'blueprint-avatar' : ''}`}
    >
      {/* Hair */}
      <ellipse cx="40" cy="22" rx="18" ry="10" fill={showBlueprint ? '#89b4fa' : '#b5890a'} />
      <rect x="22" y="22" width="36" height="8" fill={showBlueprint ? '#89b4fa' : '#b5890a'} />

      {/* Head */}
      <ellipse id="head" cx="40" cy="35" rx="18" ry="20"
        fill={showBlueprint ? '#313244' : '#f5d08a'}
        stroke={showBlueprint ? '#89b4fa' : '#e6b85c'}
        strokeWidth={showBlueprint ? 1.5 : 1} />

      {/* Eyes */}
      <g id="eyes">
        {eyeOpen ? (
          <>
            <circle cx="33" cy="33" r="4" fill="white" />
            <circle cx="33" cy="33" r="2" fill={eyeColor} />
            <circle cx="47" cy="33" r="4" fill="white" />
            <circle cx="47" cy="33" r="2" fill={eyeColor} />
          </>
        ) : (
          <>
            <path d="M 29 33 Q 33 37 37 33" stroke={eyeColor} strokeWidth="1.5" fill="none" />
            <path d="M 43 33 Q 47 37 51 33" stroke={eyeColor} strokeWidth="1.5" fill="none" />
          </>
        )}
      </g>

      {/* Nose */}
      <circle cx="40" cy="40" r="1.5" fill={showBlueprint ? '#89b4fa' : '#e6a050'} />

      {/* Mouth */}
      <g id="face-expression">
        <path d={faceD} stroke={showBlueprint ? '#89b4fa' : '#8b4513'}
          strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>

      {/* Hungry indicator */}
      {isHungry && !showBlueprint && (
        <text x="56" y="40" fontSize="10" textAnchor="middle">🍔</text>
      )}

      {/* Body / T-shirt */}
      <g id="body">
        <rect x="24" y="55" width="32" height="38" rx="4"
          fill={showBlueprint ? '#313244' : '#89b4fa'}
          stroke={showBlueprint ? '#89b4fa' : '#74c7ec'}
          strokeWidth={showBlueprint ? 1.5 : 0} />
        {/* T-shirt collar */}
        {!showBlueprint && (
          <path d="M 33 55 Q 40 62 47 55" stroke="#74c7ec" strokeWidth="2" fill="none" />
        )}
      </g>

      {/* Left arm */}
      <rect x="12" y="55" width="12" height="28" rx="6"
        fill={showBlueprint ? '#313244' : '#f5d08a'}
        stroke={showBlueprint ? '#89b4fa' : '#e6b85c'}
        strokeWidth={showBlueprint ? 1.5 : 1} />

      {/* Right arm / hand holding phone */}
      <g id="hands">
        <rect x="56" y="55" width="12" height="28" rx="6"
          fill={showBlueprint ? '#313244' : '#f5d08a'}
          stroke={showBlueprint ? '#89b4fa' : '#e6b85c'}
          strokeWidth={showBlueprint ? 1.5 : 1} />

        {/* Phone */}
        {!showBlueprint && (
          <g id="phone">
            <rect x="60" y="74" width="10" height="16" rx="2" fill="#313244" stroke="#89b4fa" strokeWidth="1" />
            {/* Phone battery indicator */}
            <rect x="61" y="87" width={Math.max(0, phoneBattery / 100 * 8)} height="2"
              fill={phoneBattery > 20 ? '#a6e3a1' : '#f38ba8'} />
          </g>
        )}
      </g>

      {/* Legs */}
      <rect x="26" y="93" width="12" height="30" rx="6"
        fill={showBlueprint ? '#313244' : '#4a4a8a'}
        stroke={showBlueprint ? '#89b4fa' : '#5a5a9a'}
        strokeWidth={showBlueprint ? 1.5 : 0} />
      <rect x="42" y="93" width="12" height="30" rx="6"
        fill={showBlueprint ? '#313244' : '#4a4a8a'}
        stroke={showBlueprint ? '#89b4fa' : '#5a5a9a'}
        strokeWidth={showBlueprint ? 1.5 : 0} />

      {/* Shoes */}
      <ellipse cx="32" cy="124" rx="9" ry="5" fill={showBlueprint ? '#45475a' : '#1e1e2e'} />
      <ellipse cx="48" cy="124" rx="9" ry="5" fill={showBlueprint ? '#45475a' : '#1e1e2e'} />
    </svg>
  );
}
