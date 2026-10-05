"use client";

import { HANDOFF_KEYS as K, HandoffScene, TapRipple, handoffCaptions, handoffPose } from "@shared/devices/handoff";
import { ramp } from "@shared/devices/motion";
import Captions from "./Captions";
import ScrollScene from "./ScrollScene";
import ProTrialLink from "./ProTrialLink";
import Still from "./Still";

const CAPTIONS = handoffCaptions(K).map((c, i) => (i === 0 ? { ...c, from: -1 } : c));
const TAP = { x: 111, y: 175 };

export default function HandoffSection() {
  return (
    <ScrollScene
      id="handoff"
      length="320vh"
      header={(p) => (
        <>
          <Captions t={p * K.duration} captions={CAPTIONS} fade={0.4} />
          <p className="text-center text-xs sm:text-sm text-zinc-400">
            Cross-device sessions come with <ProTrialLink />
          </p>
        </>
      )}
      scene={(p) => {
        const t = p * K.duration;
        const synced = ramp(t, K.lidOpen - 0.4, K.lidOpen);
        const joined = ramp(t, K.tap + 0.2, K.tap + 0.45);
        const typed = ramp(t, K.lidOpen + 0.6, K.lidOpen + 0.9);
        return (
          <HandoffScene
            t={t}
            laptopScreen={
              <>
                <Still src="/devices/laptop-deploy.webp" alt="Voltius on a laptop, running a deploy over SSH" show={1} />
                <Still src="/devices/laptop-synced.webp" alt="The laptop showing the command typed on the phone" show={synced} />
              </>
            }
            phoneScreen={
              <>
                <Still src="/devices/phone-hosts.webp" alt="Voltius on Android, listing the session live on the laptop" show={1} />
                <Still src="/devices/phone-deploy.webp" alt="The phone joined to the same live deploy" show={joined} />
                <Still src="/devices/phone-synced.webp" alt="The phone after typing a command into the shared session" show={typed} />
                <TapRipple t={handoffPose(t, K).tap} x={TAP.x} y={TAP.y} />
              </>
            }
          />
        );
      }}
    />
  );
}
