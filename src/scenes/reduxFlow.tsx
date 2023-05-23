import { makeScene2D } from "@motion-canvas/2d/lib/scenes";

import { Rect, Txt } from "@motion-canvas/2d/lib/components";
import { CodeBlock, lines } from "@motion-canvas/2d/lib/components/CodeBlock";

import { waitFor } from "@motion-canvas/core/lib/flow";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { createSignal } from "@motion-canvas/core/lib/signals";
import { easeInOutQuint } from "@motion-canvas/core/lib/tweening";

const POPIN_OUT_DURATION = 0.5;

export default makeScene2D(function* (view) {
  const value = createSignal("0");
  const codeBlock = createRef<CodeBlock>();
  const state = createRef<Rect>();

  yield view.add(
    <>
      <CodeBlock
        ref={codeBlock}
        x={() => -(view.width() / 2 - codeBlock().width() / 2) + 20}
        fontSize={40}
        alignSelf="start"
        language="ts"
        code={`
          function reducer(state = { value: 0 }, action) {
            switch (action.type) {
              case "increment":
                return { value: state.value + 1 };
              case "decrement":
                return { value: state.value - 1 };
              default:
                return state;
            }
          }`}
      />
      <Rect
        radius={5}
        x={600}
        y={-300}
        fill="hsl(200, 60%, 50%)"
        padding={20}
        fontFamily="monospace"
        layout
      >
        <Txt fill="#222">Reducer</Txt>
      </Rect>
      <Rect
        radius={5}
        x={400}
        y={300}
        fill="hsl(80, 60%, 40%)"
        padding={20}
        fontFamily="monospace"
        layout
      >
        <Txt fill="#222">View</Txt>
      </Rect>
      <Rect
        radius={5}
        x={750}
        y={50}
        width={() => state().width() + 20}
        height={() => state().height() + 20}
        stroke="hsl(10, 0%, 80%)"
        lineWidth={3}
        lineDash={[4]}
      />
      <Rect
        ref={state}
        x={600}
        y={-200}
        scale={0}
        fill="hsl(300, 30%, 20%)"
        stroke="hsl(300, 40%, 40%)"
        lineWidth={2}
        padding={20}
        radius={40}
        layout
      >
        <CodeBlock
          fontSize={30}
          language="json"
          code={() => `{ "value": ${value()} }`}
        />
      </Rect>
    </>
  );

  codeBlock().selection([...lines(0), ...lines(9), ...lines(6, 7)]);

  yield* state().scale(1, POPIN_OUT_DURATION, easeInOutQuint);

  yield* state().position(
    [750, 50],
    1.5,
    easeInOutQuint,
    Vector2.createArcLerp(false)
  );

  codeBlock().selection([]);

  const viewState1 = createStateShadow(state());
  view.add(viewState1);

  yield* viewState1.position(
    [400, 200],
    1.2,
    easeInOutQuint,
    Vector2.createArcLerp(true)
  );

  yield* viewState1.scale(0, POPIN_OUT_DURATION, easeInOutQuint);

  viewState1.remove();

  const increment = createAction("increment");
  increment.x(400);
  increment.y(200);
  increment.scale(0);

  view.add(increment);

  yield* increment.scale(1, POPIN_OUT_DURATION, easeInOutQuint);

  yield* increment.position(
    [600, -200],
    1.2,
    easeInOutQuint,
    Vector2.createArcLerp(true, 0.1)
  );

  codeBlock().selection([...lines(0), ...lines(1), ...lines(9)]);

  yield* waitFor(1);

  codeBlock().selection([...lines(2)]);

  yield* increment.scale(0, POPIN_OUT_DURATION, easeInOutQuint);

  yield* waitFor(1);

  codeBlock().selection([...lines(3)]);

  yield* waitFor(1);
});

function createStateShadow(src: Rect): Rect {
  const clone = src.clone();

  clone.fill.reset();
  clone.lineDash([8]);
  clone.lineWidth(4);
  clone.zIndex(-1);

  return clone;
}

function createAction(actionName: string): Rect {
  return new Rect({
    fill: "hsl(0, 30%, 20%)",
    stroke: "hsl(0, 70%, 40%)",
    lineWidth: 2,
    radius: 40,
    padding: 20,
    layout: true,
    children: (
      <CodeBlock
        fontSize={30}
        language="json"
        code={`{ "type": "${actionName}" }`}
      />
    ),
  });
}
