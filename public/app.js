

function getAvatarUrl(avatarPath) {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('http')) return avatarPath;
  if (avatarPath.startsWith('/')) {
    if (avatarPath.startsWith('/media/')) return `https://remanga.org${avatarPath}`;
    return `https://remanga.org/media${avatarPath}`;
  }
  if (avatarPath.startsWith('media/')) return `https://remanga.org/${avatarPath}`;
  return `https://remanga.org/media/${avatarPath}`;
}

function getCardMediaHTML(src, className, style, attrs) {
  if (!src) return '';
  const isWebm = src.toLowerCase().endsWith('.webm') || src.toLowerCase().includes('.webm');
  const classAttr = className ? `class="${className}"` : '';
  const styleAttr = style ? `style="${style}"` : '';
  let otherAttrs = attrs || '';
  if (isWebm) {
    if (otherAttrs.includes('onload=')) {
      otherAttrs = otherAttrs.replace('onload=', 'onloadeddata=');
    }
    return `<video src="${src}" autoplay muted playsinline ${classAttr} ${styleAttr} ${otherAttrs} preload="auto" onplay="this.pause()"></video>`;
  } else {
    return `<img src="${src}" referrerpolicy="no-referrer" ${classAttr} ${styleAttr} ${otherAttrs}>`;
  }
}

function loadAvatar(imgEl, fallbackEl, user) {
  if (!user) return;
  const tgAvatarUrl = `/api/tg-avatar/${user.tg_id}`;
  const remangaAvatarUrl = user.remanga_avatar ? getAvatarUrl(user.remanga_avatar) : null;
  imgEl.onload = () => {
    imgEl.classList.remove('hidden');
    fallbackEl.classList.add('hidden');
  };
  imgEl.onerror = () => {
    if (imgEl.src !== remangaAvatarUrl && remangaAvatarUrl) {
      imgEl.src = remangaAvatarUrl;
    } else {
      imgEl.classList.add('hidden');
      fallbackEl.classList.remove('hidden');
      fallbackEl.textContent = (user.tg_first_name || 'EW').substring(0, 2).toUpperCase();
    }
  };
  imgEl.src = tgAvatarUrl;
}

function formatDateTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }) + ' (МСК)';
}

function updateDOMBalance(balance) {
  const el1 = document.getElementById('user-balance');
  if (el1) el1.textContent = balance;
  const el2 = document.getElementById('drawer-balance');
  if (el2) el2.textContent = balance;
  const el3 = document.getElementById('shop-balance');
  if (el3) el3.textContent = balance;
}

function highlightCurrentCell() {
  if (!state.tileObjects || state.tileObjects.length === 0) return;
  if (!state.user || state.user.current_cell === undefined) return;
  const currentCell = state.user.current_cell;
  for (let i = 0; i < state.tileObjects.length; i++) {
    const tileMesh = state.tileObjects[i];
    if (!tileMesh || !tileMesh.material) continue;
    const materials = Array.isArray(tileMesh.material) ? tileMesh.material : [tileMesh.material];

    const isBossCell = (i > 0 && i % 30 === 0) || i === 299;
    const bossData = (state.bosses || []).find(b => b.cell_number === i);
    const defeated = bossData ? bossData.defeated : 0;

    if (i === currentCell) {
      materials.forEach(mat => {
        if (mat) {
          mat.emissive = new THREE.Color('#00f0ff');
          mat.emissiveIntensity = 0.75;
          if (isBossCell) {
            mat.color = new THREE.Color(defeated ? '#00ff33' : '#ff0033');
          }
        }
      });
    } else {
      materials.forEach(mat => {
        if (mat) {
          if (isBossCell) {
            mat.color = new THREE.Color(defeated ? '#00ff33' : '#ff0033');
            mat.emissive = new THREE.Color(defeated ? '#00ff33' : '#ff0033');
            mat.emissiveIntensity = 0.85;
          } else {
            mat.emissive = new THREE.Color('#000000');
            mat.emissiveIntensity = 0;
          }
        }
      });
    }
  }
}

let currentOpenedBossCell = null;

function getPlayerBattleStats(user) {
  let charData = {};
  try {
    charData = typeof user.character_data === 'string' ? JSON.parse(user.character_data) : (user.character_data || {});
  } catch (e) {
    charData = {};
  }
  const baseHp = 100;
  const baseDmg = 10;
  let bonusHp = 0;
  let bonusDmg = 0;

  const weapon = charData.weapon || 'none';
  if (weapon === 'sword') bonusDmg += 20;
  else if (weapon === 'staff') { bonusDmg += 10; bonusHp += 10; }
  else if (weapon === 'shield') { bonusDmg += 5; bonusHp += 30; }
  else if (weapon === 'axe') bonusDmg += 40;
  else if (weapon === 'bow') { bonusDmg += 20; bonusHp += 50; }
  else if (weapon === 'scythe') { bonusDmg += 30; bonusHp += 20; }
  else if (weapon === 'hammer') { bonusDmg += 80; bonusHp += 100; }

  const costume = charData.costume || 'normal';
  if (costume === 'armor') bonusHp += 100;
  else if (costume === 'robe') { bonusHp += 20; bonusDmg += 10; }
  else if (costume === 'cyber') { bonusHp += 30; bonusDmg += 5; }
  else if (costume === 'steampunk') { bonusHp += 55; bonusDmg += 10; }
  else if (costume === 'ninja_suit') { bonusHp += 200; bonusDmg += 30; }

  return {
    maxHp: baseHp + bonusHp,
    dmg: baseDmg + bonusDmg,
    element: charData.element || 'water'
  };
}

async function refreshBosses() {
  try {
    const res = await fetch('/api/bosses');
    if (res.ok) {
      state.bosses = await res.json();
      loadBossModels();
      updateBossMeshes();
      if (currentOpenedBossCell !== null) {
        const currentBoss = state.bosses.find(b => b.cell_number === currentOpenedBossCell);
        if (currentBoss) {
          updateBossModalUI(currentBoss);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}

function updateBossMeshes() {
  if (!state.boardScene) return;
  if (!state.bossObjects) {
    state.bossObjects = new Map();
  }
  for (const [cellNum, mesh] of state.bossObjects.entries()) {
    state.boardScene.remove(mesh);
  }
  state.bossObjects.clear();

  if (!state.bossLabels) state.bossLabels = [];
  state.bossLabels.forEach(s => state.boardScene.remove(s));
  state.bossLabels = [];

  const bossCells = [30, 60, 90, 120, 150, 180, 210, 240, 270, 299];
  bossCells.forEach((cellNum, idx) => {
    const bossData = (state.bosses || []).find(b => b.cell_number === cellNum);
    const defeated = bossData ? bossData.defeated : 0;
    const pos = getTilePosition(cellNum);
    const prevPos = getTilePosition(Math.max(0, cellNum - 1));
    const dx = prevPos.x - pos.x;
    const dz = prevPos.z - pos.z;
    const autoAngle = Math.atan2(dx, dz);
    const angle = (bossData && bossData.custom_rotation !== null && bossData.custom_rotation !== undefined)
      ? bossData.custom_rotation
      : autoAngle;
    const customScale = (bossData && bossData.custom_scale !== null && bossData.custom_scale !== undefined) ? bossData.custom_scale : 1.0;
    const bossMesh = create3DBossMesh(idx, defeated, angle, customScale);
    const offX = (bossData && bossData.position_offset_x) || 0;
    const offY = (bossData && bossData.position_offset_y) || 0;
    const offZ = (bossData && bossData.position_offset_z) || 0;
    bossMesh.position.set(pos.x + 1.1 + offX, pos.y + 0.15 + offY, pos.z + 1.1 + offZ);
    state.boardScene.add(bossMesh);
    state.bossObjects.set(cellNum, bossMesh);

    const labelSprite = createBossCellLabel(cellNum, bossData ? bossData.name : '');
    labelSprite.position.set(pos.x + 1.1 + offX, pos.y + 2.8 + offY, pos.z + 1.1 + offZ);
    state.boardScene.add(labelSprite);
    state.bossLabels.push(labelSprite);
  });
}

function createBossCellLabel(cellNum, bossName) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  const r = 10;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(canvas.width - r, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
  ctx.lineTo(canvas.width, canvas.height - r);
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
  ctx.lineTo(r, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = 'bold 28px Orbitron, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = bossName ? `${cellNum} • ${bossName}` : String(cellNum);
  ctx.fillText(label, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.5, 0.625, 1);
  return sprite;
}

const cachedBossGLTF = {};

function getBossScale(index) {
  switch (index) {
    case 0: return 1.5;
    case 1: return 0.008;
    case 2: return 0.012;
    case 3: return 1.0;
    case 4: return 0.8;
    case 5: return 0.6;
    case 6: return 0.008;
    case 7: return 0.015;
    case 8: return 0.012;
    case 9: return 0.6;
    default: return 0.8;
  }
}

function getBossRotation(index) {
  return [0, 0, 0];
}

const loadingBossModels = new Set();

function loadBossModels() {
  if (typeof THREE.GLTFLoader === 'undefined') {
    setTimeout(loadBossModels, 200);
    return;
  }
  const loader = new THREE.GLTFLoader();
  const bossCells = [30, 60, 90, 120, 150, 180, 210, 240, 270, 299];
  const defaultModels = [
    'Duck.glb', 'aion_boss_rigged_character_3d_model.glb', 'caine_-_boss_form_tadc___hh.glb',
    'frog_boss_from_dragon_land.glb', 'haishan_boss.glb', 'lowpoly_boss_with_huge_sword_spear.glb',
    'metal_slug_-_boss_organic.glb', 'ps2_monster_house_boss.glb', 'slasher_castom_boss.glb', 'gold_sandworm.glb'
  ];

  bossCells.forEach((cellNum, index) => {
    const bossData = (state.bosses || []).find(b => b.cell_number === cellNum);
    const modelFile = (bossData && bossData.model_file) ? bossData.model_file : defaultModels[index];
    const url = '/bosses/' + encodeURIComponent(modelFile);

    if (cachedBossGLTF[modelFile]) {
      cachedBossGLTF[index] = cachedBossGLTF[modelFile];
      updateBossMeshes();
      return;
    }

    if (loadingBossModels.has(modelFile)) {
      return;
    }
    loadingBossModels.add(modelFile);

    loader.load(url, (gltf) => {
      const meshesToReplace = [];
      gltf.scene.traverse((child) => {
        if (child.isSkinnedMesh && child.skeleton && child.skeleton.bones && child.skeleton.bones.length > 50) {
          if (modelFile !== 'slasher_castom_boss.glb') {
            meshesToReplace.push(child);
          }
        }
      });

      for (const skinnedMesh of meshesToReplace) {
        const parent = skinnedMesh.parent;
        if (parent) {
          const newMesh = new THREE.Mesh(skinnedMesh.geometry, skinnedMesh.material);
          newMesh.name = skinnedMesh.name;
          newMesh.position.copy(skinnedMesh.position);
          newMesh.rotation.copy(skinnedMesh.rotation);
          newMesh.scale.copy(skinnedMesh.scale);
          newMesh.castShadow = skinnedMesh.castShadow;
          newMesh.receiveShadow = skinnedMesh.receiveShadow;
          if (newMesh.material) {
            if (Array.isArray(newMesh.material)) {
              newMesh.material.forEach(m => { m.skinning = false; });
            } else {
              newMesh.material.skinning = false;
            }
          }
          parent.add(newMesh);
          parent.remove(skinnedMesh);
        }
      }

      cachedBossGLTF[modelFile] = gltf.scene;
      cachedBossGLTF[index] = gltf.scene;
      loadingBossModels.delete(modelFile);

      updateBossMeshes();
      if (currentOpenedBossCell === cellNum) {
        const currentBoss = (state.bosses || []).find(b => b.cell_number === cellNum);
        if (currentBoss) {
          bossBattleState.bossCellNumber = null;
          updateBossModalUI(currentBoss);
        }
      }
    }, undefined, (err) => {
      loadingBossModels.delete(modelFile);
      console.error(`[BOSS MODEL] Failed to load model ${index}: ${url}`, err);
    });
  });
}

function create3DBossMesh(index, defeated, faceAngle, customScale) {
  if (cachedBossGLTF[index]) {
    const group = new THREE.Group();
    const model = (typeof THREE.SkeletonUtils !== 'undefined') ? THREE.SkeletonUtils.clone(cachedBossGLTF[index]) : cachedBossGLTF[index].clone();



    const hiddenNodes = [];
    model.traverse((child) => {
      if (child.isLight || child.isCamera || child.isHelper) {
        child.visible = false;
        hiddenNodes.push(child);
      }
      if (child.isMesh && (
        child.name.toLowerCase().includes('grid') ||
        child.name.toLowerCase().includes('helper') ||
        child.name.toLowerCase().includes('floor') ||
        child.name.toLowerCase().includes('ground') ||
        child.name.toLowerCase().includes('sky')
      )) {
        child.visible = false;
        hiddenNodes.push(child);
      }
    });

    let visibleMeshCount = 0;
    model.traverse((child) => {
      if (child.isMesh && child.visible) visibleMeshCount++;
    });

    if (visibleMeshCount === 0) {
      hiddenNodes.forEach(n => { n.visible = true; });
      model.traverse((child) => { child.visible = true; });
    }

    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetHeight = 1.8;
    const autoScale = maxDim > 0 ? (targetHeight / maxDim) : 1.0;
    model.scale.set(autoScale, autoScale, autoScale);

    if (faceAngle !== undefined) {
      model.rotation.set(0, faceAngle, 0);
    }

    const box2 = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box2.getCenter(center);
    model.position.y -= center.y - (box2.max.y - box2.min.y) / 2;

    if (defeated) {
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          const makeDefeated = (mat) => {
            if (!mat) return mat;
            try {
              const m = mat.clone();
              m.transparent = true;
              m.opacity = 0.35;
              if (m.color && typeof m.color.set === 'function') {
                m.color.set('#555555');
              }
              return m;
            } catch (e) {
              return mat;
            }
          };
          if (Array.isArray(child.material)) {
            child.material = child.material.map(makeDefeated);
          } else {
            child.material = makeDefeated(child.material);
          }
        }
      });
    }

    group.add(model);
    const scaleMultiplier = (customScale !== undefined && customScale !== null) ? parseFloat(customScale) : 1.0;
    const finalScale = isNaN(scaleMultiplier) ? 1.0 : scaleMultiplier;
    console.log("Boss Mesh scale applied:", index, "scale:", finalScale);
    group.scale.set(finalScale, finalScale, finalScale);
    return group;
  }
  return new THREE.Group();
  const opacityVal = defeated ? 0.35 : 1.0;
  const transparentVal = defeated;
  const mainColor = defeated ? '#555555' : getBossColor(index);
  const accentColor = defeated ? '#777777' : getBossAccentColor(index);

  const mainMat = new THREE.MeshStandardMaterial({
    color: mainColor,
    roughness: 0.5,
    metalness: defeated ? 0.0 : 0.2,
    transparent: transparentVal,
    opacity: opacityVal
  });

  const accMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.4,
    metalness: defeated ? 0.0 : 0.5,
    transparent: transparentVal,
    opacity: opacityVal
  });

  const eyeColor = defeated ? '#333333' : '#ff0000';
  const eyeMat = new THREE.MeshBasicMaterial({
    color: eyeColor,
    transparent: transparentVal,
    opacity: opacityVal
  });

  if (index === 0) {
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 2.0), mainMat);
    torso.position.y = 0.8;
    group.add(torso);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mainMat);
    head.position.set(0, 1.5, 0.8);
    group.add(head);
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.7, 8), accMat);
    hornL.rotation.z = -Math.PI / 4;
    hornL.rotation.x = -Math.PI / 8;
    hornL.position.set(-0.5, 1.9, 0.9);
    const hornR = hornL.clone();
    hornR.rotation.z = Math.PI / 4;
    hornR.position.x = 0.5;
    group.add(hornL);
    group.add(hornR);
  } else if (index === 1) {
    const fig1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1.8, 8), mainMat);
    fig1.position.set(-0.6, 0.9, 0);
    const head1 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), accMat);
    head1.position.set(-0.6, 2.0, 0);
    const fig2 = fig1.clone();
    fig2.position.x = 0.6;
    const head2 = head1.clone();
    head2.position.x = 0.6;
    group.add(fig1);
    group.add(head1);
    group.add(fig2);
    group.add(head2);
  } else if (index === 2) {
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), mainMat);
    shell.scale.set(1.4, 0.6, 1.2);
    shell.position.y = 0.6;
    group.add(shell);
    const clawL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.8), accMat);
    clawL.position.set(-1.1, 0.8, 0.6);
    clawL.rotation.y = Math.PI / 6;
    const clawR = clawL.clone();
    clawR.position.x = 1.1;
    clawR.rotation.y = -Math.PI / 6;
    group.add(clawL);
    group.add(clawR);
  } else if (index === 3) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.8), mainMat);
    body.position.y = 0.7;
    group.add(body);
    const mane = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), accMat);
    mane.position.set(0, 1.4, 0.7);
    group.add(mane);
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), mainMat);
    face.position.set(0, 1.4, 1.1);
    group.add(face);
  } else if (index === 4) {
    const gown = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.8, 2.2, 10), mainMat);
    gown.position.y = 1.1;
    group.add(gown);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), accMat);
    head.position.y = 2.4;
    group.add(head);
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.8), accMat);
    wingL.rotation.y = Math.PI / 4;
    wingL.rotation.z = Math.PI / 6;
    wingL.position.set(-0.6, 1.6, -0.4);
    const wingR = wingL.clone();
    wingR.rotation.y = -Math.PI / 4;
    wingR.rotation.z = -Math.PI / 6;
    wingR.position.x = 0.6;
    group.add(wingL);
    group.add(wingR);
  } else if (index === 5) {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 2.0, 8), mainMat);
    base.position.y = 1.0;
    group.add(base);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.15), accMat);
    beam.position.y = 2.0;
    group.add(beam);
    const panL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 8), accMat);
    panL.position.set(-1.2, 1.5, 0);
    const panR = panL.clone();
    panR.position.x = 1.2;
    group.add(panL);
    group.add(panR);
  } else if (index === 6) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.6), mainMat);
    body.position.y = 0.4;
    group.add(body);
    const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.6), accMat);
    tail1.position.set(0, 0.7, -0.7);
    tail1.rotation.x = Math.PI / 4;
    const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.6), accMat);
    tail2.position.set(0, 1.2, -0.9);
    tail2.rotation.x = Math.PI / 2;
    const sting = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 4), accMat);
    sting.position.set(0, 1.5, -0.6);
    sting.rotation.x = -Math.PI / 4;
    group.add(tail1);
    group.add(tail2);
    group.add(sting);
  } else if (index === 7) {
    const horseTorso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.6), mainMat);
    horseTorso.position.y = 0.7;
    group.add(horseTorso);
    const humanTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.0, 8), mainMat);
    humanTorso.position.set(0, 1.6, 0.6);
    group.add(humanTorso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), accMat);
    head.position.set(0, 2.2, 0.6);
    group.add(head);
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 8, Math.PI), accMat);
    bow.position.set(0, 1.6, 1.1);
    bow.rotation.y = Math.PI / 2;
    group.add(bow);
  } else {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 1.6), mainMat);
    body.position.y = 0.7;
    group.add(body);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.45, 1.0, 8), accMat);
    tail.rotation.x = Math.PI / 3;
    tail.position.set(0, 0.5, -1.0);
    group.add(tail);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), mainMat);
    head.position.set(0, 1.4, 0.6);
    group.add(head);
    const horns = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 6), accMat);
    horns.rotation.x = -Math.PI / 4;
    horns.position.set(0, 1.9, 0.4);
    group.add(horns);
  }

  if (index !== 4 && index !== 5) {
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 4, 4), eyeMat);
    eyeL.position.set(-0.25, 1.5, 1.25);
    if (index === 0) eyeL.position.set(-0.25, 1.6, 1.25);
    else if (index === 7) eyeL.position.set(-0.15, 2.25, 0.9);
    else if (index === 8) eyeL.position.set(-0.15, 1.5, 0.9);
    const eyeR = eyeL.clone();
    eyeR.position.x = -eyeL.position.x;
    group.add(eyeL);
    group.add(eyeR);
  }

  group.scale.set(1.5, 1.5, 1.5);
  return group;
}

function getBossColor(index) {
  const colors = [
    '#5c3d2e',
    '#2d4059',
    '#9a0f0f',
    '#d39e00',
    '#f5f5f5',
    '#4b5d67',
    '#1a1a1a',
    '#005f73',
    '#556b2f'
  ];
  return colors[index] || '#777777';
}

function getBossAccentColor(index) {
  const colors = [
    '#ffb800',
    '#00f0ff',
    '#ff4444',
    '#ffffff',
    '#ff00ff',
    '#00ffcc',
    '#990000',
    '#ff8800',
    '#a2b93a'
  ];
  return colors[index] || '#ffffff';
}

async function checkAndShowBossModal(cellNumber) {
  currentOpenedBossCell = cellNumber;
  await refreshBosses();
  const boss = (state.bosses || []).find(b => b.cell_number === cellNumber);
  if (!boss) {
    currentOpenedBossCell = null;
    return;
  }
  const modal = document.getElementById('boss-battle-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  updateBossModalUI(boss);
}

function getModelBoundingBox(object) {
  const box = new THREE.Box3();
  let hasMesh = false;

  object.updateMatrixWorld(true);
  object.traverse((child) => {
    if (child.isMesh) {
      hasMesh = true;
      if (!child.geometry.boundingBox) {
        child.geometry.computeBoundingBox();
      }
      const geomBox = child.geometry.boundingBox.clone();
      geomBox.applyMatrix4(child.matrixWorld);
      box.union(geomBox);
    }
  });

  if (!hasMesh) {
    box.setFromObject(object);
  }
  return box;
}

let bossBattleState = { renderer: null, scene: null, camera: null, animId: null, playerModel: null, bossModel: null, bossMixer: null, bossCellNumber: null };

function cleanupBossBattle() {
  if (bossBattleState.animId) {
    cancelAnimationFrame(bossBattleState.animId);
    bossBattleState.animId = null;
  }
  if (bossBattleState.renderer) {
    bossBattleState.renderer.dispose();
    const container = document.getElementById('boss-battle-canvas');
    if (container) container.innerHTML = '';
    bossBattleState.renderer = null;
  }
  bossBattleState.scene = null;
  bossBattleState.camera = null;
  bossBattleState.playerModel = null;
  bossBattleState.bossModel = null;
  bossBattleState.bossMixer = null;
  bossBattleState.bossCellNumber = null;
}

function renderBossBattle3D(boss) {
  cleanupBossBattle();
  const container = document.getElementById('boss-battle-canvas');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 260;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#080c14');

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20);
  camera.position.set(0, 1.6, 4.0);
  camera.lookAt(0, 0.7, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(3, 5, 3);
  scene.add(dirLight);
  const backLight = new THREE.DirectionalLight(0xff3333, 0.4);
  backLight.position.set(-3, 2, -3);
  scene.add(backLight);

  const tileGeom = new THREE.BoxGeometry(3.2, 0.2, 1.8);
  const tileMat = new THREE.MeshStandardMaterial({ color: '#121a24', roughness: 0.6, metalness: 0.3 });
  const tileMesh = new THREE.Mesh(tileGeom, tileMat);
  tileMesh.position.y = -0.1;
  scene.add(tileMesh);

  const gridHelper = new THREE.GridHelper(3.2, 6, '#00f0ff', '#1a2736');
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  const charData = (state.user && state.user.character_data)
    ? state.user.character_data
    : getDefaultCharData();
  const playerMesh = create3DCharacterMesh(charData);
  playerMesh.position.set(-1.0, 0, 0);
  playerMesh.rotation.y = Math.PI / 2;
  scene.add(playerMesh);
  bossBattleState.playerModel = playerMesh;

  const bossCells = [30, 60, 90, 120, 150, 180, 210, 240, 270, 299];
  const bossIndex = bossCells.indexOf(boss.cell_number);
  const cached = bossIndex >= 0 ? cachedBossGLTF[bossIndex] : null;

  let bossMixer = null;

  const bossData = (state.bosses || []).find(b => b.cell_number === boss.cell_number);
  const customScale = 1.0;
  const customRotation = 0.0;

  if (cached) {
    const bossModel = (typeof THREE.SkeletonUtils !== 'undefined') ? THREE.SkeletonUtils.clone(cached) : cached.clone();

    bossModel.traverse((child) => {
      if (child.isLight || child.isCamera || child.isHelper) child.visible = false;
      if (child.isMesh && (child.name.toLowerCase().includes('grid') || child.name.toLowerCase().includes('floor') || child.name.toLowerCase().includes('ground') || child.name.toLowerCase().includes('sky'))) child.visible = false;
    });

    bossModel.updateMatrixWorld(true);
    const box = getModelBoundingBox(bossModel);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetH = 1.6;
    let sc = maxDim > 0 ? targetH / maxDim : 1;
    sc *= customScale;
    bossModel.scale.set(sc, sc, sc);

    bossModel.rotation.y = -Math.PI / 2 + customRotation;

    bossModel.position.set(0, 0, 0);
    bossModel.updateMatrixWorld(true);
    const box2 = getModelBoundingBox(bossModel);
    const center = new THREE.Vector3();
    box2.getCenter(center);

    bossModel.position.x = 1.0 - center.x;
    bossModel.position.z = 0 - center.z;
    bossModel.position.y = 0;

    if (cached.animations && cached.animations.length > 0) {
      bossMixer = new THREE.AnimationMixer(bossModel);
      const action = bossMixer.clipAction(cached.animations[0]);
      action.play();
    }

    scene.add(bossModel);
    bossBattleState.bossModel = bossModel;
  } else {
    const fallback = create3DBossMesh(bossIndex >= 0 ? bossIndex : 0, false, -Math.PI / 2 + customRotation, customScale);
    fallback.position.set(1.0, 0, 0);
    scene.add(fallback);
    bossBattleState.bossModel = fallback;
  }

  bossBattleState.renderer = renderer;
  bossBattleState.scene = scene;
  bossBattleState.camera = camera;
  bossBattleState.bossMixer = bossMixer;

  const clock = new THREE.Clock();
  const animate = () => {
    if (!bossBattleState.renderer) return;
    bossBattleState.animId = requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = performance.now() * 0.003;

    if (bossBattleState.bossMixer) {
      bossBattleState.bossMixer.update(delta);
    }

    if (bossBattleState.playerModel) {
      bossBattleState.playerModel.position.y = Math.sin(time * 2) * 0.05;
    }
    if (bossBattleState.bossModel && !bossBattleState.bossMixer) {
      bossBattleState.bossModel.position.y = Math.sin(time * 2 + 1) * 0.05;
    }

    renderer.render(scene, camera);
  };
  animate();
}

let bossPreviewState = { renderer: null, scene: null, camera: null, animId: null, model: null, mixer: null };

function cleanupBossPreview() {
  cleanupBossBattle();
  if (bossPreviewState.animId) {
    cancelAnimationFrame(bossPreviewState.animId);
    bossPreviewState.animId = null;
  }
  if (bossPreviewState.renderer) {
    bossPreviewState.renderer.dispose();
    const container = document.getElementById('boss-preview-canvas');
    if (container) container.innerHTML = '';
    bossPreviewState.renderer = null;
  }
  bossPreviewState.scene = null;
  bossPreviewState.camera = null;
  bossPreviewState.model = null;
  bossPreviewState.mixer = null;
}

function renderBossPreview3D(boss) {
  cleanupBossPreview();
  const container = document.getElementById('boss-preview-canvas');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 200;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#080c14');

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 20);
  camera.position.set(0, 1.2, 3.5);
  camera.lookAt(0, 0.8, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(2, 3, 2);
  scene.add(dirLight);
  const backLight = new THREE.DirectionalLight(0xff3333, 0.3);
  backLight.position.set(-2, 1, -2);
  scene.add(backLight);

  const bossCells = [30, 60, 90, 120, 150, 180, 210, 240, 270, 299];
  const bossIndex = bossCells.indexOf(boss.cell_number);
  const cached = bossIndex >= 0 ? cachedBossGLTF[bossIndex] : null;

  let mixer = null;

  if (cached) {
    const model = (typeof THREE.SkeletonUtils !== 'undefined') ? THREE.SkeletonUtils.clone(cached) : cached.clone();

    model.traverse((child) => {
      if (child.isLight || child.isCamera || child.isHelper) child.visible = false;
      if (child.isMesh && (child.name.toLowerCase().includes('grid') || child.name.toLowerCase().includes('floor') || child.name.toLowerCase().includes('ground') || child.name.toLowerCase().includes('sky'))) child.visible = false;
    });

    model.updateMatrixWorld(true);
    const box = getModelBoundingBox(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetH = 2.0;
    const sc = maxDim > 0 ? targetH / maxDim : 1;
    model.scale.set(sc, sc, sc);

    model.updateMatrixWorld(true);
    const box2 = getModelBoundingBox(model);
    const center = new THREE.Vector3();
    box2.getCenter(center);
    model.position.x = -center.x;
    model.position.z = -center.z;
    model.position.y = -center.y + (box2.max.y - box2.min.y) / 2;

    if (cached.animations && cached.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(cached.animations[0]);
      action.play();
    }

    scene.add(model);
    bossPreviewState.model = model;
  } else {
    const fallback = create3DBossMesh(bossIndex >= 0 ? bossIndex : 0, false);
    scene.add(fallback);
    bossPreviewState.model = fallback;
  }

  bossPreviewState.renderer = renderer;
  bossPreviewState.scene = scene;
  bossPreviewState.camera = camera;
  bossPreviewState.mixer = mixer;

  const clock = new THREE.Clock();
  const animate = () => {
    if (!bossPreviewState.renderer) return;
    bossPreviewState.animId = requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (bossPreviewState.mixer) {
      bossPreviewState.mixer.update(delta);
    }
    if (bossPreviewState.model) {
      bossPreviewState.model.rotation.y += 0.012;
    }
    renderer.render(scene, camera);
  };
  animate();
}

function updateBossModalUI(boss) {
  document.getElementById('boss-status-defeated').classList.add('hidden');
  document.getElementById('boss-status-occupied').classList.add('hidden');
  document.getElementById('boss-status-ready').classList.add('hidden');
  document.getElementById('boss-status-battle').classList.add('hidden');

  document.getElementById('boss-btn-close').classList.add('hidden');
  document.getElementById('boss-btn-bypass-only').classList.add('hidden');
  document.getElementById('boss-btn-fight').classList.add('hidden');
  document.getElementById('boss-btn-bypass').classList.add('hidden');
  document.getElementById('boss-btn-attack').classList.add('hidden');
  document.getElementById('boss-btn-forfeit').classList.add('hidden');

  document.getElementById('boss-modal-title').textContent = `Босс: ${boss.name} (Ячейка ${boss.cell_number})`;

  if (boss.defeated) {
    document.getElementById('boss-status-defeated').classList.remove('hidden');
    document.getElementById('boss-victor-name').textContent = boss.defeated_by_username || 'Неизвестно';
    
    const isPending = state.user && state.user.pending_boss_cell === boss.cell_number;
    if (isPending) {
      document.getElementById('boss-btn-bypass-only').classList.remove('hidden');
      document.getElementById('boss-btn-close').classList.add('hidden');
    } else {
      document.getElementById('boss-btn-close').classList.remove('hidden');
      document.getElementById('boss-btn-bypass-only').classList.add('hidden');
    }

    const rewardsContainer = document.getElementById('boss-defeated-rewards-container');
    const rewardsList = document.getElementById('boss-defeated-rewards-list');
    if (rewardsContainer && rewardsList) {
      let cards = [];
      if (boss.reward_type === 'card' && boss.reward_detail) {
        try {
          if (boss.reward_detail.startsWith('[')) {
            cards = JSON.parse(boss.reward_detail);
          } else {
            const parts = boss.reward_detail.split('|');
            cards = [{
              id: 'card_legacy',
              type: 'card',
              cover: parts[0] || '',
              name: parts[1] || boss.name + ' — Карта',
              char: parts[2] || '',
              claimed_by_user_id: null,
              claimed_by_username: null
            }];
          }
        } catch (e) {}
      }

      const hasUnclaimed = cards.some(c => c.claimed_by_user_id === null || c.claimed_by_user_id === undefined);

      if (cards.length > 0 && hasUnclaimed) {
        rewardsContainer.classList.remove('hidden');
        let html = '';
        const displayName = (state.user && (state.user.tg_first_name || state.user.tg_username)) || `Игрок ${state.user ? state.user.id : ''}`;
        cards.forEach(card => {
          const claimed = card.claimed_by_user_id !== null && card.claimed_by_user_id !== undefined;
          let claimStatusText = '';
          if (claimed) {
            claimStatusText = `<span style="font-size: 11px; color: #ff4a4a; font-weight: bold;">Забрано (${card.claimed_by_username || ''})</span>`;
          } else {
            const isKiller = (state.user && boss.defeated_by_user_id === state.user.id) || boss.defeated_by_username === displayName;
            const killerIsOnBossCell = boss.killer_current_cell === boss.cell_number;
            const userIsOnBossCell = state.user && state.user.current_cell === boss.cell_number;
            const canClaim = userIsOnBossCell && (isKiller || !killerIsOnBossCell);

            if (canClaim) {
              claimStatusText = `<button class="btn btn-primary btn-sm" style="padding: 4px 8px; font-size: 11px; background: #00f0ff; color: #000; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;" onclick="claimBossCard(${boss.cell_number}, '${card.id}')">Забрать</button>`;
            } else if (killerIsOnBossCell) {
              claimStatusText = `<span style="font-size: 10px; color: #ffb800;">Ожидание выбора</span>`;
            } else {
              claimStatusText = `<span style="font-size: 10px; color: #8c9ba5;">Встаньте на ячейку</span>`;
            }
          }

          html += `
            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 6px 10px;">
              <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                ${getCardMediaHTML(card.cover, '', 'width: 35px; height: 49px; object-fit: cover; border-radius: 4px; flex-shrink: 0;')}
                <span style="font-size: 12px; color: #fff; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; text-align: left;" title="${card.name}">${card.name}</span>
              </div>
              <div style="flex-shrink: 0; margin-left: 10px;">${claimStatusText}</div>
            </div>
          `;
        });
        rewardsList.innerHTML = html;
      } else {
        rewardsContainer.classList.add('hidden');
      }
    }
  } else if (boss.current_fighter_id && boss.current_fighter_id !== state.user.id) {
    document.getElementById('boss-status-occupied').classList.remove('hidden');
    document.getElementById('boss-fighter-name').textContent = boss.current_fighter_username || 'Неизвестно';
    document.getElementById('boss-btn-bypass-only').classList.remove('hidden');
  } else if (boss.current_fighter_id === state.user.id) {
    document.getElementById('boss-status-battle').classList.remove('hidden');
    document.getElementById('boss-btn-attack').classList.remove('hidden');
    document.getElementById('boss-btn-forfeit').classList.remove('hidden');

    if (!bossBattleState.renderer || bossBattleState.bossCellNumber !== boss.cell_number) {
      bossBattleState.bossCellNumber = boss.cell_number;
      setTimeout(() => {
        renderBossBattle3D(boss);
      }, 0);
    }

    const stats = getPlayerBattleStats(state.user);
    document.getElementById('battle-player-element').textContent = translateElement(stats.element);
    document.getElementById('battle-player-dmg').textContent = stats.dmg;

    const playerHp = boss.current_fighter_hp;
    const playerMaxHp = stats.maxHp;
    const playerPercent = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));
    document.getElementById('battle-player-hp-bar').style.width = `${playerPercent}%`;
    document.getElementById('battle-player-hp-text').textContent = `${playerHp} / ${playerMaxHp}`;

    document.getElementById('battle-boss-name-label').textContent = boss.name;
    document.getElementById('battle-boss-weakness').textContent = translateElement(boss.weakness);
    document.getElementById('battle-boss-dmg').textContent = boss.dmg;

    const bossPercent = Math.max(0, Math.min(100, (boss.hp / boss.max_hp) * 100));
    document.getElementById('battle-boss-hp-bar').style.width = `${bossPercent}%`;
    document.getElementById('battle-boss-hp-text').textContent = `${boss.hp} / ${boss.max_hp}`;

    updateAttackCooldownUI(boss);
  } else {
    document.getElementById('boss-status-ready').classList.remove('hidden');
    document.getElementById('boss-info-name').textContent = boss.name;
    document.getElementById('boss-info-hp').textContent = `${boss.hp} / ${boss.max_hp}`;
    document.getElementById('boss-info-dmg').textContent = boss.dmg;
    document.getElementById('boss-info-weakness').textContent = translateElement(boss.weakness);
    const rewardText = formatBossReward(boss);
    document.getElementById('boss-info-reward').textContent = rewardText;

    document.getElementById('boss-preview-hp').textContent = `${boss.hp} / ${boss.max_hp}`;
    document.getElementById('boss-preview-dmg').textContent = boss.dmg;
    renderBossPreview3D(boss);

    const cardImgBlock = document.getElementById('boss-reward-card-img');
    if (cardImgBlock) {
      if (boss.reward_type === 'card' && boss.reward_detail) {
        let cards = [];
        try {
          if (boss.reward_detail.startsWith('[')) {
            cards = JSON.parse(boss.reward_detail);
          } else {
            const parts = boss.reward_detail.split('|');
            if (parts.length >= 2) {
              cards = [{ cover: parts[0], name: parts[1], char: parts[2] || '' }];
            }
          }
        } catch (e) {}

        if (cards.length > 0) {
          cardImgBlock.classList.remove('hidden');
          cardImgBlock.style.display = 'flex';
          cardImgBlock.style.flexDirection = 'column';
          cardImgBlock.style.alignItems = 'stretch';
          cardImgBlock.style.gap = '8px';
          cardImgBlock.style.background = 'transparent';
          cardImgBlock.style.border = 'none';
          cardImgBlock.style.padding = '0';
          cardImgBlock.style.marginTop = '8px';

          let html = '';
          cards.forEach(card => {
            const isWebm = card.cover && (card.cover.toLowerCase().endsWith('.webm') || card.cover.toLowerCase().includes('.webm'));
            html += `
              <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 6px; border: 1px solid rgba(255,200,0,0.2);">
                <div style="position: relative; width: 45px; height: 63px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 4px; overflow: hidden; flex-shrink: 0;">
                  <div class="image-loader-spinner" style="position: absolute; width: 16px; height: 16px; border: 2px solid rgba(0,240,255,0.1); border-radius: 50%; border-top-color: #00f0ff; animation: spin 1s linear infinite;"></div>
                  ${isWebm ? `
                    <video autoplay muted loop playsinline preload="auto" onloadstart="this.previousElementSibling.remove(); this.style.opacity='1';" onerror="this.previousElementSibling.remove();" style="width: 45px; height: 63px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); opacity: 0; transition: opacity 0.3s;">
                      <source src="${card.cover}" type="video/webm">
                    </video>
                  ` : `
                    <img src="${card.cover}" referrerpolicy="no-referrer" onload="this.previousElementSibling.remove(); this.style.opacity='1';" onerror="this.previousElementSibling.remove(); if(typeof window.handleRewardImageError === 'function') window.handleRewardImageError(this, '${card.cover}');" style="width: 45px; height: 63px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); opacity: 0; transition: opacity 0.3s;">
                  `}
                </div>
                <div>
                  <div style="font-size: 12px; color: #ffcc00; font-weight: 600; text-align: left;">${card.name}</div>
                  <div style="font-size: 10px; color: #8c9ba5; text-align: left;">${card.char || ''}</div>
                </div>
              </div>
            `;
          });
          cardImgBlock.innerHTML = html;
        } else {
          cardImgBlock.classList.add('hidden');
          cardImgBlock.style.display = 'none';
        }
      } else {
        cardImgBlock.classList.add('hidden');
        cardImgBlock.style.display = 'none';
      }
    }

    document.getElementById('boss-btn-fight').classList.remove('hidden');
    document.getElementById('boss-btn-bypass').classList.remove('hidden');
  }

  const playerOnOrPendingBoss = state.user && (
    state.user.current_cell === boss.cell_number ||
    state.user.pending_boss_cell === boss.cell_number
  );
  if (!playerOnOrPendingBoss) {
    document.getElementById('boss-btn-bypass-only').classList.add('hidden');
    document.getElementById('boss-btn-fight').classList.add('hidden');
    document.getElementById('boss-btn-bypass').classList.add('hidden');
    document.getElementById('boss-btn-attack').classList.add('hidden');
    document.getElementById('boss-btn-forfeit').classList.add('hidden');
    document.getElementById('boss-btn-close').classList.remove('hidden');
  }
}

function translateElement(el) {
  const map = {
    water: 'Вода',
    fire: 'Огонь',
    earth: 'Земля',
    wind: 'Ветер'
  };
  return map[el] || el;
}

function formatBossReward(boss) {
  const rt = boss.reward_type || 'coins';
  if (rt === 'card' && boss.reward_detail) {
    try {
      if (boss.reward_detail.startsWith('[')) {
        const cards = JSON.parse(boss.reward_detail);
        return `🃏 ${cards.map(c => c.name).join(', ')}`;
      } else {
        const parts = boss.reward_detail.split('|');
        if (parts.length >= 2) {
          return `🃏 ${parts[1]}`;
        }
      }
    } catch (e) {}
    return `🃏 ${boss.reward_detail}`;
  }
  return `${boss.reward_coins || 500} монет`;
}

let attackCooldownInterval = null;

function updateAttackCooldownUI(boss) {
  if (attackCooldownInterval) {
    clearInterval(attackCooldownInterval);
    attackCooldownInterval = null;
  }

  const lastAttackStr = state.user.last_boss_attack_time;
  if (!lastAttackStr) {
    document.getElementById('battle-cooldown-text').classList.add('hidden');
    document.getElementById('boss-btn-attack').disabled = false;
    return;
  }

  const cooldownMs = (boss.attack_cooldown_seconds || 300) * 1000;
  const lastAttackTime = new Date(lastAttackStr).getTime();

  function updateTimer() {
    const elapsed = Date.now() - lastAttackTime;
    const remaining = cooldownMs - elapsed;
    if (remaining <= 0) {
      document.getElementById('battle-cooldown-text').classList.add('hidden');
      document.getElementById('boss-btn-attack').disabled = false;
      clearInterval(attackCooldownInterval);
      attackCooldownInterval = null;
    } else {
      document.getElementById('battle-cooldown-text').classList.remove('hidden');
      document.getElementById('boss-btn-attack').disabled = true;
      const sec = Math.ceil(remaining / 1000);
      const min = Math.floor(sec / 60);
      const remSec = sec % 60;
      document.getElementById('battle-cooldown-time').textContent = `${min}м ${remSec}с`;
    }
  }

  updateTimer();
  attackCooldownInterval = setInterval(updateTimer, 1000);
}

function hideBossModal() {
  const modal = document.getElementById('boss-battle-modal');
  if (modal) modal.classList.add('hidden');
  currentOpenedBossCell = null;
  cleanupBossPreview();
}

function initBossModalEvents() {
  const modal = document.getElementById('boss-battle-modal');
  if (!modal) return;

  document.getElementById('boss-btn-close').addEventListener('click', () => {
    hideBossModal();
  });

  document.getElementById('boss-btn-bypass-only').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/boss/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.user.id })
      });
      const data = await res.json();
      if (res.ok) {
        hideBossModal();
      } else {
        showNotification(data.error || 'Ошибка', 'error');
      }
    } catch (e) {
      showNotification('Ошибка сети', 'error');
    }
  });

  document.getElementById('boss-btn-bypass').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/boss/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.user.id })
      });
      const data = await res.json();
      if (res.ok) {
        hideBossModal();
      } else {
        showNotification(data.error || 'Ошибка', 'error');
      }
    } catch (e) {
      showNotification('Ошибка сети', 'error');
    }
  });

  document.getElementById('boss-btn-fight').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/boss/start-fight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.user.id, cellNumber: currentOpenedBossCell })
      });
      if (res.ok) {
        await refreshProfile();
        await refreshBosses();
      } else {
        const data = await res.json();
        showNotification(data.error || 'Не удалось начать бой', 'error');
      }
    } catch (e) {
      showNotification('Ошибка сети', 'error');
    }
  });

  document.getElementById('boss-btn-attack').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/boss/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.user.id, cellNumber: currentOpenedBossCell })
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.error || 'Ошибка при атаке', 'error');
        return;
      }

      if (data.status === 'victory') {
        let msg = `Победа! Вы победили босса и получили ${data.reward} монет!`;
        showNotification(msg, 'success');
        hideBossModal();
        await refreshProfile();
        await refreshBosses();
        showCellInfoTag(currentOpenedBossCell);
      } else if (data.status === 'defeat') {
        const msg = data.isCrit
          ? 'Смертельный критический удар босса! Вы потеряли 300 монет и отступили назад.'
          : 'Поражение! Вы потеряли 300 монет и отступили назад.';
        showNotification(msg, 'error');
        hideBossModal();
        await refreshProfile();
        await refreshBosses();
      } else {
        const logEl = document.getElementById('battle-log');
        let matchText = data.elementMatch ? ' (Критический урон от стихии!)' : '';
        logEl.textContent = `Вы нанесли ${data.dmgDealt} урона${matchText}. Босс нанес вам ${data.bossDmg} урона.`;
        await refreshProfile();
        await refreshBosses();
      }
    } catch (e) {
      showNotification('Ошибка сети', 'error');
    }
  });

  document.getElementById('boss-btn-forfeit').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/boss/forfeit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.user.id, cellNumber: currentOpenedBossCell })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`Вы сбежали с поля боя, потеряв 300 монет.`, 'warning');
        hideBossModal();
      } else {
        showNotification(data.error || 'Не удалось сбежать', 'error');
      }
    } catch (e) {
      showNotification('Ошибка сети', 'error');
    }
  });
}

function setupAdminBossConfig() {
  const bossSelect = document.getElementById('admin-boss-select');
  const modelSelect = document.getElementById('admin-boss-model');

  fetch('/api/boss-models').then(r => r.json()).then(models => {
    if (modelSelect && Array.isArray(models)) {
      modelSelect.innerHTML = '<option value="">-- Без модели --</option>';
      models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m.replace('.glb', '');
        modelSelect.appendChild(opt);
      });
    }
  }).catch(() => { });

  let adminSelectedBossCards = [];

  const renderAdminBossCardsList = () => {
    const renderList = document.getElementById('admin-boss-cards-list');
    if (!renderList) return;
    renderList.innerHTML = '';
    adminSelectedBossCards.forEach(card => {
      const div = document.createElement('div');
      div.style.cssText = 'display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; padding: 4px 8px; font-size: 11px;';
      
      let claimText = '';
      if (card.claimed_by_username) {
        claimText = ` <span style="color:#ff4a4a; font-size:9px;">(Забрал: ${card.claimed_by_username})</span>`;
      }

      div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px; flex: 1;">
          ${getCardMediaHTML(card.cover, '', 'width: 25px; height: 35px; object-fit: cover; border-radius: 2px;')}
          <input type="text" value="${card.name}" onchange="updateAdminBossCardName('${card.id}', this.value)" style="background: transparent; border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 11px; padding: 2px 4px; border-radius: 4px; width: 120px; box-sizing: border-box; margin: 0;">
          ${claimText}
        </div>
        <button class="btn btn-danger btn-sm" style="padding: 2px 6px; font-size: 10px;" onclick="removeAdminBossCard('${card.id}')">✕</button>
      `;
      renderList.appendChild(div);
    });
  };

  window.updateAdminBossCardName = (id, newName) => {
    const card = adminSelectedBossCards.find(c => c.id === id);
    if (card) {
      card.name = newName;
    }
  };

  window.removeAdminBossCard = (id) => {
    adminSelectedBossCards = adminSelectedBossCards.filter(c => c.id !== id);
    renderAdminBossCardsList();
  };

  const loadBossFields = () => {
    const cellNum = parseInt(bossSelect.value);
    const boss = (state.bosses || []).find(b => b.cell_number === cellNum);
    if (boss) {
      const nameEl = document.getElementById('admin-boss-name');
      if (nameEl) nameEl.value = boss.name || '';
      if (modelSelect) modelSelect.value = boss.model_file || '';
      const maxHpInput = document.getElementById('admin-boss-max-hp');
      if (maxHpInput) maxHpInput.value = boss.max_hp;
      document.getElementById('admin-boss-hp').value = boss.hp;
      document.getElementById('admin-boss-dmg').value = boss.dmg;
      document.getElementById('admin-boss-cooldown').value = boss.attack_cooldown_seconds;
      document.getElementById('admin-boss-crit').value = boss.crit_chance || 0;
      document.getElementById('admin-boss-reward').value = boss.reward_coins || 500;
      const rtEl = document.getElementById('admin-boss-reward-type');
      if (rtEl) rtEl.value = boss.reward_type || 'coins';

      adminSelectedBossCards = [];
      if (boss.reward_type === 'card' && boss.reward_detail) {
        try {
          if (boss.reward_detail.startsWith('[')) {
            adminSelectedBossCards = JSON.parse(boss.reward_detail);
          } else {
            const parts = boss.reward_detail.split('|');
            adminSelectedBossCards = [{
              id: 'card_legacy',
              type: 'card',
              cover: parts[0] || '',
              name: parts[1] || boss.name + ' — Карта',
              char: parts[2] || '',
              claimed_by_user_id: null,
              claimed_by_username: null
            }];
          }
        } catch (e) {
          adminSelectedBossCards = [];
        }
      }
      renderAdminBossCardsList();

      const rdEl = document.getElementById('admin-boss-reward-detail');
      if (rdEl) rdEl.value = boss.reward_detail || '';

      toggleBossCardHelper(boss.reward_type || 'coins');
    }
  };

  const toggleBossCardHelper = (type) => {
    const helper = document.getElementById('admin-boss-card-helper');
    if (helper) {
      if (type === 'card') {
        helper.classList.remove('hidden');
      } else {
        helper.classList.add('hidden');
      }
    }
  };

  const bossRewardTypeEl = document.getElementById('admin-boss-reward-type');
  if (bossRewardTypeEl) {
    bossRewardTypeEl.addEventListener('change', () => {
      toggleBossCardHelper(bossRewardTypeEl.value);
    });
  }

  const bossCardFetchBtn = document.getElementById('admin-boss-fetch-card-btn');
  if (bossCardFetchBtn) {
    bossCardFetchBtn.addEventListener('click', async () => {
      const urlInput = document.getElementById('admin-boss-card-url');
      const url = urlInput ? urlInput.value.trim() : '';
      if (!url) {
        showNotification('Введите ссылку на карту', 'error');
        return;
      }
      try {
        bossCardFetchBtn.setAttribute('disabled', 'true');
        const res = await fetch('/api/admin/fetch-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardUrl: url, requesterUserId: state.user.id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        adminSelectedBossCards.push({
          id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          type: 'card',
          cover: data.cover,
          name: data.characterName || data.title,
          char: data.characterName,
          claimed_by_user_id: null,
          claimed_by_username: null
        });
        urlInput.value = '';
        renderAdminBossCardsList();
        showNotification('Карта босса добавлена!', 'success');
      } catch (err) {
        showNotification(err.message, 'error');
      } finally {
        bossCardFetchBtn.removeAttribute('disabled');
      }
    });
  }

  window.loadAdminBossFields = loadBossFields;
  if (bossSelect) {
    bossSelect.addEventListener('change', loadBossFields);
  }

  const bossSaveBtn = document.getElementById('admin-boss-save-btn');
  if (bossSaveBtn) {
    bossSaveBtn.addEventListener('click', async () => {
      const cellNum = parseInt(bossSelect.value);
      const name = document.getElementById('admin-boss-name').value;
      const modelFile = modelSelect ? modelSelect.value : '';
      const maxHpInput = document.getElementById('admin-boss-max-hp');
      const maxHp = maxHpInput ? parseInt(maxHpInput.value) : parseInt(document.getElementById('admin-boss-hp').value);
      const hp = parseInt(document.getElementById('admin-boss-hp').value);
      const dmg = parseInt(document.getElementById('admin-boss-dmg').value);
      const cooldown = parseInt(document.getElementById('admin-boss-cooldown').value);
      const critChance = parseInt(document.getElementById('admin-boss-crit').value) || 0;
      const reward = parseInt(document.getElementById('admin-boss-reward').value);
      const rewardType = document.getElementById('admin-boss-reward-type').value;
      const rewardDetail = rewardType === 'card' ? JSON.stringify(adminSelectedBossCards) : document.getElementById('admin-boss-reward-detail').value;

      try {
        const res = await fetch('/api/admin/boss/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cellNumber: cellNum, name, modelFile, maxHp, hp, dmg, cooldown, reward, rewardType, rewardDetail, critChance, requesterUserId: state.user.id })
        });
        if (res.ok) {
          showNotification('Настройки босса сохранены!', 'success');
          await refreshBosses();
        } else {
          const data = await res.json();
          showNotification(data.error || 'Ошибка при сохранении', 'error');
        }
      } catch (err) {
        showNotification('Ошибка сети', 'error');
      }
    });
  }

  const loadBossPositionFields = () => {
    const cellNum = parseInt(bossSelect.value);
    const boss = (state.bosses || []).find(b => b.cell_number === cellNum);
    if (boss) {
      const oxEl = document.getElementById('admin-boss-offset-x');
      const oyEl = document.getElementById('admin-boss-offset-y');
      const ozEl = document.getElementById('admin-boss-offset-z');
      const rotEl = document.getElementById('admin-boss-rotation');
      const scaleEl = document.getElementById('admin-boss-scale');
      if (oxEl) oxEl.value = boss.position_offset_x || 0;
      if (oyEl) oyEl.value = boss.position_offset_y || 0;
      if (ozEl) ozEl.value = boss.position_offset_z || 0;
      if (rotEl) rotEl.value = boss.custom_rotation !== null && boss.custom_rotation !== undefined ? Math.round(boss.custom_rotation * 180 / Math.PI) : 0;
      if (scaleEl) scaleEl.value = boss.custom_scale !== null && boss.custom_scale !== undefined ? boss.custom_scale : 1.0;
    }
  };

  window.loadAdminBossPositionFields = loadBossPositionFields;
  if (bossSelect) {
    bossSelect.addEventListener('change', loadBossPositionFields);
  }

  const posSaveBtn = document.getElementById('admin-boss-pos-save-btn');
  if (posSaveBtn) {
    posSaveBtn.addEventListener('click', async () => {
      const cellNum = parseInt(bossSelect.value);
      const offsetX = parseFloat(document.getElementById('admin-boss-offset-x').value) || 0;
      const offsetY = parseFloat(document.getElementById('admin-boss-offset-y').value) || 0;
      const offsetZ = parseFloat(document.getElementById('admin-boss-offset-z').value) || 0;
      const rotDeg = parseFloat(document.getElementById('admin-boss-rotation').value) || 0;
      const rotation = rotDeg * Math.PI / 180;
      const scale = parseFloat(document.getElementById('admin-boss-scale').value) || 1.0;

      try {
        const res = await fetch('/api/admin/boss/position', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cellNumber: cellNum, offsetX, offsetY, offsetZ, rotation, scale, requesterUserId: state.user.id })
        });
        if (res.ok) {
          showNotification('Позиция босса сохранена!', 'success');
          await refreshBosses();
        } else {
          const data = await res.json();
          showNotification(data.error || 'Ошибка', 'error');
        }
      } catch (err) {
        showNotification('Ошибка сети', 'error');
      }
    });
  }
  loadBossFields();
  loadBossPositionFields();
}

let backendUrl = 'https://patrina-unlusty-vince.ngrok-free.dev';

async function resolveBackendUrl() {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalhost && window.location.port === '3000') {
    backendUrl = '';
    return;
  }

  const cached = localStorage.getItem('ew_backend_url');
  if (cached) {
    backendUrl = cached;
  }

  try {
    const binUrl = 'https://extendsclass.com/api/json-storage/bin/ffaabaf?nocache=' + Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(binUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.backendUrl) {
        const newUrl = data.backendUrl.trim();
        if (newUrl !== backendUrl) {
          backendUrl = newUrl;
          localStorage.setItem('ew_backend_url', backendUrl);
          console.log('Backend URL dynamically resolved from storage:', backendUrl);
        }
      }
    }
  } catch (err) {
    console.error('Не удалось обновить адрес бэкенда через хранилище:', err);
  }
}

const state = {
  user: null,
  inventory: [],
  activeEffects: [],
  history: [],
  globalHistory: [],
  onlinePlayers: [],
  cells: [],
  shopItems: [],
  activeShopTab: 'buffs',
  activeTab: 'tab-cells',
  diceTimer: null,
  socket: null,
  boardScene: null,
  boardCamera: null,
  boardRenderer: null,
  boardControls: null,
  boardAnimId: null,
  boardResizeObserver: null,
  boardPlayers: new Map(),
  tileObjects: [],
  floatingIcons: [],
  taggedPlayer: null,
  creator: {
    scene: null,
    camera: null,
    renderer: null,
    group: null,
    controls: null
  },
  drawerPreview: {
    scene: null,
    camera: null,
    renderer: null,
    group: null,
    controls: null
  },
  pathObjects: [],
  cellInfoTimeout: null,
  usernameTimeout: null,
  diceRolling: false,
  pendingSelfMove: null
};

function showNotification(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;

  let icon = '🔔';
  if (type === 'success') icon = '✅';
  else if (type === 'error') icon = '❌';
  else if (type === 'info') icon = 'ℹ️';

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">${message}</div>
  `;

  container.appendChild(toast);
  toast.offsetHeight;
  toast.classList.add('show');

  const removeToast = () => {
    toast.classList.add('hide');
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  };

  const timer = setTimeout(removeToast, 3500);

  toast.addEventListener('click', () => {
    clearTimeout(timer);
    removeToast();
  });
}

window.alert = (message) => {
  let type = 'info';
  const msgLower = String(message).toLowerCase();
  if (msgLower.includes('ошибка') || msgLower.includes('не удалось') || msgLower.includes('недостаточно') || msgLower.includes('вы заморожены') || msgLower.includes('не можете') || msgLower.includes('не найдена') || msgLower.includes('неверный') || msgLower.includes('заблокирован') || msgLower.includes('занят') || msgLower.includes('закончил')) {
    type = 'error';
  } else if (msgLower.includes('успешно') || msgLower.includes('создан') || msgLower.includes('куплен') || msgLower.includes('активирован') || msgLower.includes('обновлены')) {
    type = 'success';
  }
  showNotification(message, type);
};

function proxyTouchEvent(e, targetElement) {
  const joystickEl = document.getElementById('mobile-joystick-container');
  if (!joystickEl) return e;
  if (joystickEl.contains(targetElement)) return e;

  const filteredTouches = Array.from(e.touches || []).filter(t => !joystickEl.contains(t.target));
  const filteredTargetTouches = Array.from(e.targetTouches || []).filter(t => !joystickEl.contains(t.target));
  const filteredChangedTouches = Array.from(e.changedTouches || []).filter(t => !joystickEl.contains(t.target));

  return new Proxy(e, {
    get(target, prop) {
      if (prop === 'touches') return filteredTouches;
      if (prop === 'targetTouches') return filteredTargetTouches;
      if (prop === 'changedTouches') return filteredChangedTouches;

      const val = target[prop];
      if (typeof val === 'function') {
        return val.bind(target);
      }
      return val;
    }
  });
}

const originalAddEvent = EventTarget.prototype.addEventListener;
const originalRemoveEvent = EventTarget.prototype.removeEventListener;

EventTarget.prototype.addEventListener = function (type, listener, options) {
  if (type.startsWith('touch')) {
    const self = this;
    const wrapped = function (e) {
      listener(proxyTouchEvent(e, self));
    };
    if (!listener._wrappedListeners) {
      listener._wrappedListeners = [];
    }
    listener._wrappedListeners.push({ target: this, wrapped });
    originalAddEvent.call(this, type, wrapped, options);
  } else {
    originalAddEvent.call(this, type, listener, options);
  }
};

EventTarget.prototype.removeEventListener = function (type, listener, options) {
  if (type.startsWith('touch') && listener._wrappedListeners) {
    const idx = listener._wrappedListeners.findIndex(x => x.target === this);
    if (idx !== -1) {
      const { wrapped } = listener._wrappedListeners[idx];
      originalRemoveEvent.call(this, type, wrapped, options);
      listener._wrappedListeners.splice(idx, 1);
      return;
    }
  }
  originalRemoveEvent.call(this, type, listener, options);
};

const keysPressed = {};
const joystickInput = { x: 0, y: 0 };

function initJoystick() {
  const container = document.getElementById('mobile-joystick-container');
  const dot = document.getElementById('mobile-joystick-dot');
  if (!container || !dot) return;

  let active = false;
  let startX = 0;
  let startY = 0;
  let touchId = null;
  const maxDistance = 35;

  function updateJoystickPosition(touch) {
    let dx = touch.clientX - startX;
    let dy = touch.clientY - startY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance;
      dy = (dy / distance) * maxDistance;
    }

    dot.style.transform = `translate(${dx}px, ${dy}px)`;

    joystickInput.x = dx / maxDistance;
    joystickInput.y = dy / maxDistance;
  }

  function handleStart(e) {
    if (active) return;

    let touch = null;
    if (e.changedTouches && e.changedTouches.length > 0) {
      touch = e.changedTouches[0];
      touchId = touch.identifier;
    } else if (e.touches && e.touches.length > 0) {
      touch = e.touches[0];
      touchId = touch.identifier;
    } else {
      touch = e;
    }

    active = true;
    const rect = container.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
    updateJoystickPosition(touch);
  }

  function handleMove(e) {
    if (!active) return;

    let touch = null;
    if (e.touches && touchId !== null) {
      touch = Array.from(e.touches).find(t => t.identifier === touchId);
    } else if (!e.touches) {
      touch = e;
    }

    if (!touch) return;
    updateJoystickPosition(touch);
  }

  function handleEnd(e) {
    if (!active) return;

    let ended = false;
    if (e.changedTouches && touchId !== null) {
      ended = Array.from(e.changedTouches).some(t => t.identifier === touchId);
    } else if (!e.changedTouches) {
      ended = true;
    }

    if (ended) {
      active = false;
      touchId = null;
      dot.style.transform = 'translate(0px, 0px)';
      joystickInput.x = 0;
      joystickInput.y = 0;
    }
  }

  container.addEventListener('touchstart', handleStart, { passive: true });
  container.addEventListener('touchmove', handleMove, { passive: true });
  container.addEventListener('touchend', handleEnd, { passive: true });
  container.addEventListener('touchcancel', handleEnd, { passive: true });

  container.addEventListener('mousedown', handleStart);
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);
}
window.addEventListener('keydown', (e) => {
  if (e && e.key) {
    keysPressed[e.key.toLowerCase()] = true;
  }
});
window.addEventListener('keyup', (e) => {
  if (e && e.key) {
    keysPressed[e.key.toLowerCase()] = false;
  }
});

const TILE_SPACING = 3.5;
const GRID_COLS = 20;

function getTilePosition(index) {
  const row = Math.floor(index / GRID_COLS);
  const rem = index % GRID_COLS;
  const col = (row % 2 === 0) ? rem : (GRID_COLS - 1 - rem);

  return {
    x: (col - GRID_COLS / 2) * TILE_SPACING,
    y: 0,
    z: (row - 7.5) * TILE_SPACING
  };
}

function updateTilePositions() {
  const playersPerCell = new Array(300).fill(0);
  (state.players || []).forEach(p => {
    if (p.current_cell >= 0 && p.current_cell < 300) {
      const pObj = state.boardPlayers.get(String(p.id));
      const cell = (pObj && pObj.animating && pObj.currentCell !== undefined) ? pObj.currentCell : p.current_cell;
      if (cell >= 0 && cell < 300) {
        playersPerCell[cell]++;
      }
    }
  });

  const scales = new Array(300).fill(1);
  for (let i = 0; i < 300; i++) {
    const count = playersPerCell[i];
    if (count > 1) {
      scales[i] = 1 + (count - 1) * 0.25;
    }
  }

  const positions = new Array(300);
  const GRID_ROWS = 15;

  const colWidths = new Array(GRID_COLS).fill(TILE_SPACING);
  const rowHeights = new Array(GRID_ROWS).fill(TILE_SPACING);

  function getGridCoord(index) {
    const row = Math.floor(index / GRID_COLS);
    const rem = index % GRID_COLS;
    const col = (row % 2 === 0) ? rem : (GRID_COLS - 1 - rem);
    return { col, row };
  }

  for (let i = 0; i < 300; i++) {
    const coord = getGridCoord(i);
    const size = TILE_SPACING * scales[i];
    colWidths[coord.col] = Math.max(colWidths[coord.col], size);
    rowHeights[coord.row] = Math.max(rowHeights[coord.row], size);
  }

  const colLeft = new Array(GRID_COLS);
  colLeft[0] = 0;
  for (let c = 1; c < GRID_COLS; c++) {
    colLeft[c] = colLeft[c - 1] + (colWidths[c - 1] + colWidths[c]) / 2;
  }

  const rowTop = new Array(GRID_ROWS);
  rowTop[0] = 0;
  for (let r = 1; r < GRID_ROWS; r++) {
    rowTop[r] = rowTop[r - 1] + (rowHeights[r - 1] + rowHeights[r]) / 2;
  }

  const totalWidth = colLeft[GRID_COLS - 1];
  const totalHeight = rowTop[GRID_ROWS - 1];

  for (let i = 0; i < 300; i++) {
    const coord = getGridCoord(i);
    positions[i] = {
      x: colLeft[coord.col] - totalWidth / 2,
      y: 0,
      z: rowTop[coord.row] - totalHeight / 2
    };
  }

  return { positions, scales, playersPerCell };
}

function layoutBoardElements() {
  if (!state.boardScene || !state.tileObjects || state.tileObjects.length === 0) return;

  const { positions, scales } = updateTilePositions();

  for (let i = 0; i < 300; i++) {
    const tile = state.tileObjects[i];
    if (tile) {
      const pos = positions[i];
      tile.position.set(pos.x, pos.y, pos.z);
      tile.scale.set(scales[i], 1, scales[i]);
    }

    const icon = state.floatingIcons[i];
    if (icon) {
      const pos = positions[i];
      icon.position.x = pos.x;
      icon.position.z = pos.z;
    }
  }

  const cellPlayerIndex = {};
  for (const player of (state.players || [])) {
    const idStr = String(player.id);
    const pObj = state.boardPlayers.get(idStr);
    let cell = player.current_cell;
    if (pObj) {
      if (pObj.animating && pObj.currentCell !== undefined) {
        cell = pObj.currentCell;
      } else if (idStr === String(state.user?.id) && state.diceRolling && pObj.currentCell !== undefined) {
        cell = pObj.currentCell;
      }
    }
    if (cell >= 0 && cell < 300) {
      if (!cellPlayerIndex[cell]) cellPlayerIndex[cell] = [];
      cellPlayerIndex[cell].push(idStr);
    }
  }

  for (const cell in cellPlayerIndex) {
    const playerIds = cellPlayerIndex[cell];
    const N = playerIds.length;
    const pos = positions[cell];
    const scale = scales[cell];

    playerIds.forEach((idStr, index) => {
      const playerObj = state.boardPlayers.get(idStr);
      if (playerObj && !playerObj.animating) {
        if (N === 1) {
          playerObj.mesh.position.set(pos.x, pos.y, pos.z);
        } else {
          const angle = (index / N) * 2 * Math.PI;
          const radius = 0.55 * scale;
          playerObj.mesh.position.set(
            pos.x + Math.cos(angle) * radius,
            pos.y,
            pos.z + Math.sin(angle) * radius
          );
        }
      }
    });
  }
  buildBoardPaths();
}

function getTilePositionOfCell(cellIndex, positions) {
  if (positions && positions[cellIndex]) {
    return positions[cellIndex];
  }
  return getTilePosition(cellIndex);
}

function createTileMaterials(i, baseColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 128, 128);

  ctx.font = 'bold 36px Orbitron, Montserrat, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(i), 64, 64);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 124, 124);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const isBossCell = (i > 0 && i % 30 === 0) || i === 299;
  const emissiveColor = isBossCell ? new THREE.Color(baseColor) : new THREE.Color('#000000');
  const emissiveIntensity = isBossCell ? 0.85 : 0;

  const sideMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.4,
    metalness: 0.1,
    emissive: emissiveColor,
    emissiveIntensity: emissiveIntensity
  });

  const topMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    metalness: 0.1,
    emissive: emissiveColor,
    emissiveIntensity: emissiveIntensity
  });

  return [
    sideMat,
    sideMat,
    topMat,
    sideMat,
    sideMat,
    sideMat
  ];
}

function buildBoardPaths() {
  if (state.pathObjects) {
    state.pathObjects.forEach(obj => state.boardScene.remove(obj));
  }
  state.pathObjects = [];

  if (!state.boardScene) return;

  const { positions } = updateTilePositions();

  const trackPoints = [];
  for (let i = 0; i < 300; i++) {
    const pos = positions[i];
    trackPoints.push(new THREE.Vector3(pos.x, pos.y - 0.15, pos.z));
  }
  const trackGeo = new THREE.BufferGeometry().setFromPoints(trackPoints);
  const trackMat = new THREE.LineBasicMaterial({
    color: '#00f0ff',
    transparent: true,
    opacity: 0.4
  });
  const trackLine = new THREE.Line(trackGeo, trackMat);
  state.boardScene.add(trackLine);
  state.pathObjects.push(trackLine);

  const regularConeGeo = new THREE.ConeGeometry(0.08, 0.22, 5);
  const regularConeMat = new THREE.MeshStandardMaterial({
    color: '#00f0ff',
    roughness: 0.4,
    metalness: 0.1,
    transparent: true,
    opacity: 0.7
  });

  for (let i = 0; i < 299; i++) {
    const startPos = positions[i];
    const endPos = positions[i + 1];
    const dir = new THREE.Vector3().subVectors(endPos, startPos);
    dir.y = 0;
    dir.normalize();
    const mid = new THREE.Vector3().copy(endPos).addScaledVector(dir, -1.35);
    mid.y = -0.15;
    const cone = new THREE.Mesh(regularConeGeo, regularConeMat);
    cone.position.copy(mid);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    state.boardScene.add(cone);
    state.pathObjects.push(cone);
  }

  for (let i = 0; i < 300; i++) {
    const cellData = state.cells[i];
    if (!cellData || cellData.type === 'normal') continue;

    const startPos = positions[i];
    let targetIndex = i;
    let color = '#2ecc71';

    if (cellData.type === 'forward') {
      targetIndex = Math.min(299, i + cellData.value);
      color = '#2ecc71';
    } else if (cellData.type === 'backward') {
      targetIndex = Math.max(0, i - cellData.value);
      color = '#e74c3c';
    } else {
      continue;
    }

    if (targetIndex === i) continue;

    const endPos = positions[targetIndex];

    const dir = new THREE.Vector3().subVectors(endPos, startPos);
    dir.y = 0;
    const dist = dir.length();
    dir.normalize();

    const pStart = new THREE.Vector3().copy(startPos).addScaledVector(dir, 1.25);
    const pEnd = new THREE.Vector3().copy(endPos).addScaledVector(dir, -1.25);
    pStart.y = 0.16;
    pEnd.y = 0.16;

    const pMid = new THREE.Vector3().addVectors(pStart, pEnd).multiplyScalar(0.5);
    pMid.y += Math.max(2, dist * 0.25);

    const curve = new THREE.QuadraticBezierCurve3(pStart, pMid, pEnd);
    const curvePoints = curve.getPoints(20);

    const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMat = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });
    const curveLine = new THREE.Line(curveGeo, curveMat);
    state.boardScene.add(curveLine);
    state.pathObjects.push(curveLine);

    const tangent = new THREE.Vector3().subVectors(pEnd, pMid).normalize();
    const coneGeo = new THREE.ConeGeometry(0.18, 0.45, 8);
    const coneMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.4,
      metalness: 0.1
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.copy(pEnd);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    state.boardScene.add(cone);
    state.pathObjects.push(cone);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await resolveBackendUrl();
  await initAuth();
  setupUI();
  setupAdminTabs();
  initJoystick();
});

let tgAuthPollingInterval = null;

async function initAuth() {
  const savedUser = localStorage.getItem('ew_event_user');
  if (savedUser) {
    try {
      const userObj = JSON.parse(savedUser);
      const res = await fetch(`/api/profile/${userObj.id}`);
      if (!res.ok) {
        if (res.status === 404) {
          console.warn('Текущий пользователь не найден в БД. Сброс сессии.');
          localStorage.removeItem('ew_event_user');
          state.user = null;
          checkOnboardingStage(null);
          return;
        }
      }
      const data = await res.json();
      state.user = data.user;
      localStorage.setItem('ew_event_user', JSON.stringify(data.user));
      checkOnboardingStage(state.user);
    } catch (e) {
      console.error('Ошибка проверки сессии при старте:', e);
      state.user = JSON.parse(savedUser);
      checkOnboardingStage(state.user);
    }
  } else {
    checkOnboardingStage(null);
  }

  const tgAuthBtn = document.getElementById('tg-bot-auth-btn');
  if (tgAuthBtn) {
    tgAuthBtn.addEventListener('click', startTelegramBotAuth);
  }

  const toggleBtn = document.getElementById('toggle-demo-btn');
  const demoFields = document.getElementById('demo-auth-fields');
  if (toggleBtn && demoFields) {
    toggleBtn.addEventListener('click', () => {
      if (demoFields.style.display === 'none') {
        demoFields.style.display = 'flex';
        toggleBtn.textContent = 'Скрыть демо-режим';
      } else {
        demoFields.style.display = 'none';
        toggleBtn.textContent = 'Войти в демо-режиме (для тестирования)';
      }
    });
  }

  const authBtn = document.getElementById('auth-btn');
  if (authBtn) {
    authBtn.addEventListener('click', async () => {
      const tgIdInput = document.getElementById('tg-id-input');
      const tgUsernameInput = document.getElementById('tg-username-input');
      const tgFirstNameInput = document.getElementById('tg-first-name-input');
      if (!tgIdInput || !tgFirstNameInput) return;

      const tgId = tgIdInput.value.trim();
      const username = tgUsernameInput ? tgUsernameInput.value.trim() : '';
      const firstName = tgFirstNameInput.value.trim();

      if (!tgId || !firstName) {
        showNotification('Пожалуйста, заполните Telegram ID и Имя', 'error');
        return;
      }

      try {
        const res = await fetch('/api/auth/telegram-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tg_id: tgId, username, first_name: firstName })
        });

        if (!res.ok) {
          throw new Error('Ошибка авторизации');
        }

        const data = await res.json();
        state.user = data.user;
        localStorage.setItem('ew_event_user', JSON.stringify(data.user));
        checkOnboardingStage(state.user);
      } catch (err) {
        showNotification(err.message, 'error');
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('ew_event_user');
      if (state.socket) {
        state.socket.disconnect();
      }
      location.reload();
    });
  }
}

async function callApi(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  if (!res.ok) {
    let errMsg = `Ошибка сервера (${res.status})`;
    try {
      const errJson = JSON.parse(text);
      errMsg = errJson.error || errMsg;
    } catch (e) {
      errMsg += `: ${text.substring(0, 150)}`;
    }
    throw new Error(errMsg);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Ответ сервера не является JSON. Получено:\n${text.substring(0, 300)}`);
  }
}

async function startTelegramBotAuth() {
  const btn = document.getElementById('tg-bot-auth-btn');
  const statusEl = document.getElementById('tg-auth-status');

  let newWindow = null;
  try {
    newWindow = window.open('about:blank', '_blank');
  } catch (e) {
    console.error(e);
  }

  try {
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-1.97 9.28c-.15.67-.54.83-1.09.52l-3.02-2.23-1.46 1.4c-.16.16-.3.3-.61.3l.22-3.07 5.56-5.02c.24-.22-.05-.33-.38-.13L8.69 13.7l-2.98-.93c-.65-.2-.66-.65.14-.96l11.64-4.49c.54-.19 1.01.13.84.96l-.39-.15z"/></svg> Подождите...';

    const data = await callApi('/api/auth/telegram-start', { method: 'POST' });
    const { token, botLink } = data;

    if (newWindow) {
      newWindow.location.href = botLink;
    } else {
      window.location.href = botLink;
    }

    statusEl.style.display = 'block';
    statusEl.innerHTML = '⏳ Нажмите <b>Start</b> в боте Telegram и вернитесь сюда. Авторизация произойдёт автоматически...';

    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-1.97 9.28c-.15.67-.54.83-1.09.52l-3.02-2.23-1.46 1.4c-.16.16-.3.3-.61.3l.22-3.07 5.56-5.02c.24-.22-.05-.33-.38-.13L8.69 13.7l-2.98-.93c-.65-.2-.66-.65.14-.96l11.64-4.49c.54-.19 1.01.13.84.96l-.39-.15z"/></svg> Ожидание авторизации...';

    if (tgAuthPollingInterval) clearInterval(tgAuthPollingInterval);

    let attempts = 0;
    const maxAttempts = 150;

    tgAuthPollingInterval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(tgAuthPollingInterval);
        tgAuthPollingInterval = null;
        resetTgAuthButton();
        statusEl.style.display = 'none';
        showNotification('Время авторизации истекло. Попробуйте снова.', 'error');
        return;
      }

      try {
        const checkData = await callApi(`/api/auth/telegram-check/${token}`);

        if (checkData.status === 'completed' && checkData.user) {
          clearInterval(tgAuthPollingInterval);
          tgAuthPollingInterval = null;

          state.user = checkData.user;
          localStorage.setItem('ew_event_user', JSON.stringify(checkData.user));
          statusEl.innerHTML = '✅ Авторизация успешна!';

          showNotification(`Добро пожаловать, ${checkData.user.tg_first_name}!`, 'success');

          setTimeout(() => {
            checkOnboardingStage(state.user);
          }, 500);
        } else if (checkData.status === 'not_allowed') {
          clearInterval(tgAuthPollingInterval);
          tgAuthPollingInterval = null;
          resetTgAuthButton();
          statusEl.style.display = 'none';
          showNotification(checkData.error || 'Регистрация недоступна — вы не состоите в нужной группе.', 'error');
        } else if (checkData.status === 'expired') {
          clearInterval(tgAuthPollingInterval);
          tgAuthPollingInterval = null;
          resetTgAuthButton();
          statusEl.style.display = 'none';
          showNotification('Токен истёк. Нажмите кнопку заново.', 'error');
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);

  } catch (err) {
    if (newWindow) {
      try {
        newWindow.close();
      } catch (e) { }
    }
    showNotification(err.message, 'error');
    resetTgAuthButton();
    statusEl.style.display = 'none';
  }
}

function resetTgAuthButton() {
  const btn = document.getElementById('tg-bot-auth-btn');
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-1.97 9.28c-.15.67-.54.83-1.09.52l-3.02-2.23-1.46 1.4c-.16.16-.3.3-.61.3l.22-3.07 5.56-5.02c.24-.22-.05-.33-.38-.13L8.69 13.7l-2.98-.93c-.65-.2-.66-.65.14-.96l11.64-4.49c.54-.19 1.01.13.84.96l-.39-.15z"/></svg> Войти через Telegram';
  }
}

function showWizardStep(stepNumber) {
  const step1 = document.getElementById('creator-step-1');
  const step2 = document.getElementById('creator-step-2');
  const step3 = document.getElementById('creator-step-3');
  const title = document.getElementById('creator-step-title');

  if (step1 && step2 && step3 && title) {
    step1.classList.add('hidden');
    step2.classList.add('hidden');
    step3.classList.add('hidden');

    document.getElementById(`creator-step-${stepNumber}`).classList.remove('hidden');
    title.textContent = `Создание персонажа (Шаг ${stepNumber} из 3)`;
  }
}

function checkOnboardingStage(user) {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('link-remanga-screen').classList.add('hidden');
  document.getElementById('character-creator-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.add('hidden');

  if (!user) {
    document.getElementById('auth-screen').classList.remove('hidden');
    return;
  }

  if (!user.remanga_user_id) {
    document.getElementById('link-remanga-screen').classList.remove('hidden');
    return;
  }

  if (!user.character_data) {
    document.getElementById('character-creator-screen').classList.remove('hidden');
    showWizardStep(1);
    initCreator3D();
    return;
  }

  document.getElementById('app-screen').classList.remove('hidden');
  destroyCreator3D();
  initGameComponents();
}

let isInitialProfileLoad = true;
let gameInitialized = false;
async function initGameComponents() {
  if (gameInitialized) return;
  gameInitialized = true;

  try {
    initSocket();
  } catch (e) {
    console.error(e);
  }
  try {
    await loadCells();
  } catch (e) {
    console.error(e);
  }
  try {
    initBoard3D();
  } catch (e) {
    console.error(e);
  }
  try {
    initBossModalEvents();
    await refreshBosses();
    setInterval(() => {
      refreshBosses();
    }, 5000);
  } catch (e) {
    console.error(e);
  }
  try {
    if (state.user && state.user.is_admin) {
      setupAdminBossConfig();
      const bSel = document.getElementById('admin-boss-select');
      if (bSel) bSel.dispatchEvent(new Event('change'));
    }
  } catch (e) {
    console.error(e);
  }
  try {
    const res = await fetch('/api/history/global');
    if (res.ok) {
      state.globalHistory = await res.json();
      state.allHistoryLoaded = false;
      updateGlobalHistoryUI();
    }
  } catch (e) {
    console.error(e);
  }
  try {
    await refreshProfile();
  } catch (e) {
    console.error(e);
  }
  try {
    if (state.user && state.user.guild_tax_required && state.user.guild_tax_required > (state.user.guild_tax_paid || 0)) {
      showGuildTaxModal(state.user.guild_tax_required, state.user.current_cell);
    }
  } catch (e) {
    console.error(e);
  }
  try {
    await loadShop();
  } catch (e) {
    console.error(e);
  }
  try {
    if (state.user && state.user.is_admin) {
      document.getElementById('admin-panel').classList.remove('hidden');
      loadAdminUsers();
      loadAdminSettings();
      setInterval(() => {
        loadAdminUsers();
        loadAdminSettings();
      }, 2000);
    }
  } catch (e) {
    console.error(e);
  }
}

function performSelfMovement(moveData) {
  if (!moveData) return;
  animatePlayerMovement(moveData);
  setTimeout(() => {
    refreshProfile().then(() => {
      const isBoss = (moveData.endCell > 0 && moveData.endCell % 30 === 0) || moveData.endCell === 299;
      if (isBoss) {
        checkAndShowBossModal(moveData.endCell);
      } else {
        const cell = state.cells ? state.cells[moveData.endCell] : null;
        if (cell && cell.type === 'guild_tax') {
          showGuildTaxModal(cell.value, moveData.endCell);
        }
      }
    });
    if (moveData.rewardTriggered && moveData.rewardTriggered.type && moveData.rewardTriggered.type !== 'none') {
      if (moveData.rewardTriggered.type === 'multi') {
        showMultiRewardChoiceModal(moveData.rewardTriggered);
      } else if (moveData.rewardTriggered.type === 'card' || moveData.rewardTriggered.type === 'premium') {
        showRewardChoiceModal(moveData.rewardTriggered);
      } else {
        showRewardPopup(moveData.rewardTriggered);
      }
    }
    if (state.boardScene) {
      updateBoardPlayers();
    }
  }, moveData.path.length * 300 + 500);
}

function initSocket() {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const socketUrl = backendUrl || undefined;
  const options = {};
  if (isLocal) {
    options.transports = ['polling', 'websocket'];
  } else {
    options.transports = ['websocket'];
  }
  state.socket = io(socketUrl, options);

  let heartbeatInterval = null;
  let lastSentHeartbeat = 0;

  const startHeartbeat = () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
      if (state.socket && state.socket.connected && state.user) {
        state.socket.emit('heartbeat');
      }
    }, 15000);
  };

  const sendHeartbeatNow = () => {
    const now = Date.now();
    if (now - lastSentHeartbeat > 5000) {
      if (state.socket && state.socket.connected && state.user) {
        state.socket.emit('heartbeat');
        lastSentHeartbeat = now;
      }
    }
  };

  document.addEventListener('click', sendHeartbeatNow);
  document.addEventListener('touchstart', sendHeartbeatNow);

  state.socket.on('connect', () => {
    state.socket.emit('authenticate', { userId: state.user.id });
    startHeartbeat();
  });

  state.socket.on('disconnect', () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.socket) {
      if (!state.socket.connected) {
        state.socket.connect();
      } else {
        state.socket.emit('authenticate', { userId: state.user.id });
        sendHeartbeatNow();
      }
    }
  });
  state.socket.on('bosses_update', (list) => {
    state.bosses = list;
    if (state.tileObjects && state.tileObjects.length > 0) {
      highlightCurrentCell();
      loadBossModels();
      updateBossMeshes();
      if (currentOpenedBossCell !== null) {
        const currentBoss = list.find(b => b.cell_number === currentOpenedBossCell);
        if (currentBoss) {
          updateBossModalUI(currentBoss);
        }
      }
      if (state.selectedCellInfo) {
        showCellInfoTag(state.selectedCellInfo.cellIndex);
      }
    }
    if (typeof window.loadAdminBossFields === 'function') {
      window.loadAdminBossFields();
    }
    if (typeof window.loadAdminBossPositionFields === 'function') {
      window.loadAdminBossPositionFields();
    }
  });

  state.socket.on('players_list', (list) => {
    state.players = list;
    updateOnlineList();
    updateBoardPlayers();
  });

  state.socket.on('player_move', (moveData) => {
    addMovementLog(moveData);
    const p = (state.players || []).find(x => String(x.id) === String(moveData.userId));
    if (p) {
      p.current_cell = moveData.endCell;
    }

    if (String(moveData.userId) === String(state.user.id)) {
      if (state.diceRolling) {
        state.pendingSelfMove = moveData;
      } else {
        performSelfMovement(moveData);
      }
    } else {
      animatePlayerMovement(moveData);
    }
  });

  state.socket.on('balance_update', (data) => {
    if (data.balance !== undefined) {
      state.user.balance = data.balance;
      updateDOMBalance(data.balance);
    }
    if (data.guild_tax_required !== undefined) {
      state.user.guild_tax_required = data.guild_tax_required;
    }
    if (data.guild_tax_paid !== undefined) {
      state.user.guild_tax_paid = data.guild_tax_paid;
      const modal = document.getElementById('guild-tax-modal');
      if (modal && !modal.classList.contains('hidden')) {
        document.getElementById('tax-paid-span').textContent = data.guild_tax_paid;
        document.getElementById('tax-total-span').textContent = data.guild_tax_required;
        if (data.guild_tax_required === 0 && data.guild_tax_paid === 0) {
          modal.classList.add('hidden');
          showNotification('Налог гильдии успешно оплачен! Теперь вы можете продолжать игру.', 'success');
        }
      }
    }
    if (data.dice_cooldown_until !== undefined) {
      state.user.dice_cooldown_until = data.dice_cooldown_until;
      updateDiceButton();
    }
    if (data.historyEntry) {
      addPersonalHistoryItem(data.historyEntry);
    }
  });

  state.socket.on('effect_notification', (data) => {
    showNotification(data.message, 'info');
    refreshProfile();
  });

  state.socket.on('cells_update', (cells) => {
    state.cells = cells;
    updateFloatingIcons();
    if (state.selectedCellInfo) {
      showCellInfoTag(state.selectedCellInfo.cellIndex);
    }
  });

  state.socket.on('settings_update', () => {
    loadShop();
    if (state.activeShopTab === 'equipment') {
      renderEquipmentShop();
    }
  });

  state.socket.on('global_history', (history) => {
    if (!state.globalHistory) {
      state.globalHistory = history;
    } else {
      const existingIds = new Set(state.globalHistory.map(item => item.id));
      const newItems = history.filter(item => !existingIds.has(item.id));
      if (newItems.length > 0) {
        state.globalHistory = [...newItems, ...state.globalHistory];
      }
    }
    updateGlobalHistoryUI();
  });

  state.socket.on('pvp_match_found', (duel) => {
    document.getElementById('pvp-lobby-modal').classList.remove('hidden');
    renderDuelState(duel);
  });

  state.socket.on('pvp_update', (duel) => {
    renderDuelState(duel);
  });

  state.socket.on('pvp_start', (duel) => {
    renderDuelState(duel);
  });

  state.socket.on('pvp_turn', (data) => {
    const duel = data.duel;
    const roll = data.roll;
    const rollerId = data.rollerId;
    const diceArea = document.getElementById('pvp-dice-area');
    if (diceArea) {
      diceArea.textContent = '🎲';
      let count = 0;
      const interval = setInterval(() => {
        diceArea.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][Math.floor(Math.random() * 6)];
        count++;
        if (count > 6) {
          clearInterval(interval);
          const diceMap = ['⚀','⚁','⚂','⚃','⚄','⚅'];
          diceArea.textContent = diceMap[roll - 1] || '🎲';
        }
      }, 100);
    }
    const p1 = duel.player1;
    const p2 = duel.player2;
    const roller = (p1.id === parseInt(rollerId)) ? p1 : p2;
    const target = (p1.id === parseInt(rollerId)) ? p2 : p1;
    addDuelLog(`${roller.name} выбросил ${roll} и нанес ${roll} урона по ${target.name}!`);
    setTimeout(() => {
      renderDuelState(duel);
    }, 800);
  });

  state.socket.on('pvp_finished', (data) => {
    if (data.timeout) {
      const winnerId = data.winnerId;
      if (state.user.id === parseInt(winnerId)) {
        showNotification('Техническая победа! Соперник не вернулся за 30 минут.', 'success');
      } else {
        showNotification('Техническое поражение из-за долгого дисконнекта.', 'error');
      }
      refreshProfile();
      checkActiveDuel();
      return;
    }
    const duel = data.duel;
    const roll = data.roll;
    const rollerId = data.rollerId;
    const diceArea = document.getElementById('pvp-dice-area');
    if (diceArea) {
      const diceMap = ['⚀','⚁','⚂','⚃','⚄','⚅'];
      diceArea.textContent = diceMap[roll - 1] || '🎲';
    }
    const p1 = duel.player1;
    const p2 = duel.player2;
    const roller = (p1.id === parseInt(rollerId)) ? p1 : p2;
    const target = (p1.id === parseInt(rollerId)) ? p2 : p1;
    addDuelLog(`${roller.name} выбросил ${roll} и нанес смертельный урон!`);
    setTimeout(() => {
      renderDuelState(duel);
      refreshProfile();
    }, 1000);
  });

  state.socket.on('pvp_invite_received', (data) => {
    const inviteText = document.getElementById('pvp-invite-text');
    if (inviteText) {
      inviteText.textContent = `Игрок ${data.initiatorName} вызывает вас на дуэль на карты! Примите вызов?`;
    }
    const modal = document.getElementById('pvp-invite-modal');
    if (modal) {
      modal.setAttribute('data-initiator-id', data.initiatorId);
      modal.classList.remove('hidden');
    }
  });

  state.socket.on('pvp_invite_declined', () => {
    showNotification('Соперник отклонил ваш вызов на дуэль.', 'info');
  });
}

async function loadCells() {
  try {
    const res = await fetch('/api/board/config');
    const data = await res.json();
    state.cells = data.cells;
  } catch (err) {

  }
}

async function refreshProfile() {
  try {
    const res = await fetch(`/api/profile/${state.user.id}`);
    if (res.status === 404) {
      localStorage.removeItem('ew_event_user');
      location.reload();
      return;
    }
    if (!res.ok) throw new Error();
    const data = await res.json();

    state.user = data.user;
    state.inventory = data.inventory;
    state.activeEffects = data.activeEffects;
    state.history = data.history;

    localStorage.setItem('ew_event_user', JSON.stringify(state.user));

    document.getElementById('user-display-name').textContent = state.user.tg_first_name || 'Без имени';
    document.getElementById('user-tg-username').textContent = state.user.tg_username ? `@${state.user.tg_username}` : '';
    updateDOMBalance(state.user.balance);
    document.getElementById('user-wins').textContent = state.user.wins;
    if (state.tileObjects && state.tileObjects.length > 0) {
      highlightCurrentCell();
    }

    const avatarImg = document.getElementById('user-avatar');
    const avatarFallback = document.getElementById('avatar-fallback');
    if (avatarImg && avatarFallback) {
      loadAvatar(avatarImg, avatarFallback, state.user);
    }

    const drawerAvatarImg = document.getElementById('drawer-avatar-img');
    const drawerAvatarFallback = document.getElementById('drawer-avatar-fallback');
    if (drawerAvatarImg && drawerAvatarFallback) {
      loadAvatar(drawerAvatarImg, drawerAvatarFallback, state.user);
    }

    const drawerDispName = document.getElementById('drawer-display-name');
    if (drawerDispName) {
      drawerDispName.textContent = state.user.tg_first_name || 'Без имени';
    }
    const drawerTgUser = document.getElementById('drawer-tg-username');
    if (drawerTgUser) {
      drawerTgUser.textContent = state.user.tg_username ? `@${state.user.tg_username}` : '';
    }

    const drawerWins = document.getElementById('drawer-wins');
    if (drawerWins) {
      drawerWins.textContent = state.user.wins;
    }
    const drawerRemName = document.getElementById('drawer-remanga-name');
    if (drawerRemName) {
      drawerRemName.textContent = state.user.remanga_username || '-';
    }
    const drawerRemId = document.getElementById('drawer-remanga-id');
    if (drawerRemId) {
      drawerRemId.textContent = state.user.remanga_user_id ? `ID: ${state.user.remanga_user_id}` : '-';
    }

    const stats = getPlayerBattleStats(state.user);
    const drawerHp = document.getElementById('drawer-hp');
    if (drawerHp) drawerHp.textContent = stats.maxHp;
    const drawerDmg = document.getElementById('drawer-dmg');
    if (drawerDmg) drawerDmg.textContent = stats.dmg;
    const drawerElement = document.getElementById('drawer-element');
    if (drawerElement) drawerElement.textContent = translateElement(stats.element);

    updateInventoryUI();
    updateEffectsUI();
    updatePersonalHistoryUI();
    updateDiceButton();

    const currentCellIndex = state.user.current_cell;
    const currentCell = state.cells ? state.cells[currentCellIndex] : null;
    const claimBtn = document.getElementById('claim-reward-current-cell-btn');
    if (claimBtn) {
      let showButton = false;
      let btnText = 'Забрать награду';
      if (currentCell) {
        if (currentCell.rewards_json) {
          try {
            const rewards = JSON.parse(currentCell.rewards_json);
            const userClaimed = rewards.some(r => r.claimed_by_user_id === state.user.id);
            const hasUnclaimed = rewards.some(r => (r.type === 'card' || r.type === 'premium') && !r.claimed_by_user_id);
            if (!userClaimed && hasUnclaimed) {
              showButton = true;
              btnText = 'Выбрать награду';
            }
          } catch (e) {}
        } else if ((currentCell.reward_type === 'card' || currentCell.reward_type === 'premium') && currentCell.claimed_by_user_id === null) {
          showButton = true;
          btnText = `Забрать: ${currentCell.reward_name}`;
        }
      }
      if (showButton) {
        claimBtn.classList.remove('hidden');
        claimBtn.textContent = btnText;
      } else {
        claimBtn.classList.add('hidden');
      }
    }

    if (document.getElementById('profile-drawer').classList.contains('open')) {
      updateDrawerPreview();
      updateDrawerEquipment();
    }

    if (data.pendingBoss) {
      let shouldShow = false;
      if (!data.pendingBoss.defeated) {
        shouldShow = true;
      } else {
        let cards = [];
        if (data.pendingBoss.bossRewardType === 'card' && data.pendingBoss.bossRewardDetail) {
          try {
            if (data.pendingBoss.bossRewardDetail.startsWith('[')) {
              cards = JSON.parse(data.pendingBoss.bossRewardDetail);
            }
          } catch (e) {}
        }
        const hasUnclaimed = cards.some(c => c.claimed_by_user_id === null || c.claimed_by_user_id === undefined);
        if (hasUnclaimed) {
          shouldShow = true;
        }
      }

      if (shouldShow && isInitialProfileLoad) {
        showPendingBossModal(data.pendingBoss);
      }
    }
    isInitialProfileLoad = false;
    checkActiveDuel();

  } catch (err) {

  }
}

function showPendingBossModal(pendingBoss) {
  currentOpenedBossCell = pendingBoss.cellNumber;
  const modal = document.getElementById('boss-battle-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  const boss = (state.bosses || []).find(b => b.cell_number === pendingBoss.cellNumber);
  if (boss) {
    updateBossModalUI(boss);
    return;
  }

  document.getElementById('boss-status-defeated').classList.add('hidden');
  document.getElementById('boss-status-occupied').classList.add('hidden');
  document.getElementById('boss-status-ready').classList.add('hidden');
  document.getElementById('boss-status-battle').classList.add('hidden');
  document.getElementById('boss-btn-close').classList.add('hidden');
  document.getElementById('boss-btn-bypass-only').classList.add('hidden');
  document.getElementById('boss-btn-fight').classList.add('hidden');
  document.getElementById('boss-btn-bypass').classList.add('hidden');
  document.getElementById('boss-btn-attack').classList.add('hidden');
  document.getElementById('boss-btn-forfeit').classList.add('hidden');

  document.getElementById('boss-modal-title').textContent = `Босс: ${pendingBoss.bossName} (Ячейка ${pendingBoss.cellNumber})`;

  if (pendingBoss.currentFighterId && pendingBoss.currentFighterId !== state.user.id) {
    document.getElementById('boss-status-occupied').classList.remove('hidden');
    document.getElementById('boss-fighter-name').textContent = pendingBoss.currentFighterName || 'Неизвестно';
    document.getElementById('boss-btn-bypass').classList.remove('hidden');
  } else {
    document.getElementById('boss-status-ready').classList.remove('hidden');
    document.getElementById('boss-info-name').textContent = pendingBoss.bossName;
    document.getElementById('boss-info-hp').textContent = `${pendingBoss.bossHp} / ${pendingBoss.bossMaxHp}`;
    document.getElementById('boss-info-dmg').textContent = pendingBoss.bossDmg;
    document.getElementById('boss-info-weakness').textContent = translateElement(pendingBoss.bossWeakness);
    document.getElementById('boss-info-reward').textContent = formatBossReward({
      reward_type: pendingBoss.bossRewardType || 'coins',
      reward_coins: pendingBoss.bossReward,
      reward_detail: pendingBoss.bossRewardDetail || ''
    });

    document.getElementById('boss-preview-hp').textContent = `${pendingBoss.bossHp} / ${pendingBoss.bossMaxHp}`;
    document.getElementById('boss-preview-dmg').textContent = pendingBoss.bossDmg;
    renderBossPreview3D({ cell_number: pendingBoss.cellNumber, max_hp: pendingBoss.bossMaxHp, hp: pendingBoss.bossHp, dmg: pendingBoss.bossDmg });

    document.getElementById('boss-btn-fight').classList.remove('hidden');
    document.getElementById('boss-btn-bypass').classList.remove('hidden');
  }
}

function initDrawerPreview3D() {
  const container = document.getElementById('drawer-char-canvas');
  if (!container || state.drawerPreview.renderer) return;

  const width = container.clientWidth || 340;
  const height = container.clientHeight || 200;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10);
  camera.position.set(0, 0.7, 2.2);
  camera.lookAt(0, 0.7, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(2, 4, 3);
  dirLight.castShadow = true;
  scene.add(dirLight);

  state.drawerPreview.scene = scene;
  state.drawerPreview.camera = camera;
  state.drawerPreview.renderer = renderer;

  const animate = () => {
    if (!state.drawerPreview.renderer) return;
    requestAnimationFrame(animate);
    if (state.drawerPreview.group) {
      state.drawerPreview.group.rotation.y += 0.015;
    }
    renderer.render(scene, camera);
  };
  animate();
}

function updateDrawerPreview() {
  if (!state.drawerPreview.scene) {
    initDrawerPreview3D();
  }

  if (state.drawerPreview.group) {
    state.drawerPreview.scene.remove(state.drawerPreview.group);
  }

  const charData = state.user.character_data || getDefaultCharData();
  state.drawerPreview.group = create3DCharacterMesh(charData);
  state.drawerPreview.scene.add(state.drawerPreview.group);
}

function getDefaultCharData() {
  return {
    skinColor: '#ffdbac',
    costume: 'normal',
    clothesColor: '#2a3f5f',
    hairStyle: 'none',
    hairColor: '#e74c3c',
    weapon: 'none',
    wings: 'none'
  };
}

function create3DCharacterMesh(data) {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: data.skinColor, roughness: 0.6 });
  const clothColor = data.clothesColor || '#2a3f5f';
  let clothMat = new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.6 });
  const accMat = new THREE.MeshStandardMaterial({ color: data.hairColor || '#ffffff', roughness: 0.5 });
  const metalMat = new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.8, roughness: 0.2 });
  const woodMat = new THREE.MeshStandardMaterial({ color: '#8b5a2b', roughness: 0.8 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#000000' });

  const costume = data.costume || 'normal';
  if (costume === 'armor') {
    clothMat = new THREE.MeshStandardMaterial({ color: clothColor, metalness: 0.8, roughness: 0.2 });
  } else if (costume === 'robe') {
    clothMat = new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.9 });
  } else if (costume === 'cyber') {
    clothMat = new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.2 });
  } else if (costume === 'steampunk') {
    clothMat = new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.7 });
  } else if (costume === 'ninja_suit') {
    clothMat = new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.8 });
  }

  const bodyGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.9, 12);
  const body = new THREE.Mesh(bodyGeo, clothMat);
  body.position.y = 0.45;
  group.add(body);

  if (costume === 'armor') {
    const plateGeo = new THREE.BoxGeometry(0.48, 0.5, 0.48);
    const plate = new THREE.Mesh(plateGeo, new THREE.MeshStandardMaterial({ color: clothColor, metalness: 0.9, roughness: 0.15 }));
    plate.position.set(0, 0.5, 0.05);
    group.add(plate);

    const padGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const padL = new THREE.Mesh(padGeo, plate.material);
    padL.position.set(-0.35, 0.7, 0);
    const padR = padL.clone();
    padR.position.x = 0.35;
    group.add(padL);
    group.add(padR);
  } else if (costume === 'robe') {
    const skirtGeo = new THREE.CylinderGeometry(0.38, 0.48, 0.38, 12);
    const skirt = new THREE.Mesh(skirtGeo, clothMat);
    skirt.position.y = 0.19;
    group.add(skirt);

    const collarGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.1, 12);
    const collar = new THREE.Mesh(collarGeo, new THREE.MeshStandardMaterial({ color: '#7f8c8d', roughness: 0.8 }));
    collar.position.y = 0.8;
    group.add(collar);
  } else if (costume === 'cyber') {
    const glowMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
    const band1Geo = new THREE.CylinderGeometry(0.38, 0.38, 0.06, 12);
    const band1 = new THREE.Mesh(band1Geo, glowMat);
    band1.position.y = 0.65;
    const band2Geo = new THREE.CylinderGeometry(0.43, 0.43, 0.06, 12);
    const band2 = new THREE.Mesh(band2Geo, glowMat);
    band2.position.y = 0.25;
    const coreGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8);
    coreGeo.rotateX(Math.PI / 2);
    const core = new THREE.Mesh(coreGeo, glowMat);
    core.position.set(0, 0.55, 0.32);
    group.add(band1);
    group.add(band2);
    group.add(core);
  } else if (costume === 'steampunk') {
    const brassMat = new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 0.8, roughness: 0.3 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: '#4a3728', roughness: 0.9 });
    const beltGeo = new THREE.CylinderGeometry(0.42, 0.44, 0.12, 12);
    const belt = new THREE.Mesh(beltGeo, leatherMat);
    belt.position.y = 0.3;
    const buckleGeo = new THREE.BoxGeometry(0.14, 0.14, 0.1);
    const buckle = new THREE.Mesh(buckleGeo, brassMat);
    buckle.position.set(0, 0.3, 0.42);
    const strapLGeo = new THREE.BoxGeometry(0.08, 0.5, 0.08);
    const strapL = new THREE.Mesh(strapLGeo, leatherMat);
    strapL.position.set(-0.16, 0.65, 0.28);
    strapL.rotation.x = -0.15;
    const strapR = strapL.clone();
    strapR.position.x = 0.16;
    const gearGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8);
    gearGeo.rotateX(Math.PI / 2);
    const gear = new THREE.Mesh(gearGeo, brassMat);
    gear.position.set(-0.16, 0.5, 0.32);
    group.add(belt);
    group.add(buckle);
    group.add(strapL);
    group.add(strapR);
    group.add(gear);
  } else if (costume === 'ninja_suit') {
    const redMat = new THREE.MeshStandardMaterial({ color: '#ff3333', roughness: 0.9 });
    const strapMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9 });
    const sashGeo = new THREE.CylinderGeometry(0.41, 0.43, 0.15, 12);
    const sash = new THREE.Mesh(sashGeo, redMat);
    sash.position.y = 0.35;
    const strapGeo = new THREE.BoxGeometry(0.08, 0.7, 0.08);
    strapGeo.rotateZ(-0.65);
    const strap = new THREE.Mesh(strapGeo, strapMat);
    strap.position.set(0, 0.58, 0.28);
    const ribbonGeo = new THREE.BoxGeometry(0.06, 0.4, 0.02);
    const ribbonL = new THREE.Mesh(ribbonGeo, redMat);
    ribbonL.position.set(-0.1, 0.15, -0.4);
    ribbonL.rotation.z = 0.2;
    const ribbonR = ribbonL.clone();
    ribbonR.position.x = 0.1;
    ribbonR.rotation.z = -0.2;
    group.add(sash);
    group.add(strap);
    group.add(ribbonL);
    group.add(ribbonR);
  }

  const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.05;
  group.add(head);

  const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.1, 1.1, 0.22);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.1, 1.1, 0.22);
  group.add(eyeL);
  group.add(eyeR);

  if (data.hairStyle === 'mohawk') {
    const mohawkGeo = new THREE.BoxGeometry(0.06, 0.15, 0.35);
    const mohawk = new THREE.Mesh(mohawkGeo, accMat);
    mohawk.position.set(0, 1.35, 0.05);
    group.add(mohawk);
  } else if (data.hairStyle === 'crown') {
    const ringGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 12, 1, true);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: data.hairColor, metalness: 0.9, roughness: 0.1 }));
    ring.position.set(0, 1.32, 0);
    group.add(ring);
    for (let i = 0; i < 6; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.03, 0.08, 4);
      const spike = new THREE.Mesh(spikeGeo, ring.material);
      const angle = (i / 6) * Math.PI * 2;
      spike.position.set(Math.cos(angle) * 0.17, 1.36, Math.sin(angle) * 0.17);
      group.add(spike);
    }
  } else if (data.hairStyle === 'horns') {
    const hornLGeo = new THREE.ConeGeometry(0.06, 0.2, 8);
    const hornL = new THREE.Mesh(hornLGeo, accMat);
    hornL.position.set(-0.2, 1.25, 0.05);
    hornL.rotation.z = 0.5;
    const hornR = hornL.clone();
    hornR.position.x = 0.2;
    hornR.rotation.z = -0.5;
    group.add(hornL);
    group.add(hornR);
  } else if (data.hairStyle === 'helmet') {
    const helmetGeo = new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const helmet = new THREE.Mesh(helmetGeo, metalMat);
    helmet.position.y = 1.1;
    group.add(helmet);
    const crestGeo = new THREE.BoxGeometry(0.05, 0.1, 0.3);
    const crest = new THREE.Mesh(crestGeo, accMat);
    crest.position.set(0, 1.4, 0);
    group.add(crest);
  } else if (data.hairStyle === 'cap') {
    const domeGeo = new THREE.SphereGeometry(0.29, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, accMat);
    dome.position.y = 1.1;
    group.add(dome);
    const visorGeo = new THREE.BoxGeometry(0.24, 0.02, 0.18);
    const visor = new THREE.Mesh(visorGeo, accMat);
    visor.position.set(0, 1.18, 0.26);
    visor.rotation.x = 0.1;
    group.add(visor);
  } else if (data.hairStyle === 'ninja') {
    const wrapGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.07, 16);
    const wrap = new THREE.Mesh(wrapGeo, accMat);
    wrap.position.y = 1.12;
    group.add(wrap);
    const plateGeo = new THREE.BoxGeometry(0.12, 0.05, 0.02);
    const plate = new THREE.Mesh(plateGeo, metalMat);
    plate.position.set(0, 1.12, 0.285);
    group.add(plate);
  } else if (data.hairStyle === 'wizard') {
    const brimGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.02, 16);
    const wizardHat = new THREE.Mesh(brimGeo, accMat);
    wizardHat.position.y = 1.25;
    group.add(wizardHat);
    const coneGeo = new THREE.ConeGeometry(0.26, 0.6, 16);
    const cone = new THREE.Mesh(coneGeo, accMat);
    cone.position.set(0, 1.54, -0.05);
    cone.rotation.x = -0.15;
    group.add(cone);
  } else if (data.hairStyle === 'cat_ears') {
    const earLGeo = new THREE.ConeGeometry(0.08, 0.12, 4);
    const earL = new THREE.Mesh(earLGeo, accMat);
    earL.position.set(-0.16, 1.32, 0.05);
    earL.rotation.z = 0.3;
    const earR = earL.clone();
    earR.position.x = 0.16;
    earR.rotation.z = -0.3;
    group.add(earL);
    group.add(earR);
  } else if (data.hairStyle === 'hair_long') {
    const topGeo = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const topHair = new THREE.Mesh(topGeo, accMat);
    topHair.position.y = 1.1;
    group.add(topHair);
    const backGeo = new THREE.BoxGeometry(0.32, 0.45, 0.12);
    const backHair = new THREE.Mesh(backGeo, accMat);
    backHair.position.set(0, 0.9, -0.2);
    group.add(backHair);
  } else if (data.hairStyle === 'hair_spiky') {
    const baseGeo = new THREE.SphereGeometry(0.29, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const baseHair = new THREE.Mesh(baseGeo, accMat);
    baseHair.position.y = 1.1;
    group.add(baseHair);
    for (let i = 0; i < 7; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.06, 0.16, 4);
      const spike = new THREE.Mesh(spikeGeo, accMat);
      const lat = 0.5 + (i * 0.4);
      const lon = i * 2.3;
      spike.position.set(
        Math.cos(lon) * Math.sin(lat) * 0.28,
        1.1 + Math.cos(lat) * 0.28,
        Math.sin(lon) * Math.sin(lat) * 0.28
      );
      spike.lookAt(0, 1.1, 0);
      spike.rotateX(Math.PI / 2);
      group.add(spike);
    }
  } else if (data.hairStyle === 'halo') {
    const ringGeo = new THREE.TorusGeometry(0.16, 0.02, 8, 24);
    const glowMat = new THREE.MeshBasicMaterial({ color: data.hairColor });
    const ring = new THREE.Mesh(ringGeo, glowMat);
    ring.position.set(0, 1.45, 0);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    const rodGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.2, 8);
    const rodMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.set(0, 1.33, -0.1);
    group.add(rod);
  } else if (data.hairStyle === 'cyber_viser') {
    const visorGeo = new THREE.BoxGeometry(0.38, 0.08, 0.08);
    const visorMat = new THREE.MeshBasicMaterial({ color: data.hairColor });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.1, 0.22);
    group.add(visor);
  }

  if (data.weapon === 'sword') {
    const bladeGeo = new THREE.BoxGeometry(0.05, 0.7, 0.1);
    const blade = new THREE.Mesh(bladeGeo, metalMat);
    blade.position.set(0.5, 0.7, 0.1);
    blade.rotation.x = 0.3;
    group.add(blade);
    const guardGeo = new THREE.BoxGeometry(0.2, 0.04, 0.15);
    const guard = new THREE.Mesh(guardGeo, new THREE.MeshStandardMaterial({ color: '#ffb800' }));
    guard.position.set(0.5, 0.35, 0.1);
    guard.rotation.x = 0.3;
    group.add(guard);
  } else if (data.weapon === 'staff') {
    const shaftGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8);
    const shaft = new THREE.Mesh(shaftGeo, woodMat);
    shaft.position.set(0.5, 0.5, 0.1);
    group.add(shaft);
    const orbGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const orb = new THREE.Mesh(orbGeo, new THREE.MeshBasicMaterial({ color: '#00f0ff' }));
    orb.position.set(0.5, 1.05, 0.1);
    group.add(orb);
  } else if (data.weapon === 'shield') {
    const shieldGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.04, 16);
    const shieldMat = new THREE.MeshStandardMaterial({ color: '#2980b9', roughness: 0.3, metalness: 0.8 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(-0.55, 0.5, 0.1);
    shield.rotation.z = Math.PI / 2;
    group.add(shield);
    const starGeo = new THREE.BoxGeometry(0.08, 0.08, 0.06);
    const star = new THREE.Mesh(starGeo, new THREE.MeshStandardMaterial({ color: '#ffb800', metalness: 0.9 }));
    star.position.set(-0.57, 0.5, 0.1);
    group.add(star);
  } else if (data.weapon === 'axe') {
    const shaftGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8);
    const shaft = new THREE.Mesh(shaftGeo, woodMat);
    shaft.position.set(0.5, 0.5, 0.1);
    group.add(shaft);
    const bladeGeo = new THREE.BoxGeometry(0.04, 0.3, 0.2);
    const blade = new THREE.Mesh(bladeGeo, metalMat);
    blade.position.set(0.5, 0.85, 0.1);
    group.add(blade);
  } else if (data.weapon === 'bow') {
    const bowMat = new THREE.MeshStandardMaterial({ color: '#8b5a2b', roughness: 0.8 });
    const bowGeo = new THREE.TorusGeometry(0.28, 0.02, 8, 16, Math.PI);
    const bow = new THREE.Mesh(bowGeo, bowMat);
    bow.position.set(0.5, 0.5, 0.15);
    bow.rotation.y = Math.PI / 2;
    group.add(bow);
    const stringGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.56, 8);
    const stringMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const string = new THREE.Mesh(stringGeo, stringMat);
    string.position.set(0.5, 0.5, 0.15);
    group.add(string);
  } else if (data.weapon === 'scythe') {
    const staffGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.3, 8);
    const staff = new THREE.Mesh(staffGeo, woodMat);
    staff.position.set(0.5, 0.65, 0.1);
    group.add(staff);
    const bladeGeo = new THREE.BoxGeometry(0.03, 0.1, 0.55);
    const blade = new THREE.Mesh(bladeGeo, metalMat);
    blade.position.set(0.5, 1.25, 0.26);
    blade.rotation.x = 0.2;
    group.add(blade);
  } else if (data.weapon === 'hammer') {
    const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8);
    const handle = new THREE.Mesh(handleGeo, woodMat);
    handle.position.set(0.5, 0.45, 0.1);
    group.add(handle);
    const headGeo = new THREE.BoxGeometry(0.18, 0.18, 0.32);
    const head = new THREE.Mesh(headGeo, metalMat);
    head.position.set(0.5, 0.65, 0.1);
    group.add(head);
  }

  if (data.wings === 'angel') {
    const wingMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, side: THREE.DoubleSide });
    const wingGeo = new THREE.BoxGeometry(0.6, 0.3, 0.02);
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(-0.4, 0.6, -0.3);
    wingL.rotation.y = 0.5;
    wingL.rotation.z = -0.2;
    const wingR = wingL.clone();
    wingR.position.x = 0.4;
    wingR.rotation.y = -0.5;
    wingR.rotation.z = 0.2;
    group.add(wingL);
    group.add(wingR);
  } else if (data.wings === 'demon') {
    const wingMat = new THREE.MeshStandardMaterial({ color: '#2c1a30', roughness: 0.8, side: THREE.DoubleSide });
    const wingGeo = new THREE.BoxGeometry(0.6, 0.3, 0.02);
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(-0.4, 0.6, -0.3);
    wingL.rotation.y = 0.5;
    wingL.rotation.z = -0.2;
    const wingR = wingL.clone();
    wingR.position.x = 0.4;
    wingR.rotation.y = -0.5;
    wingR.rotation.z = 0.2;
    group.add(wingL);
    group.add(wingR);
  } else if (data.wings === 'fairy') {
    const wingMat = new THREE.MeshBasicMaterial({ color: '#00f0ff', transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const wingGeo = new THREE.BoxGeometry(0.5, 0.25, 0.01);
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(-0.35, 0.65, -0.28);
    wingL.rotation.y = 0.4;
    wingL.rotation.z = -0.4;
    const wingR = wingL.clone();
    wingR.position.x = 0.35;
    wingR.rotation.y = -0.4;
    wingR.rotation.z = 0.4;
    group.add(wingL);
    group.add(wingR);
  } else if (data.wings === 'butterfly') {
    const wingMat = new THREE.MeshStandardMaterial({ color: '#e056fd', roughness: 0.9, side: THREE.DoubleSide });
    const wingGeo = new THREE.BoxGeometry(0.55, 0.45, 0.01);
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(-0.38, 0.6, -0.26);
    wingL.rotation.y = 0.45;
    wingL.rotation.z = -0.15;
    const wingR = wingL.clone();
    wingR.position.x = 0.38;
    wingR.rotation.y = -0.45;
    wingR.rotation.z = 0.15;
    group.add(wingL);
    group.add(wingR);
  } else if (data.wings === 'cyber_wings') {
    const glowMat = new THREE.MeshBasicMaterial({ color: '#ff00ff' });
    const wingGeo = new THREE.BoxGeometry(0.55, 0.04, 0.04);
    const wingL = new THREE.Mesh(wingGeo, glowMat);
    wingL.position.set(-0.35, 0.65, -0.25);
    wingL.rotation.y = 0.4;
    wingL.rotation.z = -0.3;
    const wingR = wingL.clone();
    wingR.position.x = 0.4;
    wingR.rotation.y = -0.4;
    wingR.rotation.z = 0.3;
    group.add(wingL);
    group.add(wingR);
  } else if (data.wings === 'bat_wings') {
    const wingMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9, side: THREE.DoubleSide });
    const wingLGroup = new THREE.Group();
    const mainGeo = new THREE.BoxGeometry(0.5, 0.2, 0.02);
    const mainPart = new THREE.Mesh(mainGeo, wingMat);
    mainPart.position.set(-0.25, 0, 0);
    wingLGroup.add(mainPart);
    const spikeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.02);
    spikeGeo.rotateZ(0.7);
    const spikePart = new THREE.Mesh(spikeGeo, wingMat);
    spikePart.position.set(-0.4, -0.1, 0);
    wingLGroup.add(spikePart);
    wingLGroup.position.set(-0.2, 0.65, -0.25);
    wingLGroup.rotation.y = 0.45;
    wingLGroup.rotation.z = -0.25;
    const wingRGroup = wingLGroup.clone();
    wingRGroup.position.x = 0.2;
    wingRGroup.rotation.y = -0.45;
    wingRGroup.rotation.z = 0.25;
    wingRGroup.children[0].position.x = 0.25;
    wingRGroup.children[1].position.x = 0.4;
    group.add(wingLGroup);
    group.add(wingRGroup);
  }

  group.castShadow = true;
  group.receiveShadow = true;
  group.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return group;
}

function createFloatingIconMesh(cellData) {
  if (!cellData) return null;
  if (cellData.claimed_by_user_id !== null && cellData.claimed_by_user_id !== undefined) {
    return null;
  }

  if (cellData.type === 'forward') {
    const coneGeo = new THREE.ConeGeometry(0.12, 0.35, 4);
    const coneMat = new THREE.MeshBasicMaterial({ color: '#2ecc71' });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = Math.PI / 2;
    return cone;
  }

  if (cellData.type === 'backward') {
    const coneGeo = new THREE.ConeGeometry(0.12, 0.35, 4);
    const coneMat = new THREE.MeshBasicMaterial({ color: '#e74c3c' });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = -Math.PI / 2;
    return cone;
  }

  if (cellData.type === 'obstacle') {
    const boxGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const boxMat = new THREE.MeshBasicMaterial({ color: '#e67e22' });
    const box = new THREE.Mesh(boxGeo, boxMat);
    return box;
  }

  if (cellData.reward_type === 'currency') {
    const coinGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 8);
    const coinMat = new THREE.MeshStandardMaterial({ color: '#ffb800', metalness: 0.9, roughness: 0.1 });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.rotation.x = Math.PI / 2;
    return coin;
  }

  if (cellData.reward_type === 'card') {
    const cardGeo = new THREE.BoxGeometry(0.12, 0.24, 0.02);
    const cardMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
    const card = new THREE.Mesh(cardGeo, cardMat);
    return card;
  }

  if (cellData.reward_type === 'premium') {
    const diamondGeo = new THREE.OctahedronGeometry(0.14);
    const diamondMat = new THREE.MeshBasicMaterial({ color: '#e056fd' });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    return diamond;
  }

  return null;
}

function updateFloatingIcons() {
  if (!state.boardScene || !state.floatingIcons) return;
  for (let i = 0; i < 300; i++) {
    const cellData = state.cells[i] || { type: 'normal' };
    if (state.floatingIcons[i]) {
      state.boardScene.remove(state.floatingIcons[i]);
      state.floatingIcons[i] = null;
    }
    const pos = getTilePosition(i);
    const iconMesh = createFloatingIconMesh(cellData);
    if (iconMesh) {
      iconMesh.position.set(pos.x, 1.2, pos.z);
      iconMesh.userData = { baseY: 1.2, offset: Math.random() * 10 };
      state.boardScene.add(iconMesh);
      state.floatingIcons[i] = iconMesh;
    }
  }
}

function cleanupBoard3D() {
  if (state.boardAnimId) {
    cancelAnimationFrame(state.boardAnimId);
    state.boardAnimId = null;
  }
  if (state.boardResizeObserver) {
    state.boardResizeObserver.disconnect();
    state.boardResizeObserver = null;
  }
  if (state.boardRenderer) {
    try {
      state.boardRenderer.dispose();
    } catch (e) { }
    state.boardRenderer = null;
  }
  const container = document.getElementById('board-canvas-container');
  if (container) {
    container.innerHTML = '';
  }
  state.boardPlayers.clear();
  state.boardScene = null;
  state.boardCamera = null;
  state.boardControls = null;
}

function initBoard3D() {
  cleanupBoard3D();
  const container = document.getElementById('board-canvas-container');
  if (!container) return;
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#030509');
  scene.fog = new THREE.FogExp2('#030509', 0.015);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 300);

  const playerCell = (state.user && state.user.current_cell !== undefined) ? state.user.current_cell : 0;
  const startPos = getTilePosition(playerCell);

  let cameraX = startPos.x;
  let cameraY = startPos.y + 15;
  let cameraZ = startPos.z + 20;

  let targetX = startPos.x;
  let targetY = startPos.y;
  let targetZ = startPos.z;

  const savedCam = state.user ? localStorage.getItem(`ew_cam_pos_${state.user.id}`) : null;
  if (savedCam) {
    try {
      const parsed = JSON.parse(savedCam);
      if (typeof parsed.x === 'number' && !isNaN(parsed.x)) cameraX = parsed.x;
      if (typeof parsed.y === 'number' && !isNaN(parsed.y)) cameraY = parsed.y;
      if (typeof parsed.z === 'number' && !isNaN(parsed.z)) cameraZ = parsed.z;
      if (typeof parsed.tx === 'number' && !isNaN(parsed.tx)) targetX = parsed.tx;
      if (typeof parsed.ty === 'number' && !isNaN(parsed.ty)) targetY = parsed.ty;
      if (typeof parsed.tz === 'number' && !isNaN(parsed.tz)) targetZ = parsed.tz;
    } catch (e) { }
  }

  camera.position.set(cameraX, cameraY, cameraZ);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    console.warn('WebGL context lost on board canvas. Re-initializing...');
    setTimeout(() => {
      initBoard3D();
    }, 50);
  }, false);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minDistance = 10;
  controls.maxDistance = 120;
  controls.target.set(targetX, targetY, targetZ);
  controls.update();

  controls.addEventListener('change', () => {
    if (state.user) {
      const camPos = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        tx: controls.target.x,
        ty: controls.target.y,
        tz: controls.target.z
      };
      localStorage.setItem(`ew_cam_pos_${state.user.id}`, JSON.stringify(camPos));
    }
  });

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 40, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  scene.add(dirLight);

  const gridHelper = new THREE.GridHelper(200, 50, '#121d33', '#090f1a');
  gridHelper.position.y = -0.1;
  scene.add(gridHelper);

  state.boardScene = scene;
  state.boardCamera = camera;
  state.boardRenderer = renderer;
  state.boardControls = controls;

  buildBoardTiles();
  loadBossModels();
  updateBoardPlayers();
  layoutBoardElements();

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let pointerStartX = 0;
  let pointerStartY = 0;

  renderer.domElement.addEventListener('pointerdown', (e) => {
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
  });

  renderer.domElement.addEventListener('pointerup', (e) => {
    const diffX = Math.abs(e.clientX - pointerStartX);
    const diffY = Math.abs(e.clientY - pointerStartY);
    if (diffX > 6 || diffY > 6) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const playerMeshes = [];
    for (const [id, playerObj] of state.boardPlayers.entries()) {
      playerMeshes.push(playerObj.mesh);
    }

    const intersects = raycaster.intersectObjects(playerMeshes, true);
    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && obj.parent && obj.parent !== scene) {
        obj = obj.parent;
      }

      let clickedPlayer = null;
      for (const [id, playerObj] of state.boardPlayers.entries()) {
        if (playerObj.mesh === obj) {
          clickedPlayer = (state.players || []).find(p => String(p.id) === id);
          break;
        }
      }

      if (clickedPlayer) {
        state.taggedPlayer = { player: clickedPlayer, mesh: obj };
        state.selectedCellInfo = null;
        hideCellInfoTag();
        clearTimeout(state.usernameTimeout);
        state.usernameTimeout = setTimeout(() => {
          state.taggedPlayer = null;
          document.getElementById('username-tag').classList.add('hidden');
        }, 2000);
        return;
      }
    }

    const bossMeshes = Array.from(state.bossObjects.values());
    const bossIntersects = raycaster.intersectObjects(bossMeshes, true);
    let cellIndex = -1;
    let clickedTile = null;

    if (bossIntersects.length > 0) {
      let hitBossObj = bossIntersects[0].object;
      while (hitBossObj && hitBossObj.parent && hitBossObj.parent !== scene) {
        hitBossObj = hitBossObj.parent;
      }
      for (const [cellNum, mesh] of state.bossObjects.entries()) {
        if (mesh === hitBossObj) {
          cellIndex = cellNum;
          clickedTile = state.tileObjects[cellNum];
          break;
        }
      }
    }

    if (cellIndex === -1) {
      const tileIntersects = raycaster.intersectObjects(state.tileObjects);
      if (tileIntersects.length > 0) {
        clickedTile = tileIntersects[0].object;
        cellIndex = state.tileObjects.indexOf(clickedTile);
      }
    }

    if (cellIndex !== -1 && clickedTile) {
      state.selectedCellInfo = { cellIndex, mesh: clickedTile };
      showCellInfoTag(cellIndex);
      state.taggedPlayer = null;
      document.getElementById('username-tag').classList.add('hidden');
      clearTimeout(state.cellInfoTimeout);
      state.cellInfoTimeout = setTimeout(() => {
        state.selectedCellInfo = null;
        hideCellInfoTag();
      }, 2000);
      if (state.user && state.user.is_admin) {
        document.getElementById('admin-cell-number').value = cellIndex;
        loadAdminCellData(cellIndex);
        const tabBtn = document.querySelector('.tab-btn[data-tab="admin-tab-cells"]');
        if (tabBtn) tabBtn.click();
      }
    } else {
      state.selectedCellInfo = null;
      hideCellInfoTag();
      clearTimeout(state.cellInfoTimeout);
    }

    state.taggedPlayer = null;
    document.getElementById('username-tag').classList.add('hidden');
    clearTimeout(state.usernameTimeout);
  });

  const animate = () => {
    if (state.boardRenderer !== renderer) return;
    state.boardAnimId = requestAnimationFrame(animate);

    const time = performance.now() * 0.003;
    if (state.floatingIcons) {
      state.floatingIcons.forEach(icon => {
        if (icon) {
          icon.rotation.y += 0.02;
          icon.position.y = icon.userData.baseY + Math.sin(time + icon.userData.offset) * 0.15;
        }
      });
    }

    if (state.taggedPlayer) {
      const tempV = new THREE.Vector3();
      state.taggedPlayer.mesh.getWorldPosition(tempV);
      tempV.y += 1.5;
      tempV.project(camera);

      const rect = renderer.domElement.getBoundingClientRect();
      const x_local = (tempV.x * 0.5 + 0.5) * rect.width;
      const y_local = (tempV.y * -0.5 + 0.5) * rect.height;

      const tag = document.getElementById('username-tag');
      tag.style.left = `${x_local}px`;
      tag.style.top = `${y_local}px`;

      const tagW = tag.offsetWidth || 120;
      const tagH = tag.offsetHeight || 60;

      let clampedX = Math.max(tagW / 2 + 10, Math.min(rect.width - tagW / 2 - 10, x_local));
      let clampedY = y_local;

      if (y_local - tagH < 10) {
        tag.style.transform = 'translate(-50%, 15px)';
      } else {
        tag.style.transform = 'translate(-50%, -100%)';
      }

      tag.style.left = `${clampedX}px`;
      tag.style.top = `${clampedY}px`;

      let html = `<div style="font-weight:700; color:#00f0ff;">${state.taggedPlayer.player.tg_first_name}</div>`;
      if (state.taggedPlayer.player.remanga_username) {
        html += `<div style="font-size:10px; color:#ffb800; margin-top:2px;">Remanga: ${state.taggedPlayer.player.remanga_username}</div>`;
      }
      html += `<div style="font-size:9px; color:#8c9ba5; margin-top:2px;">Ячейка: ${state.taggedPlayer.player.current_cell}</div>`;

      const statusColor = state.taggedPlayer.player.isOnline ? '#2ecc71' : '#95a5a6';
      const statusText = state.taggedPlayer.player.isOnline ? 'В сети' : 'Не в сети';
      html += `<div style="font-size:9px; display:flex; align-items:center; justify-content:center; gap:4px; margin-top:2px; color:${statusColor};">
        <span style="display:inline-block; width:5px; height:5px; border-radius:50%; background:${statusColor};"></span>
        ${statusText}
      </div>`;

      if (state.taggedPlayer.player.effects && state.taggedPlayer.player.effects.length > 0) {
        html += `<div style="border-top:1px solid rgba(255,255,255,0.1); margin-top:5px; padding-top:4px; display:flex; flex-direction:column; gap:2px; align-items:center;">`;
        state.taggedPlayer.player.effects.forEach(eff => {
          let badgeColor = '#3498db';
          if (eff.type === 'freeze') badgeColor = '#9b59b6';
          else if (eff.type === 'slowness') badgeColor = '#e74c3c';
          else if (eff.type === 'double_roll') badgeColor = '#2ecc71';
          html += `<div style="font-size:8px; background:${badgeColor}; color:#fff; padding:1px 4px; border-radius:3px; white-space:nowrap;">
            ${eff.name}
          </div>`;
        });
        html += `</div>`;
      }

      tag.innerHTML = html;
      tag.classList.remove('hidden');
    }

    if (state.selectedCellInfo) {
      const tempV = new THREE.Vector3();
      state.selectedCellInfo.mesh.getWorldPosition(tempV);
      tempV.y += 0.8;
      tempV.project(camera);

      const rect = renderer.domElement.getBoundingClientRect();
      const x_local = (tempV.x * 0.5 + 0.5) * rect.width;
      const y_local = (tempV.y * -0.5 + 0.5) * rect.height;

      const tag = document.getElementById('cell-info-tag');
      tag.style.left = `${x_local}px`;
      tag.style.top = `${y_local}px`;

      const tagW = tag.offsetWidth || 220;
      const tagH = tag.offsetHeight || 100;

      let clampedX = Math.max(tagW / 2 + 10, Math.min(rect.width - tagW / 2 - 10, x_local));
      let targetY = y_local - tagH - 15;
      let clampedY = Math.max(10, Math.min(rect.height - tagH - 10, targetY));

      tag.style.transform = 'translateX(-50%)';
      tag.style.left = `${clampedX}px`;
      tag.style.top = `${clampedY}px`;
    }

    const speed = 0.4;
    let moveX = 0;
    let moveZ = 0;
    if (keysPressed['w'] || keysPressed['ц']) moveZ -= speed;
    if (keysPressed['s'] || keysPressed['ы']) moveZ += speed;
    if (keysPressed['a'] || keysPressed['ф']) moveX -= speed;
    if (keysPressed['d'] || keysPressed['в']) moveX += speed;

    if (joystickInput.x !== 0 || joystickInput.y !== 0) {
      moveX += joystickInput.x * speed;
      moveZ += joystickInput.y * speed;
    }

    if (moveX !== 0 || moveZ !== 0) {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT' || activeEl.tagName === 'TEXTAREA');
      if (!isTyping) {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        if (forward.lengthSq() > 0.0001) {
          forward.normalize();
        } else {
          forward.set(0, 0, -1);
        }

        const right = new THREE.Vector3();
        right.crossVectors(forward, camera.up);
        right.y = 0;
        if (right.lengthSq() > 0.0001) {
          right.normalize();
        } else {
          right.set(1, 0, 0);
        }

        const direction = new THREE.Vector3();
        direction.addScaledVector(forward, -moveZ);
        direction.addScaledVector(right, moveX);

        if (!isNaN(direction.x) && !isNaN(direction.y) && !isNaN(direction.z)) {
          camera.position.add(direction);
          controls.target.add(direction);
        }
      }
    }

    if (isNaN(camera.position.x) || isNaN(camera.position.y) || isNaN(camera.position.z) ||
      isNaN(controls.target.x) || isNaN(controls.target.y) || isNaN(controls.target.z)) {
      const fallbackPos = getTilePosition(state.user ? state.user.current_cell : 0);
      camera.position.set(fallbackPos.x, fallbackPos.y + 15, fallbackPos.z + 20);
      controls.target.set(fallbackPos.x, fallbackPos.y, fallbackPos.z);
      controls.update();
    }
    if (camera.position.y < 3) camera.position.y = 3;
    if (controls.target.y < 0) controls.target.y = 0;
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  state.boardResizeObserver = new ResizeObserver(() => {
    if (!container.clientWidth) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const aspect = w / h;
    camera.aspect = aspect;
    camera.fov = 50;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  state.boardResizeObserver.observe(container);
}

function buildBoardTiles() {
  state.tileObjects = [];

  if (state.floatingIcons) {
    state.floatingIcons.forEach(icon => {
      if (icon) state.boardScene.remove(icon);
    });
  }
  state.floatingIcons = [];

  for (let i = 0; i < 300; i++) {
    const cellData = state.cells[i] || { type: 'normal' };
    const pos = getTilePosition(i);

    let color = '#121d33';
    const isBossCell = (i > 0 && i % 30 === 0) || i === 299;
    const bossData = (state.bosses || []).find(b => b.cell_number === i);
    const defeated = bossData ? bossData.defeated : 0;
    if (i === 0) color = '#ffb800';
    else if (isBossCell) color = defeated ? '#00ff33' : '#ff0033';
    else if (cellData.type === 'forward') color = '#2ecc71';
    else if (cellData.type === 'backward') color = '#e74c3c';
    else if (cellData.type === 'obstacle') color = '#e67e22';

    const size = isBossCell ? 3.8 : 2.4;
    const tileGeo = new THREE.BoxGeometry(size, 0.3, size);
    const tileMesh = new THREE.Mesh(tileGeo, createTileMaterials(i, color));
    tileMesh.position.set(pos.x, pos.y, pos.z);
    tileMesh.receiveShadow = true;
    state.boardScene.add(tileMesh);
    state.tileObjects.push(tileMesh);

    const iconMesh = createFloatingIconMesh(cellData);
    if (iconMesh) {
      iconMesh.position.set(pos.x, 1.2, pos.z);
      iconMesh.userData = { baseY: 1.2, offset: Math.random() * 10 };
      state.boardScene.add(iconMesh);
      state.floatingIcons[i] = iconMesh;
    } else {
      state.floatingIcons[i] = null;
    }
  }
  highlightCurrentCell();
  updateBossMeshes();
}

function updateBoardPlayers() {
  if (!state.boardScene) return;

  const currentIds = new Set((state.players || []).map(p => String(p.id)));

  for (const [id, playerObj] of state.boardPlayers.entries()) {
    if (!currentIds.has(id)) {
      state.boardScene.remove(playerObj.mesh);
      state.boardPlayers.delete(id);
    }
  }

  for (const player of (state.players || [])) {
    const idStr = String(player.id);
    const pos = getTilePosition(player.current_cell);

    if (state.boardPlayers.has(idStr)) {
      const entry = state.boardPlayers.get(idStr);

      const newCharData = player.character_data || getDefaultCharData();
      const newCharDataStr = JSON.stringify(newCharData);
      const oldCharDataStr = entry.charDataString || '';

      if (oldCharDataStr !== newCharDataStr) {
        state.boardScene.remove(entry.mesh);
        const mesh = create3DCharacterMesh(newCharData);
        mesh.position.copy(entry.mesh.position);
        mesh.rotation.copy(entry.mesh.rotation);
        state.boardScene.add(mesh);
        entry.mesh = mesh;
        entry.charDataString = newCharDataStr;
      } else if (!state.boardScene.children.includes(entry.mesh)) {
        state.boardScene.add(entry.mesh);
      }

      if (!entry.animating) {
        if (idStr === String(state.user?.id) && state.diceRolling) {
        } else {
          entry.mesh.position.set(pos.x, pos.y, pos.z);
          entry.currentCell = player.current_cell;
        }
      }
    } else {
      const charData = player.character_data || getDefaultCharData();
      const mesh = create3DCharacterMesh(charData);
      mesh.position.set(pos.x, pos.y, pos.z);
      state.boardScene.add(mesh);

      state.boardPlayers.set(idStr, {
        mesh: mesh,
        animating: false,
        currentCell: player.current_cell,
        charDataString: JSON.stringify(charData)
      });
    }
  }

  layoutBoardElements();
  highlightCurrentCell();
}

function animatePlayerMovement(moveData) {
  const idStr = String(moveData.userId);
  if (!state.boardPlayers.has(idStr)) {
    updateBoardPlayers();
  }
  const playerObj = state.boardPlayers.get(idStr);
  if (!playerObj) return;

  playerObj.animating = true;
  const path = moveData.path;
  if (!path || path.length === 0) {
    playerObj.animating = false;
    return;
  }

  let step = 0;

  function hopNext() {
    if (step >= path.length) {
      playerObj.animating = false;
      playerObj.currentCell = moveData.endCell;

      const currentPositions = updateTilePositions().positions;
      const finalPos = getTilePositionOfCell(moveData.endCell, currentPositions);

      playerObj.mesh.position.set(finalPos.x, finalPos.y, finalPos.z);
      layoutBoardElements();

      if (moveData.userId === state.user.id) {
        state.user.current_cell = moveData.endCell;
        highlightCurrentCell();
        if (state.boardControls) {
          smoothCameraFocus(finalPos);
        }
      }
      return;
    }

    const startPos = Object.assign({}, playerObj.mesh.position);
    const duration = 300;
    const startTime = performance.now();

    function updateHop(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentPositions = updateTilePositions().positions;
      const startCellPos = step === 0 ? getTilePositionOfCell(playerObj.currentCell, currentPositions) : getTilePositionOfCell(path[step - 1], currentPositions);
      const endCellPos = getTilePositionOfCell(path[step], currentPositions);

      const x = startCellPos.x + (endCellPos.x - startCellPos.x) * progress;
      const z = startCellPos.z + (endCellPos.z - startCellPos.z) * progress;
      const y = startCellPos.y + (endCellPos.y - startCellPos.y) * progress + Math.sin(progress * Math.PI) * 1.5;

      playerObj.mesh.position.set(x, y, z);

      if (progress < 1) {
        requestAnimationFrame(updateHop);
      } else {
        if (moveData.userId === state.user.id) {
          state.user.current_cell = path[step];
          highlightCurrentCell();
        }
        step++;
        hopNext();
      }
    }

    requestAnimationFrame(updateHop);
  }

  hopNext();
}

function smoothCameraFocus(targetPos) {
  const cam = state.boardCamera;
  const ctrl = state.boardControls;
  const duration = 800;
  const startTime = performance.now();

  const startCamPos = cam.position.clone();
  const startTarget = ctrl.target.clone();

  const endCamPos = new THREE.Vector3(targetPos.x, targetPos.y + 25, targetPos.z + 30);
  const endTarget = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);

  function updateCam(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    cam.position.lerpVectors(startCamPos, endCamPos, progress);
    ctrl.target.lerpVectors(startTarget, endTarget, progress);

    if (progress < 1) {
      requestAnimationFrame(updateCam);
    }
  }

  requestAnimationFrame(updateCam);
}

function setupUI() {
  document.getElementById('link-remanga-btn-onboarding').addEventListener('click', async () => {
    const url = document.getElementById('remanga-url-input-onboarding').value.trim();
    if (!url) {
      showNotification('Пожалуйста, введите ссылку на профиль Remanga', 'error');
      return;
    }

    try {
      const res = await fetch('/api/profile/link-remanga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.user.id, remangaUrl: url })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      state.user = data.user;
      localStorage.setItem('ew_event_user', JSON.stringify(data.user));
      showNotification('Профиль Remanga успешно привязан!', 'success');
      checkOnboardingStage(state.user);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  });

  document.getElementById('creator-next-1').addEventListener('click', () => {
    showWizardStep(2);
  });

  document.getElementById('creator-prev-2').addEventListener('click', () => {
    showWizardStep(1);
  });

  document.getElementById('creator-next-2').addEventListener('click', () => {
    showWizardStep(3);
  });

  document.getElementById('creator-prev-3').addEventListener('click', () => {
    showWizardStep(2);
  });

  const buySlotsBtn = document.getElementById('buy-slots-btn');
  if (buySlotsBtn) {
    buySlotsBtn.addEventListener('click', async () => {
      if (!state.user) return;
      if (state.user.balance < 3000) {
        showNotification('Недостаточно монет! Стоимость: 3000 монет.', 'error');
        return;
      }
      try {
        const res = await fetch('/api/inventory/buy-slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.user.id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        state.user.balance = data.newBalance;
        state.user.inventory_slots = data.newSlots;
        localStorage.setItem('ew_event_user', JSON.stringify(state.user));
        
        const balanceEl = document.getElementById('balance-value');
        if (balanceEl) balanceEl.textContent = state.user.balance;
        const drawerBalEl = document.getElementById('drawer-balance');
        if (drawerBalEl) drawerBalEl.textContent = state.user.balance;

        updateInventoryUI();
        showNotification('Инвентарь успешно расширен на +10 слотов!', 'success');
      } catch (err) {
        showNotification(err.message || 'Ошибка при покупке слотов', 'error');
      }
    });
  }

  const buySlotsModalYes = document.getElementById('buy-slots-modal-yes');
  if (buySlotsModalYes) {
    buySlotsModalYes.addEventListener('click', async () => {
      document.getElementById('buy-slots-modal').classList.add('hidden');
      if (!state.user) return;
      if (state.user.balance < 3000) {
        showNotification('Недостаточно монет! Стоимость: 3000 монет.', 'error');
        return;
      }
      try {
        const res = await fetch('/api/inventory/buy-slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.user.id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        state.user.balance = data.newBalance;
        state.user.inventory_slots = data.newSlots;
        localStorage.setItem('ew_event_user', JSON.stringify(state.user));
        
        const balanceEl = document.getElementById('balance-value');
        if (balanceEl) balanceEl.textContent = state.user.balance;
        const drawerBalEl = document.getElementById('drawer-balance');
        if (drawerBalEl) drawerBalEl.textContent = state.user.balance;

        updateInventoryUI();
        showNotification('Инвентарь успешно расширен на +10 слотов!', 'success');
      } catch (err) {
        showNotification(err.message || 'Ошибка при покупке слотов', 'error');
      }
    });
  }

  const buySlotsModalNo = document.getElementById('buy-slots-modal-no');
  if (buySlotsModalNo) {
    buySlotsModalNo.addEventListener('click', () => {
      document.getElementById('buy-slots-modal').classList.add('hidden');
    });
  }

  document.getElementById('creator-save-btn').addEventListener('click', () => {
    document.getElementById('confirm-char-modal').classList.remove('hidden');
  });

  document.getElementById('confirm-char-no').addEventListener('click', () => {
    document.getElementById('confirm-char-modal').classList.add('hidden');
  });

  document.getElementById('confirm-char-yes').addEventListener('click', async () => {
    document.getElementById('confirm-char-modal').classList.add('hidden');

    const charData = {
      skinColor: document.getElementById('creator-skin').value,
      costume: document.getElementById('creator-costume').value,
      clothesColor: document.getElementById('creator-clothes').value,
      hairStyle: document.getElementById('creator-hair-style').value,
      hairColor: document.getElementById('creator-hair-color').value,
      weapon: document.getElementById('creator-weapon').value,
      wings: document.getElementById('creator-wings').value,
      element: document.getElementById('creator-element').value
    };

    try {
      const res = await fetch('/api/character/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.user.id, characterData: charData })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      state.user = data.user;
      localStorage.setItem('ew_event_user', JSON.stringify(data.user));
      showNotification('Персонаж успешно создан и закреплен!', 'success');
      setTimeout(() => {
        location.reload();
      }, 500);
    } catch (err) {
      showNotification(err.message || 'Ошибка при сохранении персонажа', 'error');
    }
  });

  function updateBodyScrollLock() {
    const shopCard = document.querySelector('.shop-card');
    const profileDrawer = document.getElementById('profile-drawer');
    const shopOpen = shopCard && shopCard.classList.contains('open');
    const profileOpen = profileDrawer && profileDrawer.classList.contains('open');
    if (shopOpen || profileOpen) {
      document.body.classList.add('scroll-locked');
    } else {
      document.body.classList.remove('scroll-locked');
    }
  }

  document.getElementById('open-profile-btn').addEventListener('click', () => {
    const drawer = document.getElementById('profile-drawer');
    drawer.classList.add('open');
    updateDrawerPreview();
    updateDrawerEquipment();
    refreshProfile();
    updateBodyScrollLock();
  });

  document.getElementById('close-profile-btn').addEventListener('click', () => {
    document.getElementById('profile-drawer').classList.remove('open');
    updateBodyScrollLock();
  });

  document.addEventListener('click', (e) => {
    const drawer = document.getElementById('profile-drawer');
    const openBtn = document.getElementById('open-profile-btn');
    const mobileBtn = document.getElementById('mobile-open-profile-btn');
    if (drawer && drawer.classList.contains('open')) {
      if (!drawer.contains(e.target) && !openBtn.contains(e.target) && (!mobileBtn || !mobileBtn.contains(e.target))) {
        drawer.classList.remove('open');
        updateBodyScrollLock();
      }
    }
  });

  const slotCostume = document.getElementById('slot-costume');
  if (slotCostume) {
    slotCostume.addEventListener('click', () => openEqPanel('costume'));
  }
  const slotWeapon = document.getElementById('slot-weapon');
  if (slotWeapon) {
    slotWeapon.addEventListener('click', () => openEqPanel('weapon'));
  }
  const closeEqPanelBtn = document.getElementById('eq-panel-close-btn');
  if (closeEqPanelBtn) {
    closeEqPanelBtn.addEventListener('click', closeEqPanel);
  }

  const mobileOpenProfileBtn = document.getElementById('mobile-open-profile-btn');
  if (mobileOpenProfileBtn) {
    mobileOpenProfileBtn.addEventListener('click', () => {
      const drawer = document.getElementById('profile-drawer');
      drawer.classList.add('open');
      updateDrawerPreview();
      updateDrawerEquipment();
      refreshProfile();
      updateBodyScrollLock();
    });
  }

  const mobileOpenShopBtn = document.getElementById('mobile-open-shop-btn');
  if (mobileOpenShopBtn) {
    mobileOpenShopBtn.addEventListener('click', () => {
      const shopCard = document.querySelector('.shop-card');
      if (shopCard) shopCard.classList.add('open');
      updateBodyScrollLock();
    });
  }

  const closeShopBtn = document.getElementById('close-shop-btn');
  if (closeShopBtn) {
    closeShopBtn.addEventListener('click', () => {
      const shopCard = document.querySelector('.shop-card');
      if (shopCard) shopCard.classList.remove('open');
      updateBodyScrollLock();
    });
  }

  document.querySelectorAll('.shop-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shop-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeShopTab = btn.getAttribute('data-tab');
      if (state.activeShopTab === 'casino') {
        document.getElementById('shop-items-list').classList.add('hidden');
        document.getElementById('casino-section').classList.remove('hidden');
        initCasinoWheel();
      } else if (state.activeShopTab === 'equipment') {
        document.getElementById('shop-items-list').classList.remove('hidden');
        document.getElementById('casino-section').classList.add('hidden');
        renderEquipmentShop();
      } else {
        document.getElementById('shop-items-list').classList.remove('hidden');
        document.getElementById('casino-section').classList.add('hidden');
        renderShopItems();
      }
    });
  });

  document.querySelectorAll('.casino-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.casino-color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  document.getElementById('casino-spin-btn').addEventListener('click', casinoSpin);

  document.getElementById('close-cell-info-tag').addEventListener('click', () => {
    state.selectedCellInfo = null;
    clearTimeout(state.cellInfoTimeout);
    hideCellInfoTag();
  });

  document.getElementById('close-guild-tax-btn').addEventListener('click', () => {
    document.getElementById('guild-tax-modal').classList.add('hidden');
  });

  const adminCellRewType = document.getElementById('admin-cell-rew-type');
  if (adminCellRewType) {
    adminCellRewType.addEventListener('change', () => {
      const helper = document.getElementById('admin-card-helper-group');
      if (adminCellRewType.value === 'card') {
        helper.classList.remove('hidden');
      } else {
        helper.classList.add('hidden');
      }
    });
  }

  const fetchCardBtn = document.getElementById('admin-fetch-card-btn');
  if (fetchCardBtn) {
    fetchCardBtn.addEventListener('click', async () => {
      const url = document.getElementById('admin-cell-card-url').value.trim();
      if (!url) {
        showNotification('Пожалуйста, введите ссылку на карту', 'error');
        return;
      }
      try {
        const res = await fetch('/api/admin/fetch-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardUrl: url, requesterUserId: state.user.id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        document.getElementById('admin-cell-rew-name').value = `Карта: ${data.title} (${data.characterName})`;
        document.getElementById('admin-cell-rew-detail').value = data.cover;
        showNotification('Карта найдена и заполнена!', 'success');
      } catch (err) {
        showNotification(err.message, 'error');
      }
    });
  }

  function animateDiceRoll(rollValue, callback) {
    const overlay = document.getElementById('dice-overlay');
    const cube = document.getElementById('dice-cube');
    const resultText = document.getElementById('dice-result-text');

    resultText.textContent = 'Бросаем кубик...';
    overlay.classList.remove('hidden');
    cube.style.transition = 'none';
    cube.style.transform = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
    cube.classList.add('spinning');

    setTimeout(() => {
      cube.classList.remove('spinning');
      cube.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)';

      let targetX = 0;
      let targetY = 0;

      switch (rollValue) {
        case 1: targetX = 0; targetY = 0; break;
        case 6: targetX = 0; targetY = 180; break;
        case 2: targetX = 0; targetY = -90; break;
        case 5: targetX = 0; targetY = 90; break;
        case 3: targetX = -90; targetY = 0; break;
        case 4: targetX = 90; targetY = 0; break;
      }

      cube.style.transform = `rotateX(${targetX + 720}deg) rotateY(${targetY + 720}deg)`;

      setTimeout(() => {
        resultText.textContent = `Выпало число: ${rollValue}`;
        setTimeout(() => {
          overlay.classList.add('hidden');
          if (callback) callback();
        }, 1000);
      }, 1200);
    }, 1200);
  }

  document.getElementById('roll-dice-btn').addEventListener('click', async () => {
    try {
      state.diceRolling = true;
      const res = await fetch('/api/board/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.user.id })
      });

      const data = await res.json();
      if (!res.ok) {
        state.diceRolling = false;
        throw new Error(data.error);
      }

      const bossEnc = data.bossEncounter;

      animateDiceRoll(data.baseRoll !== undefined ? data.baseRoll : data.roll, () => {
        state.diceRolling = false;
        if (state.pendingSelfMove) {
          performSelfMovement(state.pendingSelfMove);
          state.pendingSelfMove = null;
          if (bossEnc) {
            refreshProfile().then(() => {
              showPendingBossModal(bossEnc);
            });
          } else {
            refreshProfile();
          }
        } else {
          refreshProfile().then(() => {
            if (bossEnc) {
              showPendingBossModal(bossEnc);
            }
          });
        }
      });
    } catch (err) {
      showNotification(err.message, 'error');
    }
  });

  const creatorInputs = [
    'creator-skin', 'creator-costume', 'creator-clothes',
    'creator-hair-style', 'creator-hair-color',
    'creator-weapon', 'creator-wings', 'creator-element'
  ];
  creatorInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', updateCreatorPreview);
      el.addEventListener('input', updateCreatorPreview);
    }
  });

  const historyListEl = document.getElementById('action-history');
  if (historyListEl) {
    historyListEl.addEventListener('scroll', async () => {
      if (historyListEl.scrollHeight - historyListEl.scrollTop - historyListEl.clientHeight < 20) {
        if (state.loadingMoreHistory || state.allHistoryLoaded) return;
        state.loadingMoreHistory = true;
        try {
          const offset = state.globalHistory ? state.globalHistory.length : 0;
          const res = await fetch(`/api/history/global?limit=50&offset=${offset}`);
          if (res.ok) {
            const data = await res.json();
            if (data.length === 0) {
              state.allHistoryLoaded = true;
            } else {
              const existingIds = new Set(state.globalHistory.map(item => item.id));
              const newItems = data.filter(item => !existingIds.has(item.id));
              if (newItems.length === 0) {
                state.allHistoryLoaded = true;
              } else {
                state.globalHistory = [...state.globalHistory, ...newItems];
                updateGlobalHistoryUI(true, newItems);
              }
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          state.loadingMoreHistory = false;
        }
      }
    });
  }
}

function initCreator3D() {
  const container = document.getElementById('creator-canvas-container');
  if (!container || state.creator.renderer) return;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 500;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#030509');

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10);
  camera.position.set(0, 0.7, 2.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1;
  controls.maxDistance = 5;
  controls.target.set(0, 0.7, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(2, 4, 3);
  dirLight.castShadow = true;
  scene.add(dirLight);

  state.creator.scene = scene;
  state.creator.camera = camera;
  state.creator.renderer = renderer;
  state.creator.controls = controls;

  updateCreatorPreview();

  const animate = () => {
    if (!state.creator.renderer) return;
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();
}

function destroyCreator3D() {
  if (state.creator.renderer) {
    try {
      state.creator.renderer.dispose();
    } catch (e) { }
  }
  const container = document.getElementById('creator-canvas-container');
  if (container) container.innerHTML = '';
  state.creator = {
    scene: null,
    camera: null,
    renderer: null,
    group: null,
    controls: null
  };
}

function updateCreatorPreview() {
  if (!state.creator.scene) return;

  if (state.creator.group) {
    state.creator.scene.remove(state.creator.group);
  }

  const charData = {
    skinColor: document.getElementById('creator-skin').value,
    costume: document.getElementById('creator-costume').value,
    clothesColor: document.getElementById('creator-clothes').value,
    hairStyle: document.getElementById('creator-hair-style').value,
    hairColor: document.getElementById('creator-hair-color').value,
    weapon: document.getElementById('creator-weapon').value,
    wings: document.getElementById('creator-wings').value,
    element: document.getElementById('creator-element').value
  };

  state.creator.group = create3DCharacterMesh(charData);
  state.creator.scene.add(state.creator.group);

  updateCreatorStatsUI(charData);
}

function updateCreatorStatsUI(charData) {
  const baseHp = 100;
  const baseDmg = 10;
  let bonusHp = 0;
  let bonusDmg = 0;

  const weapon = charData.weapon || 'none';
  if (weapon === 'sword') bonusDmg += 20;
  else if (weapon === 'staff') { bonusDmg += 10; bonusHp += 10; }
  else if (weapon === 'shield') { bonusDmg += 5; bonusHp += 30; }
  else if (weapon === 'axe') bonusDmg += 40;
  else if (weapon === 'bow') { bonusDmg += 20; bonusHp += 50; }
  else if (weapon === 'scythe') { bonusDmg += 30; bonusHp += 20; }
  else if (weapon === 'hammer') { bonusDmg += 80; bonusHp += 100; }

  const costume = charData.costume || 'normal';
  if (costume === 'armor') bonusHp += 100;
  else if (costume === 'robe') { bonusHp += 20; bonusDmg += 10; }
  else if (costume === 'cyber') { bonusHp += 30; bonusDmg += 5; }
  else if (costume === 'steampunk') { bonusHp += 55; bonusDmg += 10; }
  else if (costume === 'ninja_suit') { bonusHp += 200; bonusDmg += 30; }

  const totalHp = baseHp + bonusHp;
  const totalDmg = baseDmg + bonusDmg;

  const statHpEl = document.getElementById('creator-stat-hp');
  if (statHpEl) statHpEl.textContent = totalHp;
  const statDmgEl = document.getElementById('creator-stat-dmg');
  if (statDmgEl) statDmgEl.textContent = totalDmg;

  const element = charData.element || 'water';
  const elementNames = {
    water: 'Вода',
    fire: 'Огонь',
    earth: 'Земля',
    wind: 'Ветер'
  };

  const elementDescriptions = {
    water: 'Повышенный урон по боссам: (120 ячейка) и (240 ячейка).',
    fire: 'Повышенный урон по боссам: (90 ячейка) и (210 ячейка).',
    earth: 'Повышенный урон по боссам: (60 ячейка) и (180 ячейка).',
    wind: 'Повышенный урон по боссам: (30 ячейка), (150 ячейка) и (270 ячейка).'
  };

  const statElementEl = document.getElementById('creator-stat-element');
  if (statElementEl) statElementEl.textContent = elementNames[element] || element;
  const statElementDescEl = document.getElementById('creator-stat-element-desc');
  if (statElementDescEl) statElementDescEl.textContent = elementDescriptions[element] || '';

  const helpEl = document.getElementById('creator-element-help');
  if (helpEl) {
    helpEl.textContent = elementDescriptions[element] || '';
  }
}

function updateOnlineList() {
  const container = document.getElementById('online-players-list');
  if (!container) return;
  container.innerHTML = '';

  const list = state.players || [];
  list.forEach(player => {
    const item = document.createElement('div');
    item.className = 'online-user-item';
    item.style.cursor = 'pointer';

    if (state.taggedPlayer && String(state.taggedPlayer.player.id) === String(player.id)) {
      item.classList.add('selected');
    }

    item.addEventListener('click', () => {
      const idStr = String(player.id);
      const playerObj = state.boardPlayers.get(idStr);
      if (playerObj) {
        state.taggedPlayer = { player: player, mesh: playerObj.mesh };
        smoothCameraFocus(playerObj.mesh.position);

        // Re-render list to show selected state styling
        document.querySelectorAll('.online-user-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
      }
    });

    const tgSrc = `/api/tg-avatar/${player.tg_id}`;
    const remangaSrc = player.remanga_avatar ? getAvatarUrl(player.remanga_avatar) : '';
    const fallbackText = (player.tg_first_name || 'EW').substring(0, 2).toUpperCase();

    const avatarHtml = `
      <div class="online-avatar">
        <img src="${tgSrc}" referrerpolicy="no-referrer"
             onload="this.style.display='block'; if(this.nextElementSibling) this.nextElementSibling.style.display='none';" 
             onerror="if(this.getAttribute('data-tried-remanga')!=='true' && '${remangaSrc}'){this.setAttribute('data-tried-remanga','true');this.src='${remangaSrc}';}else{this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='flex';}" 
             style="display:none; width:100%; height:100%; object-fit:cover; border-radius:50%;">
        <div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%; border-radius:50%; background:transparent; color:#00f0ff; font-size:11px; font-weight:bold;">${fallbackText}</div>
      </div>
    `;

    const statusColor = player.isOnline ? '#2ecc71' : '#95a5a6';

    let challengeBtnHtml = '';
    if (player.isOnline && String(player.id) !== String(state.user.id)) {
      challengeBtnHtml = `<button class="btn btn-sm" style="padding: 3px 6px; font-size: 9px; line-height: 1; margin-left: auto; margin-right: 6px; background: linear-gradient(135deg, #ff007c 0%, #ff4b00 100%); border: none; color: #fff; border-radius: 4px;" onclick="event.stopPropagation(); challengePlayer(${player.id})">⚔️</button>`;
    }

    item.innerHTML = `
      <div class="online-user-info" style="display:flex; align-items:center; justify-content:space-between; width:100%;">
        <div style="display:flex; align-items:center; gap:8px;">
          ${avatarHtml}
          <div class="online-meta">
            <span class="online-name" style="font-weight: 500;">${player.tg_first_name || 'Игрок'}</span>
            <span class="online-cell text-cyan" style="font-size: 10px;">Ячейка: ${player.current_cell}</span>
          </div>
        </div>
        ${challengeBtnHtml}
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${statusColor}; box-shadow: 0 0 6px ${statusColor};"></span>
      </div>
    `;
    container.appendChild(item);
  });
}

function addMovementLog(moveData) {
  const container = document.getElementById('movement-messages');
  if (!container) return;
  const msg = document.createElement('div');
  msg.className = 'log-message';

  if (moveData.forced) {
    msg.innerHTML = `<span class="text-gold">${moveData.tg_username || 'Игрок'}</span> отброшен назад на ячейку <span class="text-cyan">${moveData.endCell}</span>`;
  } else if (moveData.roll === 0) {
    msg.innerHTML = `<span class="text-gold">${moveData.tg_username || 'Игрок'}</span> перемещен на ячейку <span class="text-cyan">${moveData.endCell}</span>`;
  } else {
    msg.innerHTML = `<span class="text-gold">${moveData.tg_username || 'Игрок'}</span> выбросил <span class="text-cyan">${moveData.roll}</span> и идет на ячейку <span class="text-cyan">${moveData.endCell}</span>`;
  }

  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;

  if (container.children.length > 30) {
    container.removeChild(container.firstChild);
  }
}

function updateDiceButton() {
  clearInterval(state.diceTimer);
  const btn = document.getElementById('roll-dice-btn');
  const timerDiv = document.getElementById('dice-cooldown');

  if (!state.user.dice_cooldown_until) {
    btn.disabled = false;
    timerDiv.textContent = 'Готов к броску';
    return;
  }

  const check = () => {
    const now = new Date();
    const cooldown = new Date(state.user.dice_cooldown_until);

    if (cooldown <= now) {
      btn.disabled = false;
      timerDiv.textContent = 'Готов к броску';
      clearInterval(state.diceTimer);
    } else {
      btn.disabled = true;
      const diffMs = cooldown - now;
      const mins = Math.floor(diffMs / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      timerDiv.textContent = `Откат: ${mins}м ${secs}с`;
    }
  };

  check();
  state.diceTimer = setInterval(check, 1000);
}

async function loadShop() {
  try {
    const res = await fetch('/api/shop');
    const data = await res.json();
    state.shopItems = data.items;
    renderShopItems();
  } catch (err) {

  }
}

function renderShopItems() {
  const container = document.getElementById('shop-items-list');
  if (!container) return;
  container.innerHTML = '';

  const activeTab = state.activeShopTab || 'buffs';
  const filtered = (state.shopItems || []).filter(item => {
    if (activeTab === 'buffs') {
      return ['shield', 'cure', 'double_roll'].includes(item.item_type);
    } else {
      return ['freeze', 'pusher', 'slowness'].includes(item.item_type);
    }
  });

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'shop-item-card';
    card.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="shop-item-footer">
        <span class="shop-item-cost">${item.cost} монет</span>
        <button class="btn btn-secondary btn-sm" onclick="buyItem('${item.id}')">Купить</button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.buyItem = async (itemId) => {
  try {
    const res = await fetch('/api/shop/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user.id, itemId })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    showNotification('Предмет успешно куплен!', 'success');
    refreshProfile();
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

async function renderEquipmentShop() {
  const container = document.getElementById('shop-items-list');
  if (!container) return;
  container.innerHTML = '<div class="info-note">Загрузка...</div>';

  try {
    const res = await fetch('/api/equipment/shop');
    const data = await res.json();
    const eqRes = state.user ? await fetch(`/api/equipment/inventory?userId=${state.user.id}`) : null;
    const eqData = eqRes ? await eqRes.json() : { items: [] };
    const ownedKeys = (eqData.items || []).map(i => i.item_key);

    container.innerHTML = '';

    const weapons = data.items.filter(i => i.category === 'weapon');
    const costumes = data.items.filter(i => i.category === 'costume');

    const weaponHeader = document.createElement('div');
    weaponHeader.style.cssText = 'font-size: 14px; font-weight: 700; color: #ffcc00; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid rgba(255,204,0,0.2);';
    weaponHeader.textContent = '⚔️ Оружие';
    container.appendChild(weaponHeader);

    weapons.forEach(item => {
      const owned = ownedKeys.includes(item.key);
      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="shop-item-footer">
          <span class="shop-item-cost">${item.cost} монет</span>
          ${owned ? '<span style="color: #00ff66; font-size: 11px; font-weight: 600;">✓ Куплено</span>' : `<button class="btn btn-secondary btn-sm" onclick="buyEquipment('${item.id}')">Купить</button>`}
        </div>
      `;
      container.appendChild(card);
    });

    const costumeHeader = document.createElement('div');
    costumeHeader.style.cssText = 'font-size: 14px; font-weight: 700; color: #00f0ff; margin: 15px 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid rgba(0,240,255,0.2);';
    costumeHeader.textContent = '🛡️ Костюмы';
    container.appendChild(costumeHeader);

    costumes.forEach(item => {
      const owned = ownedKeys.includes(item.key);
      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="shop-item-footer">
          <span class="shop-item-cost">${item.cost} монет</span>
          ${owned ? '<span style="color: #00ff66; font-size: 11px; font-weight: 600;">✓ Куплено</span>' : `<button class="btn btn-secondary btn-sm" onclick="buyEquipment('${item.id}')">Купить</button>`}
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '<div class="info-note">Ошибка загрузки магазина</div>';
  }
}

window.buyEquipment = async (itemId) => {
  try {
    const res = await fetch('/api/equipment/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user.id, itemId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showNotification('Экипировка куплена!', 'success');
    refreshProfile();
    if (state.activeShopTab === 'equipment') renderEquipmentShop();
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

window.equipItem = async (itemKey, category) => {
  try {
    const res = await fetch('/api/equipment/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user.id, itemKey, category })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    state.user.character_data = data.character_data;
    showNotification('Экипировка изменена!', 'success');
    updateDrawerPreview();
    updateDrawerEquipment();
    updateDrawerStats();
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

async function updateDrawerEquipment() {
  if (!state.user) return;
  try {
    const res = await fetch(`/api/equipment/inventory?userId=${state.user.id}`);
    const data = await res.json();

    const charData = state.user.character_data || {};
    const currentWeapon = charData.weapon || 'none';
    const currentCostume = charData.costume || 'normal';

    const starterCostumes = [
      { key: 'normal', name: 'Обычный', desc: 'без бонусов' },
      { key: 'armor', name: 'Рыцарский доспех', desc: '+100 HP' },
      { key: 'robe', name: 'Мантия мага', desc: '+20 HP, +10 DMG' }
    ];
    const starterWeapons = [
      { key: 'none', name: 'Без оружия', desc: 'без бонусов' },
      { key: 'sword', name: 'Энерг. меч', desc: '+20 DMG' },
      { key: 'staff', name: 'Посох мага', desc: '+10 HP, +10 DMG' },
      { key: 'shield', name: 'Энерг. щит', desc: '+30 HP, +5 DMG' }
    ];

    const activeW = starterWeapons.find(w => w.key === currentWeapon);
    const activeC = starterCostumes.find(c => c.key === currentCostume);

    const shopWeapons = [
      { key: 'axe', name: 'Боевой топор', desc: '+40 DMG' },
      { key: 'bow', name: 'Лук', desc: '+50 HP, +20 DMG' },
      { key: 'scythe', name: 'Коса смерти', desc: '+20 HP, +30 DMG' },
      { key: 'hammer', name: 'Молот Тора', desc: '+100 HP, +80 DMG' }
    ];
    const shopCostumes = [
      { key: 'cyber', name: 'Кибер-костюм', desc: '+30 HP, +5 DMG' },
      { key: 'steampunk', name: 'Стимпанк жилет', desc: '+55 HP, +10 DMG' },
      { key: 'ninja_suit', name: 'Костюм шиноби', desc: '+200 HP, +30 DMG' }
    ];

    const weaponName = activeW ? activeW.name : (shopWeapons.find(w => w.key === currentWeapon)?.name || 'Неизвестно');
    const costumeName = activeC ? activeC.name : (shopCostumes.find(c => c.key === currentCostume)?.name || 'Неизвестно');

    const slotCostumeValueEl = document.getElementById('slot-costume-value');
    const slotWeaponValueEl = document.getElementById('slot-weapon-value');
    if (slotCostumeValueEl) slotCostumeValueEl.textContent = costumeName;
    if (slotWeaponValueEl) slotWeaponValueEl.textContent = weaponName;

  } catch (err) { }
}

async function openEqPanel(category) {
  const panel = document.getElementById('drawer-eq-select-panel');
  const title = document.getElementById('eq-panel-title');
  const listEl = document.getElementById('eq-panel-list');
  if (!panel || !title || !listEl || !state.user) return;

  title.textContent = category === 'costume' ? 'Выбор костюма' : 'Выбор оружия';
  listEl.innerHTML = '';
  panel.classList.remove('hidden');
  setTimeout(() => panel.classList.add('open'), 10);

  try {
    const res = await fetch(`/api/equipment/inventory?userId=${state.user.id}`);
    const data = await res.json();

    const charData = state.user.character_data || {};
    const currentWeapon = charData.weapon || 'none';
    const currentCostume = charData.costume || 'normal';

    const starterCostumes = [
      { key: 'normal', name: 'Обычный', desc: 'без бонусов' },
      { key: 'armor', name: 'Рыцарский доспех', desc: '+100 HP' },
      { key: 'robe', name: 'Мантия мага', desc: '+20 HP, +10 DMG' }
    ];
    const starterWeapons = [
      { key: 'none', name: 'Без оружия', desc: 'без бонусов' },
      { key: 'sword', name: 'Энерг. меч', desc: '+20 DMG' },
      { key: 'staff', name: 'Посох мага', desc: '+10 HP, +10 DMG' },
      { key: 'shield', name: 'Энерг. щит', desc: '+30 HP, +5 DMG' }
    ];

    if (category === 'costume') {
      const startingCKey = data.startingCostume || 'normal';
      const startOption = starterCostumes.find(c => c.key === startingCKey);

      const options = [];
      if (startOption) {
        options.push(startOption);
      }

      const ownedCostumes = (data.items || []).filter(i => i.item_category === 'costume');
      ownedCostumes.forEach(c => {
        options.push({
          key: c.item_key,
          name: c.name,
          desc: `+${c.bonus_hp} HP, +${c.bonus_dmg} DMG`
        });
      });

      options.forEach(opt => {
        const active = currentCostume === opt.key;
        const btn = document.createElement('button');
        btn.className = `eq-select-btn ${active ? 'active' : ''}`;
        btn.innerHTML = `
          <div style="font-weight: 700; color: #fff; font-size: 12px; margin-bottom: 2px;">${opt.name}</div>
          <div style="font-size: 10px; color: #8c9ba5;">${opt.desc}</div>
        `;
        btn.onclick = async () => {
          await equipItem(opt.key, 'costume');
          closeEqPanel();
        };
        listEl.appendChild(btn);
      });

    } else {
      const startingWKey = data.startingWeapon || 'none';
      const startOption = starterWeapons.find(w => w.key === startingWKey);

      const options = [];
      if (startOption) {
        options.push(startOption);
      }

      const ownedWeapons = (data.items || []).filter(i => i.item_category === 'weapon');
      ownedWeapons.forEach(w => {
        options.push({
          key: w.item_key,
          name: w.name,
          desc: `+${w.bonus_hp} HP, +${w.bonus_dmg} DMG`
        });
      });

      options.forEach(opt => {
        const active = currentWeapon === opt.key;
        const btn = document.createElement('button');
        btn.className = `eq-select-btn ${active ? 'active weapon' : ''}`;
        btn.innerHTML = `
          <div style="font-weight: 700; color: #fff; font-size: 12px; margin-bottom: 2px;">${opt.name}</div>
          <div style="font-size: 10px; color: #8c9ba5;">${opt.desc}</div>
        `;
        btn.onclick = async () => {
          await equipItem(opt.key, 'weapon');
          closeEqPanel();
        };
        listEl.appendChild(btn);
      });
    }
  } catch (err) { }
}

function closeEqPanel() {
  const panel = document.getElementById('drawer-eq-select-panel');
  if (panel) {
    panel.classList.remove('open');
    setTimeout(() => panel.classList.add('hidden'), 300);
  }
}

function updateDrawerStats() {
  if (!state.user) return;
  const stats = getPlayerBattleStats(state.user);
  const hpEl = document.getElementById('drawer-hp');
  const dmgEl = document.getElementById('drawer-dmg');
  const elemEl = document.getElementById('drawer-element');
  if (hpEl) hpEl.textContent = stats.maxHp;
  if (dmgEl) dmgEl.textContent = stats.dmg;
  const elementNames = { water: 'Вода', fire: 'Огонь', earth: 'Земля', wind: 'Ветер' };
  if (elemEl) elemEl.textContent = elementNames[stats.element] || stats.element;
}

function updateInventoryUI() {
  const mainInv = document.getElementById('inventory-list');
  const drawerInv = document.getElementById('drawer-inventory-list');

  if (mainInv) {
    mainInv.innerHTML = '';
    const filteredMain = state.inventory.filter(item => item.item_type !== 'remanga_card' && item.item_type !== 'premium_subscription');
    if (filteredMain.length === 0) {
      mainInv.innerHTML = '<div class="info-note">Инвентарь пуст</div>';
    } else {
      filteredMain.forEach(item => {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        let btnHtml = '';
        if (item.item_type === 'shield' || item.item_type === 'cure' || item.item_type === 'double_roll') {
          btnHtml = `<button class="btn btn-primary btn-sm" onclick="useItem(${item.id}, null)">Использовать</button>`;
        } else {
          btnHtml = `<button class="btn btn-primary btn-sm" onclick="openUseModal(${item.id}, '${item.name}', '${item.description}')">Выбрать цель</button>`;
        }
        div.innerHTML = `
          <div class="inventory-item-header">
            <span class="inventory-item-name">${item.name}</span>
            ${btnHtml}
          </div>
          <span class="inventory-item-desc">${item.description}</span>
        `;
        mainInv.appendChild(div);
      });
    }
  }

  const maxSlots = (state.user && state.user.inventory_slots) || 10;
  const prizes = state.inventory.filter(item => (item.item_type === 'remanga_card' || item.item_type === 'premium_subscription') && !item.is_pvp_trophy);
  const pvpTrophies = state.inventory.filter(item => (item.item_type === 'remanga_card' || item.item_type === 'premium_subscription') && item.is_pvp_trophy);
  const slotsInfoEl = document.getElementById('drawer-inventory-slots-info');
  if (slotsInfoEl) {
    slotsInfoEl.textContent = `(${prizes.length} / ${maxSlots})`;
  }
  const buyContainer = document.getElementById('buy-slots-container');
  if (buyContainer) {
    if (maxSlots < 20) {
      buyContainer.classList.remove('hidden');
    } else {
      buyContainer.classList.add('hidden');
    }
  }

  if (drawerInv) {
    drawerInv.innerHTML = '';
    if (state.inventory.length === 0) {
      drawerInv.innerHTML = '<div class="info-note">Инвентарь пуст</div>';
    } else {
      const normalItems = state.inventory.filter(item => item.item_type !== 'remanga_card' && item.item_type !== 'premium_subscription');

      prizes.sort((a, b) => {
        const cellA = a.origin_cell_number !== null ? a.origin_cell_number : 999999;
        const cellB = b.origin_cell_number !== null ? b.origin_cell_number : 999999;
        return cellA - cellB;
      });

      const countHeader = document.createElement('div');
      countHeader.style.cssText = 'grid-column: 1 / -1; font-size: 12px; font-weight: 600; color: #ffb800; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;';
      countHeader.innerHTML = `Призы (заполнено: ${prizes.length} из ${maxSlots})`;
      drawerInv.appendChild(countHeader);

      if (prizes.length === 0) {
        const emptyPrizes = document.createElement('div');
        emptyPrizes.className = 'info-note';
        emptyPrizes.style.cssText = 'grid-column: 1 / -1; margin-bottom: 15px;';
        emptyPrizes.textContent = 'Нет полученных призов';
        drawerInv.appendChild(emptyPrizes);
      } else {
        prizes.forEach(item => {
          const div = document.createElement('div');
          let removeBtn = '';
          if (item.origin_cell_number !== null) {
            removeBtn = `<button class="btn btn-danger btn-sm" style="display: block; width: 100%; margin-top: 8px; font-size: 11px; padding: 4px 8px; border-radius: 6px;" onclick="confirmRemoveReward(${item.id}, '${item.name.replace(/'/g, "\\'")}')">Убрать</button>`;
          }
          const cellText = item.origin_cell_number !== null ? `<div style="font-size: 10px; color: #8c9ba5; text-align: center; margin-top: 4px;">Ячейка: ${item.origin_cell_number}</div>` : '';

          if (item.item_type === 'remanga_card') {
            let cover = item.description || '';
            if (cover.includes('|')) {
              cover = cover.split('|')[0];
            }
            div.className = 'inventory-item card-item-container';
            div.innerHTML = `
              <div class="card-item-cover-wrapper" style="text-align: center; margin-bottom: 8px;">
                ${getCardMediaHTML(cover, 'card-item-cover', '', `alt="${item.name}" onerror="this.onerror=null; this.src='https://api.remanga.org/media/card-item/cover_2a9a0d1b6da54356.webp';"`)}
              </div>
              <div class="card-item-name" style="text-align: center; font-size: 11px; font-weight: 700; color: #00f0ff;">${item.name}</div>
              ${cellText}
              ${removeBtn}
            `;
          } else {
            div.className = 'inventory-item';
            div.innerHTML = `
              <div class="inventory-item-header" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                <span class="inventory-item-name">${item.name}</span>
                ${cellText}
                ${removeBtn}
              </div>
              <span class="inventory-item-desc">${item.description}</span>
            `;
          }
          drawerInv.appendChild(div);
        });
      }

      const pvpHeader = document.createElement('div');
      pvpHeader.style.cssText = 'grid-column: 1 / -1; font-size: 12px; font-weight: 600; color: #ff007c; margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;';
      pvpHeader.innerHTML = `Трофеи PvP (заполнено: ${pvpTrophies.length} из 30)`;
      drawerInv.appendChild(pvpHeader);

      if (pvpTrophies.length === 0) {
        const emptyPvp = document.createElement('div');
        emptyPvp.className = 'info-note';
        emptyPvp.style.cssText = 'grid-column: 1 / -1; margin-bottom: 15px;';
        emptyPvp.textContent = 'Нет PvP трофеев';
        drawerInv.appendChild(emptyPvp);
      } else {
        pvpTrophies.forEach(item => {
          const div = document.createElement('div');
          let discardBtn = `<button class="btn btn-danger btn-sm" style="display: block; width: 100%; margin-top: 8px; font-size: 11px; padding: 4px 8px; border-radius: 6px; background: linear-gradient(135deg, #ff4b00 0%, #ff007c 100%); border: none;" onclick="discardPvpCard(${item.id})">Слить (500 🪙)</button>`;
          let cover = item.description || '';
          if (cover.includes('|')) {
            cover = cover.split('|')[0];
          }
          div.className = 'inventory-item card-item-container';
          div.style.border = '1px solid rgba(255, 0, 124, 0.2)';
          div.innerHTML = `
            <div class="card-item-cover-wrapper" style="text-align: center; margin-bottom: 8px;">
              ${getCardMediaHTML(cover, 'card-item-cover', '', `alt="${item.name}" onerror="this.onerror=null; this.src='https://api.remanga.org/media/card-item/cover_2a9a0d1b6da54356.webp';"`)}
            </div>
            <div class="card-item-name" style="text-align: center; font-size: 11px; font-weight: 700; color: #ff007c;">${item.name}</div>
            <div style="font-size: 10px; color: #8c9ba5; text-align: center; margin-top: 4px;">🏆 Трофей PvP</div>
            ${discardBtn}
          `;
          drawerInv.appendChild(div);
        });
      }

      const itemsHeader = document.createElement('div');
      itemsHeader.style.cssText = 'grid-column: 1 / -1; font-size: 12px; font-weight: 600; color: #00f0ff; margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;';
      itemsHeader.textContent = 'Расходники';
      drawerInv.appendChild(itemsHeader);

      if (normalItems.length === 0) {
        const emptyItems = document.createElement('div');
        emptyItems.className = 'info-note';
        emptyItems.style.cssText = 'grid-column: 1 / -1;';
        emptyItems.textContent = 'Нет активных расходников';
        drawerInv.appendChild(emptyItems);
      } else {
        normalItems.forEach(item => {
          const div = document.createElement('div');
          div.className = 'inventory-item';
          let btnHtml = '';
          if (item.item_type === 'shield' || item.item_type === 'cure' || item.item_type === 'double_roll') {
            btnHtml = `<button class="btn btn-primary btn-sm" onclick="useItem(${item.id}, null)">Использовать</button>`;
          } else {
            btnHtml = `<button class="btn btn-primary btn-sm" onclick="openUseModal(${item.id}, '${item.name}', '${item.description}')">Выбрать цель</button>`;
          }
          div.innerHTML = `
            <div class="inventory-item-header">
              <span class="inventory-item-name">${item.name}</span>
              ${btnHtml}
            </div>
            <span class="inventory-item-desc">${item.description}</span>
          `;
          drawerInv.appendChild(div);
        });
      }
    }
  }
}

function updateEffectsUI() {
  const containers = [
    document.getElementById('effects-list'),
    document.getElementById('drawer-effects-list')
  ].filter(Boolean);

  containers.forEach(container => {
    container.innerHTML = '';
    if (state.activeEffects.length === 0) {
      container.innerHTML = '<div class="info-note">Нет активных эффектов</div>';
      return;
    }

    state.activeEffects.forEach(effect => {
      const div = document.createElement('div');
      div.className = 'active-effect-item';
      const expires = formatDateTime(effect.expires_at);
      div.innerHTML = `
        <div class="active-effect-name">${effect.name}</div>
        <div class="active-effect-duration">Действует до: ${expires}</div>
      `;
      container.appendChild(div);
    });
  });
}

function updatePersonalHistoryUI() {
  const drawerContainer = document.getElementById('drawer-history-list');
  if (!drawerContainer) return;
  drawerContainer.innerHTML = '';

  if (state.history.length === 0) {
    drawerContainer.innerHTML = '<div class="info-note">История пуста</div>';
    return;
  }

  state.history.forEach(item => {
    const div = document.createElement('div');
    div.className = `history-item ${item.action}`;
    const date = formatDateTime(item.timestamp);
    div.innerHTML = `
      <div>${item.detail}</div>
      <div class="history-item-time">${date}</div>
    `;
    drawerContainer.appendChild(div);
  });
}

function addPersonalHistoryItem(item) {
  const drawerContainer = document.getElementById('drawer-history-list');
  if (!drawerContainer) return;

  const div = document.createElement('div');
  div.className = `history-item ${item.action}`;
  const date = formatDateTime(item.timestamp);
  div.innerHTML = `
    <div>${item.detail}</div>
    <div class="history-item-time">${date}</div>
  `;
  drawerContainer.insertBefore(div, drawerContainer.firstChild);
}

function updateGlobalHistoryUI(appendOnly = false, appendedItems = []) {
  const mainContainer = document.getElementById('action-history');
  if (!mainContainer) return;

  if (!state.globalHistory || state.globalHistory.length === 0) {
    mainContainer.innerHTML = '<div class="info-note">История пуста</div>';
    return;
  }

  const emptyNote = mainContainer.querySelector('.info-note');
  if (emptyNote) {
    emptyNote.remove();
  }

  const createItemDOM = (item) => {
    const div = document.createElement('div');
    div.className = `history-item ${item.action || ''}`;
    const date = formatDateTime(item.timestamp);
    const displayName = item.tg_first_name || item.tg_username || `Игрок ${item.user_id}`;
    const userSpan = `<span style="color: #00f0ff; font-weight: bold;">${displayName}</span>: `;
    div.innerHTML = `
      <div>${userSpan}${item.detail}</div>
      <div class="history-item-time">${date}</div>
    `;
    return div;
  };

  if (appendOnly && appendedItems.length > 0) {
    appendedItems.forEach(item => {
      mainContainer.appendChild(createItemDOM(item));
    });
  } else {
    const scrollTop = mainContainer.scrollTop;
    mainContainer.innerHTML = '';
    state.globalHistory.forEach(item => {
      mainContainer.appendChild(createItemDOM(item));
    });
    mainContainer.scrollTop = scrollTop;
  }
}

let activeUseInventoryId = null;

window.openUseModal = (inventoryId, name, desc) => {
  activeUseInventoryId = inventoryId;
  document.getElementById('use-item-name').textContent = name;
  document.getElementById('use-item-desc').textContent = desc;

  const select = document.getElementById('use-target-select');
  select.innerHTML = '';

  const list = state.players || [];
  list.forEach(p => {
    if (p.id !== state.user.id) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.tg_first_name || 'Игрок'} (${p.tg_username ? '@' + p.tg_username : 'ID ' + p.id})`;
      select.appendChild(opt);
    }
  });

  if (select.children.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Нет других игроков';
    select.appendChild(opt);
  }

  document.getElementById('use-item-modal').classList.remove('hidden');
};

document.getElementById('close-use-modal-btn').addEventListener('click', () => {
  document.getElementById('use-item-modal').classList.add('hidden');
});

const openDeposit = () => {
  document.getElementById('deposit-modal').classList.remove('hidden');
};
const closeDeposit = () => {
  document.getElementById('deposit-modal').classList.add('hidden');
};

const headerBal = document.getElementById('header-balance-container');
if (headerBal) headerBal.addEventListener('click', openDeposit);

const shopBal = document.getElementById('shop-balance-container');
if (shopBal) shopBal.addEventListener('click', openDeposit);

const drawerBal = document.getElementById('drawer-balance-container');
if (drawerBal) drawerBal.addEventListener('click', openDeposit);

const closeDepBtn = document.getElementById('close-deposit-modal-btn');
if (closeDepBtn) closeDepBtn.addEventListener('click', closeDeposit);

const closeDepBtnBottom = document.getElementById('close-deposit-modal-btn-bottom');
if (closeDepBtnBottom) closeDepBtnBottom.addEventListener('click', closeDeposit);

document.getElementById('confirm-use-btn').addEventListener('click', async () => {
  const targetId = document.getElementById('use-target-select').value;
  if (!targetId && document.getElementById('use-target-select').options[0].value === '') {
    showNotification('Нет доступной цели!', 'error');
    return;
  }

  await useItem(activeUseInventoryId, targetId);
  document.getElementById('use-item-modal').classList.add('hidden');
});

async function useItem(inventoryId, targetUserId) {
  try {
    const res = await fetch('/api/shop/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user.id, inventoryId, targetUserId })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    showNotification(data.message, 'success');
    refreshProfile();
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

window.useItem = useItem;

function setupAdminTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const contentId = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const targetContent = document.getElementById(contentId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  const searchInput = document.getElementById('admin-search-users');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderAdminUsers(e.target.value);
    });
  }

  const refreshBtn = document.getElementById('admin-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await loadAdminUsers();
      await loadCells();
      showNotification('Данные обновлены!', 'success');
    });
  }

  const cellNumInput = document.getElementById('admin-cell-number');
  if (cellNumInput) {
    cellNumInput.addEventListener('input', (e) => {
      const idx = parseInt(e.target.value);
      if (idx >= 0 && idx < 300) {
        loadAdminCellData(idx);
      }
    });
  }

  const addMultiCardBtn = document.getElementById('admin-cell-multi-card-add-btn');
  if (addMultiCardBtn) {
    addMultiCardBtn.addEventListener('click', async () => {
      const urlInput = document.getElementById('admin-cell-multi-card-url');
      const url = urlInput ? urlInput.value.trim() : '';
      if (!url) return;
      try {
        addMultiCardBtn.setAttribute('disabled', 'true');
        const res = await fetch('/api/admin/fetch-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardUrl: url, requesterUserId: state.user.id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');
        adminSelectedMultiCards.push({
          id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          type: 'card',
          cover: data.cover,
          name: data.characterName || data.title,
          char: data.characterName,
          claimed_by_user_id: null,
          claimed_by_username: null
        });
        urlInput.value = '';
        renderAdminMultiCardsList();
        showNotification('Карта добавлена в список!', 'success');
      } catch (e) {
        showNotification(e.message, 'error');
      } finally {
        addMultiCardBtn.removeAttribute('disabled');
      }
    });
  }

  const saveCellBtn = document.getElementById('save-cell-btn');
  if (saveCellBtn) {
    saveCellBtn.addEventListener('click', async () => {
      try {
        const cellNumEl = document.getElementById('admin-cell-number');
        const typeEl = document.getElementById('admin-cell-type');
        const valueEl = document.getElementById('admin-cell-value');
        const rewTypeEl = document.getElementById('admin-cell-rew-type');
        const rewNameEl = document.getElementById('admin-cell-rew-name');
        const rewDetailEl = document.getElementById('admin-cell-rew-detail');

        const cellNumber = cellNumEl ? parseInt(cellNumEl.value) : 0;
        const type = typeEl ? typeEl.value : 'normal';
        const value = valueEl ? parseInt(valueEl.value) : 0;
        const rewardType = rewTypeEl ? rewTypeEl.value : 'none';
        const rewardName = rewNameEl ? rewNameEl.value.trim() : '';
        const rewardDetail = rewDetailEl ? rewDetailEl.value.trim() : '';

        const multiCoins = parseInt(document.getElementById('admin-cell-multi-coins').value) || 0;
        const multiPremium = parseInt(document.getElementById('admin-cell-multi-premium').value) || 0;

        let rewardsArr = [];
        if (multiCoins > 0) {
          rewardsArr.push({
            id: 'coins',
            type: 'coins',
            value: multiCoins,
            name: `${multiCoins} монет`
          });
        }
        if (multiPremium > 0) {
          let oldPrem = null;
          if (state.cells[cellNumber] && state.cells[cellNumber].rewards_json) {
            try {
              const oldRewards = JSON.parse(state.cells[cellNumber].rewards_json);
              oldPrem = oldRewards.find(r => r.type === 'premium');
            } catch (e) {}
          }
          rewardsArr.push({
            id: oldPrem ? oldPrem.id : 'premium_' + Date.now(),
            type: 'premium',
            value: multiPremium,
            name: `Премиум статус ${multiPremium} дн.`,
            claimed_by_user_id: oldPrem ? oldPrem.claimed_by_user_id : null,
            claimed_by_username: oldPrem ? oldPrem.claimed_by_username : null
          });
        }

        adminSelectedMultiCards.forEach(card => {
          let oldCard = null;
          if (state.cells[cellNumber] && state.cells[cellNumber].rewards_json) {
            try {
              const oldRewards = JSON.parse(state.cells[cellNumber].rewards_json);
              oldCard = oldRewards.find(r => r.type === 'card' && (r.id ? r.id === card.id : r.name === card.name));
            } catch (e) {}
          }
          rewardsArr.push({
            id: card.id,
            type: 'card',
            cover: card.cover,
            name: card.name,
            char: card.char,
            claimed_by_user_id: oldCard ? oldCard.claimed_by_user_id : card.claimed_by_user_id,
            claimed_by_username: oldCard ? oldCard.claimed_by_username : card.claimed_by_username
          });
        });

        const rewardsJson = rewardsArr.length > 0 ? JSON.stringify(rewardsArr) : null;

        if (!state.user) throw new Error('Пользователь не авторизован');

        const res = await fetch('/api/admin/cells/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cellNumber, type, value, rewardType, rewardName, rewardDetail, rewardsJson, requesterUserId: state.user.id })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Ошибка обновления ячейки');
        }
        showNotification('Данные ячейки обновлены!', 'success');
        await loadCells();

        if (state.boardScene) {
          state.boardScene.remove(state.tileObjects[cellNumber]);
          const pos = getTilePosition(cellNumber);
          let color = '#121d33';
          if (cellNumber === 0) color = '#ffb800';
          else if (cellNumber === 299) color = '#00f0ff';
          else if (type === 'forward') color = '#2ecc71';
          else if (type === 'backward') color = '#e74c3c';
          else if (type === 'obstacle') color = '#e67e22';

          const tileGeo = new THREE.BoxGeometry(2.4, 0.3, 2.4);
          const tileMesh = new THREE.Mesh(tileGeo, createTileMaterials(cellNumber, color));
          tileMesh.position.set(pos.x, pos.y, pos.z);
          state.boardScene.add(tileMesh);
          state.tileObjects[cellNumber] = tileMesh;

          if (state.floatingIcons[cellNumber]) {
            state.boardScene.remove(state.floatingIcons[cellNumber]);
          }
          const cellData = state.cells[cellNumber] || { type: 'normal' };
          const iconMesh = createFloatingIconMesh(cellData);
          if (iconMesh) {
            iconMesh.position.set(pos.x, 1.2, pos.z);
            iconMesh.userData = { baseY: 1.2, offset: Math.random() * 10 };
            state.boardScene.add(iconMesh);
            state.floatingIcons[cellNumber] = iconMesh;
          } else {
            state.floatingIcons[cellNumber] = null;
          }

          layoutBoardElements();
        }
      } catch (err) {
        showNotification(err.message || 'Ошибка обновления ячейки', 'error');
      }
    });
  }

  const simDonationBtn = document.getElementById('sim-donation-btn');
  if (simDonationBtn) {
    simDonationBtn.addEventListener('click', async () => {
      try {
        const remangaIdEl = document.getElementById('sim-remanga-id');
        const coinsAmountEl = document.getElementById('sim-coins-amount');

        const remangaUserId = remangaIdEl ? parseInt(remangaIdEl.value) : 0;
        const coinsToAdd = coinsAmountEl ? parseInt(coinsAmountEl.value) : 0;

        if (!remangaUserId || !coinsToAdd) {
          throw new Error('Заполните все поля симуляции');
        }

        const res = await fetch('/api/admin/simulate-donation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ remangaUserId, coinsToAdd })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        showNotification(data.message, 'success');
        refreshProfile();
      } catch (err) {
        showNotification(err.message || 'Ошибка симуляции доната', 'error');
      }
    });
  }

  const saveSettingsBtn = document.getElementById('save-settings-btn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      try {
        const cooldownEl = document.getElementById('admin-setting-cooldown');
        const shieldEl = document.getElementById('admin-price-shield');
        const freezeEl = document.getElementById('admin-price-freeze');
        const pusherEl = document.getElementById('admin-price-pusher');
        const cureEl = document.getElementById('admin-price-cure');
        const slownessEl = document.getElementById('admin-price-slowness');
        const doubleRollEl = document.getElementById('admin-price-double_roll');
        const removeRewardEl = document.getElementById('admin-price-remove-reward');

        const eqAxeEl = document.getElementById('admin-price-eq_axe');
        const eqBowEl = document.getElementById('admin-price-eq_bow');
        const eqScytheEl = document.getElementById('admin-price-eq_scythe');
        const eqHammerEl = document.getElementById('admin-price-eq_hammer');
        const eqCyberEl = document.getElementById('admin-price-eq_cyber');
        const eqSteampunkEl = document.getElementById('admin-price-eq_steampunk');
        const eqNinjaEl = document.getElementById('admin-price-eq_ninja');
        const whitelistEl = document.getElementById('admin-whitelist-chats');

        const dice_cooldown = cooldownEl ? (parseInt(cooldownEl.value) || 0) : 0;
        const price_shield = shieldEl ? (parseInt(shieldEl.value) || 0) : 0;
        const price_freeze = freezeEl ? (parseInt(freezeEl.value) || 0) : 0;
        const price_pusher = pusherEl ? (parseInt(pusherEl.value) || 0) : 0;
        const price_cure = cureEl ? (parseInt(cureEl.value) || 0) : 0;
        const price_slowness = slownessEl ? (parseInt(slownessEl.value) || 0) : 0;
        const price_double_roll = doubleRollEl ? (parseInt(doubleRollEl.value) || 0) : 0;
        const price_remove_reward = removeRewardEl ? (parseInt(removeRewardEl.value) || 0) : 0;

        const price_eq_axe = eqAxeEl ? (parseInt(eqAxeEl.value) || 0) : 0;
        const price_eq_bow = eqBowEl ? (parseInt(eqBowEl.value) || 0) : 0;
        const price_eq_scythe = eqScytheEl ? (parseInt(eqScytheEl.value) || 0) : 0;
        const price_eq_hammer = eqHammerEl ? (parseInt(eqHammerEl.value) || 0) : 0;
        const price_eq_cyber = eqCyberEl ? (parseInt(eqCyberEl.value) || 0) : 0;
        const price_eq_steampunk = eqSteampunkEl ? (parseInt(eqSteampunkEl.value) || 0) : 0;
        const price_eq_ninja = eqNinjaEl ? (parseInt(eqNinjaEl.value) || 0) : 0;
        const whitelist_chat_ids = whitelistEl ? whitelistEl.value.trim() : '';

        if (!state.user) throw new Error('Пользователь не авторизован');

        const res = await fetch('/api/admin/settings/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dice_cooldown,
            price_shield,
            price_freeze,
            price_pusher,
            price_cure,
            price_slowness,
            price_double_roll,
            price_remove_reward,
            price_eq_axe,
            price_eq_bow,
            price_eq_scythe,
            price_eq_hammer,
            price_eq_cyber,
            price_eq_steampunk,
            price_eq_ninja,
            whitelist_chat_ids,
            requesterUserId: state.user.id
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Ошибка сервера при сохранении настроек');
        }
        showNotification('Настройки сохранены!', 'success');
      } catch (err) {
        showNotification(err.message || 'Ошибка при сохранении настроек', 'error');
      }
    });
  }
}

async function loadAdminUsers() {
  try {
    const res = await fetch(`/api/admin/users?requesterUserId=${state.user.id}`);
    const data = await res.json();
    state.adminUsers = data.users;

    const searchVal = document.getElementById('admin-search-users').value;
    renderAdminUsers(searchVal);
  } catch (err) {
  }
}

async function loadAdminSettings() {
  try {
    const activeEl = document.activeElement;
    const settingsInputs = [
      'admin-setting-cooldown',
      'admin-price-shield',
      'admin-price-freeze',
      'admin-price-pusher',
      'admin-price-cure',
      'admin-price-slowness',
      'admin-price-double_roll',
      'admin-price-remove-reward',
      'admin-price-eq_axe',
      'admin-price-eq_bow',
      'admin-price-eq_scythe',
      'admin-price-eq_hammer',
      'admin-price-eq_cyber',
      'admin-price-eq_steampunk',
      'admin-price-eq_ninja',
      'admin-whitelist-chats'
    ];
    if (activeEl && settingsInputs.includes(activeEl.id)) {
      return;
    }
    const res = await fetch(`/api/admin/settings?requesterUserId=${state.user.id}`);
    const data = await res.json();
    const cooldownSetting = data.settings.find(s => s.key === 'dice_cooldown');
    if (cooldownSetting) {
      document.getElementById('admin-setting-cooldown').value = cooldownSetting.value;
    }
    const price_shield = data.settings.find(s => s.key === 'price_shield') || { value: '150' };
    const price_freeze = data.settings.find(s => s.key === 'price_freeze') || { value: '250' };
    const price_pusher = data.settings.find(s => s.key === 'price_pusher') || { value: '200' };
    const price_cure = data.settings.find(s => s.key === 'price_cure') || { value: '100' };
    const price_slowness = data.settings.find(s => s.key === 'price_slowness') || { value: '180' };
    const price_double_roll = data.settings.find(s => s.key === 'price_double_roll') || { value: '300' };
    const price_remove_reward = data.settings.find(s => s.key === 'price_remove_reward') || { value: '100' };

    const price_eq_axe = data.settings.find(s => s.key === 'price_eq_axe') || { value: '500' };
    const price_eq_bow = data.settings.find(s => s.key === 'price_eq_bow') || { value: '600' };
    const price_eq_scythe = data.settings.find(s => s.key === 'price_eq_scythe') || { value: '700' };
    const price_eq_hammer = data.settings.find(s => s.key === 'price_eq_hammer') || { value: '2000' };
    const price_eq_cyber = data.settings.find(s => s.key === 'price_eq_cyber') || { value: '400' };
    const price_eq_steampunk = data.settings.find(s => s.key === 'price_eq_steampunk') || { value: '800' };
    const price_eq_ninja = data.settings.find(s => s.key === 'price_eq_ninja') || { value: '3000' };

    document.getElementById('admin-price-shield').value = price_shield.value;
    document.getElementById('admin-price-freeze').value = price_freeze.value;
    document.getElementById('admin-price-pusher').value = price_pusher.value;
    document.getElementById('admin-price-cure').value = price_cure.value;
    document.getElementById('admin-price-slowness').value = price_slowness.value;
    document.getElementById('admin-price-double_roll').value = price_double_roll.value;
    document.getElementById('admin-price-remove-reward').value = price_remove_reward.value;

    document.getElementById('admin-price-eq_axe').value = price_eq_axe.value;
    document.getElementById('admin-price-eq_bow').value = price_eq_bow.value;
    document.getElementById('admin-price-eq_scythe').value = price_eq_scythe.value;
    document.getElementById('admin-price-eq_hammer').value = price_eq_hammer.value;
    document.getElementById('admin-price-eq_cyber').value = price_eq_cyber.value;
    document.getElementById('admin-price-eq_steampunk').value = price_eq_steampunk.value;
    document.getElementById('admin-price-eq_ninja').value = price_eq_ninja.value;

    const whitelist = data.settings.find(s => s.key === 'whitelist_chat_ids');
    const whitelistEl = document.getElementById('admin-whitelist-chats');
    if (whitelistEl) whitelistEl.value = whitelist ? whitelist.value : '';
  } catch (err) {
  }
}

function renderAdminUsers(filter = '') {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const query = filter.toLowerCase().trim();
  const filtered = (state.adminUsers || []).filter(u => {
    const name = (u.tg_first_name || '').toLowerCase();
    const username = (u.tg_username || '').toLowerCase();
    const id = String(u.id);
    return name.includes(query) || username.includes(query) || id.includes(query);
  });

  filtered.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.tg_first_name || ''} (@${u.tg_username || ''})</td>
      <td>${u.current_cell}</td>
      <td>${u.balance}</td>
      <td>
        <div style="display:flex; gap:4px;">
          <button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px;" onclick="quickAddCoins(${u.id})">+100</button>
          <button class="btn btn-primary btn-sm" style="padding:2px 6px; font-size:10px;" onclick="editUserModal(${u.id}, ${u.balance}, ${u.current_cell}, ${u.is_admin}, '${u.tg_first_name || ''}', ${u.guild_tax_required || 0}, ${u.guild_tax_paid || 0})">Изм.</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.quickAddCoins = async (userId) => {
  try {
    const user = state.adminUsers.find(u => u.id === userId);
    if (!user) return;
    const res = await fetch('/api/admin/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        balance: user.balance + 100,
        currentCell: user.current_cell,
        isAdmin: user.is_admin,
        requesterUserId: state.user.id
      })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Ошибка сервера');
    }
    showNotification('Баланс пополнен на +100 монет!', 'success');
    await loadAdminUsers();
    refreshProfile();
  } catch (err) {
    showNotification(err.message || 'Ошибка при изменении баланса', 'error');
  }
};

window.editUserModal = async (userId, oldBalance, oldCell, isAdmin, name, taxRequired = 0, taxPaid = 0) => {
  document.getElementById('edit-user-id').value = userId;
  document.getElementById('edit-user-name').value = name;
  document.getElementById('edit-user-balance').value = oldBalance;
  document.getElementById('edit-user-cell').value = oldCell;
  document.getElementById('edit-user-tax-required').value = taxRequired;
  document.getElementById('edit-user-tax-paid').value = taxPaid;
  document.getElementById('edit-user-admin').checked = (isAdmin === 1);

  const cdInput = document.getElementById('edit-user-cooldown');
  if (cdInput) {
    cdInput.value = '';
    cdInput.dataset.original = '';
  }

  const remangaContainer = document.getElementById('edit-user-remanga-link-container');
  if (remangaContainer) {
    remangaContainer.innerHTML = '<span style="color: #8c9ba5; font-size: 13px;">Загрузка...</span>';
  }

  const invEl = document.getElementById('edit-user-inventory');
  const effEl = document.getElementById('edit-user-effects');
  if (invEl) invEl.innerHTML = '<div style="font-size: 11px; color: #8c9ba5;">Загрузка...</div>';
  if (effEl) effEl.innerHTML = '<div style="font-size: 11px; color: #8c9ba5;">Загрузка...</div>';

  document.getElementById('admin-edit-modal').classList.remove('hidden');

  try {
    const res = await fetch(`/api/profile/${userId}`);
    if (!res.ok) throw new Error();
    const data = await res.json();

    if (cdInput && data.user) {
      let cooldownMinutes = 0;
      if (data.user.dice_cooldown_until) {
        const diffMs = new Date(data.user.dice_cooldown_until) - new Date();
        if (diffMs > 0) {
          cooldownMinutes = Math.ceil(diffMs / 60000);
        }
      }
      cdInput.value = cooldownMinutes;
      cdInput.dataset.original = cooldownMinutes;
    }

    if (remangaContainer && data.user) {
      if (data.user.remanga_user_id) {
        remangaContainer.innerHTML = `<a href="https://remanga.org/user/${data.user.remanga_user_id}" target="_blank" style="color: #00f0ff; text-decoration: underline; font-size: 13px;">Профиль Remanga (${data.user.remanga_username || data.user.remanga_user_id})</a>`;
      } else {
        remangaContainer.innerHTML = '<span style="color: #ff4a4a; font-size: 13px;">Не привязан</span>';
      }
    }

    if (invEl) {
      invEl.innerHTML = '';
      if (data.inventory.length === 0) {
        invEl.innerHTML = '<div style="font-size: 11px; color: #8c9ba5; grid-column: 1 / -1;">Инвентарь пуст</div>';
      } else {
        data.inventory.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.style.cssText = 'background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; padding: 6px; font-size: 11px; display: flex; flex-direction: column; gap: 4px;';

          if (item.item_type === 'remanga_card') {
            let cover = item.description || '';
            if (cover.includes('|')) {
              cover = cover.split('|')[0];
            }
            itemDiv.innerHTML = `
              <div style="text-align: center;">
                ${getCardMediaHTML(cover, '', 'width: 50px; height: auto; border-radius: 4px; border: 1px solid rgba(0,240,255,0.2);', `onerror="this.onerror=null; this.src='https://api.remanga.org/media/card-item/cover_2a9a0d1b6da54356.webp';"`)}
              </div>
              <div style="font-weight: bold; color: #00f0ff; text-align: center; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.name}</div>
              <div style="font-size: 9px; color: #8c9ba5; text-align: center;">Ячейка: ${item.origin_cell_number || '-'}</div>
            `;
          } else {
            itemDiv.innerHTML = `
              <div style="font-weight: bold; color: #ffb800; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.name}</div>
              <div style="font-size: 9px; color: #8c9ba5; text-overflow: ellipsis; overflow: hidden;">${item.description}</div>
              ${item.origin_cell_number !== null ? `<div style="font-size: 9px; color: #8c9ba5;">Ячейка: ${item.origin_cell_number}</div>` : ''}
            `;
          }
          invEl.appendChild(itemDiv);
        });
      }
    }

    if (effEl) {
      effEl.innerHTML = '';
      if (data.activeEffects.length === 0) {
        effEl.innerHTML = '<div style="font-size: 11px; color: #8c9ba5;">Нет активных эффектов</div>';
      } else {
        data.activeEffects.forEach(effect => {
          const effDiv = document.createElement('div');
          effDiv.style.cssText = 'background: rgba(231,76,60,0.08); border-left: 2px solid #e74c3c; border-radius: 4px; padding: 6px; font-size: 11px;';
          const expires = formatDateTime(effect.expires_at);
          effDiv.innerHTML = `
            <div style="font-weight: bold; color: #ffffff;">${effect.name}</div>
            <div style="font-size: 9px; color: #8c9ba5;">До: ${expires}</div>
          `;
          effEl.appendChild(effDiv);
        });
      }
    }
  } catch (err) {
    if (invEl) invEl.innerHTML = '<div style="font-size: 11px; color: #ff4a4a; grid-column: 1 / -1;">Ошибка загрузки</div>';
    if (effEl) effEl.innerHTML = '<div style="font-size: 11px; color: #ff4a4a;">Ошибка загрузки</div>';
  }
};

document.getElementById('close-admin-edit-btn').addEventListener('click', () => {
  document.getElementById('admin-edit-modal').classList.add('hidden');
});

document.getElementById('save-user-edit-btn').addEventListener('click', async () => {
  const userId = parseInt(document.getElementById('edit-user-id').value);
  const balance = parseInt(document.getElementById('edit-user-balance').value);
  const currentCell = parseInt(document.getElementById('edit-user-cell').value);
  const guildTaxRequired = parseInt(document.getElementById('edit-user-tax-required').value) || 0;
  const guildTaxPaid = parseInt(document.getElementById('edit-user-tax-paid').value) || 0;
  const isAdmin = document.getElementById('edit-user-admin').checked ? 1 : 0;

  const cdInput = document.getElementById('edit-user-cooldown');
  let diceCooldownUntil = undefined;
  if (cdInput) {
    const cooldownMinutes = parseInt(cdInput.value) || 0;
    const original = parseInt(cdInput.dataset.original) || 0;
    if (cooldownMinutes !== original) {
      if (cooldownMinutes <= 0) {
        diceCooldownUntil = null;
      } else {
        diceCooldownUntil = new Date(Date.now() + cooldownMinutes * 60000).toISOString();
      }
    }
  }

  try {
    const res = await fetch('/api/admin/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, balance, currentCell, isAdmin, guildTaxRequired, guildTaxPaid, diceCooldownUntil, requesterUserId: state.user.id })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка при обновлении пользователя');

    showNotification('Данные игрока обновлены!', 'success');
    document.getElementById('admin-edit-modal').classList.add('hidden');
    loadAdminUsers();
    refreshProfile();
  } catch (err) {
    showNotification(err.message, 'error');
  }
});

let adminSelectedMultiCards = [];
function renderAdminMultiCardsList() {
  const container = document.getElementById('admin-cell-multi-cards-list');
  if (!container) return;
  container.innerHTML = '';
  adminSelectedMultiCards.forEach((card, idx) => {
    const itemDiv = document.createElement('div');
    itemDiv.style.cssText = 'display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-bottom: 2px; gap: 8px;';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = card.name || 'Карта';
    nameInput.style.cssText = 'background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 11px; padding: 2px 4px; border-radius: 3px; flex: 1; margin: 0; box-sizing: border-box;';
    nameInput.addEventListener('input', (e) => {
      card.name = e.target.value;
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.style.cssText = 'background: none; border: none; cursor: pointer; padding: 0 4px;';
    delBtn.addEventListener('click', () => {
      adminSelectedMultiCards.splice(idx, 1);
      renderAdminMultiCardsList();
    });
    
    itemDiv.appendChild(nameInput);
    itemDiv.appendChild(delBtn);
    container.appendChild(itemDiv);
  });
}
function loadAdminCellData(cellIndex) {
  const cell = state.cells[cellIndex] || { type: 'normal', value: 0, reward_type: 'none', reward_name: '', reward_detail: '' };
  document.getElementById('admin-cell-type').value = cell.type;
  document.getElementById('admin-cell-value').value = cell.value;
  document.getElementById('admin-cell-rew-type').value = cell.reward_type;
  document.getElementById('admin-cell-rew-name').value = cell.reward_name;
  document.getElementById('admin-cell-rew-detail').value = cell.reward_detail;

  const helper = document.getElementById('admin-card-helper-group');
  if (cell.reward_type === 'card') {
    helper.classList.remove('hidden');
    document.getElementById('admin-cell-card-url').value = '';
  } else {
    helper.classList.add('hidden');
  }

  let coinsVal = 0;
  let premVal = 0;
  adminSelectedMultiCards = [];
  if (cell.rewards_json) {
    try {
      const rewards = JSON.parse(cell.rewards_json);
      const coinsItem = rewards.find(r => r.type === 'coins');
      if (coinsItem) coinsVal = coinsItem.value || 0;
      const premItem = rewards.find(r => r.type === 'premium');
      if (premItem) premVal = premItem.value || 0;
      adminSelectedMultiCards = rewards.filter(r => r.type === 'card');
    } catch (e) {
      console.error('Failed to parse rewards_json in admin editor', e);
    }
  }
  document.getElementById('admin-cell-multi-coins').value = coinsVal;
  document.getElementById('admin-cell-multi-premium').value = premVal;
  renderAdminMultiCardsList();
}

let bossPreviewRenderer = null;
let bossPreviewAnimationId = null;

function hideCellInfoTag() {
  const tag = document.getElementById('cell-info-tag');
  if (tag) tag.classList.add('hidden');
  if (bossPreviewAnimationId) {
    cancelAnimationFrame(bossPreviewAnimationId);
    bossPreviewAnimationId = null;
  }
  if (bossPreviewRenderer) {
    bossPreviewRenderer.dispose();
    bossPreviewRenderer = null;
  }
}

function initBossPreview3D(bossIndex) {
  if (bossPreviewAnimationId) {
    cancelAnimationFrame(bossPreviewAnimationId);
    bossPreviewAnimationId = null;
  }
  if (bossPreviewRenderer) {
    bossPreviewRenderer.dispose();
    bossPreviewRenderer = null;
  }

  const canvas = document.getElementById('boss-preview-canvas');
  if (!canvas) return;

  const width = canvas.clientWidth || 140;
  const height = canvas.clientHeight || 140;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  bossPreviewRenderer = renderer;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 1.2, 4);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(2, 4, 3);
  scene.add(dirLight);

  if (cachedBossGLTF[bossIndex]) {
    const model = (typeof THREE.SkeletonUtils !== 'undefined')
      ? THREE.SkeletonUtils.clone(cachedBossGLTF[bossIndex])
      : cachedBossGLTF[bossIndex].clone();

    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetHeight = 1.6;
    const autoScale = maxDim > 0 ? (targetHeight / maxDim) : 1.0;
    model.scale.set(autoScale, autoScale, autoScale);

    const box2 = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box2.getCenter(center);
    model.position.x = -center.x;
    model.position.y = -center.y + 0.8;
    model.position.z = -center.z;

    let mixer = null;
    if (cachedBossGLTF[bossIndex].animations && cachedBossGLTF[bossIndex].animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(cachedBossGLTF[bossIndex].animations[0]);
      action.play();
    }

    const clock = new THREE.Clock();
    const animatePreview = () => {
      bossPreviewAnimationId = requestAnimationFrame(animatePreview);
      const delta = clock.getDelta();
      if (mixer) {
        mixer.update(delta);
      }
      model.rotation.y += 0.015;
      renderer.render(scene, camera);
    };
    animatePreview();
  }
}

function showCellInfoTag(cellIndex) {
  if (bossPreviewAnimationId) {
    cancelAnimationFrame(bossPreviewAnimationId);
    bossPreviewAnimationId = null;
  }
  if (bossPreviewRenderer) {
    bossPreviewRenderer.dispose();
    bossPreviewRenderer = null;
  }

  const cell = state.cells ? state.cells[cellIndex] : null;
  if (!cell) return;

  const tag = document.getElementById('cell-info-tag');
  if (tag) {
    if (window.innerWidth <= 768) {
      tag.style.minWidth = '270px';
      tag.style.maxWidth = '340px';
      tag.style.width = '90%';
    } else {
      tag.style.minWidth = '200px';
      tag.style.maxWidth = '280px';
      tag.style.width = '';
    }
  }

  const contentEl = document.getElementById('cell-info-tag-content');
  if (!contentEl) return;

  let html = `<div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">Ячейка #${cellIndex}</div>`;
  const bossCells = [30, 60, 90, 120, 150, 180, 210, 240, 270, 299];
  const isBossCell = bossCells.includes(cellIndex);

  if (isBossCell) {
    const boss = (state.bosses || []).find(b => b.cell_number === cellIndex);
    if (boss) {
      html += `<div style="font-size: 11px; font-weight: 700; color: #ff4a4a; margin-bottom: 8px;">БОСС</div>`;
      html += `<div style="font-size: 12px; color: #ffffff; margin-bottom: 4px;"><strong>Босс:</strong> ${boss.name}</div>`;
      html += `<div style="text-align: center; margin: 8px 0;">
        <canvas id="boss-preview-canvas" style="width: 140px; height: 140px; border-radius: 8px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: inset 0 0 10px rgba(0,0,0,0.6); display: inline-block; vertical-align: middle;"></canvas>
      </div>`;
      html += `<div style="font-size: 11px; color: #aaaaaa; margin-bottom: 6px;"><strong>Характеристики:</strong> HP: ${boss.hp}/${boss.max_hp} | DMG: ${boss.dmg}</div>`;

      let rewText = '';
      if (boss.reward_type === 'coins') {
        rewText = `${boss.reward_coins} монет`;
      } else if (boss.reward_type === 'card') {
        try {
          if (boss.reward_detail.startsWith('[')) {
            const list = JSON.parse(boss.reward_detail);
            rewText = `Карты (${list.length} шт.)`;
          } else {
            const parts = (boss.reward_detail || '').split('|');
            rewText = `Карта: ${parts[1] || 'Случайная'}`;
          }
        } catch (e) {
          rewText = 'Карта';
        }
      } else {
        rewText = `${boss.reward_type} (${boss.reward_detail})`;
      }

      html += `<div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-top: 6px;">
        <div style="font-size: 10px; font-weight: 700; color: #ffb800; margin-bottom: 4px;">Награда за победу:</div>
        <div style="font-size: 11px; color: #ffffff; margin-bottom: 6px;">${rewText}</div>`;

      if (!boss.defeated) {
        if (boss.reward_type === 'card' && boss.reward_detail) {
          let cards = [];
          try {
            if (boss.reward_detail.startsWith('[')) {
              cards = JSON.parse(boss.reward_detail);
            } else {
              const parts = boss.reward_detail.split('|');
              cards = [{ cover: parts[0] }];
            }
          } catch (e) {}

          if (cards.length > 0) {
            html += `<div style="display: flex; gap: 4px; overflow-x: auto; padding: 4px 0; margin-top: 6px; justify-content: center;">`;
            cards.forEach(card => {
              html += getCardMediaHTML(card.cover, '', 'width: 68px; height: 95px; object-fit: cover; border-radius: 4px; box-shadow: 0 0 5px rgba(255, 56, 56, 0.3); border: 1px solid rgba(255, 56, 56, 0.15);', 'alt="Награда"');
            });
            html += `</div>`;
          }
        }
      } else {
        html += `<div style="font-size: 10px; color: #ff4a4a; font-weight: bold; margin-top: 6px;">Победитель: ${boss.defeated_by_username || 'Неизвестно'}</div>`;

        if (boss.reward_type === 'card' && boss.reward_detail) {
          let cards = [];
          try {
            if (boss.reward_detail.startsWith('[')) {
              cards = JSON.parse(boss.reward_detail);
            } else {
              const parts = boss.reward_detail.split('|');
              cards = [{
                id: 'card_legacy',
                type: 'card',
                cover: parts[0] || '',
                name: parts[1] || boss.name + ' — Карта',
                char: parts[2] || '',
                claimed_by_user_id: null,
                claimed_by_username: null
              }];
            }
          } catch (e) {}

          const displayName = (state.user && (state.user.tg_first_name || state.user.tg_username)) || `Игрок ${state.user ? state.user.id : ''}`;
          const isKiller = boss.defeated_by_username === displayName;

          if (cards.length > 0) {
            html += `<div style="margin-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px;">`;
            html += `<div style="font-size: 10px; font-weight: 700; color: #00f0ff; margin-bottom: 2px;">Наградные карты:</div>`;
            html += `<div style="font-size: 9px; color: #8c9ba5; margin-bottom: 6px; font-style: italic;">Можно забрать одну или все карты</div>`;
            html += `<div style="display: flex; flex-direction: column; gap: 6px;">`;
            cards.forEach(card => {
              const claimed = card.claimed_by_user_id !== null && card.claimed_by_user_id !== undefined;
              let claimStatusText = '';
              if (claimed) {
                claimStatusText = `<span style="font-size: 9px; color: #ff4a4a; font-weight: bold;">Забрано (${card.claimed_by_username || ''})</span>`;
              } else {
                const isKiller = (state.user && boss.defeated_by_user_id === state.user.id) || boss.defeated_by_username === displayName;
                const killerIsOnBossCell = boss.killer_current_cell === boss.cell_number;
                const userIsOnBossCell = state.user && state.user.current_cell === boss.cell_number;
                const canClaim = userIsOnBossCell && (isKiller || !killerIsOnBossCell);

                if (canClaim) {
                  claimStatusText = `<button class="btn btn-primary btn-sm" style="padding: 2px 6px; font-size: 10px; background: #00f0ff; color: #000; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;" onclick="claimBossCard(${boss.cell_number}, '${card.id}')">Забрать</button>`;
                } else if (killerIsOnBossCell) {
                  claimStatusText = `<span style="font-size: 9px; color: #ffb800;">Ожидание выбора</span>`;
                } else {
                  claimStatusText = `<span style="font-size: 9px; color: #8c9ba5;">Встаньте на ячейку</span>`;
                }
              }

              html += `
                <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 4px; padding: 4px 6px;">
                  <div style="display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;">
                    ${getCardMediaHTML(card.cover, '', 'width: 25px; height: 35px; object-fit: cover; border-radius: 2px; flex-shrink: 0;')}
                    <span style="font-size: 10px; color: #fff; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; text-align: left;" title="${card.name}">${card.name}</span>
                  </div>
                  <div style="flex-shrink: 0; margin-left: 8px;">${claimStatusText}</div>
                </div>
              `;
            });
            html += `</div></div>`;
          }
        }
      }
      html += `</div>`;

      contentEl.innerHTML = html;
      document.getElementById('cell-info-tag').classList.remove('hidden');

      const bossIndex = bossCells.indexOf(cellIndex);
      setTimeout(() => {
        initBossPreview3D(bossIndex);
      }, 0);
      return;
    }
  }

  let typeText = 'Обычная ячейка';
  if (cell.type === 'forward') typeText = `Портал (+${cell.value})`;
  else if (cell.type === 'backward') typeText = `Ловушка (-${cell.value})`;
  else if (cell.type === 'obstacle') typeText = `Болото (${cell.value} мин.)`;
  else if (cell.type === 'guild_tax') typeText = `Налог (${cell.value} молн.)`;

  html += `<div style="font-size: 11px; font-weight: 700; color: #00f0ff; margin-bottom: 8px;">${typeText}</div>`;

  if (cell.reward_type && cell.reward_type !== 'none') {
    let rewType = 'Награда';
    if (cell.reward_type === 'currency') rewType = `+${cell.reward_detail} монет`;
    else if (cell.reward_type === 'card') rewType = `Карта`;
    else if (cell.reward_type === 'premium') rewType = `Премиум`;

    html += `<div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-top: 6px;">
      <div style="font-size: 10px; font-weight: 700; color: #ffb800; margin-bottom: 4px;">${rewType}</div>`;

    if (cell.reward_type === 'card') {
      html += `<div style="font-size: 11px; color: #ffffff; margin-bottom: 6px;">${cell.reward_name}</div>`;
      if (cell.reward_detail) {
        html += `<div style="text-align: center;">
          ${getCardMediaHTML(cell.reward_detail, '', 'max-width: 100%; height: auto; max-height: 180px; border-radius: 4px; box-shadow: 0 0 10px rgba(0,240,255,0.4); border: 1px solid rgba(0,240,255,0.2);', `alt="${cell.reward_name}"`)}
        </div>`;
      }
    } else if (cell.reward_type === 'premium') {
      html += `<div style="font-size: 11px; color: #ffffff; margin-bottom: 6px;">${cell.reward_name}</div>`;
    }

    if (cell.claimed_by_username) {
      html += `<div style="font-size: 10px; color: #ff4a4a; font-weight: bold; margin-top: 6px;">Забрал: ${cell.claimed_by_username}</div>`;
    }
    html += `</div>`;
  }

  if (cell.rewards_json) {
    try {
      const rewards = JSON.parse(cell.rewards_json);
      if (rewards.length > 0) {
        html += `<div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-top: 6px;">
          <div style="font-size: 10px; font-weight: 700; color: #ffb800; margin-bottom: 8px;">Награды на ячейке:</div>
          <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px; justify-content: flex-start; align-items: flex-start;">`;
        rewards.forEach(r => {
          let text = '';
          if (r.type === 'coins') {
            text = `🪙 +${r.value} монет`;
          } else if (r.type === 'premium') {
            text = `💎 Премиум (${r.value} дн.)`;
          } else if (r.type === 'card') {
            text = `🃏 ${r.name}`;
          }
          if (r.claimed_by_username) {
            text += `<br><span style="color:#ff4a4a; font-size:9px;">(Забрал: ${r.claimed_by_username})</span>`;
          }
          
          html += `<div style="display: flex; flex-direction: column; align-items: center; text-align: center; flex: 1 1 90px; max-width: 110px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 6px; box-sizing: border-box;">
            <div style="font-size: 10px; color: #ffffff; line-height: 1.2; word-break: break-word; margin-bottom: 4px;">${text}</div>`;
          if (r.type === 'card' && r.cover) {
            html += getCardMediaHTML(r.cover, '', 'width: 100%; max-width: 80px; height: auto; border-radius: 4px; border: 1px solid rgba(0,240,255,0.2); margin-top: 2px;', `alt="${r.name}"`);
          }
          html += `</div>`;
        });
        html += `</div></div>`;
      }
    } catch (e) {}
  }

  contentEl.innerHTML = html;
  document.getElementById('cell-info-tag').classList.remove('hidden');
}

function showGuildTaxModal(taxValue, cellNumber) {
  state.activeTaxCell = cellNumber;
  document.getElementById('tax-amount-span').textContent = taxValue;
  document.getElementById('tax-paid-span').textContent = state.user.guild_tax_paid || 0;
  document.getElementById('tax-total-span').textContent = state.user.guild_tax_required || taxValue;
  document.getElementById('guild-tax-modal').classList.remove('hidden');
}

function showRewardPopup(reward) {
  const popup = document.getElementById('reward-popup');
  const body = document.getElementById('reward-popup-body');
  if (!popup || !body) return;

  let html = '';
  if (reward.type === 'currency') {
    html = `<div style="font-size: 20px; font-weight: 700; color: #ffb800; margin-bottom: 10px;">+${reward.detail} монет!</div>`;
  } else if (reward.type === 'card') {
    html = `
      <div style="font-size: 14px; color: #ffffff; margin-bottom: 10px;">Вы получили карту:</div>
      <div style="font-size: 16px; font-weight: 700; color: #00f0ff; margin-bottom: 15px;">${reward.name}</div>
      <div style="text-align: center;">
        <img src="${reward.detail}" referrerpolicy="no-referrer" alt="${reward.name}" style="max-width: 100%; height: auto; max-height: 250px; border-radius: 8px; box-shadow: 0 0 20px rgba(0,240,255,0.5); border: 1px solid rgba(0,240,255,0.3);">
      </div>
    `;
  } else {
    html = `<div style="font-size: 16px; color: #ffffff;">Получен предмет: ${reward.name}</div>`;
  }

  body.innerHTML = html;
  popup.classList.remove('hidden');

  setTimeout(() => {
    popup.classList.add('hidden');
  }, 2000);
}

function showConfirm(message) {
  return new Promise((resolve) => {
    let modal = document.getElementById('custom-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'custom-confirm-modal';
      modal.className = 'modal hidden';
      modal.style.zIndex = '10000';
      modal.innerHTML = `
        <div class="modal-content modal-sm">
          <div class="modal-header">
            <h2>Подтверждение</h2>
          </div>
          <div class="modal-body">
            <p id="confirm-modal-message" style="font-size: 13px; line-height: 1.5; margin-bottom: 20px; color: #e0e6ed; text-align: center;"></p>
            <div style="display: flex; gap: 10px;">
              <button id="confirm-modal-yes-btn" class="btn btn-primary" style="flex: 1;">Да</button>
              <button id="confirm-modal-no-btn" class="btn btn-secondary" style="flex: 1;">Отмена</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    document.getElementById('confirm-modal-message').textContent = message;

    const yesBtn = document.getElementById('confirm-modal-yes-btn');
    const noBtn = document.getElementById('confirm-modal-no-btn');

    const cleanup = (value) => {
      modal.classList.add('hidden');
      yesBtn.replaceWith(yesBtn.cloneNode(true));
      noBtn.replaceWith(noBtn.cloneNode(true));
      resolve(value);
    };

    modal.classList.remove('hidden');

    document.getElementById('confirm-modal-yes-btn').addEventListener('click', () => cleanup(true));
    document.getElementById('confirm-modal-no-btn').addEventListener('click', () => cleanup(false));
  });
}

window.handleRewardImageError = function (img, originalUrl) {
  if (!img.dataset.retries) img.dataset.retries = '0';
  let retries = parseInt(img.dataset.retries);
  if (retries < 5) {
    retries++;
    img.dataset.retries = String(retries);
    const spinner = document.createElement('div');
    spinner.className = 'image-loader-spinner';
    spinner.style.position = 'absolute';
    spinner.style.width = '30px';
    spinner.style.height = '30px';
    spinner.style.border = '3px solid rgba(0,240,255,0.1)';
    spinner.style.borderRadius = '50%';
    spinner.style.borderTopColor = '#00f0ff';
    spinner.style.animation = 'spin 1s linear infinite';
    img.parentNode.insertBefore(spinner, img);
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = originalUrl + (originalUrl.includes('?') ? '&' : '?') + 'retry=' + Date.now();
    }, 2000);
  } else {
    img.src = 'https://api.remanga.org/media/card-item/cover_2a9a0d1b6da54356.webp';
    img.style.opacity = '1';
  }
};

function showRewardChoiceModal(reward) {
  state.pendingReward = reward;
  document.getElementById('reward-choice-name').textContent = reward.name;

  const maxSlots = (state.user && state.user.inventory_slots) || 10;
  const claimedCount = state.inventory ? state.inventory.filter(item => item.item_type === 'remanga_card' || item.item_type === 'premium_subscription').length : 0;
  const freeSlots = Math.max(0, maxSlots - claimedCount);
  const canClaim = freeSlots > 0;

  let descText = '';
  if (reward.type === 'card') {
    descText = `Эта карта предметов будет добавлена в ваш инвентарь наград.<br><br>`;
    if (reward.detail) {
      descText += `<div style="text-align: center; margin-bottom: 15px; position: relative; min-height: 120px; display: flex; align-items: center; justify-content: center;">
        <div class="image-loader-spinner" style="position: absolute; width: 30px; height: 30px; border: 3px solid rgba(0,240,255,0.1); border-radius: 50%; border-top-color: #00f0ff; animation: spin 1s linear infinite;"></div>
        ${getCardMediaHTML(reward.detail, '', 'max-width: 100%; height: auto; max-height: 180px; border-radius: 8px; box-shadow: 0 0 15px rgba(0,240,255,0.4); border: 1px solid rgba(0,240,255,0.2); opacity: 0; transition: opacity 0.3s;', `alt="${reward.name}" onload="if(this.previousElementSibling)this.previousElementSibling.remove(); this.style.opacity='1';" onerror="if(this.previousElementSibling)this.previousElementSibling.remove(); handleRewardImageError(this, '${reward.detail}');"`)}
      </div>`;
    }
  } else {
    descText = 'Этот премиум-статус будет добавлен в ваш инвентарь наград.<br><br>';
  }

  descText += `<span style="font-weight: 600; display: block; text-align: center; color: ${canClaim ? '#2ecc71' : '#e74c3c'}">`;
  descText += `Свободных мест для наград: ${freeSlots} из ${maxSlots}.<br>`;
  if (canClaim) {
    descText += 'Вы можете забрать эту награду.';
  } else {
    descText += 'Инвентарь наград заполнен! Нажмите "Забрать", чтобы получить предложение расширить инвентарь.';
  }
  descText += '</span>';

  document.getElementById('reward-choice-desc').innerHTML = descText;

  const claimYesBtn = document.getElementById('claim-reward-yes-btn');
  if (claimYesBtn) {
    claimYesBtn.removeAttribute('disabled');
    claimYesBtn.style.opacity = '1';
    claimYesBtn.style.pointerEvents = 'auto';
  }

  document.getElementById('reward-choice-modal').classList.remove('hidden');
}

window.confirmRemoveReward = async (itemId, name) => {
  let removePrice = 100;
  try {
    const res = await fetch('/api/admin/settings');
    if (res.ok) {
      const data = await res.json();
      const price_remove_reward = data.settings.find(s => s.key === 'price_remove_reward');
      if (price_remove_reward) {
        removePrice = parseInt(price_remove_reward.value) || 100;
      }
    }
  } catch (err) { }

  if (await showConfirm(`Вы уверены, что хотите убрать награду "${name}"? Она вернется обратно на ячейку карты. С вашего баланса будет списано ${removePrice} монет.`)) {
    try {
      const res = await fetch('/api/inventory/remove-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.user.id, itemId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка удаления');
      showNotification('Предмет успешно удален и возвращен на ячейку карты!', 'success');
      refreshProfile();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }
};

document.getElementById('claim-reward-yes-btn').addEventListener('click', async () => {
  if (!state.pendingReward) return;
  
  const maxSlots = (state.user && state.user.inventory_slots) || 10;
  const claimedCount = state.inventory ? state.inventory.filter(item => item.item_type === 'remanga_card' || item.item_type === 'premium_subscription').length : 0;
  if (claimedCount >= maxSlots) {
    if (maxSlots < 20) {
      document.getElementById('buy-slots-modal').classList.remove('hidden');
    } else {
      showNotification('Ваш инвентарь наград полностью заполнен!', 'error');
    }
    return;
  }

  try {
    const res = await fetch('/api/board/claim-reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.user.id,
        cellNumber: state.pendingReward.originCell,
        claim: true
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    showNotification('Награда успешно добавлена в ваш инвентарь!', 'success');
    document.getElementById('reward-choice-modal').classList.add('hidden');
    state.pendingReward = null;
    refreshProfile();
  } catch (err) {
    showNotification(err.message, 'error');
  }
});

document.getElementById('claim-reward-no-btn').addEventListener('click', async () => {
  if (!state.pendingReward) return;
  try {
    await fetch('/api/board/claim-reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.user.id,
        cellNumber: state.pendingReward.originCell,
        claim: false
      })
    });
    document.getElementById('reward-choice-modal').classList.add('hidden');
    state.pendingReward = null;
    refreshProfile();
  } catch (err) {
    showNotification(err.message, 'error');
  }
});

document.getElementById('claim-reward-current-cell-btn').addEventListener('click', () => {
  const currentCellIndex = state.user.current_cell;
  const currentCell = state.cells ? state.cells[currentCellIndex] : null;
  if (currentCell) {
    if (currentCell.rewards_json) {
      let rewards = [];
      try {
        rewards = JSON.parse(currentCell.rewards_json);
      } catch (e) {}
      const hasUnclaimed = rewards.some(r => (r.type === 'card' || r.type === 'premium') && !r.claimed_by_user_id);
      if (hasUnclaimed) {
        showMultiRewardChoiceModal({
          type: 'multi',
          originCell: currentCellIndex,
          rewards: rewards
        });
      } else {
        showNotification('Все награды на этой ячейке уже забраны!', 'info');
      }
    } else {
      showRewardChoiceModal({
        type: currentCell.reward_type,
        name: currentCell.reward_name,
        detail: currentCell.reward_detail,
        originCell: currentCellIndex
      });
    }
  }
});

let selectedMultiRewardId = null;

function showMultiRewardChoiceModal(rewardTriggered) {
  state.pendingMultiReward = rewardTriggered;
  selectedMultiRewardId = null;
  
  const choiceItems = rewardTriggered.rewards.filter(r => r.type === 'card' || r.type === 'premium');
  const unclaimedItems = choiceItems.filter(item => item.claimed_by_user_id === null || item.claimed_by_user_id === undefined);
  
  if (unclaimedItems.length === 1) {
    selectedMultiRewardId = unclaimedItems[0].id;
  }

  const claimBtn = document.getElementById('claim-multi-reward-yes-btn');
  if (claimBtn) {
    claimBtn.removeAttribute('disabled');
  }

  const maxSlots = (state.user && state.user.inventory_slots) || 10;
  const claimedCount = state.inventory ? state.inventory.filter(item => item.item_type === 'remanga_card' || item.item_type === 'premium_subscription').length : 0;
  const freeSlots = Math.max(0, maxSlots - claimedCount);
  
  const slotsInfo = document.getElementById('multi-reward-slots-info');
  if (slotsInfo) {
    slotsInfo.textContent = `Свободных мест для наград: ${freeSlots} из ${maxSlots}.`;
    slotsInfo.style.color = freeSlots > 0 ? '#2ecc71' : '#e74c3c';
  }

  const grid = document.getElementById('multi-rewards-grid');
  if (grid) {
    grid.innerHTML = '';
    
    choiceItems.forEach(item => {
      const cardEl = document.createElement('div');
      cardEl.className = 'reward-card-choice-item';
      cardEl.style.cssText = 'position: relative; background: rgba(255,255,255,0.03); border: 2px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 180px;';
      
      const isClaimed = item.claimed_by_user_id !== null && item.claimed_by_user_id !== undefined;
      
      if (isClaimed) {
        cardEl.style.opacity = '0.5';
        cardEl.style.cursor = 'not-allowed';
        cardEl.style.borderColor = 'rgba(255,0,0,0.2)';
      }
      
      if (!isClaimed && unclaimedItems.length === 1 && item.id === selectedMultiRewardId) {
        cardEl.style.borderColor = '#00f0ff';
        cardEl.style.boxShadow = '0 0 10px rgba(0,240,255,0.4)';
      }

      if (item.type === 'card') {
        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = 'position: relative; width: 80px; height: 110px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 4px; overflow: hidden;';
        
        const spinner = document.createElement('div');
        spinner.className = 'image-loader-spinner';
        spinner.style.cssText = 'position: absolute; width: 20px; height: 20px; border: 2px solid rgba(0,240,255,0.1); border-radius: 50%; border-top-color: #00f0ff; animation: spin 1s linear infinite;';
        imgContainer.appendChild(spinner);
        
        const isWebm = item.cover && (item.cover.toLowerCase().endsWith('.webm') || item.cover.toLowerCase().includes('.webm'));
        const img = document.createElement(isWebm ? 'video' : 'img');
        img.src = item.cover;
        if (isWebm) {
          img.autoplay = true;
          img.muted = true;
          img.playsInline = true;
          img.setAttribute('preload', 'auto');
          img.onplay = () => { img.pause(); };
          img.onloadeddata = () => { spinner.remove(); img.style.opacity = '1'; };
        } else {
          img.referrerPolicy = 'no-referrer';
          img.onload = () => { spinner.remove(); img.style.opacity = '1'; };
        }
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.3s;';
        img.onerror = () => { spinner.remove(); img.src = 'https://api.remanga.org/media/card-item/cover_2a9a0d1b6da54356.webp'; img.style.opacity = '1'; };
        imgContainer.appendChild(img);
        cardEl.appendChild(imgContainer);
      } else {
        const premIcon = document.createElement('div');
        premIcon.style.cssText = 'width: 80px; height: 110px; display: flex; align-items: center; justify-content: center; background: rgba(255,215,0,0.1); border: 1px dashed #ffd700; border-radius: 4px; color: #ffd700; font-size: 24px; margin-bottom: 6px;';
        premIcon.innerHTML = '⭐';
        cardEl.appendChild(premIcon);
      }
      
      const nameLabel = document.createElement('div');
      nameLabel.textContent = item.name;
      nameLabel.style.cssText = 'font-size: 11px; font-weight: bold; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 26px; line-height: 13px;';
      cardEl.appendChild(nameLabel);
      
      if (isClaimed) {
        const claimedBy = document.createElement('div');
        claimedBy.textContent = `Забрал: ${item.claimed_by_username}`;
        claimedBy.style.cssText = 'font-size: 9px; color: #e74c3c; font-weight: bold; margin-top: 4px;';
        cardEl.appendChild(claimedBy);
      }
      
      if (!isClaimed) {
        cardEl.addEventListener('click', () => {
          if (freeSlots <= 0) {
            const maxSlots = (state.user && state.user.inventory_slots) || 10;
            if (maxSlots < 20) {
              document.getElementById('buy-slots-modal').classList.remove('hidden');
            } else {
              showNotification('Ваш инвентарь наград полностью заполнен!', 'error');
            }
            return;
          }
          const allCards = grid.querySelectorAll('.reward-card-choice-item');
          allCards.forEach(c => {
            if (c.style.borderColor !== 'rgba(255, 0, 0, 0.2)' && c.style.opacity !== '0.5') {
              c.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              c.style.boxShadow = 'none';
            }
          });
          cardEl.style.borderColor = '#00f0ff';
          cardEl.style.boxShadow = '0 0 10px rgba(0,240,255,0.4)';
          selectedMultiRewardId = item.id;
        });
      }
      grid.appendChild(cardEl);
    });
  }
  document.getElementById('multi-reward-modal').classList.remove('hidden');
}

const claimMultiYesBtn = document.getElementById('claim-multi-reward-yes-btn');
if (claimMultiYesBtn) {
  claimMultiYesBtn.addEventListener('click', async () => {
    if (!state.pendingMultiReward) return;

    if (!selectedMultiRewardId) {
      showNotification('Выберите одну из доступных карт!', 'error');
      const grid = document.getElementById('multi-rewards-grid');
      if (grid) {
        const unclaimedCards = grid.querySelectorAll('.reward-card-choice-item');
        unclaimedCards.forEach(c => {
          if (c.style.opacity !== '0.5') {
            c.style.transition = 'all 0.15s ease';
            const originalBorder = c.style.borderColor || 'rgba(255, 255, 255, 0.1)';
            const originalShadow = c.style.boxShadow || 'none';
            let flashCount = 0;
            const interval = setInterval(() => {
              if (flashCount % 2 === 0) {
                c.style.borderColor = '#ff3860';
                c.style.boxShadow = '0 0 12px rgba(255, 56, 96, 0.8)';
              } else {
                c.style.borderColor = originalBorder;
                c.style.boxShadow = originalShadow;
              }
              flashCount++;
              if (flashCount >= 6) {
                clearInterval(interval);
                c.style.borderColor = originalBorder;
                c.style.boxShadow = originalShadow;
              }
            }, 150);
          }
        });
      }
      return;
    }

    const maxSlots = (state.user && state.user.inventory_slots) || 10;
    const claimedCount = state.inventory ? state.inventory.filter(item => item.item_type === 'remanga_card' || item.item_type === 'premium_subscription').length : 0;
    if (claimedCount >= maxSlots) {
      if (maxSlots < 20) {
        document.getElementById('buy-slots-modal').classList.remove('hidden');
      } else {
        showNotification('Ваш инвентарь наград полностью заполнен!', 'error');
      }
      return;
    }

    try {
      const res = await fetch('/api/board/claim-multi-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.id,
          cellNumber: state.pendingMultiReward.originCell,
          rewardId: selectedMultiRewardId,
          claim: true
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при получении награды');
      
      showNotification('Награда успешно добавлена в ваш инвентарь!', 'success');
      document.getElementById('multi-reward-modal').classList.add('hidden');
      state.pendingMultiReward = null;
      selectedMultiRewardId = null;
      refreshProfile();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  });
}

const claimMultiNoBtn = document.getElementById('claim-multi-reward-no-btn');
if (claimMultiNoBtn) {
  claimMultiNoBtn.addEventListener('click', async () => {
    if (!state.pendingMultiReward) return;
    try {
      await fetch('/api/board/claim-multi-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.id,
          cellNumber: state.pendingMultiReward.originCell,
          claim: false
        })
      });
      document.getElementById('multi-reward-modal').classList.add('hidden');
      state.pendingMultiReward = null;
      selectedMultiRewardId = null;
      refreshProfile();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  });
}

window.loadAdminCellData = loadAdminCellData;
window.showCellInfoTag = showCellInfoTag;
window.showGuildTaxModal = showGuildTaxModal;
window.showRewardPopup = showRewardPopup;
window.showRewardChoiceModal = showRewardChoiceModal;
window.showMultiRewardChoiceModal = showMultiRewardChoiceModal;
window.showConfirm = showConfirm;

const casinoSegments = [
  { color: 'red', fill: '#c81e1e', label: 'Красный', pct: 49 },
  { color: 'black', fill: '#1a1a1a', label: 'Чёрный', pct: 49 },
  { color: 'green', fill: '#00a832', label: '★', pct: 2 },
];

let casinoAngle = 0;
let casinoSpinning = false;

function initCasinoWheel() {
  drawCasinoWheel(casinoAngle);
}

function drawCasinoWheel(rotation) {
  const canvas = document.getElementById('casino-wheel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = cx - 4;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let currentAngle = rotation;
  for (let i = 0; i < casinoSegments.length; i++) {
    const seg = casinoSegments[i];
    const arcSize = (seg.pct / 100) * (Math.PI * 2);
    const startAngle = currentAngle;
    const endAngle = startAngle + arcSize;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = seg.fill;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + arcSize / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.9;

    if (seg.pct > 5) {
      ctx.font = 'bold 14px Montserrat';
      ctx.fillText(seg.label, r * 0.55, 0);
    } else {
      ctx.font = 'bold 11px Montserrat';
      ctx.fillText(seg.label, r * 0.75, 0);
    }
    ctx.restore();

    currentAngle += arcSize;
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0f1e';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffb800';
  ctx.font = 'bold 10px Orbitron';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EW', cx, cy);
}

async function casinoSpin() {
  if (casinoSpinning) return;
  const resultEl = document.getElementById('casino-result');
  resultEl.classList.add('hidden');

  const betInput = document.getElementById('casino-bet-amount');
  const betAmount = parseInt(betInput.value);
  if (isNaN(betAmount) || betAmount < 1) {
    showNotification('Введите корректную ставку', 'error');
    return;
  }

  const selectedBtn = document.querySelector('.casino-color-btn.selected');
  if (!selectedBtn) {
    showNotification('Выберите цвет', 'error');
    return;
  }
  const selectedColor = selectedBtn.getAttribute('data-color');

  if (!state.user || state.user.balance < betAmount) {
    showNotification('Недостаточно монет', 'error');
    return;
  }

  casinoSpinning = true;
  document.getElementById('casino-spin-btn').disabled = true;

  let response;
  try {
    const res = await fetch('/api/casino/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user.id, bet: betAmount, color: selectedColor })
    });
    response = await res.json();
    if (!res.ok) {
      showNotification(response.error || 'Ошибка', 'error');
      casinoSpinning = false;
      document.getElementById('casino-spin-btn').disabled = false;
      return;
    }
  } catch (err) {
    showNotification('Ошибка сети', 'error');
    casinoSpinning = false;
    document.getElementById('casino-spin-btn').disabled = false;
    return;
  }

  state.user.balance = state.user.balance - betAmount;
  updateDOMBalance(state.user.balance);

  const total = casinoSegments.length;

  let currentAccum = 0;
  const segmentInfo = casinoSegments.map(seg => {
    const size = (seg.pct / 100) * (Math.PI * 2);
    const start = currentAccum;
    currentAccum += size;
    return { start, size };
  });

  const matchingIndices = [];
  for (let i = 0; i < total; i++) {
    if (casinoSegments[i].color === response.resultColor) {
      matchingIndices.push(i);
    }
  }
  const targetSegmentIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];

  const targetSeg = segmentInfo[targetSegmentIndex];
  const randomOffset = (0.1 + Math.random() * 0.8) * targetSeg.size;
  const segmentCenter = targetSeg.start + randomOffset;
  const pointerAngle = -Math.PI / 2;
  const targetAngle = pointerAngle - segmentCenter;
  const fullSpins = 6 + Math.floor(Math.random() * 3);
  const finalAngle = targetAngle + fullSpins * Math.PI * 2;

  const startAngle = casinoAngle;
  const totalAngle = finalAngle - startAngle;
  const duration = 5500 + Math.random() * 1500;
  const startTime = performance.now();

  function animateSpin(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    const currentAngle = startAngle + totalAngle * ease;

    drawCasinoWheel(currentAngle);

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      casinoAngle = currentAngle % (Math.PI * 2);
      casinoSpinning = false;
      document.getElementById('casino-spin-btn').disabled = false;

      state.user.balance = response.newBalance;
      updateDOMBalance(response.newBalance);

      const colorNames = { red: 'Красный', black: 'Чёрный', green: 'Зелёный' };

      if (response.won) {
        resultEl.className = 'casino-result win';
        resultEl.innerHTML = `🎉 Выпал <b>${colorNames[response.resultColor]}</b>! Вы выиграли <b>${response.winAmount}</b> монет (×${response.multiplier})!`;
      } else {
        resultEl.className = 'casino-result lose';
        resultEl.innerHTML = `😔 Выпал <b>${colorNames[response.resultColor]}</b>. Вы проиграли <b>${response.bet}</b> монет.`;
      }
      resultEl.classList.remove('hidden');
    }
  }

  requestAnimationFrame(animateSpin);
}

window.claimBossCard = async (cellNumber, cardId) => {
  if (!state.user) return;

  const maxSlots = (state.user && state.user.inventory_slots) || 10;
  const claimedCount = state.inventory ? state.inventory.filter(item => item.item_type === 'remanga_card' || item.item_type === 'premium_subscription').length : 0;
  if (claimedCount >= maxSlots) {
    if (maxSlots < 20) {
      document.getElementById('buy-slots-modal').classList.remove('hidden');
    } else {
      showNotification('Ваш инвентарь наград полностью заполнен!', 'error');
    }
    return;
  }

  const confirmMsg = 'Вы можете выбрать и забрать одну или несколько карт из наград босса. Хотите забрать эту карту?';
  if (!(await showConfirm(confirmMsg))) return;

  try {
    const res = await fetch('/api/boss/claim-reward-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user.id, cellNumber, cardId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    let hasMoreUnclaimed = false;
    if (data.updatedBosses) {
      const boss = data.updatedBosses.find(b => b.cell_number === cellNumber);
      if (boss && boss.reward_type === 'card' && boss.reward_detail) {
        try {
          let cards = [];
          if (boss.reward_detail.startsWith('[')) {
            cards = JSON.parse(boss.reward_detail);
          }
          hasMoreUnclaimed = cards.some(c => c.claimed_by_user_id === null || c.claimed_by_user_id === undefined);
        } catch (e) {}
      }
    }

    if (!hasMoreUnclaimed && state.user && state.user.pending_boss_cell === cellNumber && state.user.pending_boss_remaining > 0) {
      try {
        const skipRes = await fetch('/api/boss/skip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.user.id })
        });
        if (skipRes.ok) {
          hideBossModal();
          return;
        }
      } catch (e) {}
    }

    refreshProfile();
    await refreshBosses();
    showCellInfoTag(cellNumber);
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { });
  });
}

let pvpState = {
  currentDuel: null,
  isRolling: false
};

window.discardPvpCard = async (itemId) => {
  const confirmMsg = 'Вы хотите слить эту карту за 500 монет? Карта исчезнет из вашего инвентаря и вернется на ячейку поля.';
  if (!(await showConfirm(confirmMsg))) return;
  try {
    const res = await fetch('/api/pvp/discard-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user.id, itemId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    showNotification('Карта успешно слита за 500 монет!', 'success');
    refreshProfile();
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

window.challengePlayer = async (targetUserId) => {
  try {
    const res = await fetch('/api/pvp/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user.id, targetUserId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    showNotification('Вызов отправлен игроку!', 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

async function checkActiveDuel() {
  if (!state.user) return;
  try {
    const res = await fetch('/api/pvp/active-duel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user.id })
    });
    const data = await res.json();
    if (res.ok && data.duel) {
      document.getElementById('pvp-lobby-modal').classList.remove('hidden');
      renderDuelState(data.duel);
    }
  } catch (err) {
    console.error(err);
  }
}

function addDuelLog(msg) {
  const logEl = document.getElementById('pvp-battle-log');
  if (!logEl) return;
  const item = document.createElement('div');
  item.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logEl.appendChild(item);
  logEl.scrollTop = logEl.scrollHeight;
}

function renderDuelState(duel) {
  pvpState.currentDuel = duel;
  if (!duel) {
    document.getElementById('pvp-lobby-modal').classList.add('hidden');
    return;
  }

  const searchContainer = document.getElementById('pvp-searching-container');
  const setupContainer = document.getElementById('pvp-setup-container');
  const activeContainer = document.getElementById('pvp-active-container');
  const resultContainer = document.getElementById('pvp-result-container');

  searchContainer.classList.add('hidden');
  setupContainer.classList.add('hidden');
  activeContainer.classList.add('hidden');
  resultContainer.classList.add('hidden');

  if (duel.status === 'searching') {
    searchContainer.classList.remove('hidden');
    document.getElementById('pvp-lobby-title').textContent = '⚔️ Поиск Дуэли';
  } else if (duel.status === 'setup') {
    setupContainer.classList.remove('hidden');
    document.getElementById('pvp-lobby-title').textContent = '⚔️ Подготовка к Дуэли';

    const p1 = duel.player1;
    const p2 = duel.player2;
    const isP1 = p1.id === state.user.id;
    const meObj = isP1 ? p1 : p2;
    const oppObj = isP1 ? p2 : p1;

    document.getElementById('pvp-p1-name').textContent = meObj.name;
    document.getElementById('pvp-p1-avatar').src = meObj.avatar ? getAvatarUrl(meObj.avatar) : 'https://api.remanga.org/media/card-item/cover_2a9a0d1b6da54356.webp';
    document.getElementById('pvp-p1-ready-status').textContent = meObj.ready ? 'ГОТОВ' : 'Не готов';
    document.getElementById('pvp-p1-ready-status').style.color = meObj.ready ? '#2ecc71' : '#ffb800';

    if (meObj.card) {
      let cover = meObj.card.description || '';
      if (cover.includes('|')) cover = cover.split('|')[0];
      document.getElementById('pvp-p1-card-preview').innerHTML = `
        <div style="text-align: center; width: 100%;">
          ${getCardMediaHTML(cover, 'card-item-cover', '', `style="max-width: 90px; border-radius: 6px;"`)}
          <div style="font-size: 11px; font-weight: bold; color: #00f0ff; margin-top: 4px;">${meObj.card.name}</div>
        </div>
      `;
    } else {
      document.getElementById('pvp-p1-card-preview').innerHTML = `<span style="font-size: 11px; color: #8c9ba5;">Выбирает карту...</span>`;
    }

    document.getElementById('pvp-p2-name').textContent = oppObj ? oppObj.name : 'Ожидание...';
    document.getElementById('pvp-p2-avatar').src = (oppObj && oppObj.avatar) ? getAvatarUrl(oppObj.avatar) : 'https://api.remanga.org/media/card-item/cover_2a9a0d1b6da54356.webp';
    document.getElementById('pvp-p2-ready-status').textContent = (oppObj && oppObj.ready) ? 'ГОТОВ' : 'Не готов';
    document.getElementById('pvp-p2-ready-status').style.color = (oppObj && oppObj.ready) ? '#2ecc71' : '#ffb800';

    if (oppObj && oppObj.card) {
      let cover = oppObj.card.description || '';
      if (cover.includes('|')) cover = cover.split('|')[0];
      document.getElementById('pvp-p2-card-preview').innerHTML = `
        <div style="text-align: center; width: 100%;">
          ${getCardMediaHTML(cover, 'card-item-cover', '', `style="max-width: 90px; border-radius: 6px;"`)}
          <div style="font-size: 11px; font-weight: bold; color: #ff007c; margin-top: 4px;">${oppObj.card.name}</div>
        </div>
      `;
    } else {
      document.getElementById('pvp-p2-card-preview').innerHTML = `<span style="font-size: 11px; color: #8c9ba5;">Выбирает карту...</span>`;
    }

    const dropdown = document.getElementById('pvp-card-select-dropdown');
    dropdown.innerHTML = '';
    const defOpt = document.createElement('option');
    defOpt.value = '';
    defOpt.textContent = '-- Выберите карту --';
    dropdown.appendChild(defOpt);

    const cards = state.inventory.filter(item => item.item_type === 'remanga_card' || item.item_type === 'premium_subscription');
    cards.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.name} (${item.is_pvp_trophy ? 'PvP' : 'Поле'})`;
      if (meObj.card && meObj.card.id === item.id) {
        opt.selected = true;
      }
      dropdown.appendChild(opt);
    });

  } else if (duel.status === 'active') {
    activeContainer.classList.remove('hidden');
    document.getElementById('pvp-lobby-title').textContent = '⚔️ ИДЕТ БОЙ!';

    const p1 = duel.player1;
    const p2 = duel.player2;
    const isP1 = p1.id === state.user.id;
    const meObj = isP1 ? p1 : p2;
    const oppObj = isP1 ? p2 : p1;

    document.getElementById('pvp-active-p1-name').textContent = meObj.name;
    document.getElementById('pvp-active-p1-hp').textContent = meObj.hp;
    document.getElementById('pvp-active-p1-hp-bar').style.width = `${(meObj.hp / 12) * 100}%`;

    if (meObj.card) {
      let cover = meObj.card.description || '';
      if (cover.includes('|')) cover = cover.split('|')[0];
      document.getElementById('pvp-active-p1-card').innerHTML = `
        <div style="text-align: center; width: 100%;">
          ${getCardMediaHTML(cover, 'card-item-cover', '', `style="max-width: 90px; border-radius: 6px;"`)}
          <div style="font-size: 11px; font-weight: bold; color: #00f0ff; margin-top: 4px;">${meObj.card.name}</div>
        </div>
      `;
    }

    document.getElementById('pvp-active-p2-name').textContent = oppObj.name;
    document.getElementById('pvp-active-p2-hp').textContent = oppObj.hp;
    document.getElementById('pvp-active-p2-hp-bar').style.width = `${(oppObj.hp / 12) * 100}%`;

    if (oppObj.card) {
      let cover = oppObj.card.description || '';
      if (cover.includes('|')) cover = cover.split('|')[0];
      document.getElementById('pvp-active-p2-card').innerHTML = `
        <div style="text-align: center; width: 100%;">
          ${getCardMediaHTML(cover, 'card-item-cover', '', `style="max-width: 90px; border-radius: 6px;"`)}
          <div style="font-size: 11px; font-weight: bold; color: #ff007c; margin-top: 4px;">${oppObj.card.name}</div>
        </div>
      `;
    }

    const myTurn = duel.turn_user_id === state.user.id;
    const turnEl = document.getElementById('pvp-turn-indicator');
    const rollBtn = document.getElementById('pvp-roll-btn');

    if (myTurn) {
      turnEl.textContent = 'ВАШ ХОД! Бросайте кубик!';
      turnEl.style.color = '#2ecc71';
      if (!pvpState.isRolling) {
        rollBtn.disabled = false;
      }
    } else {
      turnEl.textContent = `Ходит ${oppObj.name}...`;
      turnEl.style.color = '#ffb800';
      rollBtn.disabled = true;
    }

  } else if (duel.status === 'finished') {
    resultContainer.classList.remove('hidden');
    document.getElementById('pvp-lobby-title').textContent = '⚔️ Конец дуэли';

    const p1 = duel.player1;
    const p2 = duel.player2;
    const isP1 = p1.id === state.user.id;
    const meObj = isP1 ? p1 : p2;
    const oppObj = isP1 ? p2 : p1;

    const win = duel.winner_user_id === state.user.id;
    const titleEl = document.getElementById('pvp-result-title');
    const textEl = document.getElementById('pvp-result-text');
    const prizeEl = document.getElementById('pvp-result-prize-card');

    if (win) {
      titleEl.textContent = 'ПОБЕДА!';
      titleEl.style.color = '#2ecc71';
      textEl.textContent = 'Вы одолели соперника и забрали его карту в PvP инвентарь!';
      if (oppObj && oppObj.card) {
        let cover = oppObj.card.description || '';
        if (cover.includes('|')) cover = cover.split('|')[0];
        prizeEl.innerHTML = `
          <div style="text-align: center; width: 100%;">
            ${getCardMediaHTML(cover, 'card-item-cover', '', `style="max-width: 120px; border-radius: 8px; box-shadow: 0 0 15px rgba(46, 204, 113, 0.4);"`)}
            <div style="font-size: 13px; font-weight: bold; color: #2ecc71; margin-top: 8px;">${oppObj.card.name}</div>
          </div>
        `;
      } else {
        prizeEl.innerHTML = '';
      }
    } else {
      titleEl.textContent = 'ПОРАЖЕНИЕ';
      titleEl.style.color = '#e74c3c';
      textEl.textContent = 'Вы проиграли дуэль и потеряли карту ставки.';
      prizeEl.innerHTML = '';
    }
  }
}

function initPvpListeners() {
  const startSearch = async () => {
    try {
      const res = await fetch('/api/pvp/matchmaking/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.user.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      document.getElementById('pvp-lobby-modal').classList.remove('hidden');
      renderDuelState(data.duel || { status: 'searching' });
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const pvpBtn = document.getElementById('pvp-matchmaking-btn');
  if (pvpBtn) {
    pvpBtn.addEventListener('click', startSearch);
  }
  const mobilePvpBtn = document.getElementById('mobile-pvp-btn');
  if (mobilePvpBtn) {
    mobilePvpBtn.addEventListener('click', startSearch);
  }

  const cancelSearchBtn = document.getElementById('pvp-searching-cancel-btn');
  if (cancelSearchBtn) {
    cancelSearchBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/pvp/matchmaking/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.user.id })
        });
        renderDuelState(null);
      } catch (e) {}
    });
  }

  const cancelLobbyBtn = document.getElementById('pvp-lobby-cancel-btn');
  if (cancelLobbyBtn) {
    cancelLobbyBtn.addEventListener('click', () => {
      if (pvpState.currentDuel && pvpState.currentDuel.status === 'searching') {
        cancelSearchBtn.click();
      } else if (pvpState.currentDuel && pvpState.currentDuel.status === 'setup') {
        document.getElementById('pvp-lobby-exit-btn').click();
      } else {
        renderDuelState(null);
      }
    });
  }

  const lobbyExitBtn = document.getElementById('pvp-lobby-exit-btn');
  if (lobbyExitBtn) {
    lobbyExitBtn.addEventListener('click', () => {
      renderDuelState(null);
    });
  }

  const dropdown = document.getElementById('pvp-card-select-dropdown');
  if (dropdown) {
    dropdown.addEventListener('change', async () => {
      if (!pvpState.currentDuel) return;
      const itemId = dropdown.value;
      try {
        const res = await fetch('/api/pvp/select-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.user.id, duelId: pvpState.currentDuel.id, itemId: itemId ? parseInt(itemId) : null })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        renderDuelState(data.duel);
      } catch (err) {
        showNotification(err.message, 'error');
      }
    });
  }

  const agreeBtn = document.getElementById('pvp-agree-btn');
  if (agreeBtn) {
    agreeBtn.addEventListener('click', async () => {
      if (!pvpState.currentDuel) return;
      try {
        const res = await fetch('/api/pvp/ready', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.user.id, duelId: pvpState.currentDuel.id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        renderDuelState(data.duel);
      } catch (err) {
        showNotification(err.message, 'error');
      }
    });
  }

  const rollBtn = document.getElementById('pvp-roll-btn');
  if (rollBtn) {
    rollBtn.addEventListener('click', async () => {
      if (!pvpState.currentDuel || pvpState.isRolling) return;
      pvpState.isRolling = true;
      rollBtn.disabled = true;

      const diceArea = document.getElementById('pvp-dice-area');
      let count = 0;
      const animInterval = setInterval(() => {
        if (diceArea) diceArea.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][Math.floor(Math.random() * 6)];
        count++;
        if (count > 8) {
          clearInterval(animInterval);
        }
      }, 80);

      try {
        const res = await fetch('/api/pvp/roll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.user.id, duelId: pvpState.currentDuel.id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setTimeout(() => {
          pvpState.isRolling = false;
        }, 1000);
      } catch (err) {
        clearInterval(animInterval);
        pvpState.isRolling = false;
        rollBtn.disabled = false;
        showNotification(err.message, 'error');
      }
    });
  }

  const resultCloseBtn = document.getElementById('pvp-result-close-btn');
  if (resultCloseBtn) {
    resultCloseBtn.addEventListener('click', () => {
      renderDuelState(null);
    });
  }

  const inviteAcceptBtn = document.getElementById('pvp-invite-accept-btn');
  if (inviteAcceptBtn) {
    inviteAcceptBtn.addEventListener('click', async () => {
      const inviteModal = document.getElementById('pvp-invite-modal');
      const initId = inviteModal.getAttribute('data-initiator-id');
      inviteModal.classList.add('hidden');
      try {
        const res = await fetch('/api/pvp/invite/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.user.id, initiatorUserId: parseInt(initId) })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        document.getElementById('pvp-lobby-modal').classList.remove('hidden');
        renderDuelState(data.duel);
      } catch (err) {
        showNotification(err.message, 'error');
      }
    });
  }

  const inviteDeclineBtn = document.getElementById('pvp-invite-decline-btn');
  if (inviteDeclineBtn) {
    inviteDeclineBtn.addEventListener('click', async () => {
      const inviteModal = document.getElementById('pvp-invite-modal');
      const initId = inviteModal.getAttribute('data-initiator-id');
      inviteModal.classList.add('hidden');
      try {
        await fetch('/api/pvp/invite/decline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.user.id, initiatorUserId: parseInt(initId) })
        });
      } catch (e) {}
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initPvpListeners();
  }, 1000);
});
