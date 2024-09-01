const { electron } = window

// Initialize the recording states
let isRecording = false
let recordedActions = []
let isPaused = false

// Starts the recording process and initializes the necessary states.
export const handleStartRecording = () => {
  try {
    isRecording = true
    recordedActions = []
    startTime = Date.now()

    // Update the button states
    startBtn.hidden = true
    pauseResumeBtn.hidden = false
    stopBtn.disabled = false
    replayBtn.disabled = true

    // Show the recording time and start the timer
    recordingTimeEl.classList.remove('hidden')
    recordingInterval = setInterval(() => {
      elapsedSeconds = Math.floor((Date.now() - startTime - pauseTime) / 1000)
      elapsedTimeEl.textContent = elapsedSeconds
    }, 1000)

    console.log('Recording started...')
  } catch (error) {
    console.error('Error starting recording:', error)
  }
}

// Toggles between pausing and resuming the recording.
export const handleTogglePauseResume = () => {
  try {
    // Check if the recording is in progress
    if (isRecording) {
      isPaused = !isPaused
      pauseResumeBtn.textContent = isPaused
        ? 'Resume Recording'
        : 'Pause Recording'

      console.log(`Recording ${isPaused ? 'paused' : 'resumed'}`)
    }
  } catch (error) {
    console.error('Error toggling pause/resume:', error)
  }
}

// Stops the recording process and displays the recorded actions.
export const handleStopRecording = () => {
  try {
    console.log('Stop Recording clicked')

    isRecording = false // Reset the recording state
    isPaused = false // Reset the paused state

    // Update the button states
    startBtn.hidden = false
    pauseResumeBtn.hidden = true
    stopBtn.disabled = true
    replayBtn.disabled = false

    console.log('Recorded actions:', recordedActions)
    console.log('Recording stopped.')
  } catch (error) {
    console.error('Error stopping recording:', error)
  }
}

// Replays the recorded actions by simulating mouse movements and clicks.
export const handleReplay = () => {
  try {
    // Check if the robot API is available
    if (!electron || !electron.robot) {
      alert('Robot API is not available')
      return
    }

    // Check if there are any recorded actions to replay
    if (recordedActions.length === 0) {
      alert('No actions recorded to replay.')
      return
    }

    // Disable the replay button during replay
    let startTime = recordedActions[0].time

    // Replay the recorded actions
    // Use setTimeout to maintain the time difference between actions
    recordedActions.forEach((action) => {
      let delay = action.time - startTime

      setTimeout(() => {
        try {
          if (action.type === 'mousemove') {
            electron.robot.moveMouse(action.x, action.y)
            console.log(`Replayed mouse move to (${action.x}, ${action.y})`)
          } else if (action.type === 'click') {
            electron.robot.moveMouse(action.x, action.y)
            electron.robot.mouseClick()
            console.log(`Replayed mouse click at (${action.x}, ${action.y})`)
          }
        } catch (error) {
          console.error('Error during replay action:', error)
        }
      }, delay)
    })
  } catch (error) {
    console.error('Error handling replay:', error)
  }
}

// Records mouse movement actions.
export const handleRecordMouseMove = (event) => {
  try {
    if (isRecording && !isPaused) {
      recordedActions.push({
        type: 'mousemove',
        x: event.clientX,
        y: event.clientY,
        time: Date.now(),
      })
      console.log(`Mouse moved to (${event.clientX}, ${event.clientY})`)
    }
  } catch (error) {
    console.error('Error recording mouse movement:', error)
  }
}

// Records mouse click actions.
export const handleRecordMouseClick = (event) => {
  try {
    if (isRecording && !isPaused) {
      recordedActions.push({
        type: 'click',
        x: event.clientX,
        y: event.clientY,
        time: Date.now(),
      })
      console.log(`Mouse clicked at (${event.clientX}, ${event.clientY})`)
    }
  } catch (error) {
    console.error('Error recording mouse click:', error)
  }
}
