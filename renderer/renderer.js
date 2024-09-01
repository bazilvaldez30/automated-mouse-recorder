/* import { handleStartRecording, handleTogglePauseResume, handleStopRecording, handleReplay, handleRecordMouseMove, handleRecordMouseClick } from './utils.js'; */

/* ================== Listen for the global shortcut events ================== */

ipcRenderer.on('start-recording-shortcut', () => {
  console.log('Start recording shortcut received')
  if (!isRecording) return handleStartCountdown()
  handleTogglePauseResume()
})

ipcRenderer.on('replay-shortcut', () => {
  console.log('Replay shortcut received')
  if (!isRecording && recordedActions.length > 0) handleReplay()
})

ipcRenderer.on('stop-recording-shortcut', () => {
  console.log('Stop recording shortcut received')
  if (isRecording) handleStopRecording()
})

// ================== Initialize DOM Elements ================== //
const startBtn = document.getElementById('start-recording')
const pauseResumeBtn = document.getElementById('pause-resume-recording')
const stopBtn = document.getElementById('stop-recording')
const replayBtn = document.getElementById('replay-actions')
const countdownEl = document.getElementById('countdown')
const countdownTimerEl = document.getElementById('countdown-timer')
const recordingStatusEl = document.getElementById('recording-status')
const recordingTimeEl = document.getElementById('recording-time')
const elapsedTimeEl = document.getElementById('elapsed-time')

// ================== Event Listeners ================== //

// Adding event listeners to the buttons
startBtn.addEventListener('click', handleStartCountdown)
pauseResumeBtn.addEventListener('click', handleTogglePauseResume)
stopBtn.addEventListener('click', handleStopRecording)
replayBtn.addEventListener('click', handleReplay)

// Add event listeners to record mouse movements and clicks
document.addEventListener('mousemove', handleRecordMouseMove)
document.addEventListener('click', handleRecordMouseClick)


// ================== Recording States ================== //

let isRecording = false
let recordedActions = []
let isPaused = false
let countdownInterval
let elapsedSeconds = 0
let pauseTime = 0
let lastActionIndex = 0
let isReplaying = false

pauseResumeBtn.hidden = true // Hide the pause button initially

// ================== Functions ================== //

//Starts the countdown before starting the recording process.
function handleStartCountdown() {
  console.log('Start Recording clicked')

  let countdown = 3

  replayBtn.disabled = true // Disable the replay button during countdown
  countdownEl.classList.remove('hidden') // Show the countdown element
  recordingStatusEl.classList.add('hidden') // Hide the recording status
  countdownTimerEl.textContent = countdown // Set the initial countdown value

  // Start the countdown timer
  countdownInterval = setInterval(() => {
    countdown -= 1
    countdownTimerEl.textContent = countdown

    // Start the recording after the countdown
    if (countdown <= 0) {
      clearInterval(countdownInterval)
      countdownEl.classList.add('hidden')
      handleStartRecording() // Call handleStartRecording after countdown
      recordingStatusEl.classList.remove('hidden')
    }
  }, 1000)
}

// Starts the recording process and initializes the necessary states.
function handleStartRecording() {
  try {
    isRecording = true
    recordedActions = []
    isPaused = false
    startTime = Date.now()

    // Update the button states
    startBtn.hidden = true
    pauseResumeBtn.hidden = false
    stopBtn.disabled = false
    replayBtn.disabled = true
    recordingStatusEl.classList.remove('hidden')
    recordingStatusEl.textContent = 'Mouse recorded action playing...'

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

// Function to pause or resume recording
function handleTogglePauseResume() {
  try {
    if (isRecording) {
      isPaused = !isPaused

      if (isPaused) {
        pauseResumeBtn.textContent = 'Resume Recording'
        recordingStatusEl.textContent = 'Paused'
        clearInterval(recordingInterval)

        console.log('Recording paused')
      } else {
        pauseResumeBtn.textContent = 'Pause Recording'
        recordingStatusEl.textContent = 'Recording'

        startTime = Date.now()

        // Resume the recording timer
        recordingInterval = setInterval(() => {
          elapsedSeconds = elapsedSeconds + 1
          elapsedTimeEl.textContent = elapsedSeconds
        }, 1000)

        console.log('Recording resumed')
      }
    }
  } catch (error) {
    console.error('Error toggling pause/resume:', error)
  }
}

//Stops the recording process and displays the recorded actions.
function handleStopRecording() {
  try {
    console.log('Stop Recording clicked')

    isRecording = false // Reset the recording state
    isPaused = false // Reset the paused state

    // Stop the timer and hide the recording time
    clearInterval(recordingInterval)
    recordingTimeEl.classList.add('hidden')
    elapsedTimeEl.textContent = '0'
    recordingStatusEl.classList.add('hidden')

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

//Replays the recorded actions by simulating mouse movements and clicks.
function handleReplay() {
  try {
    // Check if there are any recorded actions to replay
    if (recordedActions.length === 0) {
      alert('No actions recorded to replay.')
      return
    }

    if (isReplaying) return // Prevent multiple replays

    isReplaying = true

    // Update the recording status in UI
    recordingStatusEl.classList.remove('hidden')
    recordingStatusEl.textContent = 'Mouse recorded action playing...'

    let startTime = recordedActions[0].time
    let lastActionTime = startTime

    recordedActions.forEach((action, index) => {
      let delay = action.time - startTime

      // Delay for each action to be executed
      setTimeout(() => {
        try {
          if (action.type === 'mousemove') {
            helpers.moveMouse(action.x, action.y)
          } else if (action.type === 'click') {
            helpers.clickMouse(action.x, action.y)
          }
        } catch (error) {
          console.error('Error during replay action:', error)
        }

        // Update lastActionTime after each action
        lastActionTime = action.time

        // If it's the last action, update the status
        if (index === recordedActions.length - 1) {
          // Calculate the delay for the final status update
          let finalDelay = lastActionTime - startTime
          setTimeout(() => {
            recordingStatusEl.textContent = 'Replay completed'
            isReplaying = false
            console.log('Replay completed')

            setTimeout(() => {
              recordingStatusEl.textContent = ''
              recordingStatusEl.classList.add('hidden')
            }, 5000)
          }, finalDelay)
        }
      }, delay)
    })
  } catch (error) {
    console.error('Error handling replay:', error)
  }
}

// Records mouse movement actions.
function handleRecordMouseMove(e) {
  try {
    if (isRecording && !isPaused) {
      recordedActions.push({
        type: 'mousemove',
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      })
      console.log(`Mouse moved to (${event.clientX}, ${event.clientY})`)
    }
  } catch (error) {
    console.error('Error recording mouse movement:', error)
  }
}

// Records mouse click actions.
function handleRecordMouseClick(e) {
  try {
    if (isRecording && !isPaused) {
      recordedActions.push({
        type: 'click',
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      })
      console.log(`Mouse clicked at (${event.clientX}, ${event.clientY})`)
    }
  } catch (error) {
    console.error('Error recording mouse click:', error)
  }
}
