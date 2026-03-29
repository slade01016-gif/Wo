// Main Application Controller
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class IllusionGPTApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.particleSystem = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.clock = new THREE.Clock();
        this.objects = [];
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0015);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 30;
        this.camera.position.y = 5;
        
        // Renderer setup
        const canvas = document.getElementById('webgl-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);
        
        const pointLight1 = new THREE.PointLight(0xff0000, 1, 100);
        pointLight1.position.set(20, 20, 20);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x880000, 0.8, 100);
        pointLight2.position.set(-20, -10, 30);
        this.scene.add(pointLight2);
        
        // Create main 3D object (Geometric structure)
        this.createMainStructure();
        
        // Create particle system
        this.createParticles();
        
        // Add orbit controls for interactive rotation
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = false;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.enablePan = false;
        
        // Make canvas interactive
        this.renderer.domElement.style.pointerEvents = 'auto';
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.position.z += e.deltaY * 0.05;
            this.camera.position.z = Math.max(10, Math.min(50, this.camera.position.z));
        });
        
        // Add scroll-based animation
        this.setupScrollAnimation();
    }
    
    createMainStructure() {
        // Group to hold all main objects
        this.mainGroup = new THREE.Group();
        this.scene.add(this.mainGroup);
        
        // Core icosahedron
        const icoGeometry = new THREE.IcosahedronGeometry(4, 1);
        const icoMaterial = new THREE.MeshPhongMaterial({
            color: 0x7f1d1d,
            emissive: 0x220505,
            specular: 0xff0000,
            shininess: 100,
            wireframe: false,
            transparent: true,
            opacity: 0.9
        });
        this.icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
        this.mainGroup.add(this.icoMesh);
        
        // Wireframe overlay
        const wireframeGeometry = new THREE.IcosahedronGeometry(4.2, 1);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3333,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        this.wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        this.mainGroup.add(this.wireframeMesh);
        
        // Outer ring
        const ringGeometry = new THREE.TorusGeometry(7, 0.2, 16, 100);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0xdc2626,
            emissive: 0x440000,
            shininess: 100
        });
        this.ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        this.ringMesh.rotation.x = Math.PI / 2;
        this.mainGroup.add(this.ringMesh);
        
        // Second ring
        const ring2Geometry = new THREE.TorusGeometry(9, 0.15, 16, 100);
        const ring2Material = new THREE.MeshPhongMaterial({
            color: 0x991b1b,
            emissive: 0x220000,
            shininess: 80
        });
        this.ring2Mesh = new THREE.Mesh(ring2Geometry, ring2Material);
        this.ring2Mesh.rotation.x = Math.PI / 3;
        this.ring2Mesh.rotation.y = Math.PI / 4;
        this.mainGroup.add(this.ring2Mesh);
        
        // Floating data points
        this.createDataPoints();
        
        // Position the main group
        this.mainGroup.position.set(0, 0, 0);
    }
    
    createDataPoints() {
        this.dataPoints = [];
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshPhongMaterial({
            color: 0xff6666,
            emissive: 0x330000,
            shininess: 100
        });
        
        for (let i = 0; i < 50; i++) {
            const point = new THREE.Mesh(geometry, material);
            
            // Random spherical distribution
            const radius = 10 + Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            point.position.x = radius * Math.sin(phi) * Math.cos(theta);
            point.position.y = radius * Math.sin(phi) * Math.sin(theta);
            point.position.z = radius * Math.cos(phi);
            
            point.userData = {
                originalPos: point.position.clone(),
                speed: 0.5 + Math.random() * 1,
                offset: Math.random() * Math.PI * 2
            };
            
            this.mainGroup.add(point);
            this.dataPoints.push(point);
        }
   