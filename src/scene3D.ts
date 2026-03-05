import * as THREE from 'three';
import { SCENE } from './constants';

export class Scene3D {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private ambientLight!: THREE.AmbientLight;
  private directionalLight!: THREE.DirectionalLight;
  private clock: THREE.Clock;

  // Particle system
  private particles!: THREE.Points;
  private particleCount = 600;
  private particleVelocities: Float32Array;

  // Environment map for reflections
  private envMap: THREE.CubeTexture | null = null;

  // Camera orbit controls
  private cameraDistance = SCENE.CAMERA_Z;
  private cameraTheta = 0;  // horizontal angle
  private cameraPhi = Math.PI / 2;  // vertical angle (start looking straight)
  private cameraTarget = new THREE.Vector3(0, 0, 0);

  constructor(canvas: HTMLCanvasElement) {
    // Create scene
    this.scene = new THREE.Scene();

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      SCENE.CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      SCENE.CAMERA_NEAR,
      SCENE.CAMERA_FAR
    );
    this.updateCameraPosition();

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Allocate velocity array
    this.particleVelocities = new Float32Array(this.particleCount * 3);

    // Setup lighting
    this.setupLighting();

    // Setup particles
    this.setupParticles();

    // Generate environment map
    this.envMap = this.generateEnvMap();

    // Add ground shadow plane
    this.setupGroundPlane();

    // Clock for animations
    this.clock = new THREE.Clock();
  }

  private setupLighting(): void {
    // Ambient light for soft overall illumination
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    // Main directional light for shadows
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(5, 10, 7);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.1;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -10;
    this.directionalLight.shadow.camera.right = 10;
    this.directionalLight.shadow.camera.top = 10;
    this.directionalLight.shadow.camera.bottom = -10;
    this.directionalLight.shadow.bias = -0.0001;
    this.scene.add(this.directionalLight);

    // Soft fill light from below
    const fillLight = new THREE.DirectionalLight(0xc9b8ff, 0.3);
    fillLight.position.set(-3, -5, 3);
    this.scene.add(fillLight);

    // Rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xffd4e5, 0.4);
    rimLight.position.set(-5, 3, -5);
    this.scene.add(rimLight);
  }

  private setupParticles(): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      // Spread across a large volume
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Velocities (slow drift)
      this.particleVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
      this.particleVelocities[i * 3 + 1] = Math.random() * 0.01 + 0.005;
      this.particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      // Warm green/gold sparkle colors matching the app theme
      const colorChoice = Math.random();
      if (colorChoice < 0.4) {
        // Green-ish
        colors[i * 3] = 0.65 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.85 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.4 + Math.random() * 0.15;
      } else if (colorChoice < 0.7) {
        // Gold
        colors[i * 3] = 0.95 + Math.random() * 0.05;
        colors[i * 3 + 1] = 0.85 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.5 + Math.random() * 0.2;
      } else {
        // White sparkle
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      }

      sizes[i] = Math.random() * 3 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  /** Animate particles each frame */
  updateParticles(): void {
    const positions = this.particles.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = positions.array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      arr[i * 3] += this.particleVelocities[i * 3];
      arr[i * 3 + 1] += this.particleVelocities[i * 3 + 1];
      arr[i * 3 + 2] += this.particleVelocities[i * 3 + 2];

      // Wrap around when out of bounds
      if (arr[i * 3 + 1] > 10) arr[i * 3 + 1] = -10;
      if (arr[i * 3] > 15) arr[i * 3] = -15;
      if (arr[i * 3] < -15) arr[i * 3] = 15;
      if (arr[i * 3 + 2] > 10) arr[i * 3 + 2] = -10;
      if (arr[i * 3 + 2] < -10) arr[i * 3 + 2] = 10;
    }

    positions.needsUpdate = true;
  }

  private generateEnvMap(): THREE.CubeTexture {
    // Create a procedural environment map from canvas
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const faces: HTMLCanvasElement[] = [];

    // Generate 6 faces with different gradient angles for variety
    const faceColors: [string, string][] = [
      ['#1a2a1a', '#2d4a2d'], // +X
      ['#0d160d', '#1a2a1a'], // -X
      ['#2d4a2d', '#3d6a3d'], // +Y (top — brighter)
      ['#080a08', '#0d160d'], // -Y (bottom — darker)
      ['#1a2a1a', '#2a3a2a'], // +Z
      ['#0d160d', '#1a2a1a'], // -Z
    ];

    for (const [c1, c2] of faceColors) {
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = size;
      faceCanvas.height = size;
      const faceCtx = faceCanvas.getContext('2d')!;

      const grad = faceCtx.createLinearGradient(0, 0, 0, size);
      grad.addColorStop(0, c1);
      grad.addColorStop(0.5, c2);
      grad.addColorStop(1, c1);
      faceCtx.fillStyle = grad;
      faceCtx.fillRect(0, 0, size, size);

      // Add subtle noise
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        faceCtx.fillStyle = `rgba(190, 225, 125, ${Math.random() * 0.03})`;
        faceCtx.fillRect(x, y, 1, 1);
      }

      faces.push(faceCanvas);
    }

    const cubeTexture = new THREE.CubeTexture(faces);
    cubeTexture.needsUpdate = true;

    this.scene.environment = cubeTexture;
    return cubeTexture;
  }

  private setupGroundPlane(): void {
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.ShadowMaterial({
      opacity: 0.15,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.5;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  getEnvMap(): THREE.CubeTexture | null {
    return this.envMap;
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  render(): void {
    // Update particles each frame
    this.updateParticles();
    this.renderer.render(this.scene, this.camera);
  }

  getDeltaTime(): number {
    return this.clock.getDelta();
  }

  getElapsedTime(): number {
    return this.clock.getElapsedTime();
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  // Convert screen coordinates to 3D world position
  screenToWorld(screenX: number, screenY: number, z: number = 0): THREE.Vector3 {
    const vector = new THREE.Vector3();

    // Normalize screen coordinates to -1 to 1
    vector.x = (screenX / window.innerWidth) * 2 - 1;
    vector.y = -(screenY / window.innerHeight) * 2 + 1;
    vector.z = 0.5;

    // Unproject from screen to world
    vector.unproject(this.camera);

    // Calculate direction from camera
    const dir = vector.sub(this.camera.position).normalize();

    // Calculate distance to z plane
    const distance = (z - this.camera.position.z) / dir.z;

    // Calculate final position
    const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));

    return pos;
  }

  // Create a balloon-like material with fresnel rim glow
  createBalloonMaterial(color: string): THREE.MeshStandardMaterial {
    const threeColor = new THREE.Color(color);

    const mat = new THREE.MeshStandardMaterial({
      color: threeColor,
      roughness: 0.3,
      metalness: 0.05,
      envMap: this.envMap,
      envMapIntensity: 0.8,
      side: THREE.DoubleSide
    });

    // Inject fresnel rim glow via onBeforeCompile
    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <output_fragment>',
        `
        // Fresnel rim glow
        vec3 viewDir = normalize(vViewPosition);
        vec3 worldNormal = normalize(vNormal);
        float fresnelTerm = pow(1.0 - abs(dot(viewDir, worldNormal)), 3.0);
        vec3 rimColor = vec3(${(threeColor.r * 1.3).toFixed(2)}, ${(threeColor.g * 1.3).toFixed(2)}, ${(threeColor.b * 1.3).toFixed(2)});
        gl_FragColor.rgb += rimColor * fresnelTerm * 0.4;
        #include <output_fragment>
        `
      );
    };

    return mat;
  }

  // Raycast to find objects at screen position
  raycastObjects(
    screenX: number,
    screenY: number,
    objects: THREE.Object3D[]
  ): THREE.Intersection[] {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      (screenX / window.innerWidth) * 2 - 1,
      -(screenY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouse, this.camera);
    return raycaster.intersectObjects(objects, true);
  }

  // Update camera position based on spherical coordinates
  private updateCameraPosition(): void {
    const x = this.cameraDistance * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    const y = this.cameraDistance * Math.cos(this.cameraPhi);
    const z = this.cameraDistance * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);

    this.camera.position.set(
      this.cameraTarget.x + x,
      this.cameraTarget.y + y,
      this.cameraTarget.z + z
    );
    this.camera.lookAt(this.cameraTarget);
  }

  // Orbit camera around target
  orbitCamera(deltaTheta: number, deltaPhi: number): void {
    this.cameraTheta += deltaTheta;
    this.cameraPhi += deltaPhi;

    // Clamp vertical angle to avoid flipping
    this.cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraPhi));

    this.updateCameraPosition();
  }

  // Zoom camera in/out
  zoomCamera(delta: number): void {
    this.cameraDistance += delta * 5;
    this.cameraDistance = Math.max(3, Math.min(30, this.cameraDistance));
    this.updateCameraPosition();
  }

  // Reset camera to default position
  resetCamera(): void {
    this.cameraDistance = SCENE.CAMERA_Z;
    this.cameraTheta = 0;
    this.cameraPhi = Math.PI / 2;
    this.cameraTarget.set(0, 0, 0);
    this.updateCameraPosition();
  }
}
