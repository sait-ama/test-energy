

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
    
    const isBossCell = (i > 0 && i % 30 === 0);
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
  if (weapon === 'sword') bonusDmg += 15;
  else if (weapon === 'staff') { bonusDmg += 10; bonusHp += 20; }
  else if (weapon === 'shield') { bonusDmg += 5; bonusHp += 30; }
  else if (weapon === 'axe') bonusDmg += 20;
  else if (weapon === 'bow') bonusDmg += 12;
  else if (weapon === 'scythe') bonusDmg += 18;
  else if (weapon === 'hammer') bonusDmg += 22;

  const costume = charData.costume || 'normal';
  if (costume === 'armor') bonusHp += 50;
  else if (costume === 'robe') { bonusHp += 20; bonusDmg += 5; }
  else if (costume === 'cyber') { bonusHp += 30; bonusDmg += 8; }
  else if (costume === 'steampunk') { bonusHp += 25; bonusDmg += 6; }
  else if (costume === 'ninja_suit') { bonusHp += 15; bonusDmg += 12; }

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

  const bossCells = [30, 60, 90, 120, 150, 180, 210, 240, 270];
  bossCells.forEach((cellNum, idx) => {
    const bossData = (state.bosses || []).find(b => b.cell_number === cellNum);
    const defeated = bossData ? bossData.defeated : 0;
    const pos = getTilePosition(cellNum);
    const bossMesh = create3DBossMesh(idx, defeated);
    bossMesh.position.set(pos.x + 1.1, pos.y + 0.15, pos.z + 1.1);
    state.boardScene.add(bossMesh);
    state.bossObjects.set(cellNum, bossMesh);
  });
}

const cachedBossGLTF = {};

function getBossScale(index) {
  switch (index) {
    case 0: return 0.01;
    case 1: return 0.015;
    case 2: return 0.015;
    case 3: return 0.015;
    case 4: return 0.01;
    case 5: return 0.01;
    case 6: return 0.01;
    case 7: return 0.015;
    case 8: return 0.015;
    default: return 0.012;
  }
}

function getBossRotation(index) {
  switch (index) {
    case 0: return [0, -Math.PI / 4, 0];
    case 1: return [0, 0, 0];
    case 2: return [0, 0, 0];
    case 3: return [0, 0, 0];
    case 4: return [0, Math.PI, 0];
    case 5: return [0, Math.PI, 0];
    case 6: return [0, -Math.PI / 4, 0];
    case 7: return [0, 0, 0];
    case 8: return [0, 0, 0];
    default: return [0, 0, 0];
  }
}

function loadBossModels() {
  if (typeof THREE.GLTFLoader === 'undefined') return;
  const loader = new THREE.GLTFLoader();
  const urls = [
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Horse.glb',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Flamingo.glb',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Stork.glb',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Parrot.glb',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Soldier.glb',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Horse.glb',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Parrot.glb',
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Flamingo.glb'
  ];

  urls.forEach((url, index) => {
    loader.load(url, (gltf) => {
      cachedBossGLTF[index] = gltf.scene;
      updateBossMeshes();
    }, undefined, (err) => {});
  });
}

function create3DBossMesh(index, defeated) {
  if (cachedBossGLTF[index]) {
    const group = new THREE.Group();
    const model = cachedBossGLTF[index].clone();
    const scale = getBossScale(index);
    model.scale.set(scale, scale, scale);
    const rot = getBossRotation(index);
    model.rotation.set(rot[0], rot[1], rot[2]);

    if (defeated) {
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.35;
          if (child.material.color) {
            child.material.color.set('#555555');
          }
        }
      });
    }
    
    group.add(model);
    return group;
  }

  const group = new THREE.Group();
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
    document.getElementById('boss-btn-close').classList.remove('hidden');
  } else if (boss.current_fighter_id && boss.current_fighter_id !== state.user.id) {
    document.getElementById('boss-status-occupied').classList.remove('hidden');
    document.getElementById('boss-fighter-name').textContent = boss.current_fighter_username || 'Неизвестно';
    document.getElementById('boss-btn-bypass-only').classList.remove('hidden');
  } else if (boss.current_fighter_id === state.user.id) {
    document.getElementById('boss-status-battle').classList.remove('hidden');
    document.getElementById('boss-btn-attack').classList.remove('hidden');
    document.getElementById('boss-btn-forfeit').classList.remove('hidden');
    
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
    document.getElementById('boss-info-hp').textContent = boss.max_hp;
    document.getElementById('boss-info-dmg').textContent = boss.dmg;
    document.getElementById('boss-info-weakness').textContent = translateElement(boss.weakness);
    
    document.getElementById('boss-btn-fight').classList.remove('hidden');
    document.getElementById('boss-btn-bypass').classList.remove('hidden');
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

function initBossModalEvents() {
  const modal = document.getElementById('boss-battle-modal');
  if (!modal) return;

  document.getElementById('boss-btn-close').addEventListener('click', () => {
    modal.classList.add('hidden');
    currentOpenedBossCell = null;
  });
  
  document.getElementById('boss-btn-bypass-only').addEventListener('click', () => {
    modal.classList.add('hidden');
    currentOpenedBossCell = null;
  });
  
  document.getElementById('boss-btn-bypass').addEventListener('click', () => {
    modal.classList.add('hidden');
    currentOpenedBossCell = null;
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
        showNotification(`Победа! Вы победили босса и получили ${data.reward} монет!`, 'success');
        modal.classList.add('hidden');
        currentOpenedBossCell = null;
        await refreshProfile();
        await refreshBosses();
      } else if (data.status === 'defeat') {
        showNotification(`Поражение! Вы потеряли 300 монет и отступили назад.`, 'error');
        modal.classList.add('hidden');
        currentOpenedBossCell = null;
        
        animatePlayerMovement({
          userId: state.user.id,
          path: data.path,
          endCell: data.newCell
        });
        
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
        modal.classList.add('hidden');
        currentOpenedBossCell = null;
        
        animatePlayerMovement({
          userId: state.user.id,
          path: data.path,
          endCell: data.newCell
        });
        
        await refreshProfile();
        await refreshBosses();
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
  if (bossSelect) {
    bossSelect.addEventListener('change', () => {
      const cellNum = parseInt(bossSelect.value);
      const boss = (state.bosses || []).find(b => b.cell_number === cellNum);
      if (boss) {
        document.getElementById('admin-boss-hp').value = boss.max_hp;
        document.getElementById('admin-boss-dmg').value = boss.dmg;
        document.getElementById('admin-boss-cooldown').value = boss.attack_cooldown_seconds;
      }
    });
  }

  const bossSaveBtn = document.getElementById('admin-boss-save-btn');
  if (bossSaveBtn) {
    bossSaveBtn.addEventListener('click', async () => {
      const cellNum = parseInt(bossSelect.value);
      const hp = parseInt(document.getElementById('admin-boss-hp').value);
      const dmg = parseInt(document.getElementById('admin-boss-dmg').value);
      const cooldown = parseInt(document.getElementById('admin-boss-cooldown').value);
      
      try {
        const res = await fetch('/api/admin/boss/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cellNumber: cellNum, hp, dmg, cooldown })
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
}

let backendUrl = '';

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

EventTarget.prototype.addEventListener = function(type, listener, options) {
  if (type.startsWith('touch')) {
    const self = this;
    const wrapped = function(e) {
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

EventTarget.prototype.removeEventListener = function(type, listener, options) {
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
  container.addEventListener('touchmove', handleMove, { passive: false });
  container.addEventListener('touchend', handleEnd, { passive: true });
  
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
    const cell = (pObj && pObj.animating && pObj.currentCell !== undefined) ? pObj.currentCell : player.current_cell;
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

  const isBossCell = (i > 0 && i % 30 === 0);
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
  initAuth();
  setupUI();
  setupAdminTabs();
  initJoystick();
});

let tgAuthPollingInterval = null;

function initAuth() {
  const savedUser = localStorage.getItem('ew_event_user');
  if (savedUser) {
    state.user = JSON.parse(savedUser);
    checkOnboardingStage(state.user);
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
      } catch (e) {}
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
      const isBoss = (moveData.endCell > 0 && moveData.endCell % 30 === 0);
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
      if (moveData.rewardTriggered.type === 'card' || moveData.rewardTriggered.type === 'premium') {
        showRewardChoiceModal(moveData.rewardTriggered);
      } else {
        showRewardPopup(moveData.rewardTriggered);
      }
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
  state.socket.emit('authenticate', { userId: state.user.id });
  state.socket.on('bosses_update', (list) => {
    state.bosses = list;
    if (state.tileObjects && state.tileObjects.length > 0) {
      highlightCurrentCell();
      updateBossMeshes();
      if (currentOpenedBossCell !== null) {
        const currentBoss = list.find(b => b.cell_number === currentOpenedBossCell);
        if (currentBoss) {
          updateBossModalUI(currentBoss);
        }
      }
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
    if (data.historyEntry) {
      addHistoryItem(data.historyEntry);
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
    updateHistoryUI();
    updateDiceButton();

    const currentCellIndex = state.user.current_cell;
    const currentCell = state.cells ? state.cells[currentCellIndex] : null;
    const claimBtn = document.getElementById('claim-reward-current-cell-btn');
    if (claimBtn) {
      if (currentCell && (currentCell.reward_type === 'card' || currentCell.reward_type === 'premium') && currentCell.claimed_by_user_id === null) {
        claimBtn.classList.remove('hidden');
        claimBtn.textContent = `Забрать: ${currentCell.reward_name}`;
      } else {
        claimBtn.classList.add('hidden');
      }
    }
    
    if (document.getElementById('profile-drawer').classList.contains('open')) {
      updateDrawerPreview();
    }
    
    const isBoss = (state.user.current_cell > 0 && state.user.current_cell % 30 === 0);
    if (isBoss) {
      checkAndShowBossModal(state.user.current_cell);
    }

  } catch (err) {
    
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

function initBoard3D() {
  const container = document.getElementById('board-canvas-container');
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
      cameraX = parsed.x;
      cameraY = parsed.y;
      cameraZ = parsed.z;
      targetX = parsed.tx;
      targetY = parsed.ty;
      targetZ = parsed.tz;
    } catch (e) {}
  }

  camera.position.set(cameraX, cameraY, cameraZ);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

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
        document.getElementById('cell-info-tag').classList.add('hidden');
        clearTimeout(state.usernameTimeout);
        state.usernameTimeout = setTimeout(() => {
          state.taggedPlayer = null;
          document.getElementById('username-tag').classList.add('hidden');
        }, 2000);
        return;
      }
    }

    const tileIntersects = raycaster.intersectObjects(state.tileObjects);
    if (tileIntersects.length > 0) {
      const clickedTile = tileIntersects[0].object;
      const cellIndex = state.tileObjects.indexOf(clickedTile);
      if (cellIndex !== -1) {
        state.selectedCellInfo = { cellIndex, mesh: clickedTile };
        showCellInfoTag(cellIndex);
        state.taggedPlayer = null;
        document.getElementById('username-tag').classList.add('hidden');
        clearTimeout(state.cellInfoTimeout);
        state.cellInfoTimeout = setTimeout(() => {
          state.selectedCellInfo = null;
          document.getElementById('cell-info-tag').classList.add('hidden');
        }, 2000);
        if (state.user && state.user.is_admin) {
          document.getElementById('admin-cell-number').value = cellIndex;
          loadAdminCellData(cellIndex);
          const tabBtn = document.querySelector('.tab-btn[data-tab="admin-tab-cells"]');
          if (tabBtn) tabBtn.click();
        }
      }
    } else {
      state.selectedCellInfo = null;
      document.getElementById('cell-info-tag').classList.add('hidden');
      clearTimeout(state.cellInfoTimeout);
    }
    
    state.taggedPlayer = null;
    document.getElementById('username-tag').classList.add('hidden');
    clearTimeout(state.usernameTimeout);
  });

  const animate = () => {
    requestAnimationFrame(animate);
    
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
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, camera.up);
        right.y = 0;
        right.normalize();

        const direction = new THREE.Vector3();
        direction.addScaledVector(forward, -moveZ);
        direction.addScaledVector(right, moveX);

        camera.position.add(direction);
        controls.target.add(direction);
      }
    }

    if (camera.position.y < 3) camera.position.y = 3;
    if (controls.target.y < 0) controls.target.y = 0;
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  const resizeObserver = new ResizeObserver(() => {
    if (!container.clientWidth) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const aspect = w / h;
    camera.aspect = aspect;
    camera.fov = 50;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  resizeObserver.observe(container);
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
    const isBossCell = (i > 0 && i % 30 === 0);
    const bossData = (state.bosses || []).find(b => b.cell_number === i);
    const defeated = bossData ? bossData.defeated : 0;
    if (i === 0) color = '#ffb800';
    else if (i === 299) color = '#00f0ff';
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
      if (!entry.animating) {
        if (idStr === String(state.user?.id) && state.diceRolling) {
          // Keep player mesh at their current board position
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
        currentCell: player.current_cell
      });
    }
  }

  layoutBoardElements();
  highlightCurrentCell();
}

function animatePlayerMovement(moveData) {
  const idStr = String(moveData.userId);
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
      checkOnboardingStage(state.user);
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
    refreshProfile();
    updateBodyScrollLock();
  });

  document.getElementById('close-profile-btn').addEventListener('click', () => {
    document.getElementById('profile-drawer').classList.remove('open');
    updateBodyScrollLock();
  });

  const mobileOpenProfileBtn = document.getElementById('mobile-open-profile-btn');
  if (mobileOpenProfileBtn) {
    mobileOpenProfileBtn.addEventListener('click', () => {
      const drawer = document.getElementById('profile-drawer');
      drawer.classList.add('open');
      updateDrawerPreview();
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
    document.getElementById('cell-info-tag').classList.add('hidden');
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

      animateDiceRoll(data.baseRoll !== undefined ? data.baseRoll : data.roll, () => {
        state.diceRolling = false;
        if (state.pendingSelfMove) {
          performSelfMovement(state.pendingSelfMove);
          state.pendingSelfMove = null;
        } else {
          refreshProfile();
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
  if (weapon === 'sword') bonusDmg += 15;
  else if (weapon === 'staff') { bonusDmg += 10; bonusHp += 20; }
  else if (weapon === 'shield') { bonusDmg += 5; bonusHp += 30; }
  else if (weapon === 'axe') bonusDmg += 20;
  else if (weapon === 'bow') bonusDmg += 12;
  else if (weapon === 'scythe') bonusDmg += 18;
  else if (weapon === 'hammer') bonusDmg += 22;

  const costume = charData.costume || 'normal';
  if (costume === 'armor') bonusHp += 50;
  else if (costume === 'robe') { bonusHp += 20; bonusDmg += 5; }
  else if (costume === 'cyber') { bonusHp += 30; bonusDmg += 8; }
  else if (costume === 'steampunk') { bonusHp += 25; bonusDmg += 6; }
  else if (costume === 'ninja_suit') { bonusHp += 15; bonusDmg += 12; }

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
    water: 'Повышенный урон по боссам: Лев (120 ячейка) и Стрелец (240 ячейка).',
    fire: 'Повышенный урон по боссам: Рак (90 ячейка) и Скорпион (210 ячейка).',
    earth: 'Повышенный урон по боссам: Близнецы (60 ячейка) и Весы (180 ячейка).',
    wind: 'Повышенный урон по боссам: Телец (30 ячейка), Дева (150 ячейка) и Козерог (270 ячейка).'
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

    item.innerHTML = `
      <div class="online-user-info" style="display:flex; align-items:center; justify-content:space-between; width:100%;">
        <div style="display:flex; align-items:center; gap:8px;">
          ${avatarHtml}
          <div class="online-meta">
            <span class="online-name" style="font-weight: 500;">${player.tg_first_name || 'Игрок'}</span>
            <span class="online-cell text-cyan" style="font-size: 10px;">Ячейка: ${player.current_cell}</span>
          </div>
        </div>
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

  if (drawerInv) {
    drawerInv.innerHTML = '';
    if (state.inventory.length === 0) {
      drawerInv.innerHTML = '<div class="info-note">Инвентарь пуст</div>';
    } else {
      const prizes = state.inventory.filter(item => item.item_type === 'remanga_card' || item.item_type === 'premium_subscription');
      const normalItems = state.inventory.filter(item => item.item_type !== 'remanga_card' && item.item_type !== 'premium_subscription');

      prizes.sort((a, b) => {
        const cellA = a.origin_cell_number !== null ? a.origin_cell_number : 999999;
        const cellB = b.origin_cell_number !== null ? b.origin_cell_number : 999999;
        return cellA - cellB;
      });

      const countHeader = document.createElement('div');
      countHeader.style.cssText = 'grid-column: 1 / -1; font-size: 12px; font-weight: 600; color: #ffb800; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;';
      countHeader.innerHTML = `Призы (заполнено: ${prizes.length} из 10)`;
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
            div.className = 'inventory-item card-item-container';
            div.innerHTML = `
              <div class="card-item-cover-wrapper" style="text-align: center; margin-bottom: 8px;">
                <img class="card-item-cover" referrerpolicy="no-referrer" src="${item.description}" alt="${item.name}" onerror="this.onerror=null; this.src='https://api.remanga.org/media/card-item/cover_2a9a0d1b6da54356.webp';">
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

function updateHistoryUI() {
  const mainContainer = document.getElementById('action-history');
  const drawerContainer = document.getElementById('drawer-history-list');

  mainContainer.innerHTML = '';
  drawerContainer.innerHTML = '';

  if (state.history.length === 0) {
    const emptyNote = '<div class="info-note">История пуста</div>';
    mainContainer.innerHTML = emptyNote;
    drawerContainer.innerHTML = emptyNote;
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

    mainContainer.appendChild(div);
    drawerContainer.appendChild(div.cloneNode(true));
  });
}

function addHistoryItem(item) {
  const mainContainer = document.getElementById('action-history');
  const drawerContainer = document.getElementById('drawer-history-list');

  const div = document.createElement('div');
  div.className = `history-item ${item.action}`;
  const date = formatDateTime(item.timestamp);
  div.innerHTML = `
    <div>${item.detail}</div>
    <div class="history-item-time">${date}</div>
  `;

  mainContainer.insertBefore(div, mainContainer.firstChild);
  drawerContainer.insertBefore(div.cloneNode(true), drawerContainer.firstChild);
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

        if (!state.user) throw new Error('Пользователь не авторизован');

        const res = await fetch('/api/admin/cells/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cellNumber, type, value, rewardType, rewardName, rewardDetail, requesterUserId: state.user.id })
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

        const dice_cooldown = cooldownEl ? (parseInt(cooldownEl.value) || 0) : 0;
        const price_shield = shieldEl ? (parseInt(shieldEl.value) || 0) : 0;
        const price_freeze = freezeEl ? (parseInt(freezeEl.value) || 0) : 0;
        const price_pusher = pusherEl ? (parseInt(pusherEl.value) || 0) : 0;
        const price_cure = cureEl ? (parseInt(cureEl.value) || 0) : 0;
        const price_slowness = slownessEl ? (parseInt(slownessEl.value) || 0) : 0;
        const price_double_roll = doubleRollEl ? (parseInt(doubleRollEl.value) || 0) : 0;
        const price_remove_reward = removeRewardEl ? (parseInt(removeRewardEl.value) || 0) : 0;

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
      'admin-price-remove-reward'
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

    document.getElementById('admin-price-shield').value = price_shield.value;
    document.getElementById('admin-price-freeze').value = price_freeze.value;
    document.getElementById('admin-price-pusher').value = price_pusher.value;
    document.getElementById('admin-price-cure').value = price_cure.value;
    document.getElementById('admin-price-slowness').value = price_slowness.value;
    document.getElementById('admin-price-double_roll').value = price_double_roll.value;
    document.getElementById('admin-price-remove-reward').value = price_remove_reward.value;
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
  
  const invEl = document.getElementById('edit-user-inventory');
  const effEl = document.getElementById('edit-user-effects');
  if (invEl) invEl.innerHTML = '<div style="font-size: 11px; color: #8c9ba5;">Загрузка...</div>';
  if (effEl) effEl.innerHTML = '<div style="font-size: 11px; color: #8c9ba5;">Загрузка...</div>';
  
  document.getElementById('admin-edit-modal').classList.remove('hidden');

  try {
    const res = await fetch(`/api/profile/${userId}`);
    if (!res.ok) throw new Error();
    const data = await res.json();

    if (invEl) {
      invEl.innerHTML = '';
      if (data.inventory.length === 0) {
        invEl.innerHTML = '<div style="font-size: 11px; color: #8c9ba5; grid-column: 1 / -1;">Инвентарь пуст</div>';
      } else {
        data.inventory.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.style.cssText = 'background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; padding: 6px; font-size: 11px; display: flex; flex-direction: column; gap: 4px;';
          
          if (item.item_type === 'remanga_card') {
            itemDiv.innerHTML = `
              <div style="text-align: center;">
                <img src="${item.description}" referrerpolicy="no-referrer" style="width: 50px; height: auto; border-radius: 4px; border: 1px solid rgba(0,240,255,0.2);" onerror="this.onerror=null; this.src='https://api.remanga.org/media/card-item/cover_2a9a0d1b6da54356.webp';">
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

  try {
    const res = await fetch('/api/admin/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, balance, currentCell, isAdmin, guildTaxRequired, guildTaxPaid, requesterUserId: state.user.id })
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
}

function showCellInfoTag(cellIndex) {
  const cell = state.cells ? state.cells[cellIndex] : null;
  if (!cell) return;

  const contentEl = document.getElementById('cell-info-tag-content');
  if (!contentEl) return;

  let html = `<div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">Ячейка #${cellIndex}</div>`;
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
          <img src="${cell.reward_detail}" referrerpolicy="no-referrer" alt="${cell.reward_name}" style="max-width: 100%; height: auto; max-height: 180px; border-radius: 4px; box-shadow: 0 0 10px rgba(0,240,255,0.4); border: 1px solid rgba(0,240,255,0.2);">
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

function showRewardChoiceModal(reward) {
  state.pendingReward = reward;
  document.getElementById('reward-choice-name').textContent = reward.name;
  
  const claimedCount = state.inventory ? state.inventory.filter(item => item.item_type === 'remanga_card' || item.item_type === 'premium_subscription').length : 0;
  const freeSlots = Math.max(0, 10 - claimedCount);
  const canClaim = freeSlots > 0;
  
  let descText = '';
  if (reward.type === 'card') {
    descText = `Эта карта предметов будет добавлена в ваш инвентарь наград.<br><br>`;
    if (reward.detail) {
      descText += `<div style="text-align: center; margin-bottom: 15px;">
        <img src="${reward.detail}" referrerpolicy="no-referrer" alt="${reward.name}" onerror="this.onerror=null; this.src='https://api.remanga.org/media/card-item/cover_2a9a0d1b6da54356.webp';" style="max-width: 100%; height: auto; max-height: 180px; border-radius: 8px; box-shadow: 0 0 15px rgba(0,240,255,0.4); border: 1px solid rgba(0,240,255,0.2);">
      </div>`;
    }
  } else {
    descText = 'Этот премиум-статус будет добавлен в ваш инвентарь наград.<br><br>';
  }
  
  descText += `<span style="font-weight: 600; display: block; text-align: center; color: ${canClaim ? '#2ecc71' : '#e74c3c'}">`;
  descText += `Свободных мест для наград: ${freeSlots} из 10.<br>`;
  if (canClaim) {
    descText += 'Вы можете забрать эту награду.';
  } else {
    descText += 'Инвентарь наград заполнен! Вы не можете забрать эту награду.';
  }
  descText += '</span>';
  
  document.getElementById('reward-choice-desc').innerHTML = descText;
  
  const claimYesBtn = document.getElementById('claim-reward-yes-btn');
  if (claimYesBtn) {
    if (canClaim) {
      claimYesBtn.removeAttribute('disabled');
      claimYesBtn.style.opacity = '1';
      claimYesBtn.style.pointerEvents = 'auto';
    } else {
      claimYesBtn.setAttribute('disabled', 'true');
      claimYesBtn.style.opacity = '0.5';
      claimYesBtn.style.pointerEvents = 'none';
    }
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
  } catch (err) {}

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
    showRewardChoiceModal({
      type: currentCell.reward_type,
      name: currentCell.reward_name,
      detail: currentCell.reward_detail,
      originCell: currentCellIndex
    });
  }
});

window.loadAdminCellData = loadAdminCellData;
window.showCellInfoTag = showCellInfoTag;
window.showGuildTaxModal = showGuildTaxModal;
window.showRewardPopup = showRewardPopup;
window.showRewardChoiceModal = showRewardChoiceModal;
window.showConfirm = showConfirm;

const casinoSegments = [
  { color: 'red',   fill: '#c81e1e', label: 'Красный', pct: 49 },
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
