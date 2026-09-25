(function () {
  const palette = {
    soil: 0x4a352b,
    rock: 0x344047,
    grass: 0x294637,
    grassLight: 0x587352,
    leaf: 0x304838,
    leafLight: 0x63734f,
    blossom: 0xd9a5b6,
    cream: 0xf7e8c5,
    trunk: 0x4b2f24,
    branch: 0x5c3a2a,
    lantern: 0xffa94d,
  };

  class AssetManager {
    constructor() {
      this.materials = {};
    }

    material(name, color, options) {
      if (!this.materials[name]) {
        this.materials[name] = new THREE.MeshStandardMaterial(Object.assign({
          color,
          roughness: 0.82,
          flatShading: true,
        }, options));
      }
      return this.materials[name];
    }
  }

  function makeOrganicIsland(assetManager) {
    const group = new THREE.Group();
    const sides = 32;
    const radii = [];
    for (let index = 0; index < sides; index++) {
      const angle = (index / sides) * Math.PI * 2;
      radii.push(10.4 + Math.sin(angle * 3) * 0.9 + Math.cos(angle * 5) * 0.45);
    }

    const positions = [];
    const indices = [];
    const topY = 3.5;
    const midY = 1.8;
    const bottomY = -2.4;
    for (let ring = 0; ring < 3; ring++) {
      const scale = ring === 0 ? 1 : ring === 1 ? 0.78 : 0.28;
      const y = ring === 0 ? topY : ring === 1 ? midY : bottomY;
      for (let index = 0; index < sides; index++) {
        const angle = (index / sides) * Math.PI * 2;
        const radius = radii[index] * scale;
        positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      }
    }
    positions.push(0, topY + 0.08, 0);
    const topCenter = positions.length / 3 - 1;
    positions.push(0, bottomY - 0.15, 0);
    const bottomCenter = positions.length / 3 - 1;

    for (let ring = 0; ring < 2; ring++) {
      for (let index = 0; index < sides; index++) {
        const next = (index + 1) % sides;
        const a = ring * sides + index;
        const b = ring * sides + next;
        const c = (ring + 1) * sides + index;
        const d = (ring + 1) * sides + next;
        indices.push(a, c, b, b, c, d);
      }
    }
    for (let index = 0; index < sides; index++) {
      const next = (index + 1) % sides;
      indices.push(topCenter, index, next);
      indices.push(bottomCenter, sides * 2 + next, sides * 2 + index);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const island = new THREE.Mesh(geometry, assetManager.material('island-rock', palette.rock, { roughness: 0.92 }));
    group.add(island);

    const gardenShape = new THREE.Shape();
    radii.forEach((radius, index) => {
      const angle = (index / sides) * Math.PI * 2;
      const x = Math.cos(angle) * (radius - 0.35);
      const y = Math.sin(angle) * (radius - 0.85);
      if (index === 0) gardenShape.moveTo(x, y);
      else gardenShape.lineTo(x, y);
    });
    gardenShape.closePath();
    const garden = new THREE.Mesh(
      new THREE.ExtrudeGeometry(gardenShape, {
        depth: 0.52,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.18,
        bevelThickness: 0.12,
        curveSegments: 2,
      }),
      assetManager.material('garden', palette.grass, { roughness: 0.95 }),
    );
    garden.rotation.x = -Math.PI / 2;
    garden.position.y = topY + 0.3;
    group.add(garden);

    return { group, groundY: topY + 0.4 };
  }

  function makeTree(assetManager, groundY) {
    const group = new THREE.Group();
    const trunkMaterial = assetManager.material('trunk', palette.trunk, { flatShading: false, roughness: 0.95 });
    const branchMaterial = assetManager.material('branch', palette.branch, { flatShading: false, roughness: 0.95 });
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.5, groundY, -1.4),
      new THREE.Vector3(-2.0, groundY + 2.1, -1.25),
      new THREE.Vector3(-1.25, groundY + 4.8, -1.35),
      new THREE.Vector3(-2.15, groundY + 7.25, -1.25),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 44, 0.56, 10, false), trunkMaterial));

    const branchData = [
      [[-1.75, 2.4], [-4.15, 4.25], [-5.5, 4.55]],
      [[-1.48, 3.6], [0.5, 5.3], [3.4, 5.35]],
      [[-1.6, 4.7], [-3.65, 6.2], [-5.1, 6.7]],
      [[-1.7, 5.65], [0.6, 7.0], [2.3, 7.2]],
      [[-1.95, 6.35], [-3.9, 7.75], [-5.2, 7.9]],
    ];
    branchData.forEach((branch, index) => {
      const points = branch.map(([x, y]) => new THREE.Vector3(x, groundY + y, -1.25 + index * 0.12));
      group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 18, 0.25 - index * 0.015, 8, false), branchMaterial));
    });

    const leafMaterials = [
      assetManager.material('leaf', palette.leaf),
      assetManager.material('leaf-light', palette.leafLight),
    ];
    const canopy = [
      [-5.0, 6.15, 2.35, 0.82], [-2.45, 7.55, 2.7, 0.98], [-0.05, 7.95, 2.8, 1.0],
      [2.65, 6.8, 2.45, 0.86], [4.65, 5.9, 1.65, 0.65], [-2.8, 5.55, 2.35, 0.78],
      [0.35, 5.9, 2.6, 0.84],
    ];
    canopy.forEach(([x, y, width, height], index) => {
      const leafCluster = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), leafMaterials[index % leafMaterials.length]);
      leafCluster.position.set(x, groundY + y, -1.15 + (index % 3 - 1) * 0.52);
      leafCluster.scale.set(width, height + 0.38, 1.35);
      leafCluster.rotation.set(index * 0.18, index * 0.31, index * 0.12);
      group.add(leafCluster);

    });

    const blossomMaterial = assetManager.material('blossom', palette.blossom, { flatShading: false });
    for (let index = 0; index < 24; index++) {
      const source = canopy[index % canopy.length];
      const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.08 + Math.random() * 0.08, 8, 6), blossomMaterial);
      blossom.position.set(
        source[0] + (Math.random() - 0.5) * source[2] * 1.45,
        groundY + source[1] + (Math.random() - 0.5) * source[3] * 1.2,
        -0.1 + (Math.random() - 0.5) * 1.6,
      );
      group.add(blossom);
    }

    for (let root = 0; root < 5; root++) {
      const angle = root * Math.PI * 0.4 + 0.2;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.5, groundY + 0.05, -1.3),
        new THREE.Vector3(-1.5 + Math.cos(angle) * 1.2, groundY - 0.05, -1.3 + Math.sin(angle) * 1.2),
        new THREE.Vector3(-1.5 + Math.cos(angle) * 2.2, groundY - 0.05, -1.3 + Math.sin(angle) * 2.2),
      ]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.12, 6, false), trunkMaterial));
    }

    return group;
  }

  function makeCouple(assetManager, groundY, moonPosition) {
    const group = new THREE.Group();
    const skin = assetManager.material('skin', 0xf1c4a8, { flatShading: false });
    const shirt = assetManager.material('shirt', 0xf7ecd8, { flatShading: false });
    const pants = assetManager.material('pants', 0x2d3d59, { flatShading: false });
    const dress = assetManager.material('dress', 0xdca8b9, { flatShading: false });
    const hair = assetManager.material('hair', 0x2d2024, { flatShading: false });
    const shoes = assetManager.material('shoes', 0xf4ede1, { flatShading: false });

    function add(geometry, material, position, scale) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      if (scale) mesh.scale.copy(scale);
      group.add(mesh);
      return mesh;
    }
    function limb(start, end, radius, material) {
      const vector = new THREE.Vector3().subVectors(end, start);
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.92, radius, vector.length(), 12), material);
      mesh.position.copy(start).add(end).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vector.normalize());
      group.add(mesh);
      return mesh;
    }
    function foot(position, material) {
      return add(new THREE.BoxGeometry(0.25, 0.14, 0.43), material, position);
    }
    function head(position, hairScale, female) {
        add(new THREE.SphereGeometry(0.35, 20, 16), skin, position, new THREE.Vector3(0.95, 1.05, 0.94));
        add(new THREE.SphereGeometry(0.37, 20, 14), hair, position.clone().add(new THREE.Vector3(0, 0.13, -0.11)), hairScale);
        const eyeMaterial = assetManager.material('eyes', 0x2d2024, { roughness: 0.45, flatShading: false });
        add(new THREE.SphereGeometry(0.038, 8, 6), eyeMaterial, position.clone().add(new THREE.Vector3(-0.1, 0.015, 0.325)));
        add(new THREE.SphereGeometry(0.038, 8, 6), eyeMaterial, position.clone().add(new THREE.Vector3(0.1, 0.015, 0.325)));
      if (female) {
        add(new THREE.SphereGeometry(0.16, 12, 10), hair, position.clone().add(new THREE.Vector3(-0.27, -0.18, -0.05)), new THREE.Vector3(0.8, 1.7, 0.7));
        add(new THREE.SphereGeometry(0.16, 12, 10), hair, position.clone().add(new THREE.Vector3(0.27, -0.18, -0.05)), new THREE.Vector3(0.8, 1.7, 0.7));
      }
    }

    add(new THREE.SphereGeometry(0.53, 18, 14), shirt, new THREE.Vector3(0.38, 0.77, 0), new THREE.Vector3(0.85, 1.18, 0.7));
    add(new THREE.SphereGeometry(0.5, 18, 14), dress, new THREE.Vector3(-0.42, 0.62, 0.12), new THREE.Vector3(0.8, 1.15, 0.72));
    head(new THREE.Vector3(0.4, 1.58, 0.1), new THREE.Vector3(1.05, 0.72, 1), false);
    head(new THREE.Vector3(-0.4, 1.37, 0.24), new THREE.Vector3(1.1, 0.8, 1.05), true);

    limb(new THREE.Vector3(0.56, 0.5, 0.08), new THREE.Vector3(0.98, 0.36, 0.38), 0.13, pants);
    limb(new THREE.Vector3(0.98, 0.36, 0.38), new THREE.Vector3(0.72, 0.1, 0.85), 0.11, pants);
    foot(new THREE.Vector3(0.72, 0.05, 1.08), shoes);
    limb(new THREE.Vector3(0.12, 0.48, 0.05), new THREE.Vector3(-0.18, 0.34, 0.4), 0.12, pants);
    limb(new THREE.Vector3(-0.18, 0.34, 0.4), new THREE.Vector3(0.02, 0.1, 0.86), 0.105, pants);
    foot(new THREE.Vector3(0.02, 0.05, 1.08), shoes);
    limb(new THREE.Vector3(-0.55, 0.46, 0.15), new THREE.Vector3(-1.0, 0.34, 0.4), 0.115, dress);
    limb(new THREE.Vector3(-1.0, 0.34, 0.4), new THREE.Vector3(-1.06, 0.1, 0.8), 0.095, dress);
    foot(new THREE.Vector3(-1.06, 0.05, 1.0), shoes);
    limb(new THREE.Vector3(-0.25, 0.45, 0.15), new THREE.Vector3(-0.58, 0.34, 0.42), 0.105, dress);
    limb(new THREE.Vector3(-0.58, 0.34, 0.42), new THREE.Vector3(-0.35, 0.1, 0.86), 0.09, dress);
    foot(new THREE.Vector3(-0.35, 0.05, 1.08), shoes);

    limb(new THREE.Vector3(0.68, 1.02, 0.08), new THREE.Vector3(0.12, 1.04, 0.42), 0.1, shirt);
    limb(new THREE.Vector3(0.12, 1.04, 0.42), new THREE.Vector3(-0.28, 0.96, 0.45), 0.085, skin);
    limb(new THREE.Vector3(0.75, 1.14, 0.08), new THREE.Vector3(1.02, 1.65, 0.46), 0.095, shirt);
    limb(new THREE.Vector3(1.02, 1.65, 0.46), new THREE.Vector3(0.8, 2.15, 1.0), 0.08, skin);
    add(new THREE.SphereGeometry(0.11, 12, 8), skin, new THREE.Vector3(0.78, 2.15, 1.04), new THREE.Vector3(0.72, 0.72, 1.45));
    limb(new THREE.Vector3(-0.68, 0.96, 0.28), new THREE.Vector3(-0.18, 1.06, 0.46), 0.085, dress);
    limb(new THREE.Vector3(-0.18, 1.06, 0.46), new THREE.Vector3(0.1, 0.99, 0.46), 0.075, skin);

    group.position.set(1.4, groundY, 1.9);
    group.rotation.y = Math.atan2(moonPosition.x - group.position.x, moonPosition.z - group.position.z) + 0.62;
    group.scale.setScalar(1.82);
    const rim = new THREE.PointLight(0xffdbc2, 0.7, 7);
    rim.position.set(-1.5, 3.2, 2.8);
    group.add(rim);
    return group;
  }

  function makeLantern() {
    const group = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: palette.lantern,
      emissive: 0x9c3f10,
      emissiveIntensity: 0.78,
      roughness: 0.45,
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.38, 1.08, 8), bodyMaterial);
    group.add(body);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 8), new THREE.MeshStandardMaterial({ color: palette.cream, roughness: 0.5 }));
    top.position.y = 0.54;
    group.add(top);
    const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.38, 6), new THREE.MeshStandardMaterial({ color: 0x9f2935, roughness: 0.8 }));
    tassel.position.y = -0.72;
    group.add(tassel);
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 64;
    glowCanvas.height = 64;
    const glowContext = glowCanvas.getContext('2d');
    const gradient = glowContext.createRadialGradient(32, 32, 2, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 245, 202, 0.95)');
    gradient.addColorStop(0.32, 'rgba(255, 181, 77, 0.55)');
    gradient.addColorStop(1, 'rgba(255, 181, 77, 0)');
    glowContext.fillStyle = gradient;
    glowContext.fillRect(0, 0, 64, 64);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(glowCanvas),
      color: palette.lantern,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    glow.scale.set(2.3, 2.3, 1);
    group.add(glow);
    const hitMesh = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
    group.add(hitMesh);
    return { group, body, glow, hitMesh };
  }

  function makeProps(assetManager, groundY) {
    const group = new THREE.Group();
    const cloth = new THREE.Mesh(new THREE.CircleGeometry(1.25, 32), assetManager.material('cloth', 0x7b526c, { roughness: 0.9 }));
    cloth.rotation.x = -Math.PI / 2;
    cloth.position.set(2.4, groundY + 0.03, 0.4);
    group.add(cloth);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 0.36), assetManager.material('mooncake-box', 0xb8743c));
    box.position.set(2.55, groundY + 0.18, 0.22);
    group.add(box);
    for (let index = 0; index < 2; index++) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 10), assetManager.material('tea-cup', palette.cream));
      cup.position.set(2.05 + index * 0.25, groundY + 0.13, 0.78);
      group.add(cup);
    }
    return group;
  }

  window.Romance3D = {
    AssetManager,
    IslandFactory: { create: makeOrganicIsland },
    TreeFactory: { create: makeTree },
    CharacterFactory: { createCouple: makeCouple },
    LanternFactory: { create: makeLantern },
    PropFactory: { create: makeProps },
  };
})();
