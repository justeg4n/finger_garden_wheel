import { animals, eligibleAnimals, pickAnimal, targetRotation } from './game.js';
import { art } from './art.js';

const $ = (selector) => document.querySelector(selector);
const icons = {
  sound:'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute:'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/>',
  fullscreen:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  settings:'<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="var(--cream)"/><circle cx="16" cy="17" r="3" fill="var(--cream)"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const defaultSettings = { sound:true, noRepeat:true, duration:5 };
function readSettings() {
  try {
    const value = JSON.parse(localStorage.getItem('finger-zoo-settings-v2') || localStorage.getItem('finger-zoo-settings-v1'));
    if (!value || typeof value !== 'object') return {...defaultSettings};
    return { sound:typeof value.sound === 'boolean' ? value.sound : true, noRepeat:typeof value.noRepeat === 'boolean' ? value.noRepeat : true, duration:[3,5,7].includes(value.duration) ? value.duration : 5 };
  } catch { return {...defaultSettings}; }
}
let settings = readSettings();
let spinning = false, rotation = 0, history = [], seen = [], currentAnimal = null;
let audioContext, tickInterval, toastTimer;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function saveSettings() { try { localStorage.setItem('finger-zoo-settings-v2', JSON.stringify(settings)); } catch {} }
function updateSoundButton() {
  const btn = $('#sound-button');
  btn.innerHTML = icon(settings.sound ? 'sound' : 'mute');
  btn.setAttribute('aria-label', settings.sound ? 'Tắt âm thanh' : 'Bật âm thanh');
  btn.title = btn.getAttribute('aria-label');
  btn.setAttribute('aria-pressed', String(settings.sound));
}
function random() {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return values[0] / 4294967296;
}
function initAudio() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    if (!audioContext) audioContext = new Audio();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  } catch {}
}
function tone(frequency = 600, duration = .06, delay = 0, volume = .035) {
  if (!settings.sound || !audioContext || audioContext.state !== 'running') return;
  try {
    const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    const now = audioContext.currentTime + delay;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.start(now); oscillator.stop(now + duration);
  } catch {}
}
function chime() { [523.25,659.25,783.99,1046.5].forEach((frequency,i) => tone(frequency,.25,i*.12,.06)); }
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
}
function celebrate() {
  if (reducedMotion.matches) return;
  const colors = ['#e8a1b1','#eac76d','#8da987','#a6cce0','#c7b0e7'];
  $('#confetti').innerHTML = Array.from({length:45},(_,i) => `<i style="--x:${random()*100}%;--c:${colors[i%5]};--delay:${random()*.4}s;--drift:${(random()-.5)*240}px"></i>`).join('');
  setTimeout(() => { $('#confetti').innerHTML = ''; },3000);
}
function drawWheel() {
  const point = (angle, r) => [300+Math.sin(angle*Math.PI/180)*r,300-Math.cos(angle*Math.PI/180)*r];
  $('#wheel-svg').innerHTML = animals.map((a,i) => {
    const start = point(i*72-36,296), end = point(i*72+36,296);
    return `<g><path d="M300 300L${start.join(' ')}A296 296 0 0 1 ${end.join(' ')}Z" fill="${a.color}" stroke="#fffaf0" stroke-width="4"/><g transform="rotate(${i*72} 300 300)"><path d="M159 99A253 253 0 0 1 441 99" fill="none" stroke="#fffdf1" stroke-width="2" stroke-dasharray="7 8" stroke-linecap="round"/><text x="300" y="73" text-anchor="middle" fill="${a.ink}" font-family="'Baloo 2',system-ui,sans-serif" font-weight="800" font-size="27">${a.count} ngón tay</text>${art('animals',i,'','','x="241" y="85" width="118" height="112"')}<text x="300" y="215" text-anchor="middle" fill="${a.ink}" font-family="'Baloo 2',system-ui,sans-serif" font-weight="700" font-size="22">${a.name}</text><text x="300" y="237" text-anchor="middle" fill="${a.ink}" font-family="Nunito,system-ui,sans-serif" font-size="15">${a.rhyme}</text></g></g>`;
  }).join('');
  $('.wheel-lights').innerHTML = Array.from({length:25},(_,i) => { const angle=i/25*Math.PI*2; return `<i style="--lx:${Math.sin(angle)*47.6}%;--ly:${-Math.cos(angle)*47.6}%"></i>`; }).join('');
}
function renderFriends() {
  $('#friends-grid').innerHTML = animals.map((a,i) => `<button class="friend-card ${currentAnimal?.id===a.id ? 'active' : ''} ${settings.noRepeat && seen.includes(a.id) ? 'visited' : ''}" style="--tint:color-mix(in srgb, ${a.color} 45%, #fffaf1);--animal-ink:${a.ink}" data-animal="${a.id}" aria-label="Xem động tác ${a.name}, ${a.count} ngón tay" ${spinning ? 'disabled' : ''}><span class="friend-portrait">${art('animals',i)}</span><span><span class="friend-name">${a.name}</span><span class="friend-rhyme">${a.rhyme}</span><span class="friend-count">${a.count} NGÓN TAY</span></span></button>`).join('');
}
function renderReady() {
  $('#result-badge').innerHTML = '<span class="little-dot"></span> GÓC BIẾN HÓA';
  $('#activity-content').innerHTML = `<h2 class="activity-title">Bé sẵn sàng chưa?</h2><p class="activity-subtitle">Năm người bạn nhỏ đang chờ bé khám phá.<br>Hôm nay, ngón tay sẽ hóa thành ai nhỉ?</p><div class="ready-illustration"><span class="bubble-spark" aria-hidden="true">✧</span><div class="hand-bubble">${art('hands',0,'hand-art','Bàn tay thật giơ một ngón trỏ')}</div><span class="ready-animal">${art('animals',4)}</span><span class="bubble-circle" aria-hidden="true"></span></div><div class="ready-prompt"><span aria-hidden="true">☼</span><p><strong>Đôi tay nhỏ, phép màu to!</strong>Quay vòng quay rồi cùng làm động tác nhé.</p></div>`;
}
function showAnimal(animal, preview = false) {
  currentAnimal = animal;
  const index = animals.indexOf(animal);
  $('#result-badge').innerHTML = `<span class="little-dot"></span> ${preview ? 'LÀM QUEN NGƯỜI BẠN' : 'VÒNG QUAY ĐÃ CHỌN'}`;
  $('#activity-content').innerHTML = `<h2 class="activity-title">${animal.name} <span class="result-rhyme">${animal.rhyme}!</span></h2><span class="count-badge">Bé giơ <b>${animal.count}</b> ngón tay nhé!</span><div class="result-illustration"><div class="result-hand">${art('hands',index,'',`Bàn tay thật giơ ${animal.count} ngón tay`)}</div><span class="equals" aria-hidden="true">⤳</span><div class="result-animal">${art('animals',index,'',animal.name)}</div></div><p class="instruction-text">${animal.instruction}</p><div class="result-actions"><button class="soft-button celebrate" id="done-button">Bé làm được rồi! ✦</button></div>`;
  $('#activity-card').classList.remove('result-card','wiggle');
  void $('#activity-card').offsetWidth;
  $('#activity-card').classList.add('result-card');
  $('#done-button').addEventListener('click', () => {
    initAudio(); chime(); celebrate();
    $('#activity-card').classList.remove('wiggle'); void $('#activity-card').offsetWidth; $('#activity-card').classList.add('wiggle');
    toast('Giỏi quá! Cùng nhúc nhích ngón tay nào! ✦');
  });
  renderFriends();
}
function renderHistory() {
  $('#history-section').hidden = !history.length;
  $('#history-list').innerHTML = history.slice().reverse().map((a,i) => `<li><span>#${history.length-i}</span>${a.name} <b>${a.count}</b> ngón</li>`).join('');
}
function setBusy(busy) {
  spinning = busy;
  $('#spin-button').disabled = busy; $('#wheel-center').disabled = busy;
  $('#settings-button').disabled = busy; $('#wheel-mode').disabled = busy; $('#reset-button').disabled = busy;
  $('#spin-label').textContent = busy ? 'Ai sẽ xuất hiện nhỉ?' : 'Quay nào, bé ơi!';
  $('.wheel-stage').classList.toggle('is-spinning', busy);
  $('#wheel-disc').setAttribute('aria-busy', String(busy));
  renderFriends();
}
async function spin() {
  if (spinning || document.querySelector('dialog[open]')) return;
  initAudio();
  if (settings.noRepeat && animals.every(a => seen.includes(a.id))) seen = [];
  const animal = pickAnimal(eligibleAnimals(settings.noRepeat, seen),random);
  const index = animals.indexOf(animal);
  setBusy(true); renderCycle();
  $('#result-badge').innerHTML = '<span class="little-dot"></span> CHỜ MỘT CHÚT NHÉ';
  $('#activity-content').innerHTML = '<h2 class="activity-title">Ú òa… bạn nào đây?</h2><p class="activity-subtitle">Cùng chờ xem người bạn nào sẽ xuất hiện!</p><div class="spinning-bloom" aria-hidden="true">✿</div><p class="spinning-text">Chuẩn bị những ngón tay xinh nào…</p>';
  $('#activity-card').classList.remove('result-card','wiggle');
  const duration = reducedMotion.matches ? 80 : settings.duration*1000;
  rotation = targetRotation(rotation,index,5 + Math.floor(random()*3));
  $('#wheel-disc').style.transition = `transform ${duration}ms cubic-bezier(.12,.75,.14,1)`;
  $('#wheel-disc').style.transform = `rotate(${rotation}deg)`;
  tickInterval = setInterval(() => tone(650+random()*250,.025,0,.02),120);
  await new Promise(resolve => setTimeout(resolve,duration+50));
  clearInterval(tickInterval);
  seen.push(animal.id); history.push(animal); if (history.length > 20) history.shift();
  setBusy(false); showAnimal(animal); renderHistory(); renderCycle(); chime(); celebrate();
}

$('#spin-button').addEventListener('click',spin);
$('#wheel-center').addEventListener('click',spin);
$('#wheel-disc').addEventListener('click',spin);
$('#friends-grid').addEventListener('click',event => {
  const button = event.target.closest('[data-animal]');
  if (button && !spinning) showAnimal(animals.find(a => a.id === button.dataset.animal),true);
});
document.addEventListener('keydown',event => {
  if (event.code !== 'Space' || event.repeat || event.altKey || event.ctrlKey || event.metaKey || document.querySelector('dialog[open]')) return;
  if (event.target.closest('button,a,input,select,textarea,[contenteditable="true"]')) return;
  event.preventDefault(); spin();
});
$('#sound-button').addEventListener('click', () => { settings.sound = !settings.sound; saveSettings(); updateSoundButton(); if (settings.sound) { initAudio(); tone(); } });
$('#fullscreen-button').innerHTML = icon('fullscreen');
if (!document.fullscreenEnabled) $('#fullscreen-button').hidden = true;
$('#fullscreen-button').addEventListener('click',async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { toast('Trình duyệt này chưa mở được chế độ toàn màn hình.'); }
});
document.addEventListener('fullscreenchange', () => { const label = document.fullscreenElement ? 'Thoát toàn màn hình' : 'Toàn màn hình'; $('#fullscreen-button').setAttribute('aria-label',label); $('#fullscreen-button').title = label; });
$('#help-button').addEventListener('click', () => $('#help-dialog').showModal());
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
});
$('.dialog-done').addEventListener('click', () => $('#help-dialog').close());
$('#settings-icon').innerHTML = icon('settings');
function openSettings() {
  const form = $('#settings-form');
  ['sound','noRepeat'].forEach(key => form.elements[key].checked = settings[key]);
  form.elements.duration.value = String(settings.duration);
  $('#settings-dialog').showModal();
}
$('#settings-button').addEventListener('click',openSettings);
$('#wheel-mode').addEventListener('click',openSettings);
$('#settings-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.target);
  const noRepeat = data.has('noRepeat');
  if (noRepeat !== settings.noRepeat) seen = [];
  settings = { sound:data.has('sound'), noRepeat, duration:Number(data.get('duration')) };
  saveSettings(); updateSoundButton(); renderCycle(); renderFriends(); $('#settings-dialog').close();
  toast('Đã lưu! Vòng quay sẵn sàng rồi.');
});
$('#reset-button').addEventListener('click', () => {
  if (spinning) return;
  history = []; seen = []; currentAnimal = null;
  rotation = 0; $('#wheel-disc').style.transition = 'none'; $('#wheel-disc').style.transform = 'rotate(0deg)';
  renderReady(); renderFriends(); renderHistory(); renderCycle(); toast('Bắt đầu hành trình mới thôi!');
});
window.addEventListener('pagehide', () => clearInterval(tickInterval));
updateSoundButton(); drawWheel(); renderReady(); renderFriends(); renderCycle();

function renderCycle() {
  const count = new Set(seen).size;
  $('#wheel-mode').textContent = settings.noRepeat ? '↻ Không trùng lặp · ' + count + '/5 bạn · Cài đặt' : '↻ Ngẫu nhiên tự do · Cài đặt';
  $('#cycle-message').textContent = settings.noRepeat
    ? (count === 5 ? 'Đã gặp đủ 5 bạn! Lượt quay tiếp theo bắt đầu một vòng mới.' : 'Mỗi bạn xuất hiện một lần trong 5 lượt. Vòng quay luôn giữ đủ 5 ô.')
    : 'Mỗi lượt đều có thể gặp bất kỳ bạn nào trong 5 con vật.';
}
$('#restart-cycle').addEventListener('click', () => {
  if (spinning) return;
  seen = []; renderCycle(); renderFriends();
  toast('Đã bắt đầu lượt 5 con vật mới.');
});
