# Air Canvas

A browser-based gesture drawing experience where you draw shapes in the air using hand gestures via your webcam. Completed drawings inflate into soft, 3D balloon-like objects that float in a shared scene.

> **Disclaimer**: This project was built in about 6 hours, so expect bugs! If you encounter any issues or have suggestions, feel free to open an issue or leave feedback. I'd love to hear what you think! Also, feel free to fork this project and make your own version of it.

<p align="center">

  <!-- Visit Website Button -->
  <a href="https://debojeet-bhowmick.netlify.app" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Visit_My_Website-000000?style=for-the-badge&logo=google-chrome&logoColor=white" />
  </a>

  <!-- Buy Me a Coffee Button -->
  <a href="https://www.buymeacoffee.com/debojeet_bhowmick" target="_blank">
    <img src="https://img.shields.io/badge/☕_Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" />
  </a>

  <!-- UPI Donation Button -->
  <a href="https://d3b0j33t.github.io/Support-For-My-Work/" target="_blank">
    <img src="https://img.shields.io/badge/💳Contribute_With_UPI-1A73E8?style=for-the-badge&logo=google-pay&logoColor=white" />
  </a>

</p>

---

## Recent Updates

- **Draggable Camera Preview** - Move the camera preview anywhere on screen so it doesn't block your creations. Double-click to reset position.
- **Improved Line Smoothing** - Added jitter filter to eliminate hand vibration for smoother drawing
- **Better Hand Detection** - Switched to higher accuracy model for more reliable tracking
- **Clear All Button** - Replaced fist gesture with a dedicated button for easier clearing
- **Expandable Preview** - Click the expand button on camera preview to enlarge it

## Features

- **Gesture-Based Drawing** - Point your index finger to draw in the air
- **3D Balloon Inflation** - Completed shapes transform into puffy, floating 3D objects
- **Real-Time Hand Tracking** - Powered by MediaPipe for responsive hand detection
- **Color Palette** - Choose from 10 pastel colors for your creations
- **Interactive Objects** - Poke, grab, and rotate your balloon creations
- **Draggable Camera Preview** - See your hand tracking skeleton and move it anywhere
- **Mouse/Touch Controls** - Orbit and zoom the 3D scene

## How It Works

1. **Draw** - Extend your index finger (keep other fingers curled) to draw
2. **Complete Shape** - Hold an open palm for 0.5 seconds to close and inflate your drawing
3. **Interact** - Pinch to grab and move objects, poke with your finger to squish them
4. **Clear** - Click the "Clear All" button to remove all objects

## Gesture Controls

| Gesture              | Action                        |
| -------------------- | ----------------------------- |
| Point (index finger) | Draw in the air               |
| Open Palm (hold)     | Close shape and inflate to 3D |
| Pinch                | Grab and move objects         |
| Swipe                | Remove individual object      |

## UI Controls

| Control                    | Action                              |
| -------------------------- | ----------------------------------- |
| Clear All button           | Remove all objects                  |
| Color swatches             | Change drawing color                |
| Camera preview             | Drag to move, double-click to reset |
| Expand button (on preview) | Toggle larger preview               |

## Installation

```bash
# Clone the repository
git clone https://github.com/D3b0j33t/debojeet-air-canvas.git
cd debojeet-air-canvas

# Install dependencies
npm install || yarn install || bun install || pnpm install

# Start development server
npm run dev || yarn dev || bun dev || pnpm run dev
```

Then open your browser to the local URL shown in the terminal (usually `http://localhost:5173`).

## Requirements

- Modern browser with WebGL support (Chrome, Firefox, Edge, Safari)
- Webcam access
- Good lighting for hand tracking
- HTTPS connection (required for camera access when hosted online)

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Three.js** - 3D rendering and scene management
- **MediaPipe Hands** - Real-time hand tracking
- **GSAP** - Smooth animations
- **PeerJS** - For Multiplayer Support (Invite friends)

## Mouse/Touch Controls

- **Click + Drag** on empty space to orbit the camera
- **Click + Drag** on an object to rotate it
- **Scroll wheel** to zoom in/out
- **Touch** gestures supported on mobile

## Project Structure

```
src/
├── main.ts           # Application entry point
├── handTracking.ts   # MediaPipe hand detection
├── gestureDetector.ts # Gesture recognition logic
├── drawingCanvas.ts  # 2D stroke rendering
├── scene3D.ts        # Three.js scene setup
├── objectManager.ts  # 3D balloon creation and physics
├── balloonInflator.ts # 3D mesh generation from strokes
├── handVisualizer.ts # Hand skeleton overlay
├── multiplayer.ts    # PeerJS multiplayer support
├── constants.ts      # Configuration values
└── types.ts          # TypeScript interfaces
```

## Tips for Best Results

- Use good lighting so your hand is clearly visible
- Keep your hand about 1-2 feet from the camera
- Point with just your index finger extended for drawing
- Draw slowly and steadily for smoother lines

## Feedback & Contributions

Found a bug? Have an idea? I'd love to hear from you!

- Open an issue on GitHub
- Fork and submit a pull request
- Share your own version built on this project

## 🤝 Let’s Collaborate

| Platform     | Link                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| 🌐 Website   | [debojeet-bhowmick.netlify.app](https://debojeet-bhowmick.netlify.app)       |
| 📧 Email     | [debojeet9279.ckp@gmail.com](mailto:debojeet9279.ckp@gmail.com)              |
| 🔗 LinkedIn  | [LinkedIn Profile](https://www.linkedin.com/in/debojeet-bhowmick-a95373266/) |
| 📞 Phone     | [**+91 9835418245**](tel:+919835418245)                                      |
| 📸 Instagram | [@debojeet_bhowmick](https://www.instagram.com/debojeet_bhowmick/)           |
| 🎥 YouTube   | [YouTube Channel](https://www.youtube.com/channel/UCrxag8szJ24xzIeBRtwUyoQ)  |

---

## 🔮 Final Words

> “If you're aiming to create not just software, but systems that _stick_, let’s connect. Together, we can build something truly unforgettable.”

---

## 📜 Open Source Libraries

This project is built with these amazing open source libraries:

| Library                                                                    | Description                               | License           |
| -------------------------------------------------------------------------- | ----------------------------------------- | ----------------- |
| [Three.js](https://threejs.org/)                                           | 3D graphics library for WebGL rendering   | MIT               |
| [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html) | Google's real-time hand tracking solution | Apache 2.0        |
| [GSAP](https://greensock.com/gsap/)                                        | Professional-grade animation library      | GreenSock License |
| [PeerJS](https://peerjs.com/)                                              | WebRTC peer-to-peer connections made easy | MIT               |
| [Vite](https://vitejs.dev/)                                                | Next-generation frontend build tool       | MIT               |
| [TypeScript](https://www.typescriptlang.org/)                              | Typed superset of JavaScript              | Apache 2.0        |

## License

MIT
