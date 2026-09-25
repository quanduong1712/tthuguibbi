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
  ? new THREE.Vector3(0, 12, 45)
  : new THREE.Vector3(0, 10, 40);
const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 6.0, 0);

camera.position.copy(DEFAULT_CAM_POS);

const renderer = new THREE.WebGLRenderer({
  antialias: !isMobile,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 + 0.05;
controls.minDistance = 8;
controls.maxDistance = 85;
controls.target.copy(DEFAULT_CAM_TARGET);

// LIGHTS
const ambientLight = new THREE.AmbientLight(0x30264d, 1.25);
scene.add(ambientLight);

const treeLight = new THREE.PointLight(0xffb6c1, 2.5, 45);
treeLight.position.set(0, 8, 0);
scene.add(treeLight);

const warmLight = new THREE.PointLight(0xffaa33, 2.0, 30);
warmLight.position.set(0, -2, 0);
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

const moonPosition = new THREE.Vector3(-15, 20, -30);
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
moonGlow.scale.set(18, 18, 1);
scene.add(moonGlow);

const moonMesh = new THREE.Mesh(
  new THREE.SphereGeometry(5.3, isMobile ? 32 : 48, isMobile ? 20 : 32),
  new THREE.MeshBasicMaterial({ map: createMoonTexture() }),
);
moonMesh.position.copy(moonPosition);
scene.add(moonMesh);

const moonLight = new THREE.PointLight(0xcbd8ff, 1.5, 70);
moonLight.position.copy(moonPosition);
scene.add(moonLight);

// ISLAND
const islandGroup = new THREE.Group();
scene.add(islandGroup);

const islandGeo = new THREE.CylinderGeometry(
  8.5,
  2.2,
  7.5,
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
  color: 0x3d231b,
  roughness: 0.85,
  flatShading: true,
});
const islandMesh = new THREE.Mesh(islandGeo, islandMat);
islandGroup.add(islandMesh);

const topGeo = new THREE.CylinderGeometry(8.6, 7.8, 0.8, isMobile ? 32 : 48, 4);
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
  color: 0x22130e,
  roughness: 0.9,
  flatShading: true,
});
const topMesh = new THREE.Mesh(topGeo, topMat);
topMesh.position.y = 3.6;
islandGroup.add(topMesh);

// BỆ MẶT ĐÁ NHỎ & ĐÁ TẢNG RẢI RÁC ÍT HƠN
const stoneMat = new THREE.MeshStandardMaterial({
  color: 0x4a4d52,
  roughness: 0.85,
  metalness: 0.1,
  flatShading: true,
});

// 1. Bệ đá nhỏ dẹt ẩn nhẹ dưới gốc cây
const mainStonePlatformGeo = new THREE.CylinderGeometry(2.5, 3.0, 0.15, 6);
const mainStonePlatform = new THREE.Mesh(mainStonePlatformGeo, stoneMat);
mainStonePlatform.position.set(0, 3.9, 0);
islandGroup.add(mainStonePlatform);

// 2. Chỉ 3 viên đá nhỏ điểm xuyết trên mặt đất
const rockCount = 3;
for (let i = 0; i < rockCount; i++) {
  const rockGeo = new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.25, 0);
  const rockMesh = new THREE.Mesh(rockGeo, stoneMat);

  const angle = (i / rockCount) * Math.PI * 2 + 0.5;
  const dist = 3.8 + Math.random() * 2.0;

  rockMesh.position.set(Math.cos(angle) * dist, 3.9, Math.sin(angle) * dist);
  rockMesh.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  );
  islandGroup.add(rockMesh);
}

// TREE TRUNK & BRANCHES
const treeGroup = new THREE.Group();
treeGroup.position.set(0, 4.0, 0);
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

// HỆ THỐNG TÁN LÁ
const particleCount = isMobile ? 22000 : 38000;
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

// TWO PEOPLE UNDER THE TREE
function createCouple() {
  const couple = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xf2c6a8,
    roughness: 0.75,
  });
  const boyMat = new THREE.MeshStandardMaterial({
    color: 0x3c5377,
    roughness: 0.8,
  });
  const girlMat = new THREE.MeshStandardMaterial({
    color: 0xc8758d,
    roughness: 0.8,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x21151c,
    roughness: 0.9,
  });

  const addMesh = (geometry, material, position, scale) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    if (scale) mesh.scale.copy(scale);
    couple.add(mesh);
    return mesh;
  };

  const bodyGeo = new THREE.SphereGeometry(0.52, 14, 12);
  const headGeo = new THREE.SphereGeometry(0.34, 14, 12);
  const armGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.05, 10);
  const legGeo = new THREE.CylinderGeometry(0.14, 0.17, 0.88, 10);

  addMesh(bodyGeo, boyMat, new THREE.Vector3(0.28, 0.56, 0), new THREE.Vector3(0.9, 1.15, 0.72));
  addMesh(headGeo, skinMat, new THREE.Vector3(0.28, 1.36, 0.06));
  addMesh(new THREE.SphereGeometry(0.36, 14, 10), hairMat, new THREE.Vector3(0.28, 1.52, -0.02), new THREE.Vector3(1.02, 0.75, 1));

  addMesh(bodyGeo, girlMat, new THREE.Vector3(-0.38, 0.5, 0.14), new THREE.Vector3(0.82, 1.04, 0.7));
  addMesh(headGeo, skinMat, new THREE.Vector3(-0.36, 1.25, 0.12));
  addMesh(new THREE.SphereGeometry(0.39, 14, 10), hairMat, new THREE.Vector3(-0.42, 1.4, 0.03), new THREE.Vector3(1.1, 1.08, 1.05));
  addMesh(new THREE.SphereGeometry(0.16, 10, 8), hairMat, new THREE.Vector3(-0.66, 1.1, 0.06), new THREE.Vector3(0.85, 1.6, 0.8));

  const boyLeg = addMesh(legGeo, boyMat, new THREE.Vector3(0.48, 0.08, 0.32));
  boyLeg.rotation.x = Math.PI / 2.5;
  const girlLeg = addMesh(legGeo, girlMat, new THREE.Vector3(-0.48, 0.08, 0.36));
  girlLeg.rotation.x = Math.PI / 2.35;
  addMesh(new THREE.SphereGeometry(0.16, 10, 8), hairMat, new THREE.Vector3(0.76, -0.02, 0.68), new THREE.Vector3(1.35, 0.6, 1));
  addMesh(new THREE.SphereGeometry(0.16, 10, 8), hairMat, new THREE.Vector3(-0.72, -0.02, 0.72), new THREE.Vector3(1.35, 0.6, 1));

  const pointingArm = addMesh(armGeo, boyMat, new THREE.Vector3(0.8, 1.24, 0.04));
  pointingArm.rotation.z = -1.05;
  pointingArm.rotation.x = -0.3;

  const holdingArm = addMesh(armGeo, boyMat, new THREE.Vector3(-0.05, 0.93, 0.33));
  holdingArm.rotation.z = 0.92;
  holdingArm.rotation.x = 0.3;

  const hugArm = addMesh(armGeo, girlMat, new THREE.Vector3(-0.03, 1.05, 0.36));
  hugArm.rotation.z = 1.1;
  hugArm.rotation.x = 0.45;

  couple.position.set(0, 4.18, 1.28);
  couple.rotation.y = Math.atan2(moonPosition.x - couple.position.x, moonPosition.z - couple.position.z);
  couple.scale.setScalar(1.35);
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
for (let i = 0; i < 4; i++) {
  const rabbitMesh = createRabbit();
  islandGroup.add(rabbitMesh);

  rabbits.push({
    mesh: rabbitMesh,
    orbitRadius: 2.8 + Math.random() * 3.2,
    orbitSpeed: (0.12 + Math.random() * 0.15) * (i % 2 === 0 ? 1 : -1),
    phase: (i / 4) * Math.PI * 2,
    baseY: 4.05,
    hopSpeed: 4.5 + Math.random() * 2.0,
    hopHeight: 0.15,
    scale: 0.75 + Math.random() * 0.25,
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

  const sc = isSpecial ? 1.35 : 0.95 + Math.random() * 0.2;
  lantern.scale.set(sc, sc, sc);

  hitMesh.userData.parentLantern = lantern;

  lanternsGroup.add(lantern);
  lanterns.push(lantern);
  interactiveObjects.push(hitMesh);

  return lantern;
}

const storyLanternPositions = [
  new THREE.Vector3(-10, 7, 4),
  new THREE.Vector3(9, 11, 3),
  new THREE.Vector3(-13, 17, -5),
  new THREE.Vector3(13, 5, -7),
  new THREE.Vector3(-5, 22, -13),
  new THREE.Vector3(16, 18, -15),
  new THREE.Vector3(2, 26, -20),
];

wishList.forEach((wishData, index) => {
  addLantern(storyLanternPositions[index], wishData, index);
});

const specialLantern = addLantern(
  new THREE.Vector3(0, 21, -22),
  finalWish,
  wishList.length,
  true,
);
specialLantern.visible = false;
specialLantern.userData.glow.scale.set(7, 7, 1);
specialLantern.userData.glow.material.opacity = 1;
specialLantern.userData.body.material.emissiveIntensity = 2.8;

const decorativeLanternCount = isMobile ? 12 : 22;
for (let index = 0; index < decorativeLanternCount; index++) {
  const radius = 12 + Math.random() * 25;
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
  color: 0xffffff,
  size: 0.4,
  transparent: true,
  opacity: 0.7,
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

function updateExploreStatus() {
  const openedCount = openedStoryLanterns.size;
  exploreStatus.textContent = `${openedCount} / ${wishList.length} điều anh muốn kể`;
  exploreFill.style.width = `${(openedCount / wishList.length) * 100}%`;
}

function unlockFinalLantern() {
  specialLantern.visible = true;
  specialLantern.userData.initialY = specialLantern.position.y;
  exploreStatus.textContent = "Chiếc đèn cuối đã sáng lên gần mặt trăng";
  exploreFill.style.width = "100%";
  document.querySelector(".click-hint").textContent = "Tìm chiếc đèn đang sáng rực nhất nhé";
  createFirework(specialLantern.position);
}

function beginFinale() {
  if (finaleActive) return;
  finaleActive = true;
  finale.classList.add("is-visible");
  document.querySelector(".click-hint").textContent = "Cảm ơn bbi đã đi hết thế giới nhỏ này";
  exploreStatus.textContent = "Đêm Trung Thu của hai đứa";
  moonGlow.material.opacity = 1;
  moonMesh.scale.setScalar(1.08);

  targetCamPos = new THREE.Vector3(0, 16, 34);
  targetCamTarget = moonPosition.clone();

  setTimeout(() => {
    targetCamPos = DEFAULT_CAM_POS.clone();
    targetCamTarget = new THREE.Vector3(0, 5.5, 1);
  }, 5500);
}

let pointerDownPos = { x: 0, y: 0 };

function onPointerDown(event) {
  pointerDownPos.x =
    event.clientX || (event.touches && event.touches[0].clientX) || 0;
  pointerDownPos.y =
    event.clientY || (event.touches && event.touches[0].clientY) || 0;
}

function onPointerUp(event) {
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
      updateExploreStatus();
      if (openedStoryLanterns.size === wishList.length && !specialLantern.visible) {
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
  if (event.target.closest(".top-bar") || event.target.closest(".wish-modal")) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
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

    if (lantern.userData.isSpecial && lantern.visible) {
      const glowScale = 7 + Math.sin(time * 3.5) * 1.1;
      lantern.userData.glow.scale.set(glowScale, glowScale, 1);
      lantern.userData.glow.material.opacity = 0.82 + Math.sin(time * 3.5) * 0.18;
    }

    if (finaleActive && lantern.visible) {
      const heartIndex = lantern.userData.id % 16;
      const heartAngle = (heartIndex / 16) * Math.PI * 2;
      const heartX = 4.8 * Math.pow(Math.sin(heartAngle), 3);
      const heartY =
        3.8 * Math.cos(heartAngle) -
        1.4 * Math.cos(2 * heartAngle) -
        0.6 * Math.cos(3 * heartAngle) -
        0.3 * Math.cos(4 * heartAngle);
      lantern.position.lerp(
        new THREE.Vector3(moonPosition.x + heartX, moonPosition.y + heartY, moonPosition.z + 3),
        0.004,
      );
    }
  });

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
