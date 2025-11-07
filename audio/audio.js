
// قائمة المقاطع الصوتية
const tracks = [
    {
        id: 1,
        title: 'جزء من تاريخ المجرور',
        description: 'في هذا المقطع الصوتي يسرد فيه جاسر عثمان جاسر بعض من نشأة وتاريخ المجرور',
        src: 'jaser.opus',
        icon: '🎙️'
    },
    {
        id: 2,
        title: 'أ. جمعة عبدالله (جمعة كندشة)',
        description: 'استماع لمقابلة مع أ. جمعة عبدالله حول المجرور وتاريخها',
        src: 'gm.ogg',
        icon: '🎤'
    },
    {
        id: 3,
        title: 'أ. محمد عبدالرحمن الجله - 1',
        description: 'حديث أ. محمد عبدالرحمن الجله عن تاريخ وثقافة المجرور',
        src: 'md1.ogg',
        icon: '📻'
    },
    {
        id: 4,
        title: 'أ. محمد عبدالرحمن الجله - 2',
        description: 'حديث أ. محمد عبدالرحمن الجله عن تاريخ وثقافة المجرور',
        src: 'md2.ogg',
        icon: '🎧'
    },
    {
        id: 5,
        title: 'بشير آدم حامد',
        description: 'مقابلة مع بشير آدم حامد حول التطور الاجتماعي في المجرور',
        src: 'bashir.ogg',
        icon: '🎵'
    }
];

// المتغيرات العامة
let currentTrackIndex = 0;
let isPlaying = false;

// العناصر
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressHandle = document.getElementById('progressHandle');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const currentTitle = document.getElementById('currentTitle');
const currentDescription = document.getElementById('currentDescription');
const playlistElement = document.getElementById('playlist');
const vinylDisc = document.querySelector('.vinyl-disc');
const soundWaves = document.querySelector('.sound-waves');

// ====================================
// تهيئة التطبيق
// ====================================
function init() {
    renderPlaylist();
    setupEventListeners();
    setVolume(70);
}

// ====================================
// إنشاء قائمة التشغيل
// ====================================
function renderPlaylist() {
    playlistElement.innerHTML = tracks.map((track, index) => `
        <div class="playlist-item ${index === 0 ? 'active' : ''}" data-index="${index}">
            <span class="playlist-item-number">${index + 1}</span>
            <span class="playlist-item-icon">${track.icon}</span>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${track.title}</div>
                <div class="playlist-item-description">${track.description}</div>
            </div>
        </div>
    `).join('');

    // إضافة مستمعات الأحداث لعناصر القائمة
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.getAttribute('data-index'));
            loadTrack(index);
            play();
        });
    });
}

// ====================================
// تحميل مقطع صوتي
// ====================================
function loadTrack(index) {
    currentTrackIndex = index;
    const track = tracks[index];

    audioPlayer.src = track.src;
    currentTitle.textContent = track.title;
    currentDescription.textContent = track.description;

    // تحديث القائمة
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ====================================
// تشغيل / إيقاف مؤقت
// ====================================
function play() {
    if (!audioPlayer.src) {
        loadTrack(0);
    }
    audioPlayer.play();
    isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    vinylDisc.classList.add('playing');
    soundWaves.classList.add('active');
}

function pause() {
    audioPlayer.pause();
    isPlaying = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    vinylDisc.classList.remove('playing');
    soundWaves.classList.remove('active');
}

function togglePlay() {
    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

// ====================================
// المقطع السابق / التالي
// ====================================
function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) play();
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) play();
}

// ====================================
// تحديث شريط التقدم
// ====================================
function updateProgress() {
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressFill.style.width = `${percent}%`;
    progressHandle.style.left = `${percent}%`;
    currentTime.textContent = formatTime(audioPlayer.currentTime);
}

function setProgress(e) {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
}

// ====================================
// التحكم في مستوى الصوت
// ====================================
function setVolume(value) {
    audioPlayer.volume = value / 100;
    volumeSlider.value = value;
    updateVolumeIcon(value);
}

function updateVolumeIcon(value) {
    const volumeIcon = document.getElementById('volumeIcon');
    if (value == 0) {
        volumeIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3L19 14.5 16.5 12 19 9.5 16.5 7z"/>';
    } else {
        volumeIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
    }
}

function toggleMute() {
    if (audioPlayer.volume > 0) {
        audioPlayer.dataset.previousVolume = audioPlayer.volume;
        setVolume(0);
    } else {
        const previousVolume = audioPlayer.dataset.previousVolume || 0.7;
        setVolume(previousVolume * 100);
    }
}

// ====================================
// تنسيق الوقت
// ====================================
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ====================================
// إعداد مستمعات الأحداث
// ====================================
function setupEventListeners() {
    // أزرار التحكم
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);

    // أحداث المشغل
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', () => {
        duration.textContent = formatTime(audioPlayer.duration);
    });
    audioPlayer.addEventListener('ended', nextTrack);

    // شريط التقدم
    progressBar.addEventListener('click', setProgress);

    // مستوى الصوت
    volumeBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', (e) => {
        setVolume(e.target.value);
    });

    // اختصارات لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                nextTrack();
                break;
            case 'ArrowLeft':
                prevTrack();
                break;
            case 'ArrowUp':
                e.preventDefault();
                setVolume(Math.min(100, audioPlayer.volume * 100 + 10));
                break;
            case 'ArrowDown':
                e.preventDefault();
                setVolume(Math.max(0, audioPlayer.volume * 100 - 10));
                break;
        }
    });
}

// ====================================
// تشغيل التطبيق
// ====================================
init();

console.log('🎵 مشغل صوتيات المجرور جاهز!');
console.log('💡 استخدم مفاتيح الأسهم للتحكم: ← → للتنقل، ↑ ↓ لمستوى الصوت، مسافة للتشغيل/الإيقاف');
