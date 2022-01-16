import { injectGlobal } from "@emotion/css"
import * as TagsInput from "@ui-machines/tags-input"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { tagsInputStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"
import { useMount } from "../hooks/use-mount"

injectGlobal(tagsInputStyle)

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export default defineComponent({
  name: "TagsInput",
  setup() {
    const controls = useControls({
      autoFocus: { type: "boolean", defaultValue: true, label: "autoFocus" },
      addOnPaste: { type: "boolean", defaultValue: false, label: "addOnPaste" },
      addOnBlur: { type: "boolean", defaultValue: false, label: "addOnBlur" },
      max: { type: "number", defaultValue: 4, label: "max" },
      allowOutOfRange: { type: "boolean", defaultValue: false, label: "allowOutOfRange" },
    })

    const [state, send] = useMachine(
      TagsInput.machine.withContext({
        uid: "123",
        value: ["React", "Vue"],
      }),
      {
        context: controls.context,
      },
    )

    const ref = useMount(send)

    const tags = computed(() => TagsInput.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { value, rootProps, inputProps, getTagProps, getTagDeleteButtonProps, getTagInputProps } = tags.value

      return (
        <>
          <controls.ui />

          <div ref={ref} {...rootProps} class="tags-input">
            {value.map((value, index) => (
              <span key={index}>
                <div class="tag" data-testid={`${toDashCase(value)}-tag`} {...getTagProps({ index, value })}>
                  <span>{value} </span>
                  <button
                    class="tag-close"
                    data-testid={`${toDashCase(value)}-close-button`}
                    {...getTagDeleteButtonProps({ index, value })}
                  >
                    &#x2715;
                  </button>
                </div>
                <input
                  data-testid={`${toDashCase(value)}-input`}
                  style={{ width: 40 }}
                  {...getTagInputProps({ index })}
                />
              </span>
            ))}
            <input data-testid="input" placeholder="Add tag..." {...inputProps} />
          </div>

          <StateVisualizer state={state.value} />
        </>
      )
    }
  },
})
