import * as THREE from 'three'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import {
	Vector3,
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	PCFSoftShadowMap,
	AmbientLight,
	DirectionalLight,
	CameraHelper,
	BoxGeometry,
	MeshLambertMaterial,
	Mesh,
	EdgesGeometry,
	LineSegments,
	LineBasicMaterial,
	BufferGeometry,
	Vector2,
	Shape,
	ShapeGeometry,
	DoubleSide,
	MeshBasicMaterial,
	ExtrudeGeometry,
	SphereGeometry,
	ExtrudeBufferGeometry,
	Quaternion,
	Object3D,
	Group,
	Geometry,
	Path,
	WireframeGeometry,
	Color,
	MeshPhongMaterial,
	MeshStandardMaterial,
	BackSide,
	FrontSide,
	ObjectLoader,
	TextureLoader,
	RepeatWrapping,
	CubeTexture,
	ClampToEdgeWrapping,
	Material
} from 'three'
const OrbitControls = require('three-orbit-controls')(THREE)


const initialize = async () => {
	initScene()
	initAxisHelper()
	initCamera({ x:0, y:70, z:100})
	initRenderer()
	initOrbitControls()
	initLights(true)
	const start = performance.now()
	//where everything starts
	//here is where I play with texture mapping.
	//I do draw each wall from scratch but, in this repository,
	// I have loaded the same meshes that is exported from another repository.
	const txtLoader = new TextureLoader()
	const texture = txtLoader.load('src/static/textures/uv.jpg')
	texture.offset.set(0,0)
	texture.wrapS = texture.wrapT = RepeatWrapping
	texture.repeat.set(1,1)
	texture.mapping = THREE.UVMapping

	const objsName = ['floor1.obj','floor2.obj','floor3.obj']
	const path = 'src/static/objs/'
	const loader = new OBJLoader(new THREE.LoadingManager())

	objsName.forEach(n => {
		loader.load(path+n, (obj) => {
			const mesh = obj.children[0] as Mesh
			mesh.material = new MeshStandardMaterial({color: 0xffffff, side: FrontSide, map: texture})
			scene.add(mesh)
		})
	})

	const end = performance.now()
	console.log('executionTime: ' + (end-start) + 'ms')
	animate()
}

const updateGeometry = (mesh: Mesh) => {
  mesh.updateMatrix()
	mesh.geometry.applyMatrix(mesh.matrix)
  mesh.matrix.identity()
  mesh.position.set(0,0,0)
  mesh.rotation.set(0,0,0)
}

const animate = () => {
	requestAnimationFrame(animate)
	controls.update()
	renderer.render(scene, camera)
}


let scene
const initScene = () => {
	scene = new Scene()
}

let axesHelper
const initAxisHelper = () => {
	axesHelper = new THREE.AxesHelper(5)
	scene.add(axesHelper)
}

let camera
const initCamera = (position = null) => {
	camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1500)
	if (position) {
		camera.position.x = position.x
		camera.position.y = position.y
		camera.position.z = position.z
	}
	scene.add(camera)
}

let renderer
const initRenderer = () => {
	renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
	renderer.setSize(window.innerWidth, window.innerHeight)
	renderer.setClearColor(0x2d2d2d)
	renderer.gammaInput = true
	renderer.gammaOutput = true
	renderer.gammaFactor = 3
	renderer.shadowMap.enabled = true
	renderer.antialias = true
	renderer.shadowMap.type = PCFSoftShadowMap
	document.body.appendChild(renderer.domElement)
}

let controls
const initOrbitControls = () => {
	controls = new OrbitControls(camera, renderer.domElement)
	controls.minDistance = 0
	controls.maxDistance = Infinity
	controls.enablePan = true
	controls.enableZoom = true
	controls.zoomSpeed = 1.0
}

let ambLight, dirLight, helper
const initLights = (isHelper = null) => {
	const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x000000, 1 )
	// hemiLight.color.setHSL(0.6, 0.75, 0.5)
	// hemiLight.groundColor.setHSL(0.095, 0.5, 0.5)
	hemiLight.position.set(0, 500, 0)
	scene.add(hemiLight)
	ambLight = new THREE.AmbientLight(0x2d2d2d, 1)
	scene.add(ambLight)
	dirLight = new THREE.DirectionalLight(0xffffff, 1)
	dirLight.position.set(0, 0.75, 1)
	dirLight.position.multiplyScalar(90)
	dirLight.name = "dirlight"
	dirLight.shadowCameraVisible = true
	dirLight.shadowBias = -0.0001
	dirLight.castShadow = true
	dirLight.shadow.camera.far = 1000
	dirLight.shadow.camera.near = 0
	dirLight.shadow.camera.left = -30
	dirLight.shadow.camera.right = 30
	dirLight.shadow.camera.top = 30
	dirLight.shadow.camera.bottom = -30
	dirLight.shadowMapWidth = dirLight.shadowMapHeight = 1024 * 2
	dirLight.PCFSoftShadowMap = PCFSoftShadowMap
	scene.add(dirLight)
}

let cube

initialize()
