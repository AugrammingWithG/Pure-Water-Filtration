import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'

/** How often to ask the driver whether the programs have linked yet. */
const POLL_MS = 10

/**
 * Build the scene's shaders before it is shown, off the main thread.
 *
 * Left to itself, the first frame compiles every program in the scene —
 * twenty-odd of them — synchronously, and the page freezes for a second or
 * two (longer on a phone) between the UI appearing and the diorama. With
 * KHR_parallel_shader_compile the driver links them on its own threads, so
 * the programs are created here and polled for completion, and the page
 * stays live until the scene arrives. The scene is hidden until then: any
 * render that touched an unfinished program would block on it.
 *
 * This is three's compileAsync, unrolled, so that unmounting can stop the
 * poll: compileAsync's own loop keeps asking after programs that a remount
 * (StrictMode in development) has already deleted, and never finishes.
 *
 * Programs that only exist once the user does something (a stage card, a
 * system's effects) still compile on demand — one or two at a time, which
 * is a hitch, not a freeze. Without the extension (Safari) every program
 * reports ready at once and the first frame stalls as before.
 *
 * A layout effect, so it runs before the first frame is rendered — a passive
 * effect would run after it, once the frame had already compiled everything
 * synchronously. Rendered last among the scene's children so its effect runs
 * after theirs; the environment map in particular must be on the scene
 * before the programs are built, or they would all be rebuilt on the next
 * frame. compile() gathers the lights with traverseVisible, so the scene is
 * hidden only once it has returned.
 */
export default function Precompile({ onReady }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)

  useLayoutEffect(() => {
    const pending = gl.compile(scene, camera)
    scene.visible = false

    let timer
    const check = () => {
      for (const material of pending) {
        const program = gl.properties.get(material).currentProgram
        if (program === undefined || program.isReady()) pending.delete(material)
      }
      if (pending.size > 0) {
        timer = setTimeout(check, POLL_MS)
        return
      }
      scene.visible = true
      onReady?.()
    }
    check()

    return () => {
      clearTimeout(timer)
      scene.visible = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per scene; onReady is a notification, not an input
  }, [gl, scene, camera])

  return null
}
