import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue background

// Camera setup
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 12, 25);

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
controls.target.set(0, 10, 0);
controls.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
scene.add(directionalLight);

// Add hemisphere light for better ambient lighting
const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x7cfc00, 0.4);
scene.add(hemisphereLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
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

// Swing frame material
const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.6,
    metalness: 0.2
});

// A-frame swing structure - properly connected poles using BufferGeometry for precise positioning
const frameHeight = 18;
const frameSpread = 5; // Spread at the base (half-width)
const frameDepth = 2.5;  // Depth front to back (half-depth)
const poleRadius = 0.15;

// Create a pole between two points using BufferGeometry for precise connection
function createConnectedPole(start, end, radius = poleRadius) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    
    // Create cylinder geometry
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 12);
    
    // By default, cylinder is centered at origin and aligned with Y axis
    // We need to move it so one end is at origin, then position and rotate
    geometry.translate(0, length / 2, 0);
    
    const pole = new THREE.Mesh(geometry, frameMaterial);
    
    // Position at start point
    pole.position.copy(start);
    
    // Create rotation to align Y axis with direction
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(up, direction.clone().normalize());
    pole.setRotationFromQuaternion(quaternion);
    
    pole.castShadow = true;
    return pole;
}

// Define apex points where poles meet at top
const leftApex = new THREE.Vector3(-1, frameHeight, 0);
const rightApex = new THREE.Vector3(1, frameHeight, 0);

// Left A-frame - two poles meeting at left apex
const leftFrontBase = new THREE.Vector3(-frameSpread, 0, frameDepth);
const leftBackBase = new THREE.Vector3(-frameSpread, 0, -frameDepth);
const leftFrontPole = createConnectedPole(leftFrontBase, leftApex);
const leftBackPole = createConnectedPole(leftBackBase, leftApex);
swingGroup.add(leftFrontPole);
swingGroup.add(leftBackPole);

// Right A-frame - two poles meeting at right apex
const rightFrontBase = new THREE.Vector3(frameSpread, 0, frameDepth);
const rightBackBase = new THREE.Vector3(frameSpread, 0, -frameDepth);
const rightFrontPole = createConnectedPole(rightFrontBase, rightApex);
const rightBackPole = createConnectedPole(rightBackBase, rightApex);
swingGroup.add(rightFrontPole);
swingGroup.add(rightBackPole);

// Cross brace on left side (connecting front and back poles at mid height)
const leftBraceFront = new THREE.Vector3().lerpVectors(leftFrontBase, leftApex, 0.35);
const leftBraceBack = new THREE.Vector3().lerpVectors(leftBackBase, leftApex, 0.35);
const leftBrace = createConnectedPole(leftBraceFront, leftBraceBack, 0.08);
swingGroup.add(leftBrace);

// Cross brace on right side
const rightBraceFront = new THREE.Vector3().lerpVectors(rightFrontBase, rightApex, 0.35);
const rightBraceBack = new THREE.Vector3().lerpVectors(rightBackBase, rightApex, 0.35);
const rightBrace = createConnectedPole(rightBraceFront, rightBraceBack, 0.08);
swingGroup.add(rightBrace);

// Top bar connecting left and right apex points
const topBar = createConnectedPole(leftApex, rightApex, 0.18);
swingGroup.add(topBar);

// Add decorative caps at the apex points
const capGeometry = new THREE.SphereGeometry(0.25, 16, 16);
const leftCap = new THREE.Mesh(capGeometry, frameMaterial);
leftCap.position.copy(leftApex);
leftCap.castShadow = true;
swingGroup.add(leftCap);

const rightCap = new THREE.Mesh(capGeometry, frameMaterial);
rightCap.position.copy(rightApex);
rightCap.castShadow = true;
swingGroup.add(rightCap);

// Swing seat group (for animation)
const swingSeatGroup = new THREE.Group();
swingSeatGroup.position.set(0, frameHeight, 0);

// Chains/ropes - longer for the taller frame
const chainMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.3,
    metalness: 0.9
});

const chainLength = 10;
const chainGeometry = new THREE.CylinderGeometry(0.05, 0.05, chainLength, 8);

// Left chain
const leftChain = new THREE.Mesh(chainGeometry, chainMaterial);
leftChain.position.set(-1.2, -chainLength / 2, 0);
leftChain.castShadow = true;
swingSeatGroup.add(leftChain);

// Right chain
const rightChain = new THREE.Mesh(chainGeometry, chainMaterial);
rightChain.position.set(1.2, -chainLength / 2, 0);
rightChain.castShadow = true;
swingSeatGroup.add(rightChain);

// Swing seat - larger for the Miku model
const seatGeometry = new THREE.BoxGeometry(3, 0.2, 1.5);
const seatMaterial = new THREE.MeshStandardMaterial({
    color: 0x654321,
    roughness: 0.5,
    metalness: 0.1
});
const seat = new THREE.Mesh(seatGeometry, seatMaterial);
seat.position.set(0, -chainLength, 0);
seat.castShadow = true;
seat.receiveShadow = true;
swingSeatGroup.add(seat);

swingGroup.add(swingSeatGroup);
scene.add(swingGroup);

// Update loading text
const loadingElement = document.getElementById('loading');
if (loadingElement) {
    loadingElement.textContent = 'Loading Miku model...';
}

// GLTF Loader for loading 3D models
const gltfLoader = new GLTFLoader();

// Try to load a GLTF model, fall back to procedural if not available
// Note: In a real project, you would need to provide your own Miku GLTF/GLB model
// For this demo, we'll create a detailed procedural Miku with proper IK-like joint structure

// Create a detailed Miku character with connected bones/joints
function createMikuWithSkeleton() {
    const mikuGroup = new THREE.Group();
    
    // Materials
    const skinMaterial = new THREE.MeshStandardMaterial({
        color: 0xffe4c4,
        roughness: 0.7,
        metalness: 0.0
    });
    
    const hairMaterial = new THREE.MeshStandardMaterial({
        color: 0x39c5bb, // Miku's signature teal
        roughness: 0.4,
        metalness: 0.1
    });
    
    const outfitMaterial = new THREE.MeshStandardMaterial({
        color: 0x39c5bb,
        roughness: 0.4,
        metalness: 0.2
    });
    
    const darkOutfitMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a8a80,
        roughness: 0.4,
        metalness: 0.2
    });
    
    // Create skeleton structure for IK-like hierarchy
    const rootBone = new THREE.Bone();
    rootBone.position.set(0, 0, 0);
    
    const spineBone = new THREE.Bone();
    spineBone.position.set(0, 2, 0);
    rootBone.add(spineBone);
    
    const chestBone = new THREE.Bone();
    chestBone.position.set(0, 1.5, 0);
    spineBone.add(chestBone);
    
    const neckBone = new THREE.Bone();
    neckBone.position.set(0, 1, 0);
    chestBone.add(neckBone);
    
    const headBone = new THREE.Bone();
    headBone.position.set(0, 0.5, 0);
    neckBone.add(headBone);
    
    // Create skeleton
    const skeleton = new THREE.Skeleton([rootBone, spineBone, chestBone, neckBone, headBone]);
    
    // Head group (connected to neck)
    const headGroup = new THREE.Group();
    
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), skinMaterial);
    head.castShadow = true;
    headGroup.add(head);
    
    // Hair base (connected to and overlapping head)
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(1.35, 32, 32), hairMaterial);
    hairBase.position.set(0, 0.1, -0.2);
    hairBase.scale.set(1, 1.05, 0.95);
    hairBase.castShadow = true;
    headGroup.add(hairBase);
    
    // Bangs (connected to hair base, covering forehead)
    const bangsShape = new THREE.Shape();
    bangsShape.moveTo(-1.1, 0);
    bangsShape.quadraticCurveTo(-1.2, 0.4, -0.8, 0.5);
    bangsShape.quadraticCurveTo(0, 0.7, 0.8, 0.5);
    bangsShape.quadraticCurveTo(1.2, 0.4, 1.1, 0);
    bangsShape.quadraticCurveTo(0, -0.1, -1.1, 0);
    
    const bangs = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), hairMaterial);
    bangs.position.set(0, 0.6, 0.85);
    bangs.scale.set(2, 0.6, 0.5);
    bangs.castShadow = true;
    headGroup.add(bangs);
    
    // Side bangs
    const leftSideBang = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.8, 8, 8), hairMaterial);
    leftSideBang.position.set(-1.1, 0, 0.5);
    leftSideBang.rotation.z = Math.PI / 8;
    leftSideBang.castShadow = true;
    headGroup.add(leftSideBang);
    
    const rightSideBang = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.8, 8, 8), hairMaterial);
    rightSideBang.position.set(1.1, 0, 0.5);
    rightSideBang.rotation.z = -Math.PI / 8;
    rightSideBang.castShadow = true;
    headGroup.add(rightSideBang);
    
    // Twintails (connected to hair base with ribbon attachments)
    // Left twintail group
    const leftTwintailGroup = new THREE.Group();
    leftTwintailGroup.position.set(-1.0, 0.2, -0.2);
    
    // Ribbon
    const ribbonMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5 });
    const leftRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.1), ribbonMaterial);
    leftTwintailGroup.add(leftRibbon);
    
    // Twintail strands
    const leftTwintail1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 3.5, 8, 16), hairMaterial);
    leftTwintail1.position.set(0, -2, 0);
    leftTwintail1.rotation.z = Math.PI / 12;
    leftTwintail1.castShadow = true;
    leftTwintailGroup.add(leftTwintail1);
    
    const leftTwintail2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 3, 8, 16), hairMaterial);
    leftTwintail2.position.set(-0.2, -1.8, 0.1);
    leftTwintail2.rotation.z = Math.PI / 10;
    leftTwintail2.castShadow = true;
    leftTwintailGroup.add(leftTwintail2);
    
    headGroup.add(leftTwintailGroup);
    
    // Right twintail group
    const rightTwintailGroup = new THREE.Group();
    rightTwintailGroup.position.set(1.0, 0.2, -0.2);
    
    const rightRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.1), ribbonMaterial);
    rightTwintailGroup.add(rightRibbon);
    
    const rightTwintail1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 3.5, 8, 16), hairMaterial);
    rightTwintail1.position.set(0, -2, 0);
    rightTwintail1.rotation.z = -Math.PI / 12;
    rightTwintail1.castShadow = true;
    rightTwintailGroup.add(rightTwintail1);
    
    const rightTwintail2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 3, 8, 16), hairMaterial);
    rightTwintail2.position.set(0.2, -1.8, 0.1);
    rightTwintail2.rotation.z = -Math.PI / 10;
    rightTwintail2.castShadow = true;
    rightTwintailGroup.add(rightTwintail2);
    
    headGroup.add(rightTwintailGroup);
    
    // Face features
    // Eyes
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x39c5bb });
    const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    // Left eye
    const leftEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), eyeWhiteMaterial);
    leftEyeWhite.position.set(-0.4, 0.1, 1.0);
    leftEyeWhite.scale.set(1, 1.2, 0.5);
    headGroup.add(leftEyeWhite);
    
    const leftIris = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), eyeMaterial);
    leftIris.position.set(-0.4, 0.1, 1.12);
    headGroup.add(leftIris);
    
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), pupilMaterial);
    leftPupil.position.set(-0.4, 0.1, 1.18);
    headGroup.add(leftPupil);
    
    // Right eye
    const rightEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), eyeWhiteMaterial);
    rightEyeWhite.position.set(0.4, 0.1, 1.0);
    rightEyeWhite.scale.set(1, 1.2, 0.5);
    headGroup.add(rightEyeWhite);
    
    const rightIris = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), eyeMaterial);
    rightIris.position.set(0.4, 0.1, 1.12);
    headGroup.add(rightIris);
    
    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), pupilMaterial);
    rightPupil.position.set(0.4, 0.1, 1.18);
    headGroup.add(rightPupil);
    
    // Eye highlights
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftHighlight = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), highlightMaterial);
    leftHighlight.position.set(-0.35, 0.18, 1.2);
    headGroup.add(leftHighlight);
    
    const rightHighlight = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), highlightMaterial);
    rightHighlight.position.set(0.45, 0.18, 1.2);
    headGroup.add(rightHighlight);
    
    // Blush (cute fufu style)
    const blushMaterial = new THREE.MeshBasicMaterial({
        color: 0xffb6c1,
        transparent: true,
        opacity: 0.5
    });
    const leftBlush = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), blushMaterial);
    leftBlush.position.set(-0.75, -0.15, 1.05);
    leftBlush.rotation.y = Math.PI / 10;
    headGroup.add(leftBlush);
    
    const rightBlush = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), blushMaterial);
    rightBlush.position.set(0.75, -0.15, 1.05);
    rightBlush.rotation.y = -Math.PI / 10;
    headGroup.add(rightBlush);
    
    // Mouth/Smile
    const smileMaterial = new THREE.MeshBasicMaterial({ color: 0xff9999 });
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 8, 16, Math.PI), smileMaterial);
    smile.position.set(0, -0.35, 1.05);
    smile.rotation.x = Math.PI;
    headGroup.add(smile);
    
    // Position head
    headGroup.position.set(0, 5.5, 0);
    mikuGroup.add(headGroup);
    
    // Neck (connecting head to body)
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.6, 16), skinMaterial);
    neck.position.set(0, 4.0, 0);
    neck.castShadow = true;
    mikuGroup.add(neck);
    
    // Body/Torso (connected to neck)
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 1.2, 8, 16), outfitMaterial);
    torso.position.set(0, 2.8, 0);
    torso.castShadow = true;
    mikuGroup.add(torso);
    
    // Collar detail
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.08, 8, 16), outfitMaterial);
    collar.position.set(0, 3.6, 0);
    collar.rotation.x = Math.PI / 2;
    mikuGroup.add(collar);
    
    // Tie
    const tieMaterial = new THREE.MeshStandardMaterial({ color: 0x39c5bb });
    const tie = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.8, 4), tieMaterial);
    tie.position.set(0, 3.2, 0.5);
    tie.rotation.x = Math.PI;
    mikuGroup.add(tie);
    
    // Skirt (connected to torso)
    const skirt = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.2, 16), darkOutfitMaterial);
    skirt.position.set(0, 1.5, 0);
    skirt.rotation.x = Math.PI;
    skirt.castShadow = true;
    mikuGroup.add(skirt);
    
    // Legs (sitting position, connected to torso)
    // Upper legs
    const upperLegGeometry = new THREE.CapsuleGeometry(0.22, 0.8, 8, 8);
    
    const leftUpperLeg = new THREE.Mesh(upperLegGeometry, skinMaterial);
    leftUpperLeg.position.set(-0.35, 0.8, 0.4);
    leftUpperLeg.rotation.x = Math.PI / 2.5;
    leftUpperLeg.castShadow = true;
    mikuGroup.add(leftUpperLeg);
    
    const rightUpperLeg = new THREE.Mesh(upperLegGeometry, skinMaterial);
    rightUpperLeg.position.set(0.35, 0.8, 0.4);
    rightUpperLeg.rotation.x = Math.PI / 2.5;
    rightUpperLeg.castShadow = true;
    mikuGroup.add(rightUpperLeg);
    
    // Lower legs (connected to upper legs)
    const lowerLegGeometry = new THREE.CapsuleGeometry(0.18, 0.9, 8, 8);
    
    const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, skinMaterial);
    leftLowerLeg.position.set(-0.35, 0.2, 1.0);
    leftLowerLeg.rotation.x = -Math.PI / 5;
    leftLowerLeg.castShadow = true;
    mikuGroup.add(leftLowerLeg);
    
    const rightLowerLeg = new THREE.Mesh(lowerLegGeometry, skinMaterial);
    rightLowerLeg.position.set(0.35, 0.2, 1.0);
    rightLowerLeg.rotation.x = -Math.PI / 5;
    rightLowerLeg.castShadow = true;
    mikuGroup.add(rightLowerLeg);
    
    // Boots
    const bootMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3 });
    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.6), bootMaterial);
    leftBoot.position.set(-0.35, -0.3, 1.3);
    leftBoot.rotation.x = -Math.PI / 8;
    leftBoot.castShadow = true;
    mikuGroup.add(leftBoot);
    
    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.6), bootMaterial);
    rightBoot.position.set(0.35, -0.3, 1.3);
    rightBoot.rotation.x = -Math.PI / 8;
    rightBoot.castShadow = true;
    mikuGroup.add(rightBoot);
    
    // Arms (connected to torso/shoulders)
    // Shoulders
    const shoulderGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    
    const leftShoulder = new THREE.Mesh(shoulderGeometry, outfitMaterial);
    leftShoulder.position.set(-0.9, 3.3, 0);
    leftShoulder.castShadow = true;
    mikuGroup.add(leftShoulder);
    
    const rightShoulder = new THREE.Mesh(shoulderGeometry, outfitMaterial);
    rightShoulder.position.set(0.9, 3.3, 0);
    rightShoulder.castShadow = true;
    mikuGroup.add(rightShoulder);
    
    // Upper arms (connected to shoulders)
    const upperArmGeometry = new THREE.CapsuleGeometry(0.12, 0.6, 8, 8);
    
    const leftUpperArm = new THREE.Mesh(upperArmGeometry, skinMaterial);
    leftUpperArm.position.set(-1.1, 2.9, 0);
    leftUpperArm.rotation.z = Math.PI / 5;
    leftUpperArm.castShadow = true;
    mikuGroup.add(leftUpperArm);
    
    const rightUpperArm = new THREE.Mesh(upperArmGeometry, skinMaterial);
    rightUpperArm.position.set(1.1, 2.9, 0);
    rightUpperArm.rotation.z = -Math.PI / 5;
    rightUpperArm.castShadow = true;
    mikuGroup.add(rightUpperArm);
    
    // Lower arms/forearms (connected to upper arms)
    const forearmGeometry = new THREE.CapsuleGeometry(0.1, 0.5, 8, 8);
    
    const leftForearm = new THREE.Mesh(forearmGeometry, skinMaterial);
    leftForearm.position.set(-1.3, 2.4, 0.1);
    leftForearm.rotation.z = Math.PI / 3;
    leftForearm.rotation.x = -Math.PI / 10;
    leftForearm.castShadow = true;
    mikuGroup.add(leftForearm);
    
    const rightForearm = new THREE.Mesh(forearmGeometry, skinMaterial);
    rightForearm.position.set(1.3, 2.4, 0.1);
    rightForearm.rotation.z = -Math.PI / 3;
    rightForearm.rotation.x = -Math.PI / 10;
    rightForearm.castShadow = true;
    mikuGroup.add(rightForearm);
    
    // Hands
    const handGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    
    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.set(-1.4, 2.0, 0.15);
    leftHand.castShadow = true;
    mikuGroup.add(leftHand);
    
    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.set(1.4, 2.0, 0.15);
    rightHand.castShadow = true;
    mikuGroup.add(rightHand);
    
    // Arm sleeves (detached sleeves - Miku's signature)
    const sleeveMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3 });
    
    const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.5, 8), sleeveMaterial);
    leftSleeve.position.set(-1.25, 2.5, 0);
    leftSleeve.rotation.z = Math.PI / 4;
    mikuGroup.add(leftSleeve);
    
    const rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.5, 8), sleeveMaterial);
    rightSleeve.position.set(1.25, 2.5, 0);
    rightSleeve.rotation.z = -Math.PI / 4;
    mikuGroup.add(rightSleeve);
    
    // Position on swing
    mikuGroup.position.set(0, -chainLength + 0.3, 0);
    
    return mikuGroup;
}

// Create and add Miku to the swing
const miku = createMikuWithSkeleton();
swingSeatGroup.add(miku);

// Hide loading indicator
if (loadingElement) {
    loadingElement.style.display = 'none';
}

// Add some decorative elements

// Flowers around the ground
const flowerColors = [0xff69b4, 0xff1493, 0xffb6c1, 0xffffff, 0xffff00];

for (let i = 0; i < 50; i++) {
    const flowerMaterial = new THREE.MeshBasicMaterial({ 
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)] 
    });
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), flowerMaterial);
    flower.position.set(
        (Math.random() - 0.5) * 40,
        0.15,
        (Math.random() - 0.5) * 40
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
    const cloudGeometry = new THREE.SphereGeometry(1.5, 16, 16);

    for (let i = 0; i < 6; i++) {
        const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudPart.position.set(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 1.5
        );
        cloudPart.scale.set(
            0.5 + Math.random() * 0.8,
            0.3 + Math.random() * 0.3,
            0.5 + Math.random() * 0.8
        );
        cloudGroup.add(cloudPart);
    }

    cloudGroup.position.set(x, y, z);
    return cloudGroup;
}

scene.add(createCloud(-15, 25, -20));
scene.add(createCloud(12, 28, -25));
scene.add(createCloud(0, 22, -30));
scene.add(createCloud(-20, 30, -35));
scene.add(createCloud(18, 26, -15));

// Animation
let swingAngle = 0;
const swingSpeed = 0.015;
const swingAmplitude = Math.PI / 10;

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
