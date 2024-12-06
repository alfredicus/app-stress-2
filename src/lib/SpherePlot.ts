import { Box3, BoxGeometry, Color, DirectionalLight, FogExp2, Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, PerspectiveCamera, Scene, Sphere, SphereGeometry, Vector3, WebGLRenderer } from "three"
import { TrackballControls } from 'three-stdlib'
import { Engine } from "../../../stress/src/lib/geomeca"

export class SpherePlot {
    private div = ''
    private engine: Engine = undefined

    constructor({ div, engine }: { div: string, engine: Engine }) {
        this.engine = engine
        this.div = div

        const scene = new Scene()
        scene.background = new Color(0xcccccc);
        // scene.fog = new FogExp2(0xcccccc, 0.002);

        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.z = 5

        const canvas = document.getElementById(this.div) as HTMLCanvasElement

        const renderer = new WebGLRenderer({
            canvas
        })
        renderer.setPixelRatio(window.devicePixelRatio);

        //renderer.setSize(window.innerWidth, window.innerHeight)
        //document.body.appendChild(renderer.domElement)

        const geometry = new SphereGeometry(1, 50)
        const material = new MeshPhongMaterial( { color: 0xaaaaaa } )
        const sphere = new Mesh(geometry, material)
        scene.add(sphere)

        const lights = createDefaultLights({ object: scene })
        scene.add(lights)

        const controls = new TrackballControls(camera, renderer.domElement)
        controls.rotateSpeed = 1.0
        controls.zoomSpeed = 1.2
        controls.panSpeed = 0.8

        // const helper = new OrientationGizmo(camera, { size: 100, padding: 8 });
        // document.body.appendChild(orientationGizmo);

        const animate = () => {
            requestAnimationFrame(animate)
            controls.update()
            renderer.render(scene, camera)
        }

        const onWindowResize = () => {
            const w = canvas.offsetWidth
            const h = canvas.offsetHeight
            const aspect = w / h

            camera.aspect = aspect
            camera.updateProjectionMatrix()

            renderer.setSize(w, h)

            controls.handleResize()
        }

        window.addEventListener('resize', onWindowResize);
        animate()
    }
}

function createDefaultLights(
    {scaling, object, intensity=0.5}:
    {scaling?: number, object?: Object3D, intensity?: number}={}): Group
{
    const g = new Group()

    const b = new Box3
    b.setFromObject(object)

    const sphere = new Sphere
    b.getBoundingSphere(sphere)

    const radius = sphere.radius
    const center = sphere.center

    // let dir = new Vector3(radius,4*radius,3*radius)
    // //let dir = new Vector3(5,20,12)

    const dir = center.clone()
    dir.add( new Vector3(radius,radius,radius))


    let dirLight = new DirectionalLight(0xaaaaaa)
    dirLight.position.set(dir.x, dir.y, dir.z)
    dirLight.castShadow = false
    g.add( dirLight )

    dirLight = new DirectionalLight(0xaaaaaa)
    dirLight.position.set(dir.x, dir.y, -dir.z)
    dirLight.castShadow = false
    g.add( dirLight )
    
    // ---------------------------------------------

    const intensitySky    = 0.4 // param for flux
    const intensityground = 0.4 // param for flux
    const sky    = 0xffffff

    const ground = createGrayColor(intensityground)

    const h1 = new HemisphereLight( sky, ground, intensitySky )
    h1.position.set( 0, 10, 10 )
    g.add(h1)

    const h2 = new HemisphereLight( sky, ground, intensitySky )
    h2.position.set( 0, -10, -10 )
    g.add(h2)

    return g
}

function createGrayColor(intensity) {
    if (intensity === 0) {
        return '#000000'
    }
    const value = intensity * 0xFF | 0
    const grayscale = (value << 16) | (value << 8) | value
    const gray = grayscale.toString(16)
    return gray.length===5 ? '#0' + gray : '#' + gray
}