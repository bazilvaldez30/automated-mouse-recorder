/* import { ipcRenderer } from 'electron' */
/* import { handleStartRecording, handleTogglePauseResume, handleStopRecording, handleReplay, handleRecordMouseMove, handleRecordMouseClick } from './actions.js'; */

// Initialize the recording states
let isRecording = false
let recordedActions = []
let isPaused = false
let countdownInterval

// DOM elements
const startBtn = document.getElementById('start-recording')
const pauseResumeBtn = document.getElementById('pause-resume-recording')
const stopBtn = document.getElementById('stop-recording')
const replayBtn = document.getElementById('replay-actions')
const countdownEl = document.getElementById('countdown')
const countdownTimerEl = document.getElementById('countdown-timer')
const recordingStatusEl = document.getElementById('recording-status')

// Hide the pause button initially
pauseResumeBtn.hidden = true

// Adding event listeners to the buttons
startBtn.addEventListener('click', handleStartCountdown)
pauseResumeBtn.addEventListener('click', handleTogglePauseResume)
stopBtn.addEventListener('click', handleStopRecording)
replayBtn.addEventListener('click', handleReplay)

// Add event listeners to record mouse movements and clicks
document.addEventListener('mousemove', handleRecordMouseMove)
document.addEventListener('click', handleRecordMouseClick)

// Was trying to move the functions to a separate file but it didn't work so i just left them here but it supposed to be in a separate file
/* utils.js */

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

//Starts the recording process and initializes the necessary states.
function handleStartRecording() {
  try {
    isRecording = true
    recordedActions = []

    // Update the button states
    startBtn.hidden = true
    pauseResumeBtn.hidden = false
    stopBtn.disabled = false
    replayBtn.disabled = true

    console.log('Recording started...')
  } catch (error) {
    console.error('Error starting recording:', error)
  }
}

// Toggles between pausing and resuming the recording.
function handleTogglePauseResume() {
  try {
    // Check if the recording is in progress
    if (isRecording) {
      isPaused = !isPaused
      pauseResumeBtn.textContent = isPaused
        ? 'Resume Recording'
        : 'Pause Recording'

      recordingStatusEl.textContent = isPaused ? 'Paused' : 'Recording'

      console.log(`Recording ${isPaused ? 'paused' : 'resumed'}`)
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

    recordingStatusEl.classList.add('hidden') // Hide the recording status

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

    // Disable the replay button during replay
    let startTime = recordedActions[0].time

    // map over the recorded actions and use setTimeout to replay the actions
    recordedActions.forEach((action) => {
      let delay = action.time - startTime

      // Use setTimeout to maintain the time difference between actions
      setTimeout(() => {
        try {
          if (action.type === 'mousemove') {
            moveMouse(action.x, action.y)
          } else if (action.type === 'click') {
            clickMouse(action.x, action.y)
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

/* Codes for the global shortcuts but it didn't work becaue of the preload.js file */

// Listen for the global shortcut event
/* ipcRenderer.on('replay-shortcut', () => {
  console.log('Global shortcut pressed')

  if (!isRecording && recordedActions.length > 0) handleReplay()
})

// Listen for the global shortcut event
ipcRenderer.on('play-pause-shortcut', () => {
  console.log('Global shortcut pressed')

  if (isRecording) handleTogglePauseResume()
}) */


  
// Function to move the mouse to specified coordinates
async function moveMouse(x, y) {
  try {
    const response = await fetch(
      `http://localhost:3000/move-mouse?x=${x}&y=${y}`
    )

    await response.text() // Use response.json() if the API returns JSON
  } catch (error) {
    console.error('Error:', error)
  }
}

// Function to click the mouse
async function clickMouse(x, y) {
  try {
    const response = await fetch(
      `http://localhost:3000/click-mouse?x=${x}&y=${y}`
    )
    await response.text()
    console.log('Success:', 'Mouse clicked at', x, y)
  } catch (error) {
    console.error('Error:', error)
  }
}
