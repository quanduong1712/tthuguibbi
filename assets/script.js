const container = document.getElementById("webgl-container");
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  ) || window.innerWidth < 768;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030515);
scene.fog = new THREE.FogExp2(0x080b21, 0.0075);

const camera = new THREE.PerspectiveCamera(
  isMobile ? 60 : 45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const DEFAULT_CAM_POS = isMobile
  ? new THREE.Vector3(0, 9, 34)
  : new THREE.Vector3(0, 8, 35);
const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 6.2, 0.5);

camera.position.copy(DEFAULT_CAM_POS);

const renderer = new THREE.WebGLRenderer({
  antialias: !isMobile,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 + 0.05;
controls.minDistance = 13;
controls.maxDistance = 46;
controls.target.copy(DEFAULT_CAM_TARGET);
controls.enabled = false;

// LIGHTS
const ambientLight = new THREE.AmbientLight(0x212942, 1.15);
scene.add(ambientLight);

const treeLight = new THREE.PointLight(0xffcbd2, 2.1, 34);
treeLight.position.set(-3, 9, 4);
scene.add(treeLight);

const warmLight = new THREE.PointLight(0xffb52e, 1.35, 24);
warmLight.position.set(-3, 6, 5);
scene.add(warmLight);

// MOON & MOONLIGHT
function createMoonTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const center = 256;

  const base = ctx.createRadialGradient(190, 170, 24, center, center, 350);
  base.addColorStop(0, "#fff9d5");
  base.addColorStop(0.58, "#ffe7a5");
  base.addColorStop(1, "#d5ae67");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 24; index++) {
    const angle = index * 2.4;
    const distance = 34 + ((index * 47) % 150);
    const x = center + Math.cos(angle) * distance;
    const y = center + Math.sin(angle) * distance * 0.82;
    const radius = 9 + ((index * 13) % 24);

    ctx.fillStyle = `rgba(128, 96, 68, ${0.12 + (index % 3) * 0.04})`;
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * 0.65, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

function createMoonGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const glow = ctx.createRadialGradient(128, 128, 16, 128, 128, 128);
  glow.addColorStop(0, "rgba(255, 236, 178, 0.62)");
  glow.addColorStop(0.35, "rgba(255, 219, 135, 0.2)");
  glow.addColorStop(1, "rgba(255, 219, 135, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return new THREE.CanvasTexture(canvas);
}

const moonPosition = new THREE.Vector3(6.5, 14.2, -19);
const moonGlow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: createMoonGlowTexture(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
);
moonGlow.position.copy(moonPosition);
moonGlow.position.z -= 0.5;
moonGlow.scale.set(13, 13, 1);
scene.add(moonGlow);

const moonMesh = new THREE.Mesh(
  new THREE.SphereGeometry(3.8, isMobile ? 32 : 48, isMobile ? 20 : 32),
  new THREE.MeshBasicMaterial({ map: createMoonTexture() }),
);
moonMesh.position.copy(moonPosition);
scene.add(moonMesh);

const moonHitMesh = new THREE.Mesh(
  new THREE.SphereGeometry(4.5, 16, 12),
  new THREE.MeshBasicMaterial({ visible: false }),
);
moonHitMesh.position.copy(moonPosition);
scene.add(moonHitMesh);

const moonLight = new THREE.PointLight(0xcbd8ff, 1.5, 70);
moonLight.position.copy(moonPosition);
scene.add(moonLight);

// ISLAND
const islandGroup = new THREE.Group();
scene.add(islandGroup);

const islandGeo = new THREE.CylinderGeometry(
  11.4,
  5.4,
  6.2,
  isMobile ? 32 : 48,
  12,
);
const posAttr = islandGeo.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
  const vx = posAttr.getX(i);
  const vy = posAttr.getY(i);
  const vz = posAttr.getZ(i);

  const distFromCenter = Math.sqrt(vx * vx + vz * vz);
  const noise =
    Math.sin(vx * 0.8) * Math.cos(vz * 0.8) * 0.6 +
    Math.sin(vx * 1.8 + vz * 1.5) * 0.3;

  if (vy > 0) {
    posAttr.setY(i, vy + noise * (1.0 - distFromCenter / 12));
  } else {
    posAttr.setX(i, vx + (Math.random() - 0.5) * 1.4);
    posAttr.setZ(i, vz + (Math.random() - 0.5) * 1.4);
  }
}
islandGeo.computeVertexNormals();

const islandMat = new THREE.MeshStandardMaterial({
  color: 0x1b2925,
  roughness: 0.85,
  flatShading: true,
});
const islandMesh = new THREE.Mesh(islandGeo, islandMat);
islandGroup.add(islandMesh);

const topGeo = new THREE.CylinderGeometry(11.6, 10.2, 0.72, isMobile ? 32 : 48, 4);
const topPos = topGeo.attributes.position;
for (let i = 0; i < topPos.count; i++) {
  const vx = topPos.getX(i);
  const vy = topPos.getY(i);
  const vz = topPos.getZ(i);
  const noise = Math.sin(vx * 0.9) * Math.cos(vz * 0.9) * 0.5;
  topPos.setY(i, vy + noise * 0.4);
}
topGeo.computeVertexNormals();
const topMat = new THREE.MeshStandardMaterial({
  color: 0x1e382c,
  roughness: 0.9,
  flatShading: true,
});
const topMesh = new THREE.Mesh(topGeo, topMat);
topMesh.position.y = 3.3;
islandGroup.add(topMesh);

// BỆ MẶT ĐÁ NHỎ & ĐÁ TẢNG RẢI RÁC ÍT HƠN
const stoneMat = new THREE.MeshStandardMaterial({
  color: 0x3b4946,
  roughness: 0.85,
  metalness: 0.1,
  flatShading: true,
});

// 1. Bệ đá nhỏ dẹt ẩn nhẹ dưới gốc cây
const mainStonePlatformGeo = new THREE.CylinderGeometry(3.4, 3.8, 0.15, 7);
const mainStonePlatform = new THREE.Mesh(mainStonePlatformGeo, stoneMat);
mainStonePlatform.position.set(0, 3.7, 0);
islandGroup.add(mainStonePlatform);

// 2. Chỉ 3 viên đá nhỏ điểm xuyết trên mặt đất
const rockCount = 9;
for (let i = 0; i < rockCount; i++) {
  const rockGeo = new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.25, 0);
  const rockMesh = new THREE.Mesh(rockGeo, stoneMat);

  const angle = (i / rockCount) * Math.PI * 2 + 0.5;
  const dist = 4.6 + Math.random() * 4.3;

  rockMesh.position.set(Math.cos(angle) * dist, 3.72, Math.sin(angle) * dist);
  rockMesh.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  );
  islandGroup.add(rockMesh);
}

// GARDEN VEGETATION
const gardenGroup = new THREE.Group();
islandGroup.add(gardenGroup);
const grassMat = new THREE.MeshStandardMaterial({ color: 0x48634a, roughness: 0.95 });
const lightGrassMat = new THREE.MeshStandardMaterial({ color: 0x78915c, roughness: 0.95 });
const pinkFlowerMat = new THREE.MeshStandardMaterial({ color: 0xe8b8c8, roughness: 0.75 });
const creamFlowerMat = new THREE.MeshStandardMaterial({ color: 0xf7e8c5, roughness: 0.75 });
const mossMat = new THREE.MeshStandardMaterial({ color: 0x334d3b, roughness: 0.95 });
const rootMat = new THREE.MeshStandardMaterial({ color: 0x2b140e, roughness: 0.9 });

function addGardenCluster(angle, distance, scale) {
  const cluster = new THREE.Group();
  cluster.position.set(Math.cos(angle) * distance, 3.75, Math.sin(angle) * distance);
  cluster.rotation.y = angle + Math.PI / 2;
  cluster.scale.setScalar(scale);

  for (let bladeIndex = 0; bladeIndex < 8; bladeIndex++) {
    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(0.055, 0.18 + Math.random() * 0.2, 4),
      bladeIndex % 3 ? grassMat : lightGrassMat,
    );
    blade.position.set((Math.random() - 0.5) * 1.35, blade.geometry.parameters.height / 2, (Math.random() - 0.5) * 0.85);
    blade.rotation.z = (Math.random() - 0.5) * 0.3;
    cluster.add(blade);
  }

  for (let flowerIndex = 0; flowerIndex < 3; flowerIndex++) {
    const flower = new THREE.Group();
    flower.position.set((Math.random() - 0.5) * 1.1, 0.16 + Math.random() * 0.12, (Math.random() - 0.5) * 0.65);
    const petalMat = flowerIndex % 2 ? pinkFlowerMat : creamFlowerMat;
    for (let petalIndex = 0; petalIndex < 5; petalIndex++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), petalMat);
      petal.position.set(Math.cos((petalIndex / 5) * Math.PI * 2) * 0.12, 0, Math.sin((petalIndex / 5) * Math.PI * 2) * 0.12);
      petal.scale.set(1.2, 0.45, 0.8);
      flower.add(petal);
    }
    flower.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffd17a, roughness: 0.7 })));
    cluster.add(flower);
  }
  gardenGroup.add(cluster);
}

for (let gardenIndex = 0; gardenIndex < (isMobile ? 24 : 38); gardenIndex++) {
  const angle = (gardenIndex / (isMobile ? 24 : 38)) * Math.PI * 2 + Math.random() * 0.28;
  const distance = 5.3 + Math.random() * 4.7;
  addGardenCluster(angle, distance, 0.7 + Math.random() * 0.65);
}

for (let rootIndex = 0; rootIndex < 5; rootIndex++) {
  const rootAngle = rootIndex * ((Math.PI * 2) / 5) + 0.35;
  const rootCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(Math.cos(rootAngle) * 0.25, 0.15, Math.sin(rootAngle) * 0.25),
    new THREE.Vector3(Math.cos(rootAngle) * 1.2, -0.06, Math.sin(rootAngle) * 1.2),
    new THREE.Vector3(Math.cos(rootAngle) * 2.2, -0.12, Math.sin(rootAngle) * 2.2),
  ]);
  const root = new THREE.Mesh(new THREE.TubeGeometry(rootCurve, 10, 0.1, 6, false), rootMat);
  root.position.y = 3.72;
  gardenGroup.add(root);
}

// TREE TRUNK & BRANCHES
const treeGroup = new THREE.Group();
treeGroup.position.set(0, 3.8, -0.55);
islandGroup.add(treeGroup);

const trunkMat = new THREE.MeshStandardMaterial({
  color: 0x2b140e,
  roughness: 0.85,
});

const trunkCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0.15, 2.5, -0.1),
  new THREE.Vector3(-0.1, 5.0, 0.1),
  new THREE.Vector3(0.0, 7.5, 0.0),
]);

const trunkGeo = new THREE.TubeGeometry(trunkCurve, 32, 0.28, 8, false);
const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
treeGroup.add(trunkMesh);

const branchClusters = [];
const mainBranchCount = 12;
for (let i = 0; i < mainBranchCount; i++) {
  const angle = (i / mainBranchCount) * Math.PI * 2 + Math.random() * 0.3;
  const h = 3.0 + Math.random() * 4.0;
  const startP = trunkCurve.getPointAt(h / 7.5);
  const len = 3.0 + Math.random() * 2.2;

  const endP = new THREE.Vector3(
    startP.x + Math.cos(angle) * len,
    startP.y + 0.8 + Math.random() * 1.0,
    startP.z + Math.sin(angle) * len,
  );

  const midP = new THREE.Vector3().addVectors(startP, endP).multiplyScalar(0.5);
  midP.y += 0.4;

  const bCurve = new THREE.CatmullRomCurve3([startP, midP, endP]);
  const bGeo = new THREE.TubeGeometry(bCurve, 10, 0.09, 6, false);
  const bMesh = new THREE.Mesh(bGeo, trunkMat);
  treeGroup.add(bMesh);

  branchClusters.push({ center: endP, radius: 3.2 + Math.random() * 1.0 });
}

// LAYERED STYLIZED FOLIAGE
const foliageGroup = new THREE.Group();
treeGroup.add(foliageGroup);
const foliageMats = [
  new THREE.MeshStandardMaterial({ color: 0x263b32, roughness: 0.95, flatShading: true }),
  new THREE.MeshStandardMaterial({ color: 0x405840, roughness: 0.95, flatShading: true }),
  new THREE.MeshStandardMaterial({ color: 0x69704b, roughness: 0.95, flatShading: true }),
  new THREE.MeshStandardMaterial({ color: 0xd99bab, roughness: 0.88, flatShading: true }),
];

const foliageCenters = [
  new THREE.Vector3(-2.8, 7.1, 0.5),
  new THREE.Vector3(1.6, 8.0, -0.3),
  new THREE.Vector3(0.5, 9.8, 0),
  new THREE.Vector3(-0.8, 6.0, 1.3),
  ...branchClusters.map((cluster) => cluster.center),
];

foliageCenters.forEach((center, centerIndex) => {
  const count = centerIndex < 4 ? 9 : 4;
  for (let leafIndex = 0; leafIndex < count; leafIndex++) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.6 + Math.random() * 0.65, 10, 8),
      foliageMats[(leafIndex + centerIndex) % foliageMats.length],
    );
    leaf.position.copy(center).add(new THREE.Vector3(
      (Math.random() - 0.5) * 2.4,
      (Math.random() - 0.5) * 1.7,
      (Math.random() - 0.5) * 2.2,
    ));
    leaf.scale.set(1.25, 0.58 + Math.random() * 0.2, 1.05);
    leaf.rotation.set(Math.random(), Math.random(), Math.random());
    foliageGroup.add(leaf);
  }
});

// Subtle blossom dust gives the canopy depth without becoming the canopy itself.
const particleCount = isMobile ? 900 : 1700;
const blossomGeo = new THREE.BufferGeometry();
const blossomPos = new Float32Array(particleCount * 3);
const blossomColors = new Float32Array(particleCount * 3);

const colorDustyPink = new THREE.Color(0xe8a2a8);
const colorSoftPink = new THREE.Color(0xf0b6bc);
const colorPaleRose = new THREE.Color(0xf7d1d5);
const colorSoftWhite = new THREE.Color(0xfdf0f2);

const clusters = [
  { center: new THREE.Vector3(0, 9.5, 0), radius: 6.2 },
  { center: new THREE.Vector3(0, 7.5, 0), radius: 7.0 },
  { center: new THREE.Vector3(0, 5.5, 0), radius: 6.0 },
  ...branchClusters,
];

for (let i = 0; i < particleCount; i++) {
  const c = clusters[Math.floor(Math.random() * clusters.length)];

  const u = Math.random();
  const r = Math.pow(u, 0.65) * c.radius;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  const x = c.center.x + r * Math.sin(phi) * Math.cos(theta);
  const y = c.center.y + r * Math.sin(phi) * Math.sin(theta) * 0.8;
  const z = c.center.z + r * Math.cos(phi);

  blossomPos[i * 3] = x;
  blossomPos[i * 3 + 1] = y;
  blossomPos[i * 3 + 2] = z;

  const heightFactor = THREE.MathUtils.clamp((y - 3) / 7, 0, 1);
  const randC = Math.random();
  let col;

  if (heightFactor < 0.3) {
    col = randC < 0.6 ? colorDustyPink : colorSoftPink;
  } else if (heightFactor < 0.7) {
    col =
      randC < 0.4
        ? colorSoftPink
        : randC < 0.8
          ? colorPaleRose
          : colorDustyPink;
  } else {
    col = randC < 0.5 ? colorSoftWhite : colorPaleRose;
  }

  blossomColors[i * 3] = col.r;
  blossomColors[i * 3 + 1] = col.g;
  blossomColors[i * 3 + 2] = col.b;
}

blossomGeo.setAttribute("position", new THREE.BufferAttribute(blossomPos, 3));
blossomGeo.setAttribute("color", new THREE.BufferAttribute(blossomColors, 3));

function createParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.4, "rgba(240,182,188,0.6)");
  grad.addColorStop(1, "rgba(240,182,188,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(16, 16, 16, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

const blossomMat = new THREE.PointsMaterial({
  size: isMobile ? 0.5 : 0.42,
  vertexColors: true,
  map: createParticleTexture(),
  transparent: true,
  opacity: 0.75,
  blending: THREE.NormalBlending,
  depthWrite: false,
});

const blossomParticles = new THREE.Points(blossomGeo, blossomMat);
treeGroup.add(blossomParticles);
treeGroup.visible = false;

// HERO TREE: a composed trunk and layered foliage replace the inherited particle canopy.
const storyTreeGroup = new THREE.Group();
storyTreeGroup.position.set(-1.35, 3.72, -1.35);
islandGroup.add(storyTreeGroup);

const heroTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3b241c, roughness: 0.9 });
const heroBranchMat = new THREE.MeshStandardMaterial({ color: 0x4c2c20, roughness: 0.9 });
const heroLeafMats = [
  new THREE.MeshStandardMaterial({ color: 0x263b32, roughness: 0.95 }),
  new THREE.MeshStandardMaterial({ color: 0x385342, roughness: 0.95 }),
  new THREE.MeshStandardMaterial({ color: 0x63724e, roughness: 0.95 }),
  new THREE.MeshStandardMaterial({ color: 0xd69cab, roughness: 0.88 }),
];

const heroTrunkCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(-0.55, 2.4, 0.05),
  new THREE.Vector3(-0.15, 4.9, -0.1),
  new THREE.Vector3(-1.05, 7.5, -0.2),
]);

function createTaperedTrunk(curve, segments, sides, baseRadius, topRadius) {
  const centers = curve.getPoints(segments);
  const positions = [];
  const indices = [];

  centers.forEach((center, ringIndex) => {
    const previous = centers[Math.max(0, ringIndex - 1)];
    const next = centers[Math.min(centers.length - 1, ringIndex + 1)];
    const tangent = new THREE.Vector3().subVectors(next, previous).normalize();
    const reference = Math.abs(tangent.y) > 0.9
      ? new THREE.Vector3(1, 0, 0)
      : new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(reference, tangent).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
    const progress = ringIndex / (centers.length - 1);
    const radius = THREE.MathUtils.lerp(baseRadius, topRadius, progress);

    for (let side = 0; side < sides; side++) {
      const angle = (side / sides) * Math.PI * 2;
      const point = center.clone()
        .addScaledVector(normal, Math.cos(angle) * radius)
        .addScaledVector(binormal, Math.sin(angle) * radius);
      positions.push(point.x, point.y, point.z);
    }
  });

  for (let ring = 0; ring < centers.length - 1; ring++) {
    for (let side = 0; side < sides; side++) {
      const nextSide = (side + 1) % sides;
      const current = ring * sides + side;
      const next = ring * sides + nextSide;
      const upper = (ring + 1) * sides + side;
      const upperNext = (ring + 1) * sides + nextSide;
      indices.push(current, upper, next, next, upper, upperNext);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, heroTrunkMat);
}

storyTreeGroup.add(createTaperedTrunk(heroTrunkCurve, 22, 12, 0.82, 0.2));

const heroBranches = [
  [new THREE.Vector3(-0.35, 3.2, 0), new THREE.Vector3(-2.6, 5.6, 0.4), new THREE.Vector3(-4.1, 6.2, 0.1)],
  [new THREE.Vector3(-0.15, 4.2, 0), new THREE.Vector3(1.65, 6.15, -0.3), new THREE.Vector3(3.25, 6.55, -0.7)],
  [new THREE.Vector3(-0.55, 5.1, 0), new THREE.Vector3(-2.3, 7.1, -0.4), new THREE.Vector3(-3.25, 7.45, -0.1)],
  [new THREE.Vector3(-0.75, 5.8, 0), new THREE.Vector3(0.6, 7.7, 0.15), new THREE.Vector3(1.7, 8.1, 0)],
  [new THREE.Vector3(-0.95, 6.6, 0), new THREE.Vector3(-2.15, 8.2, 0.25), new THREE.Vector3(-3.1, 8.45, 0.2)],
];
heroBranches.forEach((points, index) => {
  storyTreeGroup.add(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 18, 0.2 - index * 0.012, 8, false),
    heroBranchMat,
  ));
});

const heroCanopyCenters = [
  [-4.5, 6.8, 2.5, 0.82, 1.45], [-2.5, 7.85, 2.85, 0.92, 1.55],
  [-0.1, 8.25, 3.0, 1.0, 1.6], [2.55, 7.35, 2.7, 0.86, 1.5],
  [4.35, 6.35, 2.0, 0.7, 1.22], [-3.4, 5.65, 2.1, 0.7, 1.2],
  [-0.6, 6.25, 2.65, 0.78, 1.35], [1.9, 5.95, 2.25, 0.68, 1.2],
  [-1.4, 9.25, 2.4, 0.65, 1.2],
];
heroCanopyCenters.forEach(([x, y, width, height, depth], index) => {
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 14), heroLeafMats[index % heroLeafMats.length]);
  canopy.position.set(x, y, (index % 3 - 1) * 0.35);
  canopy.scale.set(width, height, depth);
  storyTreeGroup.add(canopy);
});

for (let bloomIndex = 0; bloomIndex < 28; bloomIndex++) {
  const center = heroCanopyCenters[bloomIndex % heroCanopyCenters.length];
  const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 8, 6), heroLeafMats[3]);
  bloom.position.set(center[0] + (Math.random() - 0.5) * center[2] * 1.5, center[1] + (Math.random() - 0.5) * center[3] * 1.5, 0.85 + Math.random() * 0.35);
  storyTreeGroup.add(bloom);
}

// TWO PEOPLE UNDER THE TREE
function createCouple() {
  const couple = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf3c5a6, emissive: 0x24150e, emissiveIntensity: 0.18, roughness: 0.82 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xfff3d9, emissive: 0x251d12, emissiveIntensity: 0.3, roughness: 0.88 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x253550, emissive: 0x070b14, emissiveIntensity: 0.2, roughness: 0.86 });
  const dressMat = new THREE.MeshStandardMaterial({ color: 0xf4b9ca, emissive: 0x2b111e, emissiveIntensity: 0.26, roughness: 0.8 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x24171b, roughness: 0.9 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf8f0e5, roughness: 0.75 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x2a1a20, roughness: 0.45 });

  const addMesh = (geometry, material, position, scale, parent = couple) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    if (scale) mesh.scale.copy(scale);
    parent.add(mesh);
    return mesh;
  };

  const addLimb = (start, end, radius, material) => {
    const direction = new THREE.Vector3().subVectors(end, start);
    const limb = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius * 0.9, direction.length(), 10),
      material,
    );
    limb.position.copy(start).add(end).multiplyScalar(0.5);
    limb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    couple.add(limb);
    addMesh(new THREE.SphereGeometry(radius, 10, 8), material, start);
    addMesh(new THREE.SphereGeometry(radius * 0.9, 10, 8), material, end);
    return limb;
  };

  const addFace = (position, scale, hairScale, isGirl) => {
    const head = new THREE.Group();
    head.position.copy(position);
    head.rotation.x = -0.2;
    addMesh(new THREE.SphereGeometry(0.34, 20, 16), skinMat, new THREE.Vector3(), scale, head);
    addMesh(new THREE.SphereGeometry(0.36, 20, 14), hairMat, new THREE.Vector3(0, 0.12, -0.035), hairScale, head);
    const faceFront = 0.31;
    addMesh(new THREE.SphereGeometry(0.042, 10, 8), eyeMat, new THREE.Vector3(-0.105, 0.025, faceFront), null, head);
    addMesh(new THREE.SphereGeometry(0.042, 10, 8), eyeMat, new THREE.Vector3(0.105, 0.025, faceFront), null, head);
    if (isGirl) {
      addMesh(new THREE.SphereGeometry(0.15, 12, 10), hairMat, new THREE.Vector3(-0.27, -0.2, -0.03), new THREE.Vector3(0.75, 1.65, 0.68), head);
      addMesh(new THREE.SphereGeometry(0.15, 12, 10), hairMat, new THREE.Vector3(0.27, -0.2, -0.03), new THREE.Vector3(0.75, 1.65, 0.68), head);
      const bow = addMesh(new THREE.SphereGeometry(0.07, 10, 8), dressMat, new THREE.Vector3(-0.28, 0.18, 0.16), new THREE.Vector3(1.4, 0.7, 0.45), head);
      bow.rotation.z = 0.35;
    } else {
      for (let index = -1; index <= 1; index++) {
        const fringe = addMesh(new THREE.SphereGeometry(0.12, 10, 8), hairMat, new THREE.Vector3(index * 0.12, 0.3, 0.19), new THREE.Vector3(0.7, 1.2, 0.6), head);
        fringe.rotation.z = index * 0.22;
      }
    }
    couple.add(head);
    return head;
  };

  // Both figures face local +Z, which is rotated toward the moon below.
  addMesh(new THREE.SphereGeometry(0.54, 18, 14), shirtMat, new THREE.Vector3(0.28, 0.78, 0), new THREE.Vector3(0.86, 1.22, 0.68));
  addMesh(new THREE.SphereGeometry(0.51, 18, 14), dressMat, new THREE.Vector3(-0.42, 0.63, 0.16), new THREE.Vector3(0.82, 1.16, 0.72));
  addFace(new THREE.Vector3(0.28, 1.62, 0.12), new THREE.Vector3(1, 1.04, 0.96), new THREE.Vector3(1.04, 0.72, 1), false);
  addFace(new THREE.Vector3(-0.38, 1.41, 0.27), new THREE.Vector3(0.96, 1, 0.94), new THREE.Vector3(1.08, 0.78, 1.04), true);

  // Four complete leg chains: hip -> knee -> ankle -> shoe.
  const addFoot = (position, rotationY = 0) => {
    const foot = addMesh(new THREE.BoxGeometry(0.24, 0.13, 0.42), shoeMat, position);
    foot.rotation.y = rotationY;
    return foot;
  };
  addLimb(new THREE.Vector3(0.52, 0.52, 0.08), new THREE.Vector3(0.92, 0.38, 0.38), 0.13, pantsMat);
  addLimb(new THREE.Vector3(0.92, 0.38, 0.38), new THREE.Vector3(0.76, 0.1, 0.82), 0.115, pantsMat);
  addFoot(new THREE.Vector3(0.76, 0.06, 1.02), -0.12);
  addLimb(new THREE.Vector3(0.12, 0.5, 0.05), new THREE.Vector3(-0.2, 0.36, 0.38), 0.125, pantsMat);
  addLimb(new THREE.Vector3(-0.2, 0.36, 0.38), new THREE.Vector3(-0.02, 0.1, 0.86), 0.11, pantsMat);
  addFoot(new THREE.Vector3(-0.02, 0.06, 1.06), 0.1);
  addLimb(new THREE.Vector3(-0.57, 0.48, 0.2), new THREE.Vector3(-1.0, 0.35, 0.38), 0.115, dressMat);
  addLimb(new THREE.Vector3(-1.0, 0.35, 0.38), new THREE.Vector3(-1.05, 0.1, 0.78), 0.1, dressMat);
  addFoot(new THREE.Vector3(-1.05, 0.06, 0.98), -0.2);
  addLimb(new THREE.Vector3(-0.25, 0.46, 0.15), new THREE.Vector3(-0.58, 0.34, 0.46), 0.11, dressMat);
  addLimb(new THREE.Vector3(-0.58, 0.34, 0.46), new THREE.Vector3(-0.38, 0.1, 0.88), 0.095, dressMat);
  addFoot(new THREE.Vector3(-0.38, 0.06, 1.08), 0.15);

  // One arm holds her close; the other forms a clear line toward the moon.
  addLimb(new THREE.Vector3(0.67, 1.03, 0.08), new THREE.Vector3(0.08, 1.02, 0.42), 0.11, shirtMat);
  addLimb(new THREE.Vector3(0.08, 1.02, 0.42), new THREE.Vector3(-0.3, 0.93, 0.48), 0.1, skinMat);
  addLimb(new THREE.Vector3(0.72, 1.14, 0.08), new THREE.Vector3(1.0, 1.68, 0.48), 0.105, shirtMat);
  addLimb(new THREE.Vector3(1.0, 1.68, 0.48), new THREE.Vector3(0.8, 2.2, 1.08), 0.09, skinMat);
  const pointingHand = addMesh(new THREE.SphereGeometry(0.11, 12, 8), skinMat, new THREE.Vector3(0.78, 2.2, 1.1), new THREE.Vector3(0.75, 0.75, 1.5));
  pointingHand.rotation.x = -0.65;

  // Her arms rest naturally around his torso and keep both silhouettes readable.
  addLimb(new THREE.Vector3(-0.68, 0.98, 0.3), new THREE.Vector3(-0.2, 1.08, 0.5), 0.09, dressMat);
  addLimb(new THREE.Vector3(-0.2, 1.08, 0.5), new THREE.Vector3(0.1, 1.0, 0.48), 0.08, skinMat);
  addLimb(new THREE.Vector3(-0.15, 0.99, 0.3), new THREE.Vector3(0.05, 0.86, 0.45), 0.085, dressMat);

  couple.position.set(1.3, 3.95, 2.3);
  couple.rotation.y = Math.atan2(moonPosition.x - couple.position.x, moonPosition.z - couple.position.z);
  couple.scale.setScalar(1.62);
  const rimLight = new THREE.PointLight(0xffd9bd, 0.8, 7);
  rimLight.position.set(-1.8, 3.2, 2.8);
  couple.add(rimLight);
  return couple;
}

const coupleGroup = createCouple();
islandGroup.add(coupleGroup);

// RABBITS
function createRabbit() {
  const group = new THREE.Group();
  const rabbitMat = new THREE.MeshStandardMaterial({
    color: 0xf8f8ff,
    roughness: 0.5,
  });

  const bodyGeo = new THREE.SphereGeometry(0.5, 12, 12);
  bodyGeo.scale(0.8, 1, 0.9);
  const bodyMesh = new THREE.Mesh(bodyGeo, rabbitMat);
  bodyMesh.position.y = 0.4;
  group.add(bodyMesh);

  const headGeo = new THREE.SphereGeometry(0.35, 12, 12);
  const headMesh = new THREE.Mesh(headGeo, rabbitMat);
  headMesh.position.set(0, 0.85, 0.2);
  group.add(headMesh);

  const earGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.5, 8);
  const earLeft = new THREE.Mesh(earGeo, rabbitMat);
  earLeft.position.set(-0.12, 1.25, 0.18);
  earLeft.rotation.z = 0.15;
  earLeft.rotation.x = -0.1;
  group.add(earLeft);

  const earRight = earLeft.clone();
  earRight.position.x = 0.12;
  earRight.rotation.z = -0.15;
  group.add(earRight);

  return group;
}

const rabbits = [];
for (let i = 0; i < 1; i++) {
  const rabbitMesh = createRabbit();
  islandGroup.add(rabbitMesh);

  rabbits.push({
    mesh: rabbitMesh,
    orbitRadius: 2.8 + Math.random() * 3.2,
    orbitSpeed: (0.12 + Math.random() * 0.15) * (i % 2 === 0 ? 1 : -1),
    phase: -1.15,
    baseY: 4.05,
    hopSpeed: 4.5 + Math.random() * 2.0,
    hopHeight: 0.15,
    scale: 0.85,
  });
  rabbits[i].mesh.scale.setScalar(rabbits[i].scale);
}

function updateRabbits(time) {
  rabbits.forEach((r) => {
    const angle = r.phase + time * r.orbitSpeed;
    const sign = Math.sign(r.orbitSpeed) || 1;

    const x = Math.cos(angle) * r.orbitRadius;
    const z = Math.sin(angle) * r.orbitRadius;
    const hop = Math.abs(Math.sin(time * r.hopSpeed)) * r.hopHeight;

    r.mesh.position.set(x, r.baseY + hop, z);

    const dx = -Math.sin(angle) * sign;
    const dz = Math.cos(angle) * sign;
    r.mesh.rotation.y = Math.atan2(dx, dz);
  });
}

// LANTERNS & MESSAGES WITH IMAGES
const lanternsGroup = new THREE.Group();
scene.add(lanternsGroup);

const lanterns = [];
const interactiveObjects = [];

const wishList = [
  {
    title: "Trung Thu vui vẻ nha bbi",
    text: "Hí lu cô gái nhỏ của anh. Trung Thu này anh không có món quà gì quá to, cũng chưa thể chạy tới bên cạnh ôm bbi một cái. Nên anh làm cho bbi một thế giới nhỏ xíu này. Mong bbi sẽ thích nó nha. Chúc cô gái của anh có một mùa Trung Thu thật vui, thật bình yên và lúc nào cũng được yêu thương thật nhiều.",
    img: "./assets/photo-1.jpg",
  },
  {
    title: "Điều anh mong nhất",
    text: "Anh mong bbi luôn vui vẻ, ăn uống đầy đủ, ngủ thật ngon và đừng vì những chuyện không vui mà làm bản thân mình mệt mỏi nha. Nếu có ngày nào bbi buồn, thì nhớ là vẫn có một người luôn thương bbi rất nhiều.",
    img: "./assets/photo-2.jpg",
  },
  {
    title: "Nếu hôm nay anh ở cạnh bbi...",
    text: "Nếu hôm nay anh ở cạnh bbi, anh sẽ mua cho bbi một cái bánh Trung Thu thật ngon. Rồi hai đứa sẽ tìm một chỗ thật yên, ngồi cạnh nhau, ngắm trăng, nói linh tinh cả tối. Có thể chẳng cần làm gì đặc biệt. Chỉ cần được ngồi cạnh bbi thôi là anh vui rồi.",
    img: "./assets/photo-4.jpg",
  },
  {
    title: "Anh nhớ bbi",
    text: "Có những lúc anh cũng nhớ bbi nhiều lắm. Nhớ những lúc được ở cạnh nhau, nhớ lúc bbi cười, nhớ những lúc bbi làm nũng, nhớ cả những điều nhỏ xíu mà bình thường anh chẳng để ý. Khoảng cách đôi khi làm anh thấy khó chịu thật. Nhưng anh vẫn muốn cố gắng, vì người anh muốn đi cùng vẫn là bbi.",
    img: "./assets/photo-5.jpg",
  },
  {
    title: "Điều anh muốn cùng bbi",
    text: "Anh không mong mọi thứ lúc nào cũng hoàn hảo. Anh chỉ mong hai đứa mình có thể cùng nhau cố gắng. Cùng trưởng thành. Cùng kiếm tiền. Cùng xây dựng cuộc sống mà hai đứa mong muốn. Rồi một ngày, Trung Thu không còn là những cuộc gọi hay những dòng tin nhắn nữa, mà là hai đứa thật sự ngồi cạnh nhau dưới ánh trăng.",
    img: "./assets/photo-6.jpg",
  },
  {
    title: "Nếu bbi đang buồn...",
    text: "Nếu lúc mở chiếc đèn này bbi đang buồn, thì lại đây anh ôm một cái nha. Anh không biết lúc nào mình cũng có thể giải quyết được mọi chuyện cho bbi. Nhưng anh muốn bbi biết rằng bbi không cần phải mạnh mẽ một mình. Có chuyện gì thì cứ từ từ. Mệt thì nghỉ. Buồn thì cứ buồn một chút. Rồi mình lại cùng nhau cố gắng tiếp nha.",
    img: "./assets/photo-1.jpg",
  },
  {
    title: "Một lời chúc cho bbi",
    text: "Anh chúc cô gái nhỏ của anh luôn khỏe mạnh, luôn bình an, luôn được yêu thương. Công việc thuận lợi, những điều bbi cố gắng đều có kết quả. Những ngày buồn sẽ ngày càng ít đi và những ngày vui sẽ ngày càng nhiều hơn. Bbi xứng đáng với những điều thật dịu dàng.",
    img: "./assets/photo-2.jpg",
  },
];

const finalWish = {
  title: "Điều anh muốn nói nhất",
  text: "Trung Thu này, anh không thể ngồi cạnh bbi dưới ánh trăng. Nhưng anh vẫn muốn dành cho bbi một điều gì đó thật riêng. Anh không biết tương lai sẽ có những chuyện gì, cũng không biết mọi thứ sẽ luôn dễ dàng như thế nào. Nhưng anh biết một điều: anh vẫn muốn cố gắng để có thể cùng bbi đi thật lâu. Để sau này, những chiếc đèn lồng này không còn là thứ anh phải làm trên một chiếc máy tính nữa, mà là hai đứa thật sự ngồi cạnh nhau, dưới một bầu trời, ngắm cùng một mặt trăng. Trung Thu vui vẻ nha cô vợ nhỏ của anh. Anh thương bbi nhiều lắm.",
  img: "./assets/photo-3.jpg",
};

const lanternMemories = window.MID_AUTUMN_MEMORIES || wishList;
const regularMemories = lanternMemories.filter((memory) => !memory.final);
const finalMemory = lanternMemories.find((memory) => memory.final) || finalWish;

function createLanternTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "#ff4d4d");
  grad.addColorStop(0.5, "#e63946");
  grad.addColorStop(1, "#ffb703");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 120, 120);
  return new THREE.CanvasTexture(canvas);
}

const lanternTex = createLanternTexture();

function createLanternMesh() {
  const group = new THREE.Group();

  const bodyGeo = new THREE.CylinderGeometry(0.6, 0.45, 1.4, 6);
  const bodyMat = new THREE.MeshStandardMaterial({
    map: lanternTex,
    emissive: 0xff7700,
    emissiveIntensity: 0.7,
    roughness: 0.3,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  const capGeo = new THREE.CylinderGeometry(0.63, 0.63, 0.1, 6);
  const capMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.5,
  });
  const capTop = new THREE.Mesh(capGeo, capMat);
  capTop.position.y = 0.7;
  group.add(capTop);

  const tagGeo = new THREE.PlaneGeometry(0.35, 0.7);
  const tagMat = new THREE.MeshBasicMaterial({
    color: 0xd90429,
    side: THREE.DoubleSide,
  });
  const tag = new THREE.Mesh(tagGeo, tagMat);
  tag.position.set(0, -1.1, 0);
  group.add(tag);

  const spriteMat = new THREE.SpriteMaterial({
    map: createParticleTexture(),
    color: 0xffaa00,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Sprite(spriteMat);
  glow.scale.set(3.2, 3.2, 1);
  group.add(glow);

  const hitGeo = new THREE.SphereGeometry(1.6, 8, 8);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  group.add(hitMesh);

  return { group, hitMesh, glow, body };
}

function addLantern(position, wishData, id, isSpecial = false) {
  const { group: lantern, hitMesh, glow, body } = createLanternMesh();
  lantern.position.copy(position);

  lantern.userData = {
    speedY: 0.004 + Math.random() * 0.006,
    swingSpeed: 0.65 + Math.random() * 0.55,
    initialX: lantern.position.x,
    initialY: lantern.position.y,
    initialZ: lantern.position.z,
    wish: wishData.text,
    title: wishData.title,
    imgUrl: wishData.img,
    id,
    isSpecial,
    isOpened: false,
    glow,
    body,
  };

  const sc = isSpecial ? 1.05 : 0.62 + Math.random() * 0.12;
  lantern.scale.set(sc, sc, sc);

  hitMesh.userData.parentLantern = lantern;

  lanternsGroup.add(lantern);
  lanterns.push(lantern);
  interactiveObjects.push(hitMesh);

  return lantern;
}

const storyLanternPositions = [
  new THREE.Vector3(-12, 7, 5),
  new THREE.Vector3(11, 11, 2),
  new THREE.Vector3(-14, 15, -9),
  new THREE.Vector3(14, 6, -8),
  new THREE.Vector3(-7, 19, -16),
  new THREE.Vector3(15, 16, -16),
  new THREE.Vector3(4, 22, -21),
];

regularMemories.forEach((wishData, index) => {
  addLantern(storyLanternPositions[index], wishData, index);
});

const specialLantern = addLantern(
  new THREE.Vector3(-2, 18, -21),
  finalMemory,
  regularMemories.length,
  true,
);
specialLantern.visible = false;
specialLantern.userData.glow.scale.set(7, 7, 1);
specialLantern.userData.glow.material.opacity = 1;
specialLantern.userData.body.material.emissiveIntensity = 2.8;

const decorativeLanternCount = isMobile ? 3 : 5;
for (let index = 0; index < decorativeLanternCount; index++) {
  const radius = 17 + Math.random() * 18;
  const angle = Math.random() * Math.PI * 2;
  const y = -2 + Math.random() * 32;
  const { group: lantern } = createLanternMesh();
  lantern.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  lantern.scale.setScalar(0.5 + Math.random() * 0.35);
  lantern.userData = {
    speedY: 0.002 + Math.random() * 0.004,
    swingSpeed: 0.4 + Math.random() * 0.5,
    initialX: lantern.position.x,
    initialY: lantern.position.y,
    initialZ: lantern.position.z,
    id: index + 20,
  };
  lanternsGroup.add(lantern);
  lanterns.push(lantern);
}

// FALLING PETALS & STARS
const fallingPetalsCount = isMobile ? 80 : 180;
const petalsGeo = new THREE.BufferGeometry();
const petalsPos = new Float32Array(fallingPetalsCount * 3);
const petalsData = [];

for (let i = 0; i < fallingPetalsCount; i++) {
  petalsPos[i * 3] = (Math.random() - 0.5) * 36;
  petalsPos[i * 3 + 1] = Math.random() * 36;
  petalsPos[i * 3 + 2] = (Math.random() - 0.5) * 36;

  petalsData.push({
    speedY: 0.02 + Math.random() * 0.03,
  });
}

petalsGeo.setAttribute("position", new THREE.BufferAttribute(petalsPos, 3));
const petalsMat = new THREE.PointsMaterial({
  size: isMobile ? 0.35 : 0.3,
  color: 0xf7d1d5,
  transparent: true,
  opacity: 0.75,
  map: createParticleTexture(),
  blending: THREE.NormalBlending,
  depthWrite: false,
});

const petalsParticles = new THREE.Points(petalsGeo, petalsMat);
scene.add(petalsParticles);

const starCount = isMobile ? 400 : 900;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  starPos[i * 3] = (Math.random() - 0.5) * 180;
  starPos[i * 3 + 1] = Math.random() * 90;
  starPos[i * 3 + 2] = (Math.random() - 0.5) * 180;
}
starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({
  color: 0xf7e8c5,
  size: 0.28,
  transparent: true,
  opacity: 0.78,
});
scene.add(new THREE.Points(starGeo, starMat));

// FIREWORKS
let fireworks = [];
function createFirework(pos) {
  const pCount = 50;
  const pGeo = new THREE.BufferGeometry();
  const pPositions = new Float32Array(pCount * 3);
  const velocities = [];

  for (let i = 0; i < pCount; i++) {
    pPositions[i * 3] = pos.x;
    pPositions[i * 3 + 1] = pos.y;
    pPositions[i * 3 + 2] = pos.z;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = 0.08 + Math.random() * 0.12;

    velocities.push(
      new THREE.Vector3(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta),
        speed * Math.cos(phi),
      ),
    );
  }

  pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.35,
    color: 0xffd700,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
  });

  const pMesh = new THREE.Points(pGeo, pMat);
  scene.add(pMesh);

  fireworks.push({ mesh: pMesh, velocities: velocities, life: 1.0 });
}

// RAYCASTER & INTERACTION
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let targetCamPos = null;
let targetCamTarget = null;
let selectedLantern = null;
let finaleActive = false;
let hoveredLantern = null;
const openedStoryLanterns = new Set();

const wishModal = document.getElementById("wishModal");
const wishTitle = document.getElementById("wishTitle");
const wishText = document.getElementById("wishText");
const wishImage = document.getElementById("wishImage");
const closeWishBtn = document.getElementById("closeWishBtn");
const storyIntro = document.getElementById("storyIntro");
const exploreStatus = document.getElementById("exploreStatus");
const exploreFill = document.getElementById("exploreFill");
const finale = document.getElementById("finale");
const moonHint = document.getElementById("moonHint");
const moonRitual = document.getElementById("moonRitual");
const moonRitualText = document.getElementById("moonRitualText");
const moonResetBtn = document.getElementById("moonResetBtn");
const passwordGate = document.getElementById("passwordGate");
const passwordForm = document.getElementById("passwordForm");
const passwordInput = document.getElementById("passwordInput");
const passwordFeedback = document.getElementById("passwordFeedback");
const passwordHint = document.getElementById("passwordHint");
let passwordAttempts = 0;
let worldUnlocked = false;

class FinalMoonSequenceController {
  constructor() {
    this.moonClickCount = 0;
    this.floatingLanternCount = 0;
    this.heartSequenceStarted = false;
    this.heartFormationComplete = false;
    this.finalMessageVisible = false;
    this.endingComplete = false;
    this.experienceReset = false;
    this.requiredClicks = 8;
    this.spawnPlan = [3, 3, 3, 3, 3, 3, 3, 3];
    this.secretLanterns = [];
    this.group = new THREE.Group();
    this.sequenceElapsed = 0;
    this.messageElapsed = 0;
    this.messageIndex = -1;
    this.hintShown = false;
    this.messages = [
      "Anh không biết sau này...",
      "...chúng mình sẽ đi cùng nhau được bao xa.",
      "Anh cũng không biết tương lai sẽ có những ngày vui hay những ngày mệt mỏi.",
      "Nhưng có một điều anh chắc chắn...",
      "Anh vẫn muốn là người được ở bên cạnh bbi.",
      "Muốn cùng bbi đi qua những ngày bình thường nhất.",
      "Cùng nhau ăn những món ngon... cùng nhau đi thật nhiều nơi... cùng nhau có một căn nhà nhỏ... và cùng nhau già đi.",
      "Anh yêu em nhiều lắm ❤️",
    ];
    scene.add(this.group);
  }

  showHint() {
    if (this.hintShown || this.endingComplete) return;
    this.hintShown = true;
    moonHint.classList.add("is-visible");
  }

  heartPoint(index, total) {
    const angle = (index / total) * Math.PI * 2;
    const x = 5.8 * Math.pow(Math.sin(angle), 3);
    const y =
      4.15 * Math.cos(angle) -
      1.55 * Math.cos(2 * angle) -
      0.68 * Math.cos(3 * angle) -
      0.32 * Math.cos(4 * angle);
    const depthLayer = (index % 3 - 1) * 1.25 + Math.sin(angle * 2) * 0.7;
    return new THREE.Vector3(
      moonPosition.x + x,
      moonPosition.y + y + 0.2,
      moonPosition.z + 5.8 + depthLayer,
    );
  }

  spawnLanterns(count) {
    for (let index = 0; index < count; index++) {
      const { group, glow, body } = createLanternMesh();
      const angle = Math.random() * Math.PI * 2;
      const start = new THREE.Vector3(
        Math.cos(angle) * (6 + Math.random() * 4),
        4 + Math.random() * 3,
        Math.sin(angle) * (6 + Math.random() * 4),
      );
      group.position.copy(start);
      group.scale.setScalar(0.02);
      glow.material.opacity = 0.25;
      body.material.emissiveIntensity = 1.1;
      this.group.add(group);
      this.secretLanterns.push({
        group,
        glow,
        body,
        start,
        riseTarget: new THREE.Vector3(
          (Math.random() - 0.5) * 24,
          12 + Math.random() * 14,
          -8 + (Math.random() - 0.5) * 18,
        ),
        heartTarget: null,
        driftPhase: Math.random() * Math.PI * 2,
        spawnAge: 0,
      });
    }
    this.floatingLanternCount += count;
  }

  clickMoon() {
    if (!finaleActive || this.heartSequenceStarted) return;
    this.moonClickCount += 1;
    moonMesh.scale.setScalar(1.08 + Math.min(this.moonClickCount, 8) * 0.012);
    moonGlow.scale.setScalar(13 + this.moonClickCount * 0.32);
    createFirework(moonPosition);
    this.spawnLanterns(this.spawnPlan[this.moonClickCount - 1] || 0);

    if (this.moonClickCount === 1) moonHint.textContent = "Có một điều anh vẫn chưa nói hết...";
    if (this.moonClickCount === 3) moonHint.textContent = "Thêm một chút nữa nhé...";
    if (this.moonClickCount === 6) moonHint.textContent = "Anh nghĩ bbi sắp nhìn thấy rồi đó...";
    moonHint.classList.add("is-visible");

    if (this.moonClickCount >= this.requiredClicks) this.startHeartFormation();
  }

  startHeartFormation() {
    if (this.heartSequenceStarted) return;
    this.heartSequenceStarted = true;
    this.sequenceElapsed = 0;
    controls.enabled = false;
    moonHint.classList.remove("is-visible");
    document.body.classList.add("moon-ending");
    finale.classList.remove("is-visible");
    this.secretLanterns.forEach((lantern, index) => {
      lantern.heartTarget = this.heartPoint(index, this.secretLanterns.length);
    });
    targetCamPos = new THREE.Vector3(0, 13.5, 37);
    targetCamTarget = new THREE.Vector3(0, 8.5, -4);
  }

  completeHeart() {
    if (this.heartFormationComplete) return;
    this.heartFormationComplete = true;
    this.finalMessageVisible = true;
    this.messageElapsed = 0;
    this.messageIndex = -1;
    moonGlow.scale.setScalar(17);
    moonRitual.classList.add("is-visible");
  }

  update(delta, time) {
    this.secretLanterns.forEach((lantern, index) => {
      lantern.spawnAge += delta;
      const scale = Math.min(1, lantern.spawnAge * 1.7) * 0.72;
      lantern.group.scale.setScalar(scale);
      lantern.group.rotation.y += delta * 0.35;
      const target = this.heartSequenceStarted
        ? lantern.heartTarget.clone().add(new THREE.Vector3(
          Math.sin(time * 0.75 + lantern.driftPhase) * 0.14,
          Math.sin(time * 1.35 + lantern.driftPhase) * 0.22,
          Math.cos(time * 0.9 + lantern.driftPhase) * 0.16,
        ))
        : lantern.riseTarget;
      const easing = this.heartSequenceStarted ? 0.028 : 0.018;
      lantern.group.position.lerp(target, easing);
      lantern.group.rotation.z = Math.sin(time * 0.85 + lantern.driftPhase) * 0.1;
      lantern.glow.material.opacity = this.heartSequenceStarted ? 0.92 : 0.55;
      lantern.glow.scale.setScalar(this.heartSequenceStarted ? 4.1 : 2.8);
      lantern.body.material.emissiveIntensity = this.heartSequenceStarted ? 1.7 : 1.05;
    });

    if (this.heartSequenceStarted && !this.heartFormationComplete) {
      this.sequenceElapsed += delta;
      if (this.sequenceElapsed > 4.8) this.completeHeart();
    }

    if (this.finalMessageVisible && !this.endingComplete) {
      this.messageElapsed += delta;
      const nextIndex = Math.floor(this.messageElapsed / 2.5);
      if (nextIndex !== this.messageIndex && nextIndex < this.messages.length) {
        this.messageIndex = nextIndex;
        moonRitualText.textContent = this.messages[nextIndex];
      }
      if (this.messageElapsed > this.messages.length * 2.5 + 1) {
        this.endingComplete = true;
        moonRitualText.textContent = this.messages[this.messages.length - 1];
        moonRitual.classList.add("is-complete");
      }
    }
  }

  reset() {
    this.secretLanterns.forEach((lantern) => this.group.remove(lantern.group));
    this.secretLanterns = [];
    this.moonClickCount = 0;
    this.floatingLanternCount = 0;
    this.heartSequenceStarted = false;
    this.heartFormationComplete = false;
    this.finalMessageVisible = false;
    this.endingComplete = false;
    this.experienceReset = true;
    this.sequenceElapsed = 0;
    this.messageElapsed = 0;
    this.messageIndex = -1;
    this.hintShown = false;
    moonMesh.scale.setScalar(1);
    moonGlow.scale.setScalar(13);
    moonHint.classList.remove("is-visible");
    moonRitual.classList.remove("is-visible", "is-complete");
    moonRitualText.textContent = "";
    document.body.classList.remove("moon-ending");
  }
}

const finalMoonSequence = new FinalMoonSequenceController();

function updateExploreStatus() {
  const openedCount = openedStoryLanterns.size;
  exploreStatus.textContent = `${openedCount} / ${regularMemories.length + 1} điều anh muốn kể`;
  exploreFill.style.width = `${(openedCount / (regularMemories.length + 1)) * 100}%`;
}

function unlockFinalLantern() {
  specialLantern.visible = true;
  specialLantern.userData.initialY = specialLantern.position.y;
  exploreStatus.textContent = `${regularMemories.length} / ${regularMemories.length + 1} điều anh muốn kể`;
  exploreFill.style.width = `${(regularMemories.length / (regularMemories.length + 1)) * 100}%`;
  document.querySelector(".click-hint").textContent = "Tìm chiếc đèn đang sáng rực nhất nhé";
  createFirework(specialLantern.position);
}

function beginFinale() {
  if (finaleActive) return;
  finaleActive = true;
  finale.classList.add("is-visible");
  document.querySelector(".click-hint").textContent = "Cảm ơn bbi đã đi hết thế giới nhỏ này";
  exploreStatus.textContent = `${regularMemories.length + 1} / ${regularMemories.length + 1} điều anh muốn kể`;
  exploreFill.style.width = "100%";
  moonGlow.material.opacity = 1;
  moonMesh.scale.setScalar(1.08);

  targetCamPos = DEFAULT_CAM_POS.clone();
  targetCamTarget = DEFAULT_CAM_TARGET.clone();
  setTimeout(() => finalMoonSequence.showHint(), 3000);
}

let pointerDownPos = { x: 0, y: 0 };

function onPointerDown(event) {
  pointerDownPos.x =
    event.clientX || (event.touches && event.touches[0].clientX) || 0;
  pointerDownPos.y =
    event.clientY || (event.touches && event.touches[0].clientY) || 0;
}

function onPointerUp(event) {
  if (!worldUnlocked) return;
  if (event.target.closest(".top-bar") || event.target.closest(".wish-modal"))
    return;

  const clientX =
    event.clientX ||
    (event.changedTouches && event.changedTouches[0].clientX) ||
    0;
  const clientY =
    event.clientY ||
    (event.changedTouches && event.changedTouches[0].clientY) ||
    0;

  const distMoved = Math.hypot(
    clientX - pointerDownPos.x,
    clientY - pointerDownPos.y,
  );
  if (distMoved > 8) return;

  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const moonHit = raycaster.intersectObject(moonHitMesh, false);
  if (finaleActive && moonHit.length > 0) {
    finalMoonSequence.clickMoon();
    return;
  }
  const intersects = raycaster.intersectObjects(interactiveObjects, false);

  if (intersects.length > 0) {
    const hitMesh = intersects[0].object;
    selectedLantern = hitMesh.userData.parentLantern || hitMesh.parent;
    if (!selectedLantern.visible) return;
    const lPos = selectedLantern.position;

    createFirework(lPos);

    const offset = new THREE.Vector3()
      .subVectors(camera.position, lPos)
      .normalize()
      .multiplyScalar(5.5);
    targetCamPos = new THREE.Vector3().addVectors(lPos, offset);
    targetCamTarget = lPos.clone();

    wishTitle.textContent = selectedLantern.userData.title;
    wishText.textContent = selectedLantern.userData.wish;
    wishImage.src = selectedLantern.userData.imgUrl;

    if (!selectedLantern.userData.isSpecial) {
      openedStoryLanterns.add(selectedLantern.userData.id);
      selectedLantern.userData.isOpened = true;
      selectedLantern.userData.skyTarget = new THREE.Vector3(
        (Math.random() - 0.5) * 22,
        10 + Math.random() * 15,
        -6 + (Math.random() - 0.5) * 18,
      );
      updateExploreStatus();
      if (openedStoryLanterns.size === regularMemories.length && !specialLantern.visible) {
        unlockFinalLantern();
      }
    } else {
      beginFinale();
    }

    setTimeout(() => {
      wishModal.classList.add("active");
    }, 300);
  }
}

window.addEventListener("pointerdown", onPointerDown, { passive: true });
window.addEventListener("pointerup", onPointerUp, { passive: true });

window.addEventListener("pointermove", (event) => {
  if (!worldUnlocked) return;
  if (event.target.closest(".top-bar") || event.target.closest(".wish-modal")) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const moonIsHovered = finaleActive && raycaster.intersectObject(moonHitMesh, false).length > 0;
  if (moonIsHovered) {
    renderer.domElement.style.cursor = "pointer";
    moonGlow.material.opacity = 0.95;
    return;
  }
  moonGlow.material.opacity = finaleActive ? 0.72 : 1;
  const hit = raycaster
    .intersectObjects(interactiveObjects, false)
    .find((item) => item.object.userData.parentLantern.visible);
  const nextHoveredLantern = hit && hit.object.userData.parentLantern;

  if (hoveredLantern && hoveredLantern !== nextHoveredLantern) {
    hoveredLantern.userData.glow.scale.set(3.2, 3.2, 1);
    hoveredLantern.userData.glow.material.opacity = 0.7;
  }
  if (nextHoveredLantern && nextHoveredLantern !== hoveredLantern) {
    nextHoveredLantern.userData.glow.scale.set(4.2, 4.2, 1);
    nextHoveredLantern.userData.glow.material.opacity = 1;
  }
  hoveredLantern = nextHoveredLantern || null;
  renderer.domElement.style.cursor = hit ? "pointer" : "grab";
});

moonResetBtn.addEventListener("click", () => {
  finalMoonSequence.reset();
  finaleActive = false;
  finale.classList.remove("is-visible");
  openedStoryLanterns.clear();
  lanterns.forEach((lantern) => {
    if (lantern.userData.isSpecial) lantern.visible = false;
    if (lantern.userData.initialX !== undefined) {
      lantern.position.set(lantern.userData.initialX, lantern.userData.initialY, lantern.userData.initialZ);
    }
    lantern.userData.isOpened = false;
    delete lantern.userData.skyTarget;
  });
  specialLantern.visible = false;
  worldUnlocked = false;
  controls.enabled = false;
  passwordAttempts = 0;
  passwordInput.value = "";
  passwordInput.disabled = false;
  passwordForm.querySelector("button").disabled = false;
  passwordFeedback.textContent = "";
  passwordGate.classList.remove("is-unlocked");
  wishModal.classList.remove("active");
  storyIntro.classList.add("is-hidden");
  document.querySelector(".click-hint").textContent = "Chạm vào lồng đèn nhé";
  updateExploreStatus();
  resetCamera();
});

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = passwordInput.value.replace(/\D/g, "");
  if (password === "17042026") {
    passwordFeedback.textContent = "Đúng rồi... Ngày mà hai đứa mình bắt đầu câu chuyện này.";
    passwordInput.disabled = true;
    passwordForm.querySelector("button").disabled = true;
    setTimeout(() => {
      worldUnlocked = true;
      controls.enabled = true;
      passwordGate.classList.add("is-unlocked");
      storyIntro.classList.remove("is-hidden");
      storyIntro.querySelector("p").textContent = "Chào mừng bbi đến với nơi nhỏ anh làm cho bbi.";
      storyIntro.querySelector("span").textContent = "Xoay quanh một chút nhé...";
      setTimeout(() => storyIntro.classList.add("is-hidden"), 4200);
    }, 1200);
    return;
  }

  passwordAttempts += 1;
  passwordFeedback.textContent = passwordAttempts === 1
    ? "Gần đúng rồi đó..."
    : passwordAttempts === 2
      ? "Anh nghĩ bbi đang nhớ nhầm mất một chút rồi."
      : "Thôi được rồi, anh cho bbi một gợi ý... Ngày đó có một con số 17.";
  passwordInput.select();
});

function resetCamera() {
  targetCamPos = DEFAULT_CAM_POS.clone();
  targetCamTarget = DEFAULT_CAM_TARGET.clone();
  selectedLantern = null;
}

function closeWishCard(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  wishModal.classList.remove("active");
  resetCamera();
}

closeWishBtn.addEventListener("click", closeWishCard);
closeWishBtn.addEventListener("touchend", closeWishCard);

wishModal.addEventListener("click", (e) => {
  if (e.target === wishModal) closeWishCard(e);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeWishCard();
});

// AUDIO
const bgm = document.getElementById("bgm");
const audioBtn = document.getElementById("audio-btn");
const resetCamBtn = document.getElementById("reset-cam-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");
let isPlaying = false;

audioBtn.addEventListener("click", () => {
  if (isPlaying) {
    bgm.pause();
    audioBtn.innerHTML = '<i class="fas fa-music" style="opacity:0.5;"></i>';
  } else {
    bgm
      .play()
      .then(() => {
        audioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
      })
      .catch(() => {});
  }
  isPlaying = !isPlaying;
});

resetCamBtn.addEventListener("click", resetCamera);

fullscreenBtn.addEventListener("click", async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }
  await document.documentElement.requestFullscreen();
});

// ANIMATION
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  lanterns.forEach((lantern) => {
    lantern.position.x =
      lantern.userData.initialX +
      Math.sin(time * lantern.userData.swingSpeed + lantern.userData.id) * 0.4;
    lantern.position.z =
      lantern.userData.initialZ +
      Math.cos(time * lantern.userData.swingSpeed + lantern.userData.id) * 0.4;
    lantern.position.y =
      lantern.userData.initialY +
      Math.sin(time * lantern.userData.swingSpeed + lantern.userData.id) * 0.22;
    lantern.rotation.y += 0.003;

    if (lantern.userData.skyTarget && !finaleActive) {
      lantern.position.lerp(lantern.userData.skyTarget, 0.012);
      lantern.rotation.z = Math.sin(time * 0.8 + lantern.userData.id) * 0.08;
    }

    if (lantern.userData.isSpecial && lantern.visible) {
      const glowScale = 7 + Math.sin(time * 3.5) * 1.1;
      lantern.userData.glow.scale.set(glowScale, glowScale, 1);
      lantern.userData.glow.material.opacity = 0.82 + Math.sin(time * 3.5) * 0.18;
    }

  });

  finalMoonSequence.update(delta, time);

  const pPos = petalsGeo.attributes.position.array;
  for (let i = 0; i < fallingPetalsCount; i++) {
    pPos[i * 3 + 1] -= petalsData[i].speedY;
    pPos[i * 3] += Math.sin(time + i) * 0.01;
    pPos[i * 3 + 2] += Math.cos(time + i) * 0.01;

    if (pPos[i * 3 + 1] < -3) {
      pPos[i * 3 + 1] = 30;
      pPos[i * 3] = (Math.random() - 0.5) * 36;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
  }
  petalsGeo.attributes.position.needsUpdate = true;

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const fw = fireworks[i];
    fw.life -= delta * 1.2;
    const posArr = fw.mesh.geometry.attributes.position.array;

    for (let j = 0; j < fw.velocities.length; j++) {
      posArr[j * 3] += fw.velocities[j].x;
      posArr[j * 3 + 1] += fw.velocities[j].y;
      posArr[j * 3 + 2] += fw.velocities[j].z;
    }
    fw.mesh.geometry.attributes.position.needsUpdate = true;
    fw.mesh.material.opacity = fw.life;

    if (fw.life <= 0) {
      scene.remove(fw.mesh);
      fireworks.splice(i, 1);
    }
  }

  islandGroup.rotation.y = Math.sin(time * 0.15) * 0.05;

  updateRabbits(time);
  coupleGroup.position.y = 4.18 + Math.sin(time * 1.6) * 0.025;
  treeGroup.rotation.z = Math.sin(time * 0.35) * 0.012;

  if (targetCamPos && targetCamTarget) {
    camera.position.lerp(targetCamPos, 0.04);
    controls.target.lerp(targetCamTarget, 0.04);

    if (camera.position.distanceTo(targetCamPos) < 0.1) {
      targetCamPos = null;
      targetCamTarget = null;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

updateExploreStatus();
setTimeout(() => storyIntro.classList.add("is-hidden"), 5200);
animate();

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.fov = width < 768 ? 60 : 45;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, width < 768 ? 1.5 : 2),
  );
});
