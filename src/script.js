import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// snow particles
const snowParticlesGeometry = new THREE.BufferGeometry;
const particlesCnt = 5000;

const posArray = new Float32Array(particlesCnt * 3);

for (let i = 0; i < particlesCnt * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * (Math.random() * 5);
}

snowParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));


// Materials
const material = new THREE.PointsMaterial({
    size: 0.005,
    color: 'white'
});

// Points
const particlesMesh = new THREE.Points(snowParticlesGeometry, material);
scene.add(particlesMesh);

// Stars
const starGeometry = new THREE.BufferGeometry;
const starCnt = 5000;

const starPosArray = new Float32Array(starCnt * 3);

for (let i = 0; i < starCnt * 3; i++) {
    starPosArray[i] = (Math.random() - 0.5) * (Math.random() * 100);
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPosArray, 3));


// Materials
const starMaterial = new THREE.PointsMaterial({
    size: 0.005,
    color: 'white'
});

// Points
const starMesh = new THREE.Points(starGeometry, starMaterial);
scene.add(starMesh);



/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/11.png')

// Vertex shader code
const vertexShader = `
uniform float time;
varying vec3 vColor;

void main() {
    vec3 pos = position;
    pos.y = sin(time + pos.x);

    vColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;


const fragmentShader = `
varying vec3 vColor;

void main() {
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}
`;

/**
 * Particles
 */
const particlesGeometry2 = new THREE.BufferGeometry
const count = 500000

const positions = new Float32Array(count * 4)

for(let i = 0; i < count * 3; i++)
{
    positions[i] = (Math.random() - 0.5) * 10
}

particlesGeometry2.setAttribute('position', new THREE.BufferAttribute(positions, 3))



const particlesMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    size: 0.1,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    map: particleTexture,
    transparent: true,
    alphaMap: particleTexture,
    depthWrite: false,
});


const particles = new THREE.Points(particlesGeometry2, particlesMaterial)
scene.add(particles)

let snow = null;
const snowy_alps = new GLTFLoader();
snowy_alps.load(
    '/models/snow_alps_low_poly.glb',
    (gltf) => {
        snow = gltf.scene;
        snow.scale.set(8, 8, 8); // Set the desired scale of the model
        snow.position.y = 0; // Adjust the position of the model along the y-axis
        snow.position.z = 0; // Adjust the position of the model along the z-axis
        snow.position.x = 0; // Adjust the position of the model along the x-axis

        scene.add(snow); // Add the model to the scene
    }
);

let me = null;
const yauvan = new GLTFLoader();
yauvan.load(
    '/models/yauvan.glb',
    (gltf) => {
        me = gltf.scene;
        me.scale.set(0.1, 0.1, 0.1); // Set the desired scale of the model
        me.position.y = 0.12; // Adjust the position of the model along the y-axis
        me.position.z = 0; // Adjust the position of the model along the z-axis
        me.position.x = 0; // Adjust the position of the model along the x-axis
        

        scene.add(me); // Add the model to the scene
    }
);






/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 3)

scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#ffffff', 1.5)
moonLight.position.set(4, 5, - 2)
scene.add(moonLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(30, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 5
camera.position.y = 2
camera.position.z = 0
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    particlesMaterial.uniforms.time.value = elapsedTime;


    // Rotate the model if it's loaded
    if (snow) {
        snow.rotation.y += 0.001; // Adjust this value for different rotation speeds
    }

        // Snowfall animation
        particlesMesh.geometry.attributes.position.array.forEach((value, index) => {
            if (index % 3 === 1) { // Y component of the position
                particlesMesh.geometry.attributes.position.array[index] -= 0.02;
                if (particlesMesh.geometry.attributes.position.array[index] < -1.5) {
                    particlesMesh.geometry.attributes.position.array[index] = 1.5;
                }
            }
        });
        particlesMesh.geometry.attributes.position.needsUpdate = true;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()