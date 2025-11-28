import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue background

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 2, 5);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1.5, 0);
controls.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x7cfc00,
    roughness: 0.8,
    metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Create swing group
const swingGroup = new THREE.Group();

// Swing frame (A-frame structure)
const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.6,
    metalness: 0.2
});

// Frame poles
const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 8);

// Left front pole
const leftFrontPole = new THREE.Mesh(poleGeometry, frameMaterial);
leftFrontPole.position.set(-1.2, 2, 0.5);
leftFrontPole.rotation.z = Math.PI / 12;
leftFrontPole.castShadow = true;
swingGroup.add(leftFrontPole);

// Left back pole
const leftBackPole = new THREE.Mesh(poleGeometry, frameMaterial);
leftBackPole.position.set(-1.2, 2, -0.5);
leftBackPole.rotation.z = Math.PI / 12;
leftBackPole.castShadow = true;
swingGroup.add(leftBackPole);

// Right front pole
const rightFrontPole = new THREE.Mesh(poleGeometry, frameMaterial);
rightFrontPole.position.set(1.2, 2, 0.5);
rightFrontPole.rotation.z = -Math.PI / 12;
rightFrontPole.castShadow = true;
swingGroup.add(rightFrontPole);

// Right back pole
const rightBackPole = new THREE.Mesh(poleGeometry, frameMaterial);
rightBackPole.position.set(1.2, 2, -0.5);
rightBackPole.rotation.z = -Math.PI / 12;
rightBackPole.castShadow = true;
swingGroup.add(rightBackPole);

// Top bar
const topBarGeometry = new THREE.CylinderGeometry(0.06, 0.06, 3, 8);
const topBar = new THREE.Mesh(topBarGeometry, frameMaterial);
topBar.position.set(0, 3.8, 0);
topBar.rotation.z = Math.PI / 2;
topBar.castShadow = true;
swingGroup.add(topBar);

// Swing seat group (for animation)
const swingSeatGroup = new THREE.Group();
swingSeatGroup.position.set(0, 3.8, 0);

// Chains/ropes
const chainMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.3,
    metalness: 0.8
});

const chainGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2.5, 6);

// Left chain
const leftChain = new THREE.Mesh(chainGeometry, chainMaterial);
leftChain.position.set(-0.35, -1.25, 0);
leftChain.castShadow = true;
swingSeatGroup.add(leftChain);

// Right chain
const rightChain = new THREE.Mesh(chainGeometry, chainMaterial);
rightChain.position.set(0.35, -1.25, 0);
rightChain.castShadow = true;
swingSeatGroup.add(rightChain);

// Swing seat
const seatGeometry = new THREE.BoxGeometry(0.9, 0.08, 0.4);
const seatMaterial = new THREE.MeshStandardMaterial({
    color: 0x654321,
    roughness: 0.5,
    metalness: 0.1
});
const seat = new THREE.Mesh(seatGeometry, seatMaterial);
seat.position.set(0, -2.5, 0);
seat.castShadow = true;
seat.receiveShadow = true;
swingSeatGroup.add(seat);

swingGroup.add(swingSeatGroup);
scene.add(swingGroup);

// Create a simple Miku-inspired character (chibi/fufu style)
const mikuGroup = new THREE.Group();

// Head
const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xffe4c4,
    roughness: 0.7,
    metalness: 0.0
});
const head = new THREE.Mesh(headGeometry, skinMaterial);
head.position.y = 0.6;
head.castShadow = true;
mikuGroup.add(head);

// Hair (twin tails style - Miku's signature)
const hairMaterial = new THREE.MeshStandardMaterial({
    color: 0x39c5bb, // Miku's signature teal
    roughness: 0.5,
    metalness: 0.1
});

// Main hair
const mainHairGeometry = new THREE.SphereGeometry(0.32, 32, 32);
const mainHair = new THREE.Mesh(mainHairGeometry, hairMaterial);
mainHair.position.set(0, 0.65, -0.05);
mainHair.scale.set(1, 1, 0.8);
mainHair.castShadow = true;
mikuGroup.add(mainHair);

// Bangs
const bangsGeometry = new THREE.SphereGeometry(0.15, 16, 16);
const bangs = new THREE.Mesh(bangsGeometry, hairMaterial);
bangs.position.set(0, 0.75, 0.2);
bangs.scale.set(2, 0.5, 0.5);
bangs.castShadow = true;
mikuGroup.add(bangs);

// Left twintail
const twintailGeometry = new THREE.CapsuleGeometry(0.08, 0.8, 8, 16);
const leftTwintail = new THREE.Mesh(twintailGeometry, hairMaterial);
leftTwintail.position.set(-0.35, 0.3, -0.1);
leftTwintail.rotation.z = Math.PI / 8;
leftTwintail.castShadow = true;
mikuGroup.add(leftTwintail);

// Right twintail
const rightTwintail = new THREE.Mesh(twintailGeometry, hairMaterial);
rightTwintail.position.set(0.35, 0.3, -0.1);
rightTwintail.rotation.z = -Math.PI / 8;
rightTwintail.castShadow = true;
mikuGroup.add(rightTwintail);

// Eyes
const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
const eyeMaterial = new THREE.MeshStandardMaterial({
    color: 0x39c5bb,
    roughness: 0.3,
    metalness: 0.0
});

// Left eye
const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
leftEye.position.set(-0.1, 0.65, 0.25);
mikuGroup.add(leftEye);

// Right eye
const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
rightEye.position.set(0.1, 0.65, 0.25);
mikuGroup.add(rightEye);

// Eye highlights
const highlightGeometry = new THREE.SphereGeometry(0.02, 8, 8);
const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
leftHighlight.position.set(-0.08, 0.67, 0.29);
mikuGroup.add(leftHighlight);

const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
rightHighlight.position.set(0.12, 0.67, 0.29);
mikuGroup.add(rightHighlight);

// Blush (cute fufu style)
const blushGeometry = new THREE.CircleGeometry(0.04, 16);
const blushMaterial = new THREE.MeshBasicMaterial({
    color: 0xffb6c1,
    transparent: true,
    opacity: 0.6
});

const leftBlush = new THREE.Mesh(blushGeometry, blushMaterial);
leftBlush.position.set(-0.18, 0.55, 0.27);
leftBlush.rotation.y = Math.PI / 8;
mikuGroup.add(leftBlush);

const rightBlush = new THREE.Mesh(blushGeometry, blushMaterial);
rightBlush.position.set(0.18, 0.55, 0.27);
rightBlush.rotation.y = -Math.PI / 8;
mikuGroup.add(rightBlush);

// Smile
const smileGeometry = new THREE.TorusGeometry(0.05, 0.01, 8, 16, Math.PI);
const smileMaterial = new THREE.MeshBasicMaterial({ color: 0xff9999 });
const smile = new THREE.Mesh(smileGeometry, smileMaterial);
smile.position.set(0, 0.52, 0.27);
smile.rotation.x = Math.PI;
mikuGroup.add(smile);

// Body
const bodyGeometry = new THREE.CapsuleGeometry(0.2, 0.4, 8, 16);
const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x39c5bb, // Miku's outfit color
    roughness: 0.5,
    metalness: 0.1
});
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.1;
body.castShadow = true;
mikuGroup.add(body);

// Skirt
const skirtGeometry = new THREE.ConeGeometry(0.25, 0.2, 16);
const skirtMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a8a80,
    roughness: 0.5,
    metalness: 0.1
});
const skirt = new THREE.Mesh(skirtGeometry, skirtMaterial);
skirt.position.y = -0.15;
skirt.rotation.x = Math.PI;
skirt.castShadow = true;
mikuGroup.add(skirt);

// Legs (sitting position)
const legGeometry = new THREE.CapsuleGeometry(0.06, 0.25, 8, 8);

// Left leg
const leftLeg = new THREE.Mesh(legGeometry, skinMaterial);
leftLeg.position.set(-0.12, -0.35, 0.15);
leftLeg.rotation.x = Math.PI / 3;
leftLeg.castShadow = true;
mikuGroup.add(leftLeg);

// Right leg
const rightLeg = new THREE.Mesh(legGeometry, skinMaterial);
rightLeg.position.set(0.12, -0.35, 0.15);
rightLeg.rotation.x = Math.PI / 3;
rightLeg.castShadow = true;
mikuGroup.add(rightLeg);

// Arms
const armGeometry = new THREE.CapsuleGeometry(0.04, 0.2, 8, 8);

// Left arm (holding chain)
const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
leftArm.position.set(-0.3, 0.15, 0);
leftArm.rotation.z = Math.PI / 4;
leftArm.castShadow = true;
mikuGroup.add(leftArm);

// Right arm (holding chain)
const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
rightArm.position.set(0.3, 0.15, 0);
rightArm.rotation.z = -Math.PI / 4;
rightArm.castShadow = true;
mikuGroup.add(rightArm);

// Position Miku on the swing seat
mikuGroup.position.set(0, -2.05, 0);
swingSeatGroup.add(mikuGroup);

// Add some decorative elements

// Flowers around the ground
const flowerMaterial = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
const flowerGeometry = new THREE.SphereGeometry(0.05, 8, 8);

for (let i = 0; i < 20; i++) {
    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
    flower.position.set(
        (Math.random() - 0.5) * 10,
        0.05,
        (Math.random() - 0.5) * 10
    );
    scene.add(flower);
}

// Add some clouds
const cloudMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9
});

function createCloud(x, y, z) {
    const cloudGroup = new THREE.Group();
    const cloudGeometry = new THREE.SphereGeometry(0.5, 16, 16);

    for (let i = 0; i < 5; i++) {
        const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudPart.position.set(
            (Math.random() - 0.5) * 1,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.5
        );
        cloudPart.scale.set(
            0.5 + Math.random() * 0.5,
            0.3 + Math.random() * 0.2,
            0.5 + Math.random() * 0.5
        );
        cloudGroup.add(cloudPart);
    }

    cloudGroup.position.set(x, y, z);
    return cloudGroup;
}

scene.add(createCloud(-5, 6, -8));
scene.add(createCloud(4, 7, -10));
scene.add(createCloud(0, 5.5, -12));

// Hide loading indicator
document.getElementById('loading').style.display = 'none';

// Animation
let swingAngle = 0;
const swingSpeed = 0.02;
const swingAmplitude = Math.PI / 8;

function animate() {
    requestAnimationFrame(animate);

    // Swing animation
    swingAngle += swingSpeed;
    swingSeatGroup.rotation.z = Math.sin(swingAngle) * swingAmplitude;

    // Update controls
    controls.update();

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
