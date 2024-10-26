import * as THREE from 'three'
import GUI from 'lil-gui'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js'
import earthVertexShader from './Shaders/Earth/vertex.glsl'
import earthFragmentShader from './Shaders/Earth/fragment.glsl'
import atmosphereVertexShader from './Shaders/Atmosphere/vertex.glsl'
import atmosphereFragmentShader from './Shaders/Atmosphere/fragment.glsl'
import sunVertexShader from './Shaders/Sun/vertex.glsl'
import sunFragmentShader from './Shaders/Sun/fragment.glsl'
import moonVertexShader from './Shaders/Moon/vertex.glsl'
import moonFragmentShader from './Shaders/Moon/fragment.glsl'
import overlayVertexShader from './Shaders/Overlay/vertex.glsl'
import overlayFragmentShader from './Shaders/Overlay/fragment.glsl'

/**
 * Loaders
 */
let sceneReady = false
const loaderElement = document.querySelector('.loading')
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        // Wait a little
        window.setTimeout(() => {

            loaderElement.style.display = 'none'
            // Animate overlay
            gsap.to(
                overlayMaterial.uniforms.uAlpha, 
                { duration: 1, value: 0, delay: 1 }
            )

            loaderElement.style.transform = ''
        }, 500)

        window.setTimeout(() => {
            sceneReady = true
            initGUI()
        }, 2000)
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => {
         loaderElement.style.display = 'block'
    }
)

const textureLoader = new THREE.TextureLoader(loadingManager)

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    // wireframe: true,
    transparent: true,
    depthWrite: false,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: overlayVertexShader,
    fragmentShader: overlayFragmentShader 

})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Texture
 */
// Stars
const particlesTexture = textureLoader.load('/Particles/flare_01.png')

// Lensflare
const lensflareTexture = textureLoader.load('./Lenses/lensflare0.png')
const lensflareTexture1 = textureLoader.load('./Lenses/lensflare1.png')

// Earth
const earthDayTexture = textureLoader.load('./Earth/day.jpg')
earthDayTexture.colorSpace = THREE.SRGBColorSpace
earthDayTexture.anisotropy = 8

const earthNightTexture = textureLoader.load('./Earth/night.jpg')
earthNightTexture.colorSpace = THREE.SRGBColorSpace
earthNightTexture.anisotropy = 8

const earthCloudsTexture = textureLoader.load('./Earth/clouds.jpg')
earthCloudsTexture.colorSpace = THREE.SRGBColorSpace
earthCloudsTexture.anisotropy = 8
earthCloudsTexture.wrapS = THREE.RepeatWrapping
earthCloudsTexture.wrapT = THREE.RepeatWrapping

// Sun
const sunTexture = textureLoader.load('./Sun/sun.jpg')
sunTexture.colorSpace = THREE.SRGBColorSpace
sunTexture.anisotropy = 8

// Moon
const moonTexture = textureLoader.load('./Moon/moon.jpg')
moonTexture.colorSpace = THREE.SRGBColorSpace
moonTexture.anisotropy = 8

/**
 * Earth
 */
const earthParameters = {}
earthParameters.atmosphereDayColor = '#00aaff'
earthParameters.atmosphereNightColor = '#ff6600'

const earthGeometry = new THREE.SphereGeometry(1.5, 64, 64)

const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uTime: new THREE.Uniform(0),
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uCloudsTexture: new THREE.Uniform(earthCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereNightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereNightColor)),
        uClouds: new THREE.Uniform(0)
    }
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

/**
 * Moon
 */
const moonGeometry = new THREE.SphereGeometry(0.2, 44, 44)

const moonMaterial = new THREE.ShaderMaterial({
    vertexShader: moonVertexShader,
    fragmentShader: moonFragmentShader,
    uniforms:
    {
        uMoonTexture: new THREE.Uniform(moonTexture)
    }
})
const moon = new THREE.Mesh(moonGeometry, moonMaterial)
scene.add(moon)

const moonSpherical = new THREE.Spherical(1, Math.PI * 0.3, 2)
const moonDirection = new THREE.Vector3()

// Update
const updateMoon = () =>
    {
        // Moon direction
        moonDirection.setFromSpherical(moonSpherical)
    
        // Moon
        moon.position
            .copy(moonDirection)
            .multiplyScalar(3)
    }
    
    updateMoon()

/**
 * Atmosphere
 */
const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms: {
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereNightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereNightColor))
    },
    side: THREE.BackSide,
    transparent: true
})

const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial)
atmosphere.scale.set(1.015, 1.015, 1.015)
scene.add(atmosphere)

/**
 * Lensflare
 */
const lensflare = new Lensflare()

const light = new THREE.PointLight( 0xff6600, 1.5, 2000 )

lensflare.addElement(new LensflareElement( lensflareTexture, 1000, 0, light.color))
lensflare.addElement(new LensflareElement( lensflareTexture1, 60, 0.6 ))
lensflare.addElement(new LensflareElement( lensflareTexture1, 70, 0.7 ))
lensflare.addElement(new LensflareElement( lensflareTexture1, 120, 0.9 ))
lensflare.addElement(new LensflareElement( lensflareTexture1, 70, 1 ))

light.add(lensflare)
scene.add(light)

/**
 * Sun
 */
const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.1)
const sunDirection = new THREE.Vector3()

// Sun
const sunGeometry = new THREE.SphereGeometry(10, 64, 64)

const sunMaterial = new THREE.ShaderMaterial({
    vertexShader: sunVertexShader,
    fragmentShader: sunFragmentShader,
    uniforms:
    {
        uSunTexture: new THREE.Uniform(sunTexture)
    }
})

const sun = new THREE.Mesh(sunGeometry, sunMaterial)
scene.add(sun)

// Update
const updateSun = () =>
{
    // Sun direction
    sunDirection.setFromSpherical(sunSpherical)

    // Sun
    sun.position
        .copy(sunDirection)
        .multiplyScalar(50)

    // Uniform
    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection)
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection)

    // Lensflare
    light.position.copy(sunDirection).multiplyScalar(40)
}

updateSun()


/**
 * Particles
 */
const particlesGemetry = new THREE.BufferGeometry()
const count = 1000000

const positions = new Float32Array(count * 3)

for(let i = 0; i < count * 3; i++)
{
    positions[i] = (Math.random() - 0.5) * 500
}

particlesGemetry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)

const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.color =  new THREE.Color('#ffffff')
particlesMaterial.map = particlesTexture
particlesMaterial.transparent = true
particlesMaterial.alphaMap = particlesTexture
particlesMaterial.depthWrite = false
particlesMaterial.blending = THREE.AdditiveBlending
particlesMaterial.size = 0.5
particlesMaterial.sizeAttenuation = true

const particles = new THREE.Points(particlesGemetry, particlesMaterial)
scene.add(particles)

/**
 * Information
 */
const points = [
    {
        position: new THREE.Vector3(- 0.8, 1.2, 0.6),
        element: document.querySelector('.point-0')
    }
]

// Raycaster
const raycaster = new THREE.Raycaster()

/**
 * GUI
 */
function initGUI() {

    const gui = new GUI()

    const info = {
        info: function() {
            window.open('https://www.solarsystemscope.com/textures/', '_blank')
        },
    }
    
    gui 
        .add(sunSpherical, 'phi')
        .min(0)
        .max(Math.PI)
        .name('Sun Phi')
        .onChange(updateSun)
    
    gui 
        .add(sunSpherical, 'theta')
        .min(- Math.PI)
        .max(Math.PI)
        .name('Sun Theta')
        .onChange(updateSun)
    
    gui
        .addColor(earthParameters, 'atmosphereDayColor')
        .name('Atmosphere Day')
        .onChange(() => {
            earthMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
            atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
        })
    
    gui
        .addColor(earthParameters, 'atmosphereNightColor')
        .name('Atmosphere Twiling')
        .onChange(() => {
            earthMaterial.uniforms.uAtmosphereNightColor.value.set(earthParameters.atmosphereNightColor)
            atmosphereMaterial.uniforms.uAtmosphereNightColor.value.set(earthParameters.atmosphereNightColor)
        })
    
    gui 
        .add(moonSpherical, 'phi')
        .min(0)
        .max(Math.PI * 2)
        .name('Moon Phi')
        .onChange(updateMoon)
    
    gui 
        .add(moonSpherical, 'theta')
        .min(- Math.PI)
        .max(Math.PI)
        .name('Moon Theta')
        .onChange(updateMoon)
    
    gui 
        .add(earthMaterial.uniforms.uClouds, 'value')
        .min(0)
        .max(0.5)
        .step(0.001)
        .name('Clouds')
    
    gui.add(info, 'info').name('Solar System Scope')
}

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 2.5
camera.position.y = 1.5
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.capabilities.getMaxAnisotropy()
renderer.setClearColor('#000000')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Earth
    earth.rotation.y = elapsedTime * 0.15
    moon.rotation.y = elapsedTime * 0.1

    // Uniform time
    earthMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    if (sceneReady) {
        
        for(const point of points)
            {
                const pointPosition = point.position.clone()
                pointPosition.project(camera)
            
                raycaster.setFromCamera(pointPosition, camera)
                const intersects = raycaster.intersectObjects(scene.children, true)
            
                if(intersects.length === 0)
                {
                    point.element.classList.add('visible')
                }
                else
                {
                    const intersectionDistance = intersects[0].distance
                    const pointDistance = point.position.distanceTo(camera.position)
            
                    if(intersectionDistance < pointDistance)
                    {
                        point.element.classList.remove('visible')
                    }
                    else
                    {
                        point.element.classList.add('visible')
                    }
                }
                    
                const translateX = pointPosition.x * sizes.width * 0.5
                const translateY = - pointPosition.y * sizes.height * 0.5
                point.element.style.transform = 
                    `translateX(${translateX}px) translateY(${translateY}px)`
            } 
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()